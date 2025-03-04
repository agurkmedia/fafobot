import { create } from 'zustand';

export interface ActiveDownloadStatus {
  symbol: string;
  progress: string;
  progress_percent: number;
  chunks_completed: number;
  total_chunks: number;
  candles_per_second: number;
  estimated_remaining_seconds: number;
  remaining_candles: number;
  total_candles: number;
  new_candles_added: number;
  start_time: string;
  elapsed_time: string;
  estimated_completion: string;
  remaining_time: string;
}

export interface QueuedDownloadStatus {
  symbol: string;
  position: number;
  total_candles?: number;
  start_timestamp?: string;
  end_timestamp?: string;
}

export interface CompletedDownloadStatus {
  symbol: string;
  downloaded_candles: number;
  new_candles_added: number;
  duration: string;
  completed_at: string;
  candles_per_second: number;
  start_time: string;
  end_time: string;
  total_candles: number;
}

export interface OverallStats {
  active_downloads: number;
  queued_downloads: number;
  completed_downloads: number;
  total_downloaded_candles: number;
  overall_candles_per_second: number;
  estimated_remaining_seconds: number;
  total_candles_to_download: number;
  total_symbols: number;
  total_chunks: number;
  completed_chunks: number;
  is_running: boolean;
  start_time?: string;
  end_time?: string;
}

export interface DownloadStatus {
  active_downloads: ActiveDownloadStatus[];
  queued_downloads: QueuedDownloadStatus[];
  completed_downloads: CompletedDownloadStatus[];
  overall_stats: OverallStats;
}

interface WebSocketMessage {
  type: string;
  data: DownloadStatus;
}

interface WebSocketStore {
  isConnected: boolean;
  downloadStatus: DownloadStatus | null;
  socket: WebSocket | null;
  connect: () => void;
  disconnect: () => void;
  setDownloadStatus: (status: DownloadStatus) => void;
}

// Get the WebSocket URL based on the current environment
const getWebSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  const port = window.location.port;

  const wsUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}/ws/download-status`;
  console.log('WebSocket URL:', wsUrl);
  return wsUrl;
};

export const useWebSocketStore = create<WebSocketStore>((set) => ({
  isConnected: false,
  downloadStatus: null,
  socket: null,
  connect: () => {
    if (typeof window === 'undefined') return;

    const wsUrl = getWebSocketUrl();
    console.log('Attempting to connect to WebSocket:', wsUrl);

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connection established');
        set({ isConnected: true, socket });
        
        // Send periodic heartbeat to keep connection alive
        const heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send('ping');
            console.log('Heartbeat sent');
          } else {
            console.log('Socket not open during heartbeat, state:', socket.readyState);
          }
        }, 30000);

        // Store heartbeat interval for cleanup
        (socket as any).heartbeat = heartbeat;
      };

      socket.onmessage = (event) => {
        try {
          console.log('Raw WebSocket message:', event.data);
          // Parse the message data if it's a string
          const rawData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          const data = rawData.data; // Extract the data from the message wrapper

          // Transform active downloads from the download_stats and active_items
          const activeDownloads = (data.active_items || []).map(symbol => {
            const stats = data.download_stats[symbol] || {};
            const startTime = stats.start_time ? new Date(stats.start_time * 1000) : new Date();
            const now = new Date();
            const elapsed = (now.getTime() - startTime.getTime()) / 1000;
            const progress = (stats.downloaded_candles || 0) / (stats.total_candles || 1);
            const estimatedTotal = elapsed / Math.max(progress, 0.001);
            const remaining = Math.max(0, estimatedTotal - elapsed);
            
            return {
              symbol,
              progress: `${(progress * 100).toFixed(2)}%`,
              progress_percent: progress * 100,
              chunks_completed: stats.chunks_completed || 0,
              total_chunks: stats.total_chunks || 0,
              candles_per_second: Math.round(stats.candles_per_second || 0),
              downloaded_candles: stats.downloaded_candles || 0,
              total_candles: stats.total_candles || 0,
              new_candles_added: stats.new_candles_added || 0,
              start_time: startTime.toISOString(),
              elapsed_time: formatDuration(elapsed),
              estimated_completion: stats.estimated_completion || '',
              estimated_remaining_seconds: remaining,
              remaining_time: formatDuration(remaining)
            };
          });

          // Transform queued downloads from queue_items
          const queuedDownloads = (data.queue_items || []).map(item => ({
            symbol: item.symbol,
            position: item.position
          }));

          // Transform completed downloads
          const completedDownloads = (data.completed_items || []).map(item => {
            // Helper function to safely convert timestamps
            const toISOString = (timestamp: number | string) => {
              if (typeof timestamp === 'number') {
                return new Date(timestamp * 1000).toISOString();
              }
              try {
                // If it's already an ISO string, just validate it
                return new Date(timestamp).toISOString();
              } catch {
                return new Date().toISOString();
              }
            };

            return {
              ...item,
              duration: formatDuration(item.duration || 0),
              start_time: toISOString(item.start_time),
              end_time: toISOString(item.end_time),
              completed_at: toISOString(item.completed_at)
            };
          });

          // Get earliest start time from all stats and calculate end time from active downloads
          const allStats = Object.values(data.download_stats);
          const startTimes = allStats.map(stat => (stat as any).start_time || 0);
          const validStartTimes = startTimes.filter(t => t > 0);
          const earliestStart = validStartTimes.length > 0 ? Math.min(...validStartTimes) : 0;

          // Calculate end time based on active downloads' estimated completion
          let latestEnd = 0;
          if (activeDownloads.length > 0) {
            const now = new Date().getTime() / 1000;
            const estimatedEndTimes = activeDownloads.map(download => 
              now + (download.estimated_remaining_seconds || 0)
            );
            const validEndTimes = estimatedEndTimes.filter(t => t > 0 && Number.isFinite(t));
            latestEnd = validEndTimes.length > 0 ? Math.max(...validEndTimes) : 0;
          }

          // Create the status object
          const status: DownloadStatus = {
            active_downloads: activeDownloads,
            queued_downloads: queuedDownloads,
            completed_downloads: completedDownloads,
            overall_stats: {
              active_downloads: data.active_downloads || 0,
              queued_downloads: data.queued_downloads || 0,
              completed_downloads: data.completed_downloads || 0,
              total_downloaded_candles: Object.values(data.download_stats).reduce((sum: number, stat: any) => 
                sum + (stat.downloaded_candles || 0), 0),
              overall_candles_per_second: Object.values(data.download_stats).reduce((sum: number, stat: any) => 
                sum + (stat.candles_per_second || 0), 0),
              estimated_remaining_seconds: Math.max(...Object.values(data.download_stats)
                .map((stat: any) => stat.estimated_remaining_seconds || 0)),
              total_candles_to_download: Object.values(data.download_stats).reduce((sum: number, stat: any) => 
                sum + (stat.total_candles || 0), 0),
              total_symbols: (data.queue_items || []).length + data.active_downloads + data.completed_downloads,
              total_chunks: Object.values(data.download_stats).reduce((sum: number, stat: any) => 
                sum + (stat.total_chunks || 0), 0),
              completed_chunks: Object.values(data.download_stats).reduce((sum: number, stat: any) => 
                sum + (stat.chunks_completed || 0), 0),
              is_running: data.active_downloads > 0,
              start_time: earliestStart > 0 ? new Date(earliestStart * 1000).toISOString() : undefined,
              end_time: latestEnd > 0 ? new Date(latestEnd * 1000).toISOString() : undefined
            }
          };

          set({ downloadStatus: status });
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          console.log('Raw message data:', event.data);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        set({ isConnected: false, socket: null });
        
        // Clear heartbeat interval
        if ((socket as any).heartbeat) {
          clearInterval((socket as any).heartbeat);
        }

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          useWebSocketStore.getState().connect();
        }, 5000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.log('Connection details:', {
          readyState: socket.readyState,
          url: socket.url,
          protocol: socket.protocol,
          extensions: socket.extensions
        });
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  },
  disconnect: () => {
    if (typeof window === 'undefined') return;

    set((state) => {
      if (state.socket) {
        console.log('Disconnecting WebSocket');
        state.socket.close();
        // Clear heartbeat interval
        if ((state.socket as any).heartbeat) {
          clearInterval((state.socket as any).heartbeat);
        }
      }
      return { socket: null, isConnected: false };
    });
  },
  setDownloadStatus: (status: DownloadStatus) => set({ downloadStatus: status }),
}));

// Export a singleton instance for components to use
export const websocketService = {
  connect: () => useWebSocketStore.getState().connect(),
  disconnect: () => useWebSocketStore.getState().disconnect(),
  getStore: () => useWebSocketStore,
};

// Update formatDuration to show all non-zero units
const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
}; 
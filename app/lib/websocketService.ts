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
  duration: number;
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
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message type:', message.type);
          
          if (message.type === 'download_status') {
            // Calculate additional stats and ensure all required fields
            const status: DownloadStatus = {
              ...message.data,
              active_downloads: message.data.active_downloads.map(download => ({
                ...download,
                remaining_candles: download.total_chunks * 1000 - (download.chunks_completed * 1000),
                total_candles: download.total_chunks * 1000,
                new_candles_added: download.chunks_completed * 1000,
                start_time: download.start_time || new Date().toISOString(),
                elapsed_time: '0s', // TODO: Calculate from start_time
              })),
              overall_stats: {
                ...message.data.overall_stats,
                is_running: message.data.overall_stats.active_downloads > 0,
                total_candles_to_download: message.data.overall_stats.total_candles_to_download || 
                  message.data.active_downloads.reduce((sum, d) => sum + d.total_chunks * 1000, 0) +
                  message.data.queued_downloads.length * 1000, // Estimate for queued downloads
              }
            };
            set({ downloadStatus: status });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
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
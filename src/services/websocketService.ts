import { create } from 'zustand';

interface WebSocketStore {
  isConnected: boolean;
  downloadStatus: any;
  connect: () => void;
  disconnect: () => void;
  setDownloadStatus: (status: any) => void;
}

const WS_URL = `ws://${window.location.hostname}:8000/api/market-data/ws/download-status`;

export const useWebSocketStore = create<WebSocketStore>((set) => ({
  isConnected: false,
  downloadStatus: null,
  socket: null as WebSocket | null,
  connect: () => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log('WebSocket connected');
      set({ isConnected: true });
      
      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send('ping');
        }
      }, 30000);

      // Store heartbeat interval for cleanup
      (socket as any).heartbeat = heartbeat;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        set({ downloadStatus: data });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false });
      
      // Clear heartbeat interval
      if ((socket as any).heartbeat) {
        clearInterval((socket as any).heartbeat);
      }

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        set((state: any) => {
          state.connect();
          return state;
        });
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    set({ socket });
  },
  disconnect: () => {
    set((state: any) => {
      if (state.socket) {
        state.socket.close();
        // Clear heartbeat interval
        if ((state.socket as any).heartbeat) {
          clearInterval((state.socket as any).heartbeat);
        }
      }
      return { socket: null, isConnected: false };
    });
  },
  setDownloadStatus: (status: any) => set({ downloadStatus: status }),
}));

// Export a singleton instance for components to use
export const websocketService = {
  connect: () => useWebSocketStore.getState().connect(),
  disconnect: () => useWebSocketStore.getState().disconnect(),
  getStore: () => useWebSocketStore,
}; 
// WebSocket Service - Real-time location tracking and chat using Socket.IO
import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

export interface LocationUpdate {
  rideId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  // Connect to WebSocket server
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    this.isConnecting = true;
    const token = await AsyncStorage.getItem('auth_token');

    if (!token) {
      this.isConnecting = false;
      console.error('[WebSocket] No auth token available');
      throw new Error('No auth token available');
    }

    // Create socket
    this.socket = io(API_CONFIG.API_GATEWAY, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    // Setup listeners that don't interfere with connect/connect_error promise handling
    this.setupEventListeners();

    console.log('[WebSocket] Connecting...');

    // Wait until connected or errored
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.isConnecting = false;
        return reject(new Error('Socket not initialized'));
      }

      const onConnect = () => {
        this.socket?.off('connect_error', onError);
        this.isConnecting = false;
        resolve();
      };

      const onError = (err: any) => {
        this.socket?.off('connect', onConnect);
        this.isConnecting = false;
        // Pass the actual Error message from the server (e.g., 'Invalid or expired token')
        reject(err instanceof Error ? err : new Error(err?.message || 'WebSocket connection error'));
      };

      // Attach temporary handlers
      this.socket.on('connect', onConnect);
      this.socket.on('connect_error', onError);

      // Timeout fallback
      const timeout = setTimeout(() => {
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        this.isConnecting = false;
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      // Clear timeout on resolution/rejection
      const finalize = () => clearTimeout(timeout);
      // Wrap resolve/reject to finalize
      const originalResolve = resolve;
      const originalReject = reject;
    }).finally(() => {
      this.isConnecting = false;
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (!this.socket) return;

    // Stop reconnection attempts before disconnecting to avoid automatic reconnects after logout.
    this.socket.io.opts.reconnection = false;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket.close();
    this.socket = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    console.log('[WebSocket] Disconnected');
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected successfully');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.reconnectAttempts++;
      this.isConnecting = false;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
    });
  }

  // Join a ride room for real-time updates
  async joinRide(rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.log('[WebSocket] Not connected, cannot join ride');
        resolve(false);
        return;
      }

      this.socket.emit('join_ride', { rideId }, (response: any) => {
        if (response?.success) {
          console.log(`[WebSocket] Successfully joined ride room: ${rideId}`);
          resolve(true);
        } else {
          console.log(`[WebSocket] Failed to join ride room: ${rideId}`);
          resolve(false);
        }
      });

      // Timeout fallback
      setTimeout(() => {
        console.log(`[WebSocket] Join ride timeout for: ${rideId}`);
        resolve(false);
      }, 5000);
    });
  }

  // Leave a ride room
  async leaveRide(rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.log('[WebSocket] Not connected, cannot leave ride');
        resolve(false);
        return;
      }

      this.socket.emit('leave_ride', { rideId }, (response: any) => {
        if (response?.success) {
          console.log(`[WebSocket] Successfully left ride room: ${rideId}`);
          resolve(true);
        } else {
          console.log(`[WebSocket] Failed to leave ride room: ${rideId}`);
          resolve(false);
        }
      });

      // Timeout fallback
      setTimeout(() => {
        console.log(`[WebSocket] Leave ride timeout for: ${rideId}`);
        resolve(false);
      }, 5000);
    });
  }

  // Send location update (for drivers)
  sendLocationUpdate(data: LocationUpdate): void {
    if (this.socket?.connected) {
      this.socket.emit('location_update', data);
    }
  }

  // Listen for driver location updates (for riders)
  onDriverLocationUpdate(callback: (data: LocationUpdate) => void): void {
    if (this.socket) {
      this.socket.on('driver_location', callback);
    }
  }

  // Remove driver location listener
  offDriverLocationUpdate(): void {
    if (this.socket) {
      this.socket.off('driver_location');
    }
  }

  // Send chat message
  sendMessage(rideId: string, receiverId: string, message: string): void {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        rideId,
        receiverId,
        message,
        timestamp: new Date().toISOString(),
      });
      console.log('[WebSocket] Message sent');
    }
  }

  // Listen for incoming messages
  onMessageReceived(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // Remove message listener
  offMessageReceived(): void {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }

  // Mark messages as read
  markMessagesAsRead(rideId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { rideId });
    }
  }

  // Listen for ride status changes
  onRideStatusChange(callback: (data: { rideId: string; status: string }) => void): void {
    if (this.socket) {
      this.socket.on('ride_status_changed', callback);
    }
  }

  // Remove ride status listener
  offRideStatusChange(callback?: (data: { rideId: string; status: string }) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('ride_status_changed', callback);
      } else {
        this.socket.off('ride_status_changed');
      }
    }
  }
 
   // Listen for ride matched event
   onRideMatched(callback: (data: any) => void): void {
     if (this.socket) {
       this.socket.on('ride_matched', callback);
     }
   }
 
   // Remove ride matched listener
   offRideMatched(callback?: (data: any) => void): void {
     if (this.socket) {
       if (callback) {
         this.socket.off('ride_matched', callback);
       } else {
         this.socket.off('ride_matched');
       }
     }
   }
 
   // Listen for driver arrival
   onDriverArriving(callback: (data: { rideId: string; eta: number }) => void): void {
     if (this.socket) {
       this.socket.on('driver_arriving', callback);
     }
   }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Reconnect manually
  async reconnect(): Promise<void> {
    this.disconnect();
    await this.connect();
  }
}

export default new WebSocketService();

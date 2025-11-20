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
      console.error('[WebSocket] No auth token available');
      this.isConnecting = false;
      return;
    }

    try {
      this.socket = io(API_CONFIG.API_GATEWAY, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventListeners();
      console.log('[WebSocket] Connecting...');
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      this.isConnecting = false;
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[WebSocket] Disconnected');
    }
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
  joinRide(rideId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_ride', { rideId });
      console.log(`[WebSocket] Joined ride room: ${rideId}`);
    }
  }

  // Leave a ride room
  leaveRide(rideId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_ride', { rideId });
      console.log(`[WebSocket] Left ride room: ${rideId}`);
    }
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
  offRideStatusChange(): void {
    if (this.socket) {
      this.socket.off('ride_status_changed');
    }
  }

  // Listen for ride matched event
  onRideMatched(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('ride_matched', callback);
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

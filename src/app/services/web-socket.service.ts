import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import * as SockJS from 'sockjs-client';

// Polyfill global for SockJS
(window as any).global = window;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private messageSubject = new BehaviorSubject<any>(null);
  public message$: Observable<any> = this.messageSubject.asObservable();
  private typingSubject = new BehaviorSubject<any>(null);
  public typing$: Observable<any> = this.typingSubject.asObservable();
  private subscription!: StompSubscription;
  private typingSubscription!: StompSubscription;

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
    try {
      console.log('Initializing WebSocket connection...');

      // Create a SockJS connection as configured in the backend
      try {
        console.log('Creating SockJS connection to http://localhost:8089/ws');
        const socket = new SockJS('http://localhost:8089/ws');

        // Log SockJS events for debugging
        socket.onopen = () => {
          console.log('SockJS connection opened');
        };

        socket.onclose = (event) => {
          console.log('SockJS connection closed', event);
        };

        socket.onerror = (error) => {
          console.error('SockJS connection error', error);
        };

        // Create STOMP client with configuration for real-time chat
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          debug: (str) => console.log(`[STOMP Debug]: ${str}`),
          connectionTimeout: 20000 // Increase timeout for slower connections
        });

        console.log('STOMP client created, waiting for connection...');
      } catch (error) {
        console.error('Error creating SockJS/STOMP client:', error);
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'init_error', error });
        throw error;
      }

      this.stompClient.onConnect = () => {
        console.log('✅ Connected to WebSocket');

        // Notify subscribers that we're connected
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connected' });

        // Subscribe to private user message queue
        this.subscription = this.stompClient.subscribe('/user/queue/messages', (message) => {
          try {
            this.messageSubject.next(JSON.parse(message.body));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

        // Subscribe to typing notifications
        this.typingSubscription = this.stompClient.subscribe('/user/queue/typing', (notification) => {
          try {
            this.typingSubject.next(JSON.parse(notification.body));
          } catch (error) {
            console.error('Error parsing typing notification:', error);
          }
        });
      };

      this.stompClient.onDisconnect = () => {
        console.log('❌ Disconnected from WebSocket');
        // Notify subscribers that we're disconnected
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'disconnected' });
      };

      this.stompClient.onStompError = (frame) => {
        console.error('🚨 WebSocket Error:', frame);
        // Notify subscribers about the error
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'error', error: frame });
      };

      this.stompClient.onWebSocketError = (event) => {
        console.error('🚨 WebSocket Connection Error:', event);
        // Log detailed information about the error
        console.error('Error details:', {
          type: event.type,
          target: event.target,
          isTrusted: event.isTrusted,
          timeStamp: event.timeStamp,
          eventPhase: event.eventPhase
        });
        // Notify subscribers about the connection error
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connection_error', error: event });
      };

      // Add a handler for WebSocket close events
      this.stompClient.onWebSocketClose = (event) => {
        console.warn('WebSocket connection closed:', event);
        console.warn('Close details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      };

      // Activate the connection
      this.stompClient.activate();

      // Notify subscribers that we're trying to connect
      this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connecting' });

    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      // Notify subscribers about the initialization error
      this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'init_error', error });
    }
  }

  sendMessage(destination: string, message: any): boolean {
    try {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.publish({
          destination,
          body: JSON.stringify(message),
        });
        return true;
      } else {
        console.warn('⚠️ Cannot send message: WebSocket is not connected');
        return false;
      }
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      return false;
    }
  }

  sendTypingNotification(notification: any): boolean {
    try {
      return this.sendMessage('/app/chat.typing', notification);
    } catch (error) {
      console.error('Error sending typing notification:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('🔌 WebSocket disconnected');
    }
  }

  // Method to test the connection and reconnect if needed
  testConnection(): boolean {
    if (this.stompClient && this.stompClient.connected) {
      console.log('WebSocket connection is active');
      return true;
    } else {
      console.log('WebSocket connection is not active, attempting to reconnect...');

      // Try to reconnect
      try {
        if (this.stompClient) {
          this.stompClient.deactivate();
        }
        this.initializeWebSocketConnection();
        return false;
      } catch (error) {
        console.error('Failed to reconnect WebSocket:', error);
        return false;
      }
    }
  }

  // Method to check if the connection is active
  isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }
}

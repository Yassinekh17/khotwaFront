import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import * as SockJS from 'sockjs-client';

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

      // Check if token exists and is valid
      if (!this.isTokenValid()) {
        console.error('No valid authentication token available');
        this.messageSubject.next({
          type: 'CONNECTION_STATUS',
          status: 'error',
          error: 'No valid authentication token available'
        });
        return;
      }

      // Get the token from localStorage (try both possible keys)
      let token = localStorage.getItem('token');
      let tokenSource = 'token';

      // If not found, try access_token (used in auth interceptor)
      if (!token) {
        token = localStorage.getItem('access_token');
        tokenSource = 'access_token';
        if (token) {
          console.log('Using token from "access_token" instead of "token"');
        }
      }

      // Log token length for debugging (without exposing the actual token)
      console.log(`Token found from "${tokenSource}", length: ${token!.length}`);

      // Log token info without exposing the full token
      const tokenInfo = this.getTokenInfo();
      console.log('Token info for main connection:', tokenInfo);

      // Not setting any cookies - keeping it simple

      // Connect to WebSocket with a clean URL - no tokens, no query parameters
      const socket = new SockJS(`http://localhost:8090/messages/ws`, null, {
        // No transports specified - let SockJS choose the best one
      });

      // Log the connection attempt
      console.log('Connecting to WebSocket endpoint with token in headers');

      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectionTimeout: 20000,
        // Add token to connect headers for authentication
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => console.log(`[STOMP Debug]: ${str}`)
      });

      this.stompClient.onConnect = () => {
        console.log('✅ Connected to WebSocket');

        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connected' });

        this.subscription = this.stompClient.subscribe('/user/queue/messages', (message) => {
          try {
            this.messageSubject.next(JSON.parse(message.body));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

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
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'disconnected' });
      };

      this.stompClient.onStompError = (frame) => {
        console.error('🚨 WebSocket Error:', frame);
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'error', error: frame });
      };

      this.stompClient.onWebSocketError = (event) => {
        console.error('🚨 WebSocket Connection Error:', event);

        // Log more details about the error
        console.error('Error details:', {
          type: event.type,
          message: event instanceof ErrorEvent ? event.message : 'Unknown error',
          target: event.target,
          eventPhase: event.eventPhase,
          timeStamp: event.timeStamp
        });

        // Log authentication information (without exposing the full token)
        const tokenInfo = this.getTokenInfo();
        console.log('Token info:', tokenInfo);

        // Check if this might be an authentication error
        if (event instanceof ErrorEvent && event.message.includes('403')) {
          console.error('WebSocket connection failed with 403 Forbidden - likely an authentication error');

          // Notify subscribers about the authentication error
          this.messageSubject.next({
            type: 'CONNECTION_STATUS',
            status: 'auth_error',
            error: 'Authentication failed. Please log in again.',
            details: tokenInfo
          });
        } else {
          // For other types of errors
          this.messageSubject.next({
            type: 'CONNECTION_STATUS',
            status: 'connection_error',
            error: event,
            details: tokenInfo
          });
        }
      };

      this.stompClient.onWebSocketClose = (event) => {
        console.warn('WebSocket connection closed:', event);
        console.warn('Close details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });

        // Notify subscribers about the connection close
        this.messageSubject.next({
          type: 'CONNECTION_STATUS',
          status: 'disconnected',
          closeEvent: {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          }
        });

        // If connection was closed due to an authentication error (403)
        if (event.code === 1002 && event.reason === 'Cannot connect to server') {
          console.error('WebSocket connection failed due to authentication error');

          // Get and log token information
          const tokenInfo = this.getTokenInfo();
          console.log('Token info during connection close:', tokenInfo);

          // Notify subscribers about the authentication error
          this.messageSubject.next({
            type: 'CONNECTION_STATUS',
            status: 'auth_error',
            error: 'Authentication failed. Please log in again.',
            details: tokenInfo
          });
        }
      };

      this.stompClient.activate();

      this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connecting' });

    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
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

  /**
   * Try an alternative WebSocket connection approach
   * This method attempts to connect using a different URL format
   */
  tryAlternativeConnection(): void {
    try {
      console.log('Trying alternative WebSocket connection approach...');

      // Check if token is valid
      if (!this.isTokenValid()) {
        console.error('Cannot try alternative connection: No valid authentication token available');
        this.messageSubject.next({
          type: 'CONNECTION_STATUS',
          status: 'error',
          error: 'No valid authentication token available'
        });
        return;
      }

      // Get token from localStorage (try both possible keys)
      let token = localStorage.getItem('token');
      let tokenSource = 'token';

      if (!token) {
        token = localStorage.getItem('access_token');
        tokenSource = 'access_token';
        if (token) {
          console.log('Using token from "access_token" for alternative connection');
        }
      }

      // Log token information for debugging
      console.log(`Alternative connection: Using token from "${tokenSource}", length: ${token!.length}`);

      // Log token info without exposing the full token
      const tokenInfo = this.getTokenInfo();
      console.log('Token info for alternative connection:', tokenInfo);

      // Not setting any cookies - keeping it simple

      // Deactivate existing client if it exists
      if (this.stompClient) {
        this.stompClient.deactivate();
      }

      // Try a direct connection with a clean URL - no tokens, no query parameters
      const socket = new SockJS(`http://localhost:8090/messages/ws`, null, {
        // No transports specified - let SockJS choose the best one
      });

      console.log('Alternative connection: Using token in headers for authentication');

      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectionTimeout: 20000,
        // Add token to connect headers for authentication
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => console.log(`[STOMP Debug Alt]: ${str}`)
      });

      // Set up the same event handlers
      this.stompClient.onConnect = () => {
        console.log('✅ Connected to WebSocket (alternative approach)');
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connected' });

        this.subscription = this.stompClient.subscribe('/user/queue/messages', (message) => {
          try {
            this.messageSubject.next(JSON.parse(message.body));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

        this.typingSubscription = this.stompClient.subscribe('/user/queue/typing', (notification) => {
          try {
            this.typingSubject.next(JSON.parse(notification.body));
          } catch (error) {
            console.error('Error parsing typing notification:', error);
          }
        });
      };

      // Set up the same error handlers with enhanced logging
      this.stompClient.onDisconnect = () => {
        console.log('❌ Disconnected from WebSocket (alternative)');
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'disconnected' });
      };

      this.stompClient.onStompError = (frame) => {
        console.error('🚨 WebSocket Error (alternative):', frame);
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'error', error: frame });
      };

      this.stompClient.onWebSocketError = (event) => {
        console.error('🚨 WebSocket Connection Error (alternative):', event);

        // Log more details about the error
        console.error('Alternative connection error details:', {
          type: event.type,
          message: event instanceof ErrorEvent ? event.message : 'Unknown error',
          target: event.target,
          eventPhase: event.eventPhase,
          timeStamp: event.timeStamp
        });

        // Check if this might be an authentication error
        if (event instanceof ErrorEvent && event.message.includes('403')) {
          console.error('Alternative WebSocket connection failed with 403 Forbidden - likely an authentication error');

          // Get and log token information
          const tokenInfo = this.getTokenInfo();
          console.log('Token info during alternative connection error:', tokenInfo);

          // Notify subscribers about the authentication error
          this.messageSubject.next({
            type: 'CONNECTION_STATUS',
            status: 'auth_error',
            error: 'Authentication failed in alternative connection. Please log in again.',
            details: tokenInfo
          });
        }
      };

      this.stompClient.onWebSocketClose = (event) => {
        console.warn('Alternative WebSocket connection closed:', event);
        console.warn('Alternative close details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      };

      // Activate the connection
      this.stompClient.activate();
      this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connecting' });

    } catch (error) {
      console.error('Failed to initialize alternative WebSocket connection:', error);
      this.messageSubject.next({
        type: 'CONNECTION_STATUS',
        status: 'init_error',
        error: error
      });
    }
  }

  testConnection(): boolean {
    if (this.stompClient && this.stompClient.connected) {
      console.log('WebSocket connection is active');
      return true;
    } else {
      console.log('WebSocket connection is not active, attempting to reconnect...');
      try {
        // Check if token is valid before attempting reconnection
        if (!this.isTokenValid()) {
          console.error('Cannot reconnect: No valid authentication token available');
          this.messageSubject.next({
            type: 'CONNECTION_STATUS',
            status: 'error',
            error: 'No valid authentication token available'
          });
          return false;
        }

        // Deactivate existing client if it exists
        if (this.stompClient) {
          this.stompClient.deactivate();
        }

        // Wait a moment before reconnecting to avoid rapid reconnection attempts
        setTimeout(() => {
          // Try the alternative connection approach instead of the standard one
          this.tryAlternativeConnection();
        }, 1000);

        return false;
      } catch (error) {
        console.error('Failed to reconnect WebSocket:', error);
        this.messageSubject.next({
          type: 'CONNECTION_STATUS',
          status: 'error',
          error: error
        });
        return false;
      }
    }
  }

  isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }

  /**
   * Gets information about the token without exposing sensitive data
   * @returns Object with token information
   */
  private getTokenInfo(): any {
    // Try to get token from both possible storage keys
    let token = localStorage.getItem('token');
    let tokenSource = 'token';

    // If not found, try access_token
    if (!token) {
      token = localStorage.getItem('access_token');
      tokenSource = 'access_token';
    }

    if (!token) {
      return { exists: false, source: 'none' };
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          exists: true,
          source: tokenSource,
          valid: false,
          reason: 'Invalid format (not 3 parts)'
        };
      }

      const payload = JSON.parse(atob(parts[1]));
      const expTime = payload.exp ? new Date(payload.exp * 1000) : null;
      const now = new Date();
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();

      return {
        exists: true,
        source: tokenSource,
        valid: !isExpired,
        expired: isExpired,
        expiration: expTime ? expTime.toISOString() : 'none',
        currentTime: now.toISOString(),
        subject: payload.sub || 'unknown',
        issuer: payload.iss || 'unknown',
        audience: payload.aud || 'unknown'
      };
    } catch (error) {
      return {
        exists: true,
        source: tokenSource,
        valid: false,
        reason: 'Error parsing token',
        error: error.message
      };
    }
  }

  /**
   * Checks if the current token is valid
   * @returns true if token appears valid, false otherwise
   */
  private isTokenValid(): boolean {
    // Since the API gateway handles authentication, we don't need to validate the token
    // for WebSocket connections. However, we'll still log token information for debugging.

    // Try to get token from both possible storage keys
    let token = localStorage.getItem('token');

    // If not found, try access_token (used in auth interceptor)
    if (!token) {
      token = localStorage.getItem('access_token');
    }

    if (!token) {
      console.warn('No token found in localStorage (checked both "token" and "access_token")');
      // Return true anyway since API gateway handles auth
      return true;
    }

    try {
      // Check if token has the correct format (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token does not have valid JWT format, but continuing since API gateway handles auth');
        return true;
      }

      // Try to decode the payload
      const payload = JSON.parse(atob(parts[1]));

      // Check if token has expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('Token has expired, but continuing since API gateway handles auth');
        return true;
      }

      return true;
    } catch (error) {
      console.warn('Error validating token, but continuing since API gateway handles auth:', error);
      return true;
    }
  }
}

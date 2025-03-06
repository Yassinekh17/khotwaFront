import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';

import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private messageSubject = new BehaviorSubject<any>(null);
  public message$: Observable<any> = this.messageSubject.asObservable();
  private subscription!: StompSubscription;

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
    const socket = new SockJS('http://localhost:8089/ws'); // Update this if your backend WebSocket URL is different

    this.stompClient = new Client({
      webSocketFactory: () => socket as any, // Use SockJS for WebSocket compatibility
      reconnectDelay: 5000, // Auto-reconnect after 5 seconds
      debug: (str) => console.log(`[WebSocket Debug]: ${str}`)
    });

    this.stompClient.onConnect = () => {
      console.log('✅ Connected to WebSocket');

      // Subscribe to private user message queue
      this.subscription = this.stompClient.subscribe('/user/queue/messages', (message) => {
        this.messageSubject.next(JSON.parse(message.body));
      });
    };

    this.stompClient.onDisconnect = () => {
      console.log('❌ Disconnected from WebSocket');
    };

    this.stompClient.onStompError = (frame) => {
      console.error('🚨 WebSocket Error:', frame);
    };

    this.stompClient.activate();
  }

  sendMessage(destination: string, message: any): void {
    if (this.stompClient.connected) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(message),
      });
    } else {
      console.warn('⚠️ Cannot send message: WebSocket is not connected');
    }
  }

  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('🔌 WebSocket disconnected');
    }
  }
}

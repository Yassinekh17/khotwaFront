import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketTestService {
  private socket: WebSocket | null = null;
  private statusSubject = new BehaviorSubject<string>('disconnected');
  public status$: Observable<string> = this.statusSubject.asObservable();

  constructor() { }

  connect(): void {
    try {
      console.log('Testing direct WebSocket connection to ws://localhost:8089/ws');
      
      // Close existing connection if any
      if (this.socket) {
        this.socket.close();
      }
      
      // Create a new WebSocket connection
      this.socket = new WebSocket('ws://localhost:8089/ws');
      
      // Set up event handlers
      this.socket.onopen = () => {
        console.log('Direct WebSocket connection opened successfully');
        this.statusSubject.next('connected');
      };
      
      this.socket.onclose = (event) => {
        console.log('Direct WebSocket connection closed', event);
        this.statusSubject.next('disconnected');
      };
      
      this.socket.onerror = (error) => {
        console.error('Direct WebSocket connection error', error);
        this.statusSubject.next('error');
      };
      
      this.socket.onmessage = (event) => {
        console.log('Received message from WebSocket:', event.data);
      };
    } catch (error) {
      console.error('Error creating direct WebSocket connection:', error);
      this.statusSubject.next('error');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  sendTestMessage(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send('Test message');
    } else {
      console.error('Cannot send message: WebSocket is not connected');
    }
  }
}

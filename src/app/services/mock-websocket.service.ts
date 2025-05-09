import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatMessage } from './chat.service';
import { User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MockWebsocketService {
  private messageSubject = new BehaviorSubject<any>(null);
  public message$: Observable<any> = this.messageSubject.asObservable();

  private typingSubject = new BehaviorSubject<any>(null);
  public typing$: Observable<any> = this.typingSubject.asObservable();

  private connected = false;
  private mockUsers: User[] = [
    { id_user: 1, nom: 'Doe', prenom: 'John', email: 'john@example.com', role: 'User' },
    { id_user: 2, nom: 'Smith', prenom: 'Jane', email: 'jane@example.com', role: 'Admin' },
    { id_user: 3, nom: 'Brown', prenom: 'Mike', email: 'mike@example.com', role: 'User' },
    { id_user: 4, nom: 'Wilson', prenom: 'Sarah', email: 'sarah@example.com', role: 'User' },
    { id_user: 5, nom: 'Johnson', prenom: 'David', email: 'david@example.com', role: 'User' },
    { id_user: 6, nom: 'Taylor', prenom: 'Emma', email: 'emma@example.com', role: 'User' }
  ];

  private mockMessages: ChatMessage[] = [
    { id: 1, content: 'Bonjour, comment ça va ?', sender: '5', recipientId: '6', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, content: 'Très bien, merci ! Et toi ?', sender: '6', recipientId: '5', timestamp: new Date(Date.now() - 3500000).toISOString() },
    { id: 3, content: 'Ça va bien aussi. Que fais-tu aujourd\'hui ?', sender: '5', recipientId: '6', timestamp: new Date(Date.now() - 3400000).toISOString() },
    { id: 4, content: 'Je travaille sur un projet. Et toi ?', sender: '6', recipientId: '5', timestamp: new Date(Date.now() - 3300000).toISOString() },
    { id: 5, content: 'Je suis en train de développer une application de chat.', sender: '5', recipientId: '6', timestamp: new Date(Date.now() - 3200000).toISOString() },
    { id: 6, content: 'C\'est intéressant ! Quel type de technologie utilises-tu ?', sender: '6', recipientId: '5', timestamp: new Date(Date.now() - 3100000).toISOString() },
    { id: 7, content: 'J\'utilise Angular pour le frontend et Spring Boot pour le backend.', sender: '5', recipientId: '6', timestamp: new Date(Date.now() - 3000000).toISOString() }
  ];

  constructor() {
    console.log('MockWebsocketService initialized');
    // Simulate connection after a short delay
    setTimeout(() => {
      this.connected = true;
      this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connected' });
      console.log('Mock WebSocket connected');
    }, 1000);
  }

  // Get all users
  getUsers(): Observable<User[]> {
    console.log('Getting mock users');
    return of(this.mockUsers).pipe(delay(300)); // Simulate network delay
  }

  // Get messages between users
  getMessagesBetweenUsers(sender: string, recipientId: string): Observable<ChatMessage[]> {
    const messages = this.mockMessages.filter(message =>
      (message.sender === sender && message.recipientId === recipientId) ||
      (message.sender === recipientId && message.recipientId === sender)
    );
    return of(messages).pipe(delay(300)); // Simulate network delay
  }

  // Send a message
  sendMessage(destination: string, message: ChatMessage): boolean {
    try {
      console.log(`Mock sending message to ${destination}:`, message);

      // Add the message to our mock database
      const newMessage = {
        ...message,
        id: this.mockMessages.length + 1,
        timestamp: new Date().toISOString()
      };

      this.mockMessages.push(newMessage);

      // Simulate the message being received after a short delay
      setTimeout(() => {
        this.messageSubject.next(newMessage);
      }, 300);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Send typing notification
  sendTypingNotification(notification: any): boolean {
    try {
      console.log('Mock sending typing notification:', notification);

      // Simulate the notification being received after a short delay
      setTimeout(() => {
        this.typingSubject.next(notification);
      }, 300);

      return true;
    } catch (error) {
      console.error('Error sending typing notification:', error);
      return false;
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected;
  }

  // Test connection
  testConnection(): boolean {
    if (!this.connected) {
      console.log('Reconnecting mock WebSocket...');
      setTimeout(() => {
        this.connected = true;
        this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'connected' });
        console.log('Mock WebSocket reconnected');
      }, 1000);
    }
    return this.connected;
  }

  // Disconnect
  disconnect(): void {
    console.log('Disconnecting mock WebSocket...');
    this.connected = false;
    this.messageSubject.next({ type: 'CONNECTION_STATUS', status: 'disconnected' });
  }

  // Add a new message directly (for testing)
  addMessage(message: ChatMessage): void {
    const newMessage = {
      ...message,
      id: this.mockMessages.length + 1,
      timestamp: new Date().toISOString()
    };

    this.mockMessages.push(newMessage);
    this.messageSubject.next(newMessage);
  }

  // Simulate a response from another user
  simulateResponse(originalMessage: ChatMessage, delay: number = 2000): void {
    if (originalMessage.sender !== originalMessage.recipientId) {
      setTimeout(() => {
        // First simulate typing
        this.typingSubject.next({
          sender: originalMessage.recipientId,
          recipientId: originalMessage.sender
        });

        // Then after a delay, send a response
        setTimeout(() => {
          const responseMessage: ChatMessage = {
            id: this.mockMessages.length + 1,
            content: this.generateResponse(originalMessage.content),
            sender: originalMessage.recipientId,
            recipientId: originalMessage.sender,
            timestamp: new Date().toISOString()
          };

          this.mockMessages.push(responseMessage);
          this.messageSubject.next(responseMessage);
        }, 1500);
      }, delay);
    }
  }

  // Generate a simple response based on the message content
  private generateResponse(message: string): string {
    const responses = [
      "D'accord, je comprends.",
      "C'est intéressant !",
      "Merci pour l'information.",
      "Je suis d'accord avec toi.",
      "Pouvez-vous m'en dire plus ?",
      "C'est une bonne idée !",
      "Je vais y réfléchir.",
      "Absolument !",
      "Je ne suis pas sûr de comprendre.",
      "Excellent point de vue !"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

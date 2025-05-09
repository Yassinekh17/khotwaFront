import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatMessage } from './chat.service';
import { MockWebsocketService } from './mock-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class MockChatService {
  constructor(private mockWebsocketService: MockWebsocketService) {}

  // Get all messages
  getAllMessages(): Observable<ChatMessage[]> {
    return this.mockWebsocketService.getMessagesBetweenUsers('', '');
  }

  // Get messages between users
  getMessagesBetweenUsers(sender: string, recipientId: string): Observable<ChatMessage[]> {
    return this.mockWebsocketService.getMessagesBetweenUsers(sender, recipientId);
  }

  // Send a message
  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    // Add the message to the mock database
    this.mockWebsocketService.sendMessage('/app/chat.sendPrivateMessage', message);
    
    // Simulate a response from the recipient after a delay
    this.mockWebsocketService.simulateResponse(message);
    
    // Return the message as if it was saved by the server
    return of({
      ...message,
      id: Math.floor(Math.random() * 1000), // Generate a random ID
      timestamp: new Date().toISOString()
    }).pipe(delay(300)); // Simulate network delay
  }

  // Delete a message
  deleteMessage(id: number): Observable<void> {
    console.log(`Mock deleting message with ID ${id}`);
    return of(undefined).pipe(delay(300)); // Simulate network delay
  }
}

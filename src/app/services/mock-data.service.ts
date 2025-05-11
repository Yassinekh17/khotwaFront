import { Injectable } from '@angular/core';
import { User } from './user.service';
import { ChatMessage } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private users: User[] = [
    { id_user: 1, nom: 'Doe', prenom: 'John', email: 'john@example.com', role: 'User' },
    { id_user: 2, nom: 'Smith', prenom: 'Jane', email: 'jane@example.com', role: 'Admin' },
    { id_user: 3, nom: 'Brown', prenom: 'Mike', email: 'mike@example.com', role: 'User' },
    { id_user: 4, nom: 'Wilson', prenom: 'Sarah', email: 'sarah@example.com', role: 'User' },
    { id_user: 5, nom: 'Johnson', prenom: 'David', email: 'david@example.com', role: 'User' },
    { id_user: 6, nom: 'Taylor', prenom: 'Emma', email: 'emma@example.com', role: 'User' }
  ];

  private messages: ChatMessage[] = [
    { id: 1, content: 'Bonjour, comment ça va ?', sender: '5', recipientId: '6', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, content: 'Très bien, merci ! Et toi ?', sender: '6', recipientId: '5', timestamp: new Date(Date.now() - 3500000).toISOString() },
    { id: 3, content: 'Ça va bien aussi. Que fais-tu aujourd\'hui ?', sender: '5', recipientId: '6', timestamp: new Date(Date.now() - 3400000).toISOString() },
    { id: 4, content: 'Je travaille sur un projet. Et toi ?', sender: '6', recipientId: '5', timestamp: new Date(Date.now() - 3300000).toISOString() },
    { id: 5, content: 'Je suis en train de développer une application de chat.', sender: '5', recipientId: '6', timestamp: new Date(Date.now() - 3200000).toISOString() },
    { id: 6, content: 'C\'est intéressant ! Quel type de technologie utilises-tu ?', sender: '6', recipientId: '5', timestamp: new Date(Date.now() - 3100000).toISOString() },
    { id: 7, content: 'J\'utilise Angular pour le frontend et Spring Boot pour le backend.', sender: '5', recipientId: '6', timestamp: new Date(Date.now() - 3000000).toISOString() }
  ];

  constructor() { }

  getUsers(): User[] {
    return this.users;
  }

  getMessagesBetweenUsers(sender: string, recipientId: string): ChatMessage[] {
    return this.messages.filter(message => 
      (message.sender === sender && message.recipientId === recipientId) || 
      (message.sender === recipientId && message.recipientId === sender)
    );
  }

  addMessage(message: ChatMessage, id_user: number): ChatMessage {
    const newMessage = {
      ...message,
      id: this.messages.length + 1,
      timestamp: new Date().toISOString()
    };
    this.messages.push(newMessage);
    return newMessage;
  }
}

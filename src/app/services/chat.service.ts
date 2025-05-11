import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { retry } from 'rxjs/operators';

export interface ChatMessage {
  id?: number;
  content: string;
  sender: string;
  recipientId: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8090/messages/api/chat/messages';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('token'); // Adjust the key if needed

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  getAllMessages(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(this.apiUrl, this.getHttpOptions())
      .pipe(
        retry(1),
        catchError(error => {
          console.error('Error fetching all messages:', error);
          return throwError(() => new Error('Erreur lors de la récupération des messages. Veuillez réessayer.'));
        })
      );
  }

  getMessagesBetweenUsers(sender: string, recipientId: string): Observable<ChatMessage[]> {
    console.log(`Fetching messages between users ${sender} and ${recipientId}...`);

    return this.http.get<ChatMessage[]>(`${this.apiUrl}/between/${sender}/${recipientId}`, this.getHttpOptions())
      .pipe(
        retry(1),
        catchError(error => {
          console.error(`Error fetching messages between users ${sender} and ${recipientId}:`, error);
          return of([]);
        })
      );
  }

  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    console.log('Sending message:', message);

    return this.http.post<ChatMessage>(this.apiUrl, message, this.getHttpOptions())
      .pipe(
        retry(1),
        catchError(error => {
          console.error('Error sending message:', error);
          return of(message);
        })
      );
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        retry(1),
        catchError(error => {
          console.error(`Error deleting message with ID ${id}:`, error);
          return of(undefined);
        })
      );
  }
}

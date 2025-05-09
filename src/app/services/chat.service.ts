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
  private apiUrl = 'http://localhost:8089/api/chat/messages';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Requested-With'
      })
    };
  }

  getAllMessages(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(this.apiUrl, this.getHttpOptions())
      .pipe(
        retry(1), // Retry once before giving up
        catchError(error => {
          console.error('Error fetching all messages:', error);
          return throwError(() => new Error('Erreur lors de la récupération des messages. Veuillez réessayer.'));
        })
      );
  }

  getMessagesBetweenUsers(sender: string, recipientId: string): Observable<ChatMessage[]> {
    console.log(`Fetching messages between users ${sender} and ${recipientId}...`);

    // Récupérer les messages de la base de données
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/between/${sender}/${recipientId}`, this.getHttpOptions())
      .pipe(
        retry(1), // Retry once before giving up
        catchError(error => {
          console.error(`Error fetching messages between users ${sender} and ${recipientId}:`, error);

          // Retourner un tableau vide en cas d'erreur
          return of([]);
        })
      );
  }



  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    console.log('Sending message:', message);

    // Envoyer le message à la base de données
    return this.http.post<ChatMessage>(this.apiUrl, message, this.getHttpOptions())
      .pipe(
        retry(1), // Retry once before giving up
        catchError(error => {
          console.error('Error sending message:', error);

          // Retourner le message original en cas d'erreur
          return of(message);
        })
      );
  }



  deleteMessage(id: number): Observable<void> {
    // Supprimer le message de la base de données
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        retry(1), // Retry once before giving up
        catchError(error => {
          console.error(`Error deleting message with ID ${id}:`, error);

          // Retourner un observable vide en cas d'erreur
          return of(undefined);
        })
      );
  }
}
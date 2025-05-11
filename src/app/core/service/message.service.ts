import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message, Commentaire } from '../models/Message';
import { MessageLikeStats } from '../models/MessageLikeStats';
import { UserLikeStats } from '../models/userlikestats';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:8090/messages/messages';
  private appUrl = 'http://localhost:8090/messages/api/comments';

  constructor(private httpservice: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  getMessages(): Observable<Message[]> {
    return this.httpservice.get<Message[]>(
      `http://localhost:8090/messages/api/comments/sort/positive/message`,
      this.getHttpOptions()
    );
  }

  deleteMessage(id: number): Observable<void> {
    return this.httpservice.delete<void>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  addMessage(message: Message, id_user: number): Observable<void> {
    return this.httpservice.post<void>(
      `${this.apiUrl}/messages/${id_user}`,
      message,
      this.getHttpOptions()
    );
  }

  countLikes(messageId: number): Observable<number> {
    return this.httpservice.get<number>(
      `http://localhost:8090/messages/messages/${messageId}/likes/count`,
      this.getHttpOptions()
    );
  }

  likeMessage(messageId: number, userId: number, like: boolean): Observable<any> {
    const body = { messageId, userId, like };
    return this.httpservice.post(
      `http://localhost:8090/messages/messages/like/${userId}`,
      body,
      this.getHttpOptions()
    );
  }

  hasUserLiked(messageId: number, userId: number): Observable<boolean> {
    return this.httpservice.get<boolean>(
      `${this.apiUrl}/${messageId}/likes/${userId}`,
      this.getHttpOptions()
    );
  }

  getLikeStats(): Observable<MessageLikeStats[]> {
    return this.httpservice.get<MessageLikeStats[]>(
      `${this.apiUrl}/likes/stats`,
      this.getHttpOptions()
    );
  }

  getUserLikeStats(): Observable<UserLikeStats[]> {
    return this.httpservice.get<UserLikeStats[]>(
      `${this.apiUrl}/users/like-stats`,
      this.getHttpOptions()
    );
  }

  addComment(messageId: number, userId: number, contenu: string): Observable<any> {
    return this.httpservice.post(
      `${this.appUrl}/add`,
      null,
      {
        params: { messageId, userId, contenu },
        ...this.getHttpOptions()
      }
    );
  }

  countComments(messageId: number): Observable<number> {
    return this.httpservice.get<number>(
      `${this.appUrl}/message/${messageId}/count`,
      this.getHttpOptions()
    );
  }

  getCommentsForMessage(messageId: number): Observable<Commentaire[]> {
    return this.httpservice.get<Commentaire[]>(
      `http://localhost:8090/messages/api/comments/message/${messageId}`,
      this.getHttpOptions()
    );
  }

  getSortCommentsForMessage(messageId: number): Observable<Commentaire[]> {
    return this.httpservice.get<Commentaire[]>(
      `http://localhost:8090/messages/api/comments/sort/message/${messageId}`,
      this.getHttpOptions()
    );
  }
}

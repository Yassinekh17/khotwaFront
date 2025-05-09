import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message ,Commentaire } from '../models/Message';
import { MessageLikeStats } from '../models/MessageLikeStats';
import { UserLikeStats } from '../models/userlikestats';


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl = "http://localhost:8089/messages";
  private appUrl = 'http://localhost:8089/api/comments';
  constructor(private httpservice: HttpClient) {}
  getMessages(): Observable<Message[]> {
    return this.httpservice.get<Message[]>(`http://localhost:8089/api/comments/sort/positive/message`);
  }
  deleteMessage(id: number): Observable<void> {
    return this.httpservice.delete<void>(`${this.apiUrl}/${id}`);
  }
  addMessage(message: Message): Observable<void> {
    return this.httpservice.post<void>(`${this.apiUrl}/messages`, message);
  }
  countLikes(messageId: number): Observable<number> {
    return this.httpservice.get<number>(`http://localhost:8089/messages/${messageId}/likes/count`);
  }
  
  likeMessage(messageId: number, userId: number, like: boolean): Observable<any> {
    const body = {
      messageId,
      userId,
      like
    };
    return this.httpservice.post('http://localhost:8089/messages/like', body);
  }

  hasUserLiked(messageId: number, userId: number): Observable<boolean> {
    return this.httpservice.get<boolean>(`${this.apiUrl}/${messageId}/likes/${userId}`);
  }
  
  getLikeStats(): Observable<MessageLikeStats[]> {
    return this.httpservice.get<MessageLikeStats[]>(`${this.apiUrl}/likes/stats`);
  }
  
  getUserLikeStats(): Observable<UserLikeStats[]> {
    return this.httpservice.get<UserLikeStats[]>(`${this.apiUrl}/users/like-stats`);
  }
  addComment(messageId: number, userId: number, contenu: string): Observable<any> {
    return this.httpservice.post(`${this.appUrl}/add`, null, {
      params: {
        messageId,
        userId,
        contenu
      }
    });
  }

  countComments(messageId: number): Observable<number> {
    return this.httpservice.get<number>(`${this.appUrl}/message/${messageId}/count`);
  }
  getCommentsForMessage(messageId: number): Observable<Commentaire[]> {
    return this.httpservice.get<Commentaire[]>(`http://localhost:8089/api/comments/message/${messageId}`);
  }
  
  getSortCommentsForMessage(messageId: number): Observable<Commentaire[]> {
    return this.httpservice.get<Commentaire[]>(`http://localhost:8089/api/comments/sort/message/${messageId}`);
  }
  
}

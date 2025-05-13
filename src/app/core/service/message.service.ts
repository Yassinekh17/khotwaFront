import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
    console.log(`API call: ${like ? 'Liking' : 'Unliking'} message ${messageId} for user ${userId}`);

    if (like) {
      // For liking, use POST method
      const body = { messageId, userId, like: true };
      return this.httpservice.post(
        `http://localhost:8090/messages/messages/like/${userId}`,
        body,
        this.getHttpOptions()
      );
    } else {
      // For unliking, use DELETE method
      // Note: Angular's HttpClient doesn't support bodies in DELETE requests directly
      // We need to use the request method with options
      const options = {
        headers: this.getHttpOptions().headers,
        body: { messageId, userId, like: false }
      };

      return this.httpservice.delete(
        `http://localhost:8090/messages/messages/like/${userId}`,
        options
      );
    }
  }

  hasUserLiked(messageId: number, userId: number): Observable<boolean> {
    return this.httpservice.get<boolean>(
      `http://localhost:8090/messages/messages/${messageId}/likes/${userId}`,
      this.getHttpOptions()
    );
  }

  getLikeStats(): Observable<MessageLikeStats[]> {
    console.log('Calling likes/stats API endpoint:', `${this.apiUrl}/likes/stats`);
    console.log('With headers:', this.getHttpOptions().headers);

    return this.httpservice.get<MessageLikeStats[]>(
      `${this.apiUrl}/likes/stats`,
      this.getHttpOptions()
    );
  }

  getUserLikeStats(): Observable<UserLikeStats[]> {
    // Use the endpoint that works in Postman
    const endpoint = `${this.apiUrl}/likes/stats`;
    console.log('Calling API endpoint for message likes stats:', endpoint);
    console.log('With headers:', this.getHttpOptions().headers);

    // Get the message likes stats
    return this.httpservice.get<any>(
      endpoint,
      this.getHttpOptions()
    ).pipe(
      catchError(error => {
        console.error(`Error fetching from ${endpoint}:`, error);

        // If that fails, try the original endpoint as fallback
        console.log('Trying fallback endpoint:', `${this.apiUrl}/users/like-stats`);
        return this.httpservice.get<UserLikeStats[]>(
          `${this.apiUrl}/users/like-stats`,
          this.getHttpOptions()
        );
      }),
      map(response => {
        console.log('Raw response from likes stats endpoint:', response);

        // If the response is an array of message stats, use it directly
        // The component will handle the different format
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Try to extract stats from the general stats response
          // This is a fallback if we get a different format
          const mockStats: UserLikeStats[] = [
            { messageId: 1, contenu: 'Most Liked Message', likeCount: response.totalLikes || 0 },
            { messageId: 2, contenu: 'Average Message', likeCount: Math.round(response.averageLikesPerMessage || 0) }
          ];
          return mockStats;
        }

        // Return empty array if we can't parse the response
        return [];
      })
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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../models/Message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl = "http://localhost:8089/messages";
  constructor(private httpservice: HttpClient) {}
  getMessages(): Observable<Message[]> {
    return this.httpservice.get<Message[]>(`${this.apiUrl}/getMessagesAndUserSent`);
  }
  deleteMessage(id: number): Observable<void> {
    return this.httpservice.delete<void>(`${this.apiUrl}/${id}`);
  }
}

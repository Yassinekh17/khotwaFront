import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CommentaireEvenement {
  id?: number;
  texte: string;
  datePublication?: Date;
  note?: number;
  user?: any;
  evenement?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CommentaireService {
  private apiUrl = `${environment.apiUrl}/commentaires`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // or sessionStorage
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllCommentaires(): Observable<CommentaireEvenement[]> {
    return this.http.get<CommentaireEvenement[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  getCommentaireById(id: number): Observable<CommentaireEvenement> {
    return this.http.get<CommentaireEvenement>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  addCommentaire(commentaire: CommentaireEvenement): Observable<CommentaireEvenement> {
    return this.http.post<CommentaireEvenement>(`${this.apiUrl}/add`, commentaire, {
      headers: this.getAuthHeaders()
    });
  }

  updateCommentaire(id: number, commentaire: CommentaireEvenement): Observable<CommentaireEvenement> {
    return this.http.put<CommentaireEvenement>(`${this.apiUrl}/update/${id}`, commentaire, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCommentaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCommentairesByEventId(eventId: number): Observable<CommentaireEvenement[]> {
    return this.http.get<CommentaireEvenement[]>(`${this.apiUrl}/event/${eventId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCommentairesByUserId(userId: number): Observable<CommentaireEvenement[]> {
    return this.http.get<CommentaireEvenement[]>(`${this.apiUrl}/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCommentairesByEventAndUserId(eventId: number, userId: number): Observable<CommentaireEvenement[]> {
    return this.http.get<CommentaireEvenement[]>(`${this.apiUrl}/event/${eventId}/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  ajouterCommentaire(eventId: number, userId: number, commentaire: { texte: string; note: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/add/${eventId}/${userId}`, commentaire, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    });
  }
}

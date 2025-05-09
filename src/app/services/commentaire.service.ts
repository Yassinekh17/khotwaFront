import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // Récupérer tous les commentaires
  getAllCommentaires(): Observable<CommentaireEvenement[]> {
    return this.http.get<CommentaireEvenement[]>(`${this.apiUrl}/all`);
  }

  // Récupérer un commentaire par ID
  getCommentaireById(id: number): Observable<CommentaireEvenement> {
    return this.http.get<CommentaireEvenement>(`${this.apiUrl}/${id}`);
  }

  // Ajouter un nouveau commentaire
  addCommentaire(commentaire: CommentaireEvenement): Observable<CommentaireEvenement> {
    return this.http.post<CommentaireEvenement>(`${this.apiUrl}/add`, commentaire);
  }

  // Mettre à jour un commentaire
  updateCommentaire(id: number, commentaire: CommentaireEvenement): Observable<CommentaireEvenement> {
    return this.http.put<CommentaireEvenement>(`${this.apiUrl}/update/${id}`, commentaire);
  }

  // Supprimer un commentaire
  deleteCommentaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Récupérer les commentaires d'un événement spécifique
  getCommentairesByEventId(eventId: number): Observable<CommentaireEvenement[]> {
    return this.http.get<CommentaireEvenement[]>(`${this.apiUrl}/event/${eventId}`);
  }

  // Récupérer les commentaires d'un utilisateur spécifique
  getCommentairesByUserId(userId: number): Observable<CommentaireEvenement[]> {
    return this.http.get<CommentaireEvenement[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Récupérer les commentaires d'un événement pour un utilisateur spécifique
  getCommentairesByEventAndUserId(eventId: number, userId: number): Observable<CommentaireEvenement[]> {
    return this.http.get<CommentaireEvenement[]>(`${this.apiUrl}/event/${eventId}/user/${userId}`);
  }
  ajouterCommentaire(eventId: number, userId: number, commentaire: { texte: string; note: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/add/${eventId}/${userId}`, commentaire);
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interface pour représenter une inscription
export interface Inscription {
  inscriptionId?: number;
  nom: string;
  email: string;
  telephone: string;
  evenement?: {
    eventId: number;
  };
  user?: {
    id: number;
  };
  dateInscription?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Méthode pour rejoindre un événement avec un utilisateur statique d'ID 1
  joinEvent(eventId: number, inscriptionData: { nom: string, email: string, telephone: string }): Observable<any> {
    const userId = 1; // Utilisateur statique avec ID 1
    
    // Le backend actuel ne prend pas en compte les données du formulaire, il utilise uniquement les IDs
    // Traiter les erreurs de parsing JSON mais considérer les réponses 200 comme des succès
    return this.http.post(
      `${this.apiUrl}/inscriptions/create/${eventId}/${userId}`, 
      inscriptionData, 
      { ...this.httpOptions, responseType: 'text' }
    ).pipe(
      map(response => {
        // Si on reçoit une réponse (même si c'est du texte et pas du JSON valide)
        // considérons l'inscription comme réussie
        try {
          return JSON.parse(response);
        } catch (error) {
          // Si on ne peut pas parser la réponse comme JSON mais que le statut est 200,
          // on retourne un objet simplifié pour indiquer le succès
          console.warn('Réponse du serveur reçue mais non parsable comme JSON:', response);
          return { 
            success: true, 
            message: 'Inscription créée avec succès', 
            inscriptionId: -1 // ID temporaire/factice
          };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Si le statut est 200 OK malgré l'erreur de parsing, considérer comme un succès
        if (error.status === 200) {
          console.warn('Erreur de parsing JSON mais statut 200 OK, considérant comme succès');
          return of({ 
            success: true, 
            message: 'Inscription créée avec succès malgré des erreurs de format', 
            inscriptionId: -1
          });
        }
        
        // Sinon propager l'erreur normalement
        console.error('Erreur lors de l\'inscription:', error);
        return throwError(() => new Error('Échec de l\'inscription. Veuillez réessayer.'));
      })
    );
  }

  // Récupérer les inscriptions d'un utilisateur
  getUserInscriptions(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/inscriptions/user/${userId}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des inscriptions:', error);
        return throwError(() => new Error('Impossible de récupérer vos inscriptions.'));
      })
    );
  }

  // Compter les inscriptions pour un événement
  getInscriptionCount(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/inscriptions/count/${eventId}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération du nombre d\'inscriptions:', error);
        return throwError(() => new Error('Impossible de récupérer le nombre d\'inscriptions.'));
      })
    );
  }

  // Supprimer une inscription
  deleteInscription(inscriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inscriptions/delete/${inscriptionId}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression de l\'inscription:', error);
        return throwError(() => new Error('Impossible de supprimer l\'inscription.'));
      })
    );
  }
}
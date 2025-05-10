import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Or wherever you store your JWT
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  joinEvent(eventId: number, inscriptionData: { nom: string, email: string, telephone: string }, userId:number): Observable<any> {


    return this.http.post(
      `${this.apiUrl}/inscriptions/create/${eventId}/${userId}`,
      inscriptionData,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    ).pipe(
      map(response => {
        try {
          return JSON.parse(response);
        } catch {
          return {
            success: true,
            message: 'Inscription créée avec succès',
            inscriptionId: -1
          };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) {
          return of({
            success: true,
            message: 'Inscription créée avec succès malgré des erreurs de format',
            inscriptionId: -1
          });
        }
        return throwError(() => new Error('Échec de l\'inscription. Veuillez réessayer.'));
      })
    );
  }

  getUserInscriptions(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/inscriptions/user/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Impossible de récupérer vos inscriptions.'));
      })
    );
  }

  getInscriptionCount(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/inscriptions/count/${eventId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Impossible de récupérer le nombre d\'inscriptions.'));
      })
    );
  }

  deleteInscription(inscriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inscriptions/delete/${inscriptionId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Impossible de supprimer l\'inscription.'));
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LocalInscriptionService } from './local-inscription.service';

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

  constructor(
    private http: HttpClient,
    private localInscriptionService: LocalInscriptionService
  ) { }

  // Méthode pour s'inscrire à un événement selon le backend réel
  joinEvent(eventId: number, inscriptionData: { nom: string, email: string, telephone: string }): Observable<any> {
    const userId = 1; // Utilisateur statique avec ID 1

    // Préparer les données selon l'entité Inscription du backend
    const inscriptionPayload = {
      nom: inscriptionData.nom,
      email: inscriptionData.email,
      telephone: inscriptionData.telephone,
      // Le backend s'occupe de créer les relations automatiquement
    };

    // URL selon le backend controller: /inscriptions/create/{eventId}/{userId}
    const apiUrl = `${this.apiUrl}/inscriptions/create/${eventId}/${userId}`;
    console.log('📡 [InscriptionService] Tentative d\'inscription avec URL:', apiUrl);
    console.log('📡 [InscriptionService] Données envoyées:', inscriptionPayload);
    console.log('📡 [InscriptionService] Environment API URL:', this.apiUrl);

    return this.http.post(
      apiUrl,
      inscriptionPayload,
      this.httpOptions
    ).pipe(
      map(response => {
        console.log('✅ [InscriptionService] Inscription créée avec succès dans la base de données:', response);
        console.log('✅ [InscriptionService] Réponse du backend:', response);
        return {
          success: true,
          message: 'Inscription créée avec succès',
          data: response
        };
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ [InscriptionService] Erreur lors de l\'inscription backend:', error);
        console.error('❌ [InscriptionService] Statut HTTP:', error.status);
        console.error('❌ [InscriptionService] Message d\'erreur:', error.message);
        console.error('❌ [InscriptionService] Détails de l\'erreur:', error.error);
        console.error('❌ [InscriptionService] URL appelée:', apiUrl);

        // Fallback vers localStorage si backend échoue
        console.warn('🔄 [InscriptionService] Fallback vers sauvegarde locale');

        if (error.status === 400) {
          return throwError(() => new Error('L\'événement a atteint sa capacité maximale ou les données sont invalides.'));
        }

        return throwError(() => new Error('Échec de l\'inscription. Backend non disponible.'));
      })
    );
  }

  // Récupérer les inscriptions d'un événement (endpoint disponible dans le backend)
  getEventInscriptions(eventId: number): Observable<any> {
    const apiUrl = `${this.apiUrl}/inscriptions/event/${eventId}`;
    console.log('📡 [InscriptionService] Récupération des inscriptions d\'événement avec URL:', apiUrl);

    return this.http.get(apiUrl).pipe(
      map(response => {
        console.log('✅ [InscriptionService] Inscriptions d\'événement récupérées:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [InscriptionService] Erreur lors de la récupération des inscriptions d\'événement:', error);
        console.error('❌ [InscriptionService] URL appelée:', apiUrl);
        return throwError(() => new Error('Impossible de récupérer les inscriptions de l\'événement'));
      })
    );
  }

  // Pour "Mes Événements" - combine données backend et localStorage
  getUserInscriptions(userId: number = 1): Observable<any> {
    console.log('📋 [InscriptionService] Récupération des inscriptions utilisateur depuis backend et localStorage');

    const apiUrl = `${this.apiUrl}/inscriptions/user/${userId}`;
    console.log('📡 [InscriptionService] Tentative de récupération depuis backend:', apiUrl);

    return this.http.get(apiUrl).pipe(
      map((backendData: any) => {
        console.log('✅ [InscriptionService] Données backend récupérées:', backendData);

        // Get local data for merging
        const localData = this.getFormattedLocalInscriptions();
        console.log('📋 [InscriptionService] Données locales:', localData);

        // Merge backend and local data, avoiding duplicates
        const mergedData = this.mergeInscriptionData(backendData, localData);
        console.log('🔄 [InscriptionService] Données fusionnées:', mergedData);

        return mergedData;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ [InscriptionService] Erreur lors de la récupération depuis backend:', error);
        console.log('🔄 [InscriptionService] Fallback vers localStorage');

        // Fallback to local data if backend fails
        const localData = this.getFormattedLocalInscriptions();
        console.log('✅ [InscriptionService] Données locales retournées (fallback):', localData);
        return of(localData);
      })
    );
  }

  // Get formatted local inscriptions for "mes événements"
  private getFormattedLocalInscriptions(): any[] {
    const localInscriptions = this.localInscriptionService.getAllInscriptions();

    return localInscriptions
      .filter(insc => insc.status !== 'CANCELLED')
      .map(insc => ({
        inscriptionId: insc.id,
        nom: insc.userInfo.nom,
        email: insc.userInfo.email,
        telephone: insc.userInfo.telephone,
        dateInscription: insc.registrationDate.toISOString(),
        evenement: {
          eventId: insc.eventId,
          title: insc.event.title,
          description: insc.event.description,
          date: insc.event.date.toISOString(),
          location: insc.event.location,
          type: insc.event.type,
          status: insc.event.status,
          capacite: insc.event.capacite,
          maxParticipants: insc.event.maxParticipants,
          currentParticipants: insc.event.currentParticipants,
          technologie: insc.event.technologie,
          imageUrl: insc.event.imageUrl
        }
      }));
  }

  // Merge backend and local inscription data, avoiding duplicates
  private mergeInscriptionData(backendData: any[], localData: any[]): any[] {
    console.log('🔄 [InscriptionService] Fusion des données backend et locales');

    // Create a map to track unique events by eventId
    const mergedMap = new Map<number, any>();

    // Add backend data first
    if (Array.isArray(backendData)) {
      backendData.forEach(item => {
        if (item.evenement && item.evenement.eventId) {
          mergedMap.set(item.evenement.eventId, {
            ...item,
            source: 'backend'
          });
        }
      });
    }

    // Add local data, but don't overwrite backend data
    if (Array.isArray(localData)) {
      localData.forEach(item => {
        if (item.evenement && item.evenement.eventId) {
          if (!mergedMap.has(item.evenement.eventId)) {
            mergedMap.set(item.evenement.eventId, {
              ...item,
              source: 'local'
            });
          }
        }
      });
    }

    const mergedArray = Array.from(mergedMap.values());
    console.log('✅ [InscriptionService] Fusion terminée:', mergedArray.length, 'inscriptions uniques');
    return mergedArray;
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
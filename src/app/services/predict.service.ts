import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interface pour les recommandations de date et lieu
 */
export interface EventRecommendation {
  date: string;
  location: string;
  title?: string;      // Titre de l'événement
  type?: string;       // Type d'événement (conférence, workshop, etc.)
  category?: string;   // Catégorie d'événement (Développement, Cloud, etc.)
  city?: string;       // Ville où se déroule l'événement (Tunis, Sousse, etc.)
  expected_participants: number;
  location_score: number;
  location_capacity: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  // Coordonnées ajustées pour l'affichage sur la carte (pour éviter la superposition de marqueurs)
  displayCoordinates?: {
    lat: number;
    lng: number;
  };
  distance?: number;   // Distance en km par rapport à la position de l'utilisateur
  image?: string;      // URL de l'image du lieu
  description?: string; // Description du lieu ou de l'événement
  uniqueId?: string;   // Identifiant unique pour éviter les confusions
}

/**
 * Interface pour les informations de lieu
 */
export interface LocationInfo {
  name: string;
  score: number;
  capacity: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * Interface pour les préférences utilisateur
 */
export interface UserPreferences {
  location?: {
    lat: number;
    lng: number;
  };
  preferred_days?: number[];
  preferred_times?: number[];
  max_distance?: number;
  max_participants?: number;
  event_category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PredictService {
  // Essayer d'abord le port 5000, puis 8080, puis 8090
  private apiPorts = [5000, 8080, 8090];
  private apiUrl = 'http://localhost:8090/api'; // URL par défaut
  private portIndex = 0;

  constructor(private http: HttpClient) {
    console.log('PredictService initialisé avec URL:', this.apiUrl);
    this.testApiConnection();
  }

  /**
   * Teste la connexion à l'API et change de port si nécessaire
   */
  private testApiConnection(): void {
    this.http.get(`http://localhost:${this.apiPorts[this.portIndex]}/api`, { observe: 'response' })
      .pipe(
        catchError((error: any) => {
          console.warn(`API non accessible sur le port ${this.apiPorts[this.portIndex]}`);
          this.portIndex++;

          if (this.portIndex < this.apiPorts.length) {
            console.log(`Tentative avec le port ${this.apiPorts[this.portIndex]}...`);
            this.apiUrl = `http://localhost:${this.apiPorts[this.portIndex]}/api`;
            // Créer un nouvel Observable pour la prochaine tentative
            return this.http.get(`http://localhost:${this.apiPorts[this.portIndex]}/api`, { observe: 'response' });
          } else {
            console.error('Impossible de se connecter à l\'API sur tous les ports testés');
            return throwError(() => new Error('API inaccessible'));
          }
        })
      )
      .subscribe({
        next: (response) => {
          console.log(`API accessible sur le port ${this.apiPorts[this.portIndex]}`);
          this.apiUrl = `http://localhost:${this.apiPorts[this.portIndex]}/api`;
        },
        error: (err) => {
          console.error('Erreur finale lors de la connexion à l\'API:', err);
        }
      });
  }

  /**
   * Appelle l'API de prédiction pour déterminer la catégorie d'un événement
   * en fonction de son titre
   * @param title Titre de l'événement à classifier
   * @returns Observable contenant la réponse de l'API
   */
  predictEventCategory(title: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(`${this.apiUrl}/predict`, { title }, {
      headers: headers,
      responseType: 'text'
    }).pipe(
      map(response => {
        try {
          return JSON.parse(response);
        } catch (error) {
          console.error('Erreur de parsing JSON:', response);
          throw new Error('Format de réponse invalide');
        }
      }),
      catchError(error => {
        console.error('Erreur HTTP:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Appelle l'API de prédiction pour déterminer la catégorie d'un événement
   * en fonction de sa description
   * @param description Description de l'événement à classifier
   * @returns Observable contenant la catégorie prédite
   */
  predictCategory(description: string): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(`${this.apiUrl}/predict`, { title: description }, {
      headers: headers,
      responseType: 'text'
    }).pipe(
      map(response => {
        console.log('Réponse brute du serveur:', response);
        try {
          // Essayer d'abord d'analyser la réponse comme JSON valide
          const parsedResponse = JSON.parse(response);

          // Vérifier si la réponse a la structure attendue
          if (parsedResponse && parsedResponse.prediction) {
            return parsedResponse.prediction;
          }
          // Si la réponse est un objet mais sans la structure attendue
          else if (typeof parsedResponse === 'object') {
            console.warn('Structure de réponse inattendue:', parsedResponse);
            // Essayer de trouver la prédiction dans l'objet
            const keys = Object.keys(parsedResponse);
            if (keys.length > 0) {
              return parsedResponse[keys[0]].toString();
            }
          }
          // Si c'est une chaîne simple
          else if (typeof parsedResponse === 'string') {
            return parsedResponse;
          }

          throw new Error('Format de réponse invalide');
        } catch (error) {
          // Si ce n'est pas un JSON valide, essayer de traiter comme une chaîne
          console.warn('Erreur de parsing JSON, tentative de traitement alternatif:', response);

          // Chercher un motif qui pourrait correspondre à la prédiction
          const match = response.match(/"prediction"\s*:\s*"([^"]+)"/);
          if (match && match[1]) {
            return match[1];
          }

          throw new Error('Format de réponse invalide');
        }
      }),
      catchError(error => {
        console.error('Erreur HTTP complète:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtient des recommandations de dates et lieux pour maximiser la participation
   * @param numRecommendations Nombre de recommandations à obtenir
   * @param userPreferences Préférences de l'utilisateur (optionnel)
   * @returns Observable contenant les recommandations
   */
  getRecommendations(numRecommendations: number = 3, userPreferences?: UserPreferences): Observable<EventRecommendation[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Préparer les données à envoyer
    const requestData = {
      num_recommendations: numRecommendations,
      user_preferences: userPreferences || {}
    };

    console.log('Envoi des données de recommandation:', requestData);

    return this.http.post<{ recommendations: EventRecommendation[] }>(`${this.apiUrl}/recommend`,
      requestData,
      { headers }
    ).pipe(
      map(response => {
        console.log('Réponse de recommandation reçue:', response);
        return response.recommendations;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des recommandations:', error);
        return throwError(() => new Error('Impossible d\'obtenir des recommandations. Veuillez réessayer.'));
      })
    );
  }

  /**
   * Récupère les informations sur tous les lieux disponibles avec leurs scores
   * @returns Observable contenant les informations des lieux
   */
  getLocations(): Observable<LocationInfo[]> {
    return this.http.get<{ locations: LocationInfo[] }>(`${this.apiUrl}/locations`).pipe(
      map(response => response.locations),
      catchError(error => {
        console.error('Erreur lors de la récupération des lieux:', error);
        return throwError(() => new Error('Impossible d\'obtenir les informations des lieux. Veuillez réessayer.'));
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Define interfaces based on your backend model
export interface Evenement {
  eventId?: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  type: string;
  status?: Status_evenement;
  imageUrl?: string; // Added imageUrl property
  capacite: number; // Ajout du champ capacité
  maxParticipants: number; // Ajout du champ max participants
  currentParticipants?: number; // Ajout du champ participants actuels
  technologie?: string; // Nouveau champ pour la technologie IT
}

export enum Status_evenement {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/evenements`; // Using environment configuration

  constructor(private http: HttpClient) { }

  // Get all events
  getAllEvents(): Observable<Evenement[]> {
    // Try backend first, fallback to test data
    return this.http.get<Evenement[]>(`${this.apiUrl}/all`).pipe(
      catchError(() => {
        console.log('Using test data for events');
        return this.getTestEvents();
      })
    );
  }

  // Get test events data
  private getTestEvents(): Observable<Evenement[]> {
    const testEvents: Evenement[] = [
      {
        eventId: 1,
        title: 'Formation Angular Avancé',
        description: 'Maîtrisez les concepts avancés d\'Angular avec des projets pratiques',
        date: new Date('2025-01-15T10:00:00'),
        location: 'Salle de formation A',
        type: 'FORMATION',
        status: Status_evenement.UPCOMING,
        imageUrl: 'assets/img/landing.jpg',
        capacite: 30,
        maxParticipants: 30,
        currentParticipants: 15,
        technologie: 'Angular'
      },
      {
        eventId: 2,
        title: 'Workshop React & TypeScript',
        description: 'Découvrez les meilleures pratiques de développement avec React et TypeScript',
        date: new Date('2025-01-20T14:00:00'),
        location: 'Salle de formation B',
        type: 'WORKSHOP',
        status: Status_evenement.UPCOMING,
        imageUrl: 'assets/img/landing.jpg',
        capacite: 25,
        maxParticipants: 25,
        currentParticipants: 8,
        technologie: 'React'
      },
      {
        eventId: 3,
        title: 'Conférence IA & Machine Learning',
        description: 'Explorez les dernières avancées en intelligence artificielle',
        date: new Date('2025-01-25T09:00:00'),
        location: 'Amphithéâtre',
        type: 'CONFERENCE',
        status: Status_evenement.UPCOMING,
        imageUrl: 'assets/img/landing.jpg',
        capacite: 100,
        maxParticipants: 100,
        currentParticipants: 45,
        technologie: 'Intelligence Artificielle'
      }
    ];
    return of(testEvents);
  }
  sendEmailOnCompletion(event: Evenement): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/send-email-completion`, event);
  }
  // Get event by ID
  getEventById(eventId: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.apiUrl}/${eventId}`);
  }

  // Create a new event
  createEvent(event: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('EventService: Creating event with API URL:', `${this.apiUrl}/create`);
    console.log('EventService: Event data being sent:', event);

    return this.http.post(`${this.apiUrl}/create`, event, { headers }).pipe(
      catchError((error) => {
        console.error('EventService: Error creating event:', error);
        console.error('EventService: Error details:', error.error);
        throw error;
      })
    );
  }

  updateEvent(eventId: number, event: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put(`${this.apiUrl}/update/${eventId}`, event, { headers });
  }

  // Delete an event
  deleteEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${eventId}`);
  }

  // Generate QR code for an event
  generateQRCode(eventId: number, width: number = 200, height: number = 200): Observable<Blob> {
    const params = new HttpParams()
      .set('width', width.toString())
      .set('height', height.toString());

    return this.http.get(`${this.apiUrl}/${eventId}/qrcode`, {
      params,
      responseType: 'blob'
    });
  }

  // Export all events to CSV
  exportEventsToCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/csv`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/octet-stream')
    });
  }


  // Search events by status
  findEventsByStatus(status: Status_evenement): Observable<Evenement[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Evenement[]>(`${this.apiUrl}/search/by-status`, { params });
  }
}

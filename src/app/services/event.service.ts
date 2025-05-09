import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<Evenement[]>(`${this.apiUrl}/all`);
  }
  sendEmailOnCompletion(event: Evenement): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/send-email-completion`, event);
  }
  // Get event by ID
  getEventById(eventId: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.apiUrl}/${eventId}`);
  }

  // Create a new event
  createEvent(event: Evenement): Observable<Evenement> {
    return this.http.post<Evenement>(`${this.apiUrl}/create`, event);
  }

  updateEvent(eventId: number, event: Evenement): Observable<Evenement> {
    return this.http.put<Evenement>(`${this.apiUrl}/update/${eventId}`, event);
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

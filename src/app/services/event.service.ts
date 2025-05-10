import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Evenement {
  eventId?: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  type: string;
  status?: Status_evenement;
  imageUrl?: string;
  capacite: number;
  maxParticipants: number;
  currentParticipants?: number;
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
  private apiUrl = `${environment.apiUrl}/evenements`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllEvents(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  sendEmailOnCompletion(event: Evenement): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/send-email-completion`, event, {
      headers: this.getAuthHeaders()
    });
  }

  getEventById(eventId: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.apiUrl}/${eventId}`, {
      headers: this.getAuthHeaders()
    });
  }

  createEvent(event: Evenement, email: string): Observable<Evenement> {
    return this.http.post<Evenement>(`${this.apiUrl}/create/${email}`, event, {
      headers: this.getAuthHeaders()
    });
  }

  updateEvent(eventId: number, event: Evenement): Observable<Evenement> {
    return this.http.put<Evenement>(`${this.apiUrl}/update/${eventId}`, event, {
      headers: this.getAuthHeaders()
    });
  }

  deleteEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${eventId}`, {
      headers: this.getAuthHeaders()
    });
  }

  generateQRCode(eventId: number, width: number = 200, height: number = 200): Observable<Blob> {
    const params = new HttpParams()
      .set('width', width.toString())
      .set('height', height.toString());

    return this.http.get(`${this.apiUrl}/${eventId}/qrcode`, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  exportEventsToCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/csv`, {
      responseType: 'blob',
      headers: this.getAuthHeaders().set('Content-Type', 'application/octet-stream')
    });
  }

  findEventsByStatus(status: Status_evenement): Observable<Evenement[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Evenement[]>(`${this.apiUrl}/search/by-status`, {
      params,
      headers: this.getAuthHeaders()
    });
  }
}

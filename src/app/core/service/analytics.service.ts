import { HttpClient , HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private baseUrl = 'http://localhost:8090/api/statistics';

  constructor(private http: HttpClient) { }


  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  }

  getTotalUsers(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/users/total`, {
      headers: this.getAuthHeaders()
    });
  }

  getTotalUsersByRole(role: string): Observable<number> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.get<number>(`${this.baseUrl}/users/role/${role}`, { headers });
  }
  

  getTotalUserActions(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/activities/total`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserActionsLastMonth(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/activities/last-month`, {
      headers: this.getAuthHeaders()
    });
  }
}










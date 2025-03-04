import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserActivityService {
  private apiUrl = 'http://localhost:8050';

  constructor(private http: HttpClient) {}

  addUserActivity(email: string, action: String): Observable<void> {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Add JWT token to request
      'Content-Type': 'application/json',
    });
    const payload = { action: action };

    return this.http.post<void>(
      `${this.apiUrl}/addUserActivity/${email}`,
      payload,
      { headers }
    );
  }
  predictSatisfaction(email: string): Observable<string> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token
      'Content-Type': 'application/json',
    });

    return this.http.post<string>(
      `${this.apiUrl}/predict-satisfaction/${email}`,
      {}, // Empty body
      { headers }
    );
  }
}

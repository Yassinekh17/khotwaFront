import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserActivityService {
  private apiUrl = 'http://localhost:8090/user';

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
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    });
  
    return this.http.get<string>(
      `${this.apiUrl}/prediction/predict-satisfaction?email=${email}`,
      { headers } // Pass headers as the second (and only) argument
    );
  }
  
}

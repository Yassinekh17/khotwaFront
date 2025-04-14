import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote } from '../models/Quote';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private apiUrl = 'http://localhost:8090/api/quote';

  constructor(private http: HttpClient) {}

  // Function to get the token (you might store it in localStorage or use a service)
  private getToken(): string {
    return localStorage.getItem('token') || ''; // Adjust based on where you store the token
  }

  getQuoteOfTheDay(): Observable<Quote[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}` // Adding the token to the headers
    });

    return this.http.get<Quote[]>(this.apiUrl, { headers });
  }
}

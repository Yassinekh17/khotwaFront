import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  private apiUrl = 'http://localhost:8089/api/summary'; // URL de votre API Spring Boot

  constructor(private http: HttpClient) { }

  getSummary(text: String): Observable<string> {
    const payload = { text };
    return this.http.post<string>(this.apiUrl, payload); // On envoie un objet JSON { text: "..." }
  }
}

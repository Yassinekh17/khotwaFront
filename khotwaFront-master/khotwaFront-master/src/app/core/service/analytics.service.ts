import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private apiUrl = 'http://localhost:8050/api/analytics';

  constructor(private http: HttpClient) { }

  getActionsBetween(start: string, end: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/actions-between?start=${start}&end=${end}`);
  }
}

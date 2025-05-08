import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Useryass } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private backendUrl = 'http://localhost:8089';
  private modelApiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<Useryass[]> {
    return this.http.get<Useryass[]>(`${this.backendUrl}/retrieveAllUser`);
  }

  predictUserOutcome(user: Useryass): Observable<any> {
    const features = [
      user.sessionDuration,
      user.sessionsPerWeek,
      user.courseCompletion,
      user.userSatisfaction
    ];
    return this.http.post(`${this.modelApiUrl}/predict`, { features });
  }
}

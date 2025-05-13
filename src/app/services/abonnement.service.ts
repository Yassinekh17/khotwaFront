import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Abonnement } from '../models/abonnement.model';
import { TokenService } from '../core/service/token.service';

@Injectable({
  providedIn: 'root',
})
export class AbonnementService {
  private apiUrl = 'http://localhost:8090/payment/abonnements';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Get token from TokenService
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAbonnements(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAbonnementsByPlan(plan: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/allByPlan?plan=${plan}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAbonnementById(id: number): Observable<Abonnement> {
    return this.http.get<Abonnement>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  addAbonnement(abonnement: Abonnement, id_user: number) {
    return this.http.post<Abonnement>(`${this.apiUrl}/add/${id_user}`, abonnement, {
      headers: this.getAuthHeaders(),
    });
  }

  updateAbonnement(id: number, abonnement: Abonnement): Observable<Abonnement> {
    return this.http.put<Abonnement>(`${this.apiUrl}/update/${id}`, abonnement, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteAbonnement(id_abonnement: number) {
    return this.http.delete<Abonnement>(`${this.apiUrl}/delete/${id_abonnement}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAbonnementsSortedByPrice(sortDirection: string): Observable<Abonnement[]> {
    return this.http.get<Abonnement[]>(`${this.apiUrl}/sorted?sortDirection=${sortDirection}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAbonnementStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`, {
      headers: this.getAuthHeaders(),
    });
  }
}

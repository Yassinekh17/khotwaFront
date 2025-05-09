import { Injectable } from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Abonnement } from '../models/abonnement.model';

@Injectable({
  providedIn: 'root',
})
export class AbonnementService {
  private apiUrl = 'http://localhost:8089/abonnements'; // URL du backend

  constructor(private http: HttpClient) {}

  // Récupérer tous les abonnements
  getAbonnements(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`);
  }
   // Récupérer les abonnements par plan
   getAbonnementsByPlan(plan: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/allByPlan?plan=${plan}`);
  }

  // Récupérer un abonnement par ID
  getAbonnementById(id: number): Observable<Abonnement> {
    return this.http.get<Abonnement>(`${this.apiUrl}/${id}`);
  }

  // Ajouter un nouvel abonnement
  addAbonnement(abonnement: Abonnement){
    return this.http.post<Abonnement>(`${this.apiUrl}/add`, abonnement);
  }

  // Mettre à jour un abonnement
  updateAbonnement(id: number, abonnement: Abonnement): Observable<Abonnement> {
    return this.http.put<Abonnement>(`${this.apiUrl}/update/${id}`, abonnement);
  }

  // Supprimer un abonnement
  deleteAbonnement(id_abonnement: number) {
    return this.http.delete<Abonnement>(`${this.apiUrl}/delete/${id_abonnement}`);
  }
  // Méthode pour récupérer les abonnements triés par prix
  getAbonnementsSortedByPrice(sortDirection: string): Observable<Abonnement[]> {
    return this.http.get<Abonnement[]>(`${this.apiUrl}/sorted?sortDirection=${sortDirection}`);
  }

  // Méthode pour récupérer les statistiques
  getAbonnementStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }
 

  
}

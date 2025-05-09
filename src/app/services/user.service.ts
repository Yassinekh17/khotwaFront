import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, delay, map, of } from 'rxjs';

export interface User {
  id_user: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8089/users'; // Backend API URL

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    console.log('Fetching users...');

    // Récupérer les utilisateurs de la base de données
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<User[]>(this.apiUrl, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);

          // Retourner un tableau vide en cas d'erreur
          return of([]);
        })
      );
  }




}

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { User } from '../models/User';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserActivityService } from './user-activity.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8050';

  private keycloakLogoutUrl =
    'http://localhost:8081/realms/Khotwa/protocol/openid-connect/logout';
  constructor(
    private httpservice: HttpClient,
    private router: Router,
    private userActivityService: UserActivityService
  ) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token'); // Get token from local storage
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // ✅ GET all users with token authentication
  getUserList(): Observable<User[]> {
    return this.httpservice.get<User[]>(`${this.apiUrl}/getAllUsers`, {
      headers: this.getAuthHeaders(),
    });
  }
  getUserById(id: number): Observable<User> {
    return this.httpservice.get<User>(`${this.apiUrl}/getUserById/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ DELETE user with token authentication
  deleteUser(id: number): Observable<void> {
    return this.httpservice.delete<void>(`${this.apiUrl}/deleteByIdB/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ UPDATE user with token authentication
  updateUser(user: User): Observable<User> {
    return this.httpservice.put<User>(`${this.apiUrl}/updateUser`, user, {
      headers: this.getAuthHeaders(),
    });
  }
  addUser(user: User) {
    return this.httpservice.post('http://localhost:8050/addUser', user);
  }

  authenticate(authvalues: { username: string; password: string }) {
    const url =
      'http://localhost:8081/realms/Khotwa/protocol/openid-connect/token';

    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', 'khotwa-rest-api')
      .set('username', authvalues.username)
      .set('password', authvalues.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    console.log('Request body:', body.toString());

    return this.httpservice.post(url, body.toString(), { headers });
  }
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');

    return this.httpservice.post<any>(
      'http://localhost:8081/realms/Khotwa/protocol/openid-connect/token',
      {
        grant_type: 'refresh_token',
        client_id: 'khotwa_rest_api',
        refresh_token: refreshToken,
      }
    );
  }
  register(
    nom: string,
    prenom: string,
    email: string,
    password: string,
    role: string,
    image: File | null
  ): Observable<any> {
    const formData = new FormData();
    formData.append('nom', nom); // Align with backend 'nom'
    formData.append('prenom', prenom); // Align with backend 'prenom'
    formData.append('email', email);
    formData.append('mdp', password); // Make sure to send 'mdp' for the password
    formData.append('role', role);

    // If an image is provided, add it to the form data
    if (image) {
      formData.append('image', image);
    }

    // Adjust the URL according to your backend API
    const url = 'http://localhost:8050/registerUser';

    return this.httpservice.post(url, formData);
  }
  getUserByEmail(email: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.httpservice.get<any>(
      `http://localhost:8050/getUserByEmail/${email}`,
      { headers }
    );
  }
  getUsernameFromToken(): string | null {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token) return null; // No token found

    try {
      const decoded: any = jwtDecode(token); // Decode the token
      return decoded.preferred_username || decoded.email || decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  logout() {
    const email = this.getUsernameFromToken();
    console.log('email: from logout : ', email);
    this.userActivityService.addUserActivity(email, 'LOGOUT').subscribe({
      next: () => console.log('User activity logged: LOGOUT'),

      error: (err) => console.error('Failed to log user activity:', err),
    });
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/auth/login']);
    // 🗑️ Step 1: Remove tokens from localStorage
  }
}

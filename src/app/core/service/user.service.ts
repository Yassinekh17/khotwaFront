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
import { Useryass } from '../models/Useryass';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8090/user';
    private backendUrl = 'http://localhost:8089';
  private modelApiUrl = 'http://localhost:5000';

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
   getAllUsers(): Observable<Useryass[]> {
    return this.httpservice.get<Useryass[]>(`${this.backendUrl}/retrieveAllUser`);
  }

  predictUserOutcome(user: Useryass): Observable<any> {
    const features = [
      user.sessionDuration,
      user.sessionsPerWeek,
      user.courseCompletion,
      user.userSatisfaction
    ];
    return this.httpservice.post(`${this.modelApiUrl}/predict`, { features });
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
  updateUser(
    userId: string,
    nom: string,
    prenom: string,
    email: string,
    password: string,
    role: string,
    image: File | null
  ): Observable<any> {
    console.log('nom in service', nom);

    // Create FormData and append regular form fields
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('nom', nom);
    formData.append('prenom', prenom);
    formData.append('email', email);
    formData.append('mdp', password); // Password field (mdp)
    formData.append('role', role);

    // If an image is provided, append it to the FormData
    if (image) {
      console.log('Appending image:', image.name); // Debugging
      formData.append('image', image, image.name);
    } else {
      console.warn('No image provided');
    }

    // Get the token from local storage
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Log the token to verify it

    // Set the authorization header (no need for 'Content-Type' here)
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      // No need to explicitly set 'Content-Type' for FormData, it will be set automatically
    });

    // Define the API endpoint for the update request
    const url = 'http://localhost:8090/user/updateUser';
    console.log('formdata in user service', formData);

    // Send the PUT request with FormData and headers
    return this.httpservice.put(url, formData, { headers: headers });
  }

  addUser(user: User) {
    return this.httpservice.post('http://localhost:8090/addUser', user);
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
    image: File | null,
    age:string,
    gender: string,
    country: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('nom', nom); // Align with backend 'nom'
    formData.append('prenom', prenom); // Align with backend 'prenom'
    formData.append('email', email);
    formData.append('mdp', password); // Make sure to send 'mdp' for the password
    formData.append('role', role);
    formData.append('age', age);formData.append('gender', gender);formData.append('country', country);
    // If an image is provided, add it to the form data
    if (image) {
      formData.append('image', image);
    }

    // Adjust the URL according to your backend API
    const url = 'http://localhost:8090/user/registerUser';

    return this.httpservice.post(url, formData);
  }
  getUserByEmail(email: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.httpservice.get<any>(
      `http://localhost:8090/user/getUserByEmail/${email}`,
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

  }


  forgotpw(username: string, newPassword: string) {
    const url = `${this.apiUrl}/update-password?username=${encodeURIComponent(username)}&newPassword=${encodeURIComponent(newPassword)}`;

    return this.httpservice.put(url, null);
  }

// user.service.ts or wherever the request is made
updateRating(email: string, rating: number): Observable<any> {
  const token = localStorage.getItem('token'); // or sessionStorage, wherever you store the JWT
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.httpservice.put(`${this.apiUrl}/update-rating?email=${email}&siteRating=${rating}`, null, { headers });
}

// Complete user update method that includes age, gender, and country
updateUserComplete(
  userId: string,
  nom: string,
  prenom: string,
  email: string,
  password: string,
  role: string,
  age: string,
  gender: string,
  country: string,
  image: File | null
): Observable<any> {
  // Create FormData and append regular form fields
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('nom', nom);
  formData.append('prenom', prenom);
  formData.append('email', email);
  formData.append('mdp', password); // Password field (mdp)
  formData.append('role', role);

  // Add the new fields
  if (age) formData.append('age', age);
  if (gender) formData.append('gender', gender);
  if (country) formData.append('country', country);

  // If an image is provided, append it to the FormData
  if (image) {
    console.log('Appending image:', image.name);
    formData.append('image', image, image.name);
  }

  // Get the token from local storage
  const token = localStorage.getItem('token');

  // Set the authorization header
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  // Define the API endpoint for the update request
  const url = 'http://localhost:8090/user/updateUser';

  // Send the PUT request with FormData and headers
  return this.httpservice.put(url, formData, { headers: headers });
}

}

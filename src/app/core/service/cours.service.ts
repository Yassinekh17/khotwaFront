import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cours } from '../models/Cours';

@Injectable({
  providedIn: 'root',
})
export class CoursService {
  private apiUrl = 'http://localhost:8090/cours/retrieveAllCours';
  private addUrl = 'http://localhost:8090/cours/addCours';
  private searchUrl = 'http://localhost:8090';
  private getUrl = 'http://localhost:8090/cours/retrieveCours'; 

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Or sessionStorage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCoursList(): Observable<Cours[]> {
    console.log('JWT token:', this.getAuthHeaders()); // Should NOT be null

    return this.http.get<Cours[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  

  }

  addCours(cours: Cours, imageFile: File, fichierFile?: File, videoFile?: File): Observable<Cours> {
    const formData = new FormData();
    formData.append('cours', new Blob([JSON.stringify(cours)], {
      type: 'application/json'
    }));
    formData.append('image', imageFile);
    if (fichierFile) formData.append('fichier', fichierFile);
    if (videoFile) formData.append('video', videoFile);

    return this.http.post<Cours>(this.addUrl, formData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCours(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8090/cours/deleteCours/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateCours(cours: Cours): Observable<Cours> {
    return this.http.put<Cours>(`${this.apiUrl}/cours/updateCours`, cours, {
      headers: this.getAuthHeaders()
    });
  }

  searchCours(titre: string): Observable<Cours[]> {
    const url = titre ? `http://localhost:8090/cours/search?titre=${titre}` : this.apiUrl;
    return this.http.get<Cours[]>(url, {
      headers: this.getAuthHeaders()
    });
  }

  downloadPdf() {
    return this.http.get('http://localhost:8090/cours/pdf/export-pdf', {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
      observe: 'response'
    });
  }

  searchCoursByCategory(category: string): Observable<Cours[]> {
    return this.http.get<Cours[]>(`http://localhost:8090/cours/searchByCategory?category=${category}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCoursById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.getUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}

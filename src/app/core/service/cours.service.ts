// src/app/core/service/cours.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cours } from '../models/Cours';

@Injectable({
  providedIn: 'root',
})
export class CoursService {
  private apiUrl = 'http://localhost:8089/retrieveAllCours';
  private addUrl = 'http://localhost:8090/addCours';
  private searchUrl = 'http://localhost:8089';
  private getUrl = 'http://localhost:8089/retrieveCours'; 

  constructor(private http: HttpClient) {}

  getCoursList(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.apiUrl);
  }

  addCours(cours: Cours, imageFile: File,fichierFile?: File, videoFile?: File): Observable<Cours> {
    const formData = new FormData();
    formData.append('cours', new Blob([JSON.stringify(cours)], {
      type: 'application/json'
    }));
    formData.append('image', imageFile);
    if (fichierFile) formData.append('fichier', fichierFile);
    if (videoFile) formData.append('video', videoFile);
    return this.http.post<Cours>(this.addUrl, formData);
  }



  deleteCours(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8089/deleteCours/${id}`);
  }
  updateCours(cours: Cours): Observable<Cours> {
    return this.http.put<Cours>(`${this.apiUrl}/updateCours`, cours);
  }
  searchCours(titre: string): Observable<Cours[]> {
    if (!titre) {
      return this.getCoursList(); // If empty search, fetch all courses
    }
    return this.http.get<Cours[]>(`http://localhost:8089/search?titre=${titre}`);
  }
  downloadPdf() {
    return this.http.get('http://localhost:8089/pdf/export-pdf', { // Add full URL for testing
        responseType: 'blob',
        observe: 'response' // Get full response
    });
}
searchCoursByCategory(category: string): Observable<Cours[]> {
  return this.http.get<Cours[]>(`http://localhost:8089/searchByCategory?category=${category}`);
}
getCoursById(id: number): Observable<Cours> {
  return this.http.get<Cours>(`${this.getUrl}/${id}`);
}

 
}

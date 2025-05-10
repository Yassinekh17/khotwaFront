import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quizz, Question, Reponse } from '../models/Cours';

@Injectable({
  providedIn: 'root'
})
export class QuizzService {
  private apiUrl = 'http://localhost:8090/cours';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Or sessionStorage if you use that
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createQuizz(quizz: Quizz): Observable<Quizz> {
    return this.http.post<Quizz>(`${this.apiUrl}/addQuizz`, quizz, {
      headers: this.getAuthHeaders()
    });
  }

  addQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/addQuestion`, question, {
      headers: this.getAuthHeaders()
    });
  }

  addReponse(reponse: Reponse): Observable<Reponse> {
    return this.http.post<Reponse>(`${this.apiUrl}/addReponse`, reponse, {
      headers: this.getAuthHeaders()
    });
  }

  getAllQuizzes(): Observable<Quizz[]> {
    return this.http.get<Quizz[]>(`${this.apiUrl}/retrieveAllQuizz`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteQuizz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteQuizz/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getQuizzById(id: number): Observable<Quizz> {
    return this.http.get<Quizz>(`${this.apiUrl}/retrieveQuizz/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/retrieveAllQuestions`, {
      headers: this.getAuthHeaders()
    });
  }

  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/questionsByQuizz/${quizId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getReponsesByQuestionId(questionId: number): Observable<Reponse[]> {
    return this.http.get<Reponse[]>(`${this.apiUrl}/reponsesByQuestion/${questionId}`, {
      headers: this.getAuthHeaders()
    });
  }

  generateCertificate(quizId: number, score: number, totalQuestions: number, idUser: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/certificates/generate/${quizId}/${score}/${totalQuestions}/${idUser}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}

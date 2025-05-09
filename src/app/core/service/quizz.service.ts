// src/app/core/service/quizz.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quizz, Question, Reponse } from '../models/Cours';

@Injectable({
  providedIn: 'root'
})
export class QuizzService {
  private apiUrl = 'http://localhost:8089';

  constructor(private http: HttpClient) { }

  createQuizz(quizz: Quizz): Observable<Quizz> {
    return this.http.post<Quizz>(`${this.apiUrl}/addQuizz`, quizz);
  }

  addQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/addQuestion`, question);
  }

  addReponse(reponse: Reponse): Observable<Reponse> {
    return this.http.post<Reponse>(`${this.apiUrl}/addReponse`, reponse);
  }
  getAllQuizzes(): Observable<Quizz[]> {
    return this.http.get<Quizz[]>(`${this.apiUrl}/retrieveAllQuizz`);
  }

  deleteQuizz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteQuizz/${id}`);
  }
  getQuizzById(id: number): Observable<Quizz> {
    return this.http.get<Quizz>(`${this.apiUrl}/retrieveQuizz/${id}`);
    
  }
  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/retrieveAllQuestions`);
  }
  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/questionsByQuizz/${quizId}`);
  }
  getReponsesByQuestionId(questionId: number): Observable<Reponse[]> {
    return this.http.get<Reponse[]>(`${this.apiUrl}/reponsesByQuestion/${questionId}`);
  }
  generateCertificate(quizId: number, score: number, totalQuestions: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/certificates/generate/${quizId}/${score}/${totalQuestions}`, 
      {
        responseType: 'blob'
      }
    );
  }
  
}
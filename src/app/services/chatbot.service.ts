import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';
  private readonly apiKey = 'AIzaSyDXyMzZMWZrhD8XOR30WgdQSZ2DaOhbk9c'; // Remplacez par votre clé

  constructor(private http: HttpClient) {}

  sendPrompt(prompt: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7, // Contrôle la créativité (0-1)
        maxOutputTokens: 1000 // Limite la longueur de réponse
      }
    };

    return this.http.post<any>(
      `${this.apiUrl}?key=${this.apiKey}`,
      body,
      { headers }
    ).pipe(
      map(response => {
        // Extraction du texte de réponse
        if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Structure de réponse inattendue');
        }
        return response.candidates[0].content.parts[0].text;
      }),
      catchError(error => {
        console.error('Erreur API Gemini:', error);
        return throwError(() => new Error('Une erreur est survenue lors de la génération'));
      })
    );
  }
}
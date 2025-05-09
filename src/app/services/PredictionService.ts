import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'http://localhost:5000/predict'; // URL de l'API Flask
  private mockMode = true; // Activer le mode mock pour la démo

  constructor(private http: HttpClient) {}

  // Méthode pour envoyer la requête de prédiction à Flask
  predict(data: { category: string; region: string; payment: string }): Observable<any> {
    if (this.mockMode) {
      // Mode mock pour la démo - génère une prédiction aléatoire
      return this.getMockPrediction(data);
    }

    // Mode réel - envoie la requête à l'API
    return this.http.post<any>(this.apiUrl, data).pipe(
      catchError(error => {
        console.error('Erreur API:', error);
        // Fallback vers le mock en cas d'erreur
        return this.getMockPrediction(data);
      })
    );
  }

  // Génère une prédiction simulée basée sur les données d'entrée
  private getMockPrediction(data: { category: string; region: string; payment: string }): Observable<any> {
    // Simuler un délai réseau
    return of({
      prediction: this.calculateMockPrediction(data),
      details: {
        category_factor: Math.random() * 0.3 + 0.7,
        region_factor: Math.random() * 0.3 + 0.7,
        payment_factor: Math.random() * 0.3 + 0.7
      }
    }).pipe(delay(1500)); // Délai simulé de 1.5 secondes
  }

  // Calcule une prédiction basée sur les données d'entrée
  private calculateMockPrediction(data: { category: string; region: string; payment: string }): number {
    // Facteurs de base pour chaque catégorie (pour la démo)
    const categoryFactors: {[key: string]: number} = {
      'home': 0.78,
      'electronic': 0.85,
      'clothing': 0.75
    };

    const regionFactors: {[key: string]: number} = {
      'north': 0.82,
      'south': 0.76,
      'east': 0.80,
      'west': 0.84
    };

    const paymentFactors: {[key: string]: number} = {
      'paypal': 0.82,
      'debit': 0.78,
      'credit': 0.85
    };

    // Recherche des facteurs correspondants (insensible à la casse)
    const categoryLower = data.category.toLowerCase();
    const regionLower = data.region.toLowerCase();
    const paymentLower = data.payment.toLowerCase();

    // Obtenir les facteurs pour chaque entrée
    const categoryFactor = categoryFactors[categoryLower] || 0.75;
    const regionFactor = regionFactors[regionLower] || 0.75;
    const paymentFactor = paymentFactors[paymentLower] || 0.75;

    // Calculer la prédiction finale avec une petite variation aléatoire
    const basePrediction = (categoryFactor * 0.4 + regionFactor * 0.4 + paymentFactor * 0.2) * 100;
    const randomVariation = Math.random() * 10 - 5; // Variation de ±5%

    // Retourner la prédiction arrondie entre 0 et 100
    return Math.min(100, Math.max(0, Math.round(basePrediction + randomVariation)));
  }
}

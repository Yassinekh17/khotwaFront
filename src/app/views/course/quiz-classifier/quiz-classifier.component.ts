import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface PredictionResult {
  prediction: string;
  confidence?: number;
}

@Component({
  selector: 'app-quiz-classifier',
  templateUrl: './quiz-classifier.component.html',
  styleUrls: ['./quiz-classifier.component.css']
})
export class QuizClassifierComponent {
  // API Configuration
  private apiUrl = 'http://localhost:5000/predict';

  // Form data
  sessionDuration: number = 2.5;
  sessionsPerWeek: number = 3;
  courseCompletion: number = 50;
  userSatisfaction: number = 75;

  // Results
  prediction: PredictionResult | null = null;

  // UI states
  predicting: boolean = false;

  // Error handling
  error: string = '';

  constructor(private http: HttpClient) {}

  // Predict student success using ML model
  predict(): void {
    // Validate inputs
    if (this.sessionDuration <= 0 || this.sessionsPerWeek < 1 ||
        this.courseCompletion <= 0 || this.courseCompletion > 100 ||
        this.userSatisfaction <= 0 || this.userSatisfaction > 100) {
      this.error = 'Veuillez saisir des valeurs valides pour tous les champs (durée > 0, sessions ≥ 1, autres > 0)';
      return;
    }

    this.predicting = true;
    this.error = '';
    this.prediction = null;

    const requestData = {
      SessionDuration: this.sessionDuration,
      SessionsPerWeek: this.sessionsPerWeek,
      CourseCompletion: this.courseCompletion,
      UserSatisfaction: this.userSatisfaction
    };

    console.log('Sending prediction request:', requestData);

    this.http.post<PredictionResult>(this.apiUrl, requestData).subscribe({
      next: (result) => {
        this.prediction = result;
        this.predicting = false;
        console.log('Prediction result:', result);
      },
      error: (error) => {
        console.error('Prediction error:', error);
        this.error = 'Erreur lors de la prédiction. Vérifiez que le serveur ML est démarré.';
        this.predicting = false;
      }
    });
  }

  // Clear all results
  clearResults(): void {
    this.prediction = null;
    this.error = '';
  }

  // Reset form
  resetForm(): void {
    this.sessionDuration = 2.5;
    this.sessionsPerWeek = 3;
    this.courseCompletion = 50;
    this.userSatisfaction = 75;
    this.clearResults();
  }

  // Get prediction color for display
  getPredictionColor(prediction: string): string {
    if (prediction.toLowerCase().includes('success') || prediction.toLowerCase().includes('pass')) {
      return 'bg-green-100 text-green-800';
    } else if (prediction.toLowerCase().includes('fail') || prediction.toLowerCase().includes('risk')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-blue-100 text-blue-800';
  }
}

import { Component, OnInit } from '@angular/core';
import { QuizzService } from 'src/app/core/service/quizz.service';
import { Quizz } from 'src/app/core/models/Cours';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "app-list-quizz",
  templateUrl: "./listQuizz.component.html",
  styleUrls: ['./listQuizz.component.css']
})
export class ListQuizzComponent implements OnInit {
  quizzes: Quizz[] = [];
  searchQuery: string = '';
  showModal = false;
    // Prediction popup control
    showPredictionPopup = false;
    showResultPopup = false;
    isLoading = false;
    features = {
      courseCompletion: null,
      sessionDuration: null,
      sessionsPerWeek: null,
      userSatisfaction: null
    };
    predictionResult: number | null = null;
  constructor(private quizzService: QuizzService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizzService.getAllQuizzes().subscribe({
      next: (data) => {
        this.quizzes = data;
      },
      error: (error) => {
        console.error('Error fetching quizzes:', error);
      }
    });
  }

  startQuiz(quizId: number): void {
    this.router.navigate(['/quiz', quizId]);
  }
  goToPrediction() {
    this.router.navigate(['/prediction']);
  }
  // Prediction flow
  openPredictionPopup() {
    this.showPredictionPopup = true;
    this.predictionResult = null;
  }

  closePredictionPopup() {
    this.showPredictionPopup = false;
  }

  closeResultPopup() {
    this.showResultPopup = false;
  }

  submitPrediction() {
    this.isLoading = true;
    const featureArray = [
      this.features.sessionDuration,
      this.features.sessionsPerWeek,
      this.features.courseCompletion,
      this.features.userSatisfaction
    ];

    this.http.post<{ prediction: number }>('http://localhost:5000/predict', { features: featureArray })
      .subscribe({
        next: (res) => {
          this.predictionResult = res.prediction;
          this.isLoading = false;
          this.showPredictionPopup = false;
          this.showResultPopup = true;
        },
        error: () => {
          this.predictionResult = null;
          this.isLoading = false;
          alert('Prediction failed.');
        }
      });
  }
  // Optional: Add search functionality if needed
  searchQuizzes(): void {
    if (this.searchQuery.trim() === '') {
      this.loadQuizzes();
    } else {
      this.quizzes = this.quizzes.filter(quiz =>
        quiz.nomQuizz.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
}
// src/app/quiz/quiz.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizzService } from 'src/app/core/service/quizz.service';
import { Quizz, Question, Reponse } from 'src/app/core/models/Cours';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/core/service/user.service';
@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ],standalone: true,
  imports: [CommonModule, FormsModule]
})
export class QuizComponent implements OnInit {
  userEmail!: string ;
  idUser!:number; 
  quizId!: number;
  quiz!: Quizz;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  selectedAnswer: string | null = null;
  isSubmitted = false;
  isCorrect = false;
  score = 0;
  quizCompleted = false;
  userAnswers: { [key: number]: string } = {};
  loading = true;
  showResults = false;
  resultsLoading = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private quizzService: QuizzService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.quizId = +this.route.snapshot.params['id'];
    this.loadQuizData();
     const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.userEmail = decoded.email || decoded.sub || null;
      }
    }
   this.userService.getUserByEmail(this.userEmail).subscribe({
      next: (user) => {
        this.idUser = user.id_user;
      },
      error: (err) => {
        console.error('Error getting user:', err);
      },
    });
  }

  loadQuizData(): void {
    this.quizzService.getQuizzById(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.quizzService.getQuestionsByQuizId(this.quizId).subscribe({
          next: (questions) => {
            this.questions = questions;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading questions:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
        this.loading = false;
      }
    });
  }

  selectAnswer(answer: string): void {
    console.log('Attempting to select answer:', answer);
    if (!this.isSubmitted) {
      this.selectedAnswer = answer;
      console.log('Selected answer:', this.selectedAnswer);
    }
  }

  submitAnswer(): void {
    if (this.selectedAnswer && !this.isSubmitted) {
      this.isSubmitted = true;
      this.userAnswers[this.currentQuestionIndex] = this.selectedAnswer;
      
      const currentQuestion = this.questions[this.currentQuestionIndex];
      this.isCorrect = this.selectedAnswer === currentQuestion.bonneReponse;
      
      if (this.isCorrect) {
        this.score++;
      }
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
      this.isSubmitted = false;
      this.isCorrect = false;
    } else {
      this.quizCompleted = true;
    }
  }

  viewResults(): void {
    this.resultsLoading = true;
    this.showResults = true;
    
    // Simulate loading for 3 seconds
    setTimeout(() => {
      this.resultsLoading = false;
    }, 3000);
  }

  retryQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.isSubmitted = false;
    this.isCorrect = false;
    this.score = 0;
    this.quizCompleted = false;
    this.userAnswers = {};
    this.showResults = false;
  }

  getProgressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  isAnswerSelected(answer: string): boolean {
    const isSelected = this.selectedAnswer === answer;
    console.log(`Is ${answer} selected?`, isSelected);
    return isSelected;
  }

  isUserAnswerCorrect(questionIndex: number): boolean {
    const userAnswer = this.userAnswers[questionIndex];
    const correctAnswer = this.questions[questionIndex].bonneReponse;
    return userAnswer === correctAnswer;
  }

  getUserAnswer(questionIndex: number): string {
    return this.userAnswers[questionIndex] || 'Not answered';
  }
  generateCertificate(): void {
    const passingScore = Math.ceil(this.questions.length * 0.7); // 70% threshold
    
    if (this.score >= passingScore) {
      this.quizzService.generateCertificate(
        this.quizId,
        this.score,
        this.questions.length, 
        this.idUser
      ).subscribe({
        next: (pdfBlob: Blob) => {
          const downloadURL = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = downloadURL;
          link.download = `KHOTWA_Certificate_${this.quiz.nomQuizz}.pdf`;
          link.click();
        },
        error: (error) => {
          console.error('Error generating certificate:', error);
        }
      });
    }
  }
  
  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

}
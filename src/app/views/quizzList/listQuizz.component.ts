import { Component, OnInit } from '@angular/core';
import { QuizzService } from 'src/app/core/service/quizz.service';
import { Quizz } from 'src/app/core/models/Cours';
import { Router } from '@angular/router';

@Component({
  selector: "app-list-quizz",
  templateUrl: "./listQuizz.component.html",
  styleUrls: ['./listQuizz.component.css']
})
export class ListQuizzComponent implements OnInit {
  quizzes: Quizz[] = [];
  searchQuery: string = '';

  constructor(private quizzService: QuizzService, private router: Router) {}

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
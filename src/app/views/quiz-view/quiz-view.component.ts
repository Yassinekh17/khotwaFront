import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizAdminService } from '../../services/quiz-admin.service';
import { QuizService, Quiz, Question, QuizResult } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-view',
  templateUrl: './quiz-view.component.html',
  styleUrls: ['./quiz-view.component.css']
})
export class QuizViewComponent implements OnInit {
  courseId: string = '';
  quiz: Quiz | null = null;
  questions: Question[] = [];
  answers: { [questionId: string]: number } = {};
  currentQuestionIndex: number = 0;
  quizCompleted: boolean = false;
  result: QuizResult | null = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private quizService: QuizService,
    private quizAdminService: QuizAdminService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.loadQuiz();
  }

  loadQuiz(): void {
    const numericCourseId = parseInt(this.courseId);
    // Get quiz from QuizService (which will use localStorage if available)
    this.quizService.getQuizByCourseId(numericCourseId).subscribe(quiz => {
      this.quiz = quiz;
      this.questions = quiz.questions;
      this.loading = false;
    });
  }

  selectAnswer(questionId: number, optionIndex: number): void {
    // For single choice, just set the answer (option index)
    this.answers[questionId.toString()] = optionIndex;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitQuiz(): void {
    this.result = this.quizService.calculateScore(this.answers, this.questions);
    this.quizCompleted = true;

    const status = this.result.passed ? 'VALIDATED' : 'FAILED';
    const userId = localStorage.getItem('user_email') || 'anonymous';
    const numericCourseId = parseInt(this.courseId);

    this.quizService.updateCourseStatus(numericCourseId, status, userId).subscribe(() => {
      console.log('Course status updated');
    });
  }

  retakeQuiz(): void {
    this.answers = {};
    this.currentQuestionIndex = 0;
    this.quizCompleted = false;
    this.result = null;
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  isAnswerSelected(questionId: number, optionIndex: number): boolean {
    const answer = this.answers[questionId.toString()];
    return answer === optionIndex;
  }
}

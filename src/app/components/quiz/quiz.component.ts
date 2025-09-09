import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService, Quiz, Question, QuizResult, QuizSubmission } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  @Input() courseId!: number;
  @Input() quiz!: Quiz;
  @Output() quizCompleted = new EventEmitter<QuizResult>();

  currentQuestionIndex = 0;
  answers: { [questionId: string]: number } = {};
  showResults = false;
  result: QuizResult | null = null;
  isSubmitting = false;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    if (!this.quiz) {
      // Load quiz if not provided
      this.quizService.getQuizByCourseId(this.courseId).subscribe({
        next: (quiz) => {
          this.quiz = quiz;
        },
        error: (error) => {
          console.error('Error loading quiz:', error);
        }
      });
    }
  }

  get currentQuestion(): Question {
    return this.quiz.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.quiz.questions.length - 1;
  }

  get progressPercentage(): number {
    return Math.round(((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100);
  }

  selectAnswer(optionIndex: number): void {
    this.answers[this.currentQuestion.idQuestion!] = optionIndex;
  }

  isAnswerSelected(optionIndex: number): boolean {
    return this.answers[this.currentQuestion.idQuestion!] === optionIndex;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitQuiz(): void {
    this.isSubmitting = true;

    // Calculate score
    this.result = this.quizService.calculateScore(this.answers, this.quiz.questions);

    // Submit to backend
    const submission: QuizSubmission = {
      userId: localStorage.getItem('user_email') || 'anonymous',
      courseId: this.courseId,
      answers: this.answers,
      score: this.result.score,
      passed: this.result.passed,
      submittedAt: new Date().toISOString()
    };

    this.quizService.submitQuiz(submission).subscribe({
      next: () => {
        // Update course status
        const status = this.result!.passed ? 'VALIDATED' : 'FAILED';
        const userId = localStorage.getItem('user_email') || 'anonymous';

        this.quizService.updateCourseStatus(this.courseId, status as any, userId).subscribe({
          next: () => {
            this.showResults = true;
            this.isSubmitting = false;
            this.quizCompleted.emit(this.result!);
          },
          error: (error) => {
            console.error('Error updating course status:', error);
            this.showResults = true;
            this.isSubmitting = false;
            this.quizCompleted.emit(this.result!);
          }
        });
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        this.showResults = true;
        this.isSubmitting = false;
        this.quizCompleted.emit(this.result!);
      }
    });
  }

  downloadCertificate(): void {
    if (this.result?.passed) {
      const courseTitle = 'Course Title'; // This should come from the course data
      const studentName = localStorage.getItem('user_name') || 'Student';
      const completionDate = new Date().toLocaleDateString();

      this.quizService.generateCertificate(courseTitle, studentName, completionDate).then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Certificate_${courseTitle.replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }
  }

  retakeQuiz(): void {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.showResults = false;
    this.result = null;
  }
}
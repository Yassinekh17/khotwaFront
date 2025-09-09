import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz, Question } from '../services/course.service';

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-player.component.html',
  styleUrls: ['./quiz-player.component.css']
})
export class QuizPlayerComponent implements OnInit {
  @Input() quiz!: Quiz;
  @Input() currentQuestionIndex: number = 0;
  @Input() answers: { [key: string]: number } = {};
  @Output() answerSelected = new EventEmitter<{questionIndex: number, optionIndex: number}>();
  @Output() nextQuestion = new EventEmitter<void>();
  @Output() previousQuestion = new EventEmitter<void>();
  @Output() submitQuiz = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {
    console.log('🎯 QuizPlayer initialized with quiz:', this.quiz);
    console.log('📊 Current question index:', this.currentQuestionIndex);
  }

  get currentQuestion(): Question | null {
    if (!this.quiz || !this.quiz.questions || this.quiz.questions.length === 0) {
      return null;
    }
    return this.quiz.questions[this.currentQuestionIndex] || null;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === (this.quiz?.questions?.length || 0) - 1;
  }

  get progressPercentage(): number {
    if (!this.quiz || !this.quiz.questions) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100);
  }

  selectAnswer(optionIndex: number): void {
    console.log('🎯 Answer selected:', { questionIndex: this.currentQuestionIndex, optionIndex });
    this.answerSelected.emit({
      questionIndex: this.currentQuestionIndex,
      optionIndex: optionIndex
    });
  }

  isAnswerSelected(optionIndex: number): boolean {
    const key = `question_${this.currentQuestionIndex}`;
    const selectedAnswer = this.answers[key];
    const isSelected = selectedAnswer === optionIndex;
    console.log('🔍 isAnswerSelected check:', {
      key,
      optionIndex,
      selectedAnswer,
      isSelected,
      allAnswers: this.answers
    });
    return isSelected;
  }

  onNextQuestion(): void {
    this.nextQuestion.emit();
  }

  onPreviousQuestion(): void {
    this.previousQuestion.emit();
  }

  onSubmitQuiz(): void {
    this.submitQuiz.emit();
  }

  getOptionLetter(index: number): string {
    return ['A', 'B', 'C', 'D'][index] || '?';
  }
}

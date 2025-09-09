import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CourseService, Cours, Chapter, Quiz } from '../services/course.service';
import { QuizAdminService } from '../services/quiz-admin.service';
import { CourseProgressService } from '../services/course-progress.service';
import { QuizPlayerComponent } from '../quiz-player/quiz-player.component';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, QuizPlayerComponent],
  templateUrl: './course-player.component.html',
  styleUrls: ['./course-player.component.scss']
})
export class CoursePlayerComponent implements OnInit, OnDestroy {
  courseId: string = '';
  course: Cours | null = null;
  selectedChapter: Chapter | null = null;
  currentView: string = 'chapters';
  quiz: Quiz | null = null;

  // Progress tracking
  completedChapters: string[] = [];
  progressPercentage: number = 0;

  // UI states
  isLoading = true;
  showQuizButton = false;
  animationState = 'idle';

  // Quiz states
  currentQuestionIndex = 0;
  answers: { [questionId: string]: number } = {};
  showResults = false;
  result: any = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private quizService: QuizAdminService,
    private progressService: CourseProgressService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.loadSavedAnswers();
    this.loadCourseData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCourseData(): void {
    this.isLoading = true;
    const courseIdNumber = parseInt(this.courseId);

    console.log('Loading course data for course ID:', courseIdNumber);

    if (courseIdNumber) {
      // Load course from backend with chapters
      const courseSub = this.courseService.getCourseByIdWithChapters(courseIdNumber).subscribe({
        next: (course: Cours) => {
          console.log('Loaded course:', course);
          console.log('Course chapters:', course?.chapters);
          console.log('Number of chapters:', course?.chapters?.length || 0);

          // Ensure chapters exist
          if (!course.chapters || course.chapters.length === 0) {
            console.warn('No chapters found, creating default chapters');
            course.chapters = this.createDefaultChapters(courseIdNumber);
            // Save to local storage for future use
            this.courseService.saveCourseChapters(courseIdNumber, course.chapters);
            console.log('Created default chapters:', course.chapters);
          }

          this.course = course;
          this.isLoading = false;
          console.log('Course set, isLoading = false');

          if (course) {
            this.loadProgress();
            this.loadQuizData();
          }
        },
        error: (error: any) => {
          console.error('Error loading course from backend:', error);
          // Create a fallback course with default chapters
          this.course = this.createFallbackCourse(courseIdNumber);
          console.log('Created fallback course:', this.course);
          this.isLoading = false;
          this.loadProgress();
          this.loadQuizData();
        }
      });

      this.subscriptions.push(courseSub);
    } else {
      console.warn('Invalid course ID:', this.courseId);
      this.isLoading = false;
    }
  }

  private createDefaultChapters(courseId: number): Chapter[] {
    return [
      {
        id: `course-${courseId}-chapter-1`,
        title: 'Introduction au cours',
        description: 'Découvrez les objectifs et le contenu de ce cours',
        order: 1,
        content: 'Bienvenue dans ce cours ! Vous allez découvrir les concepts fondamentaux et acquérir de nouvelles compétences.',
        type: 'text'
      },
      {
        id: `course-${courseId}-chapter-2`,
        title: 'Chapitre 1: Concepts de base',
        description: 'Apprenez les concepts fondamentaux',
        order: 2,
        content: 'Ce chapitre couvre les concepts de base nécessaires pour comprendre le sujet.',
        type: 'text'
      },
      {
        id: `course-${courseId}-chapter-3`,
        title: 'Chapitre 2: Application pratique',
        description: 'Mettez en pratique ce que vous avez appris',
        order: 3,
        content: 'Dans ce chapitre, vous allez appliquer les concepts appris dans des exercices pratiques.',
        type: 'text'
      },
      {
        id: `course-${courseId}-chapter-4`,
        title: 'Chapitre 3: Projet final',
        description: 'Réalisez un projet complet',
        order: 4,
        content: 'Mettez toutes vos connaissances en pratique dans ce projet final.',
        type: 'text'
      }
    ];
  }

  private createFallbackCourse(courseId: number): Cours {
    return {
      idCours: courseId,
      titre: `Cours ${courseId}`,
      description: 'Description du cours',
      duree: 60,
      prix: 99,
      niveau: 'Débutant',
      categorie: 'Programmation',
      format: 'En ligne',
      nb_etudiantsEnrolled: 1,
      rating: 4.5,
      chapters: this.createDefaultChapters(courseId)
    };
  }

  private loadQuizData(): void {
    const courseIdNumber = parseInt(this.courseId);
    if (courseIdNumber) {
      const quizSub = this.quizService.getQuizByCourseId(courseIdNumber).subscribe({
        next: (quiz: Quiz) => {
          console.log('🎯 Quiz loaded from service:', quiz);
          console.log('📝 Quiz questions:', quiz.questions);
          quiz.questions.forEach((question, index) => {
            console.log(`❓ Question ${index + 1}:`, question.question);
            console.log(`🔢 Question ${index + 1} options:`, question.options);
            console.log(`✅ Question ${index + 1} correct answer:`, question.correctAnswer);
          });
          this.quiz = quiz;
        },
        error: (error: any) => {
          console.warn('Quiz not found for course:', courseIdNumber);
          this.quiz = null;
        }
      });

      this.subscriptions.push(quizSub);
    }
  }

  loadProgress(): void {
    const progress = this.progressService.getProgress(this.courseId);
    this.completedChapters = progress.completedChapters || [];
    this.updateProgress();
  }

  private updateProgress(): void {
    if (!this.course?.chapters) return;

    const totalChapters = this.course.chapters.length;
    const completedCount = this.completedChapters.length;
    this.progressPercentage = Math.round((completedCount / totalChapters) * 100);

    // Show quiz button when all chapters are completed
    this.showQuizButton = completedCount === totalChapters;
  }

  selectChapter(chapter: Chapter): void {
    this.selectedChapter = chapter;
    this.currentView = 'content';
    this.animationState = 'slide-in';
  }

  backToChapters(): void {
    this.selectedChapter = null;
    this.currentView = 'chapters';
    this.animationState = 'slide-out';
  }

  markChapterCompleted(chapterId: string): void {
    if (!this.completedChapters.includes(chapterId)) {
      this.completedChapters.push(chapterId);
      this.progressService.updateProgress(this.courseId, chapterId, true);
      this.updateProgress();

      // Trigger animation
      this.animationState = 'completed';

      if (this.showQuizButton) {
        // Navigate to quiz
        this.router.navigate(['/courses', this.courseId, 'quiz']);
      }

      // Reset animation state
      setTimeout(() => {
        this.animationState = 'idle';
      }, 1000);
    }
  }

  isChapterCompleted(chapterId: string): boolean {
    return this.completedChapters.includes(chapterId);
  }

  startQuiz(): void {
    this.currentView = 'quiz';
    this.animationState = 'fade-in';
  }

  downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getChapterIcon(type: string): string {
    switch (type) {
      case 'pdf': return 'fas fa-file-pdf';
      case 'video': return 'fas fa-video';
      case 'powerpoint': return 'fas fa-file-powerpoint';
      case 'text': return 'fas fa-file-alt';
      default: return 'fas fa-file';
    }
  }

  getChapterColor(type: string): string {
    switch (type) {
      case 'pdf': return '#dc2626'; // red-600
      case 'video': return '#2563eb'; // blue-600
      case 'powerpoint': return '#ea580c'; // orange-600
      case 'text': return '#16a34a'; // green-600
      default: return '#6b7280'; // gray-500
    }
  }

  getProgressColor(): string {
    if (this.progressPercentage < 30) return '#dc2626';
    if (this.progressPercentage < 70) return '#ea580c';
    if (this.progressPercentage < 100) return '#2563eb';
    return '#16a34a';
  }

  getMotivationalMessage(): string {
    if (this.progressPercentage === 0) return 'Commencez votre apprentissage !';
    if (this.progressPercentage < 30) return 'Bon début ! Continuez comme ça.';
    if (this.progressPercentage < 70) return 'Vous êtes sur la bonne voie !';
    if (this.progressPercentage < 100) return 'Presque terminé !';
    return 'Félicitations ! Vous avez terminé tous les chapitres.';
  }

  getFileExtension(type: string): string {
    switch (type) {
      case 'pdf': return 'pdf';
      case 'video': return 'mp4';
      case 'powerpoint': return 'pptx';
      default: return 'file';
    }
  }

  goBack(): void {
    this.router.navigate(['/cours-inscrits']);
  }

  // Template compatibility methods
  getProgressPercentage(): number {
    return this.progressPercentage;
  }

  get courseContents() {
    return this.course?.chapters || [];
  }

  trackByContentFn(index: number, content: any): string {
    return content.id;
  }

  get selectedContent() {
    return this.selectedChapter;
  }

  getContentAnimationState(contentId: string): string {
    return this.animationState;
  }

  selectContent(content: any): void {
    this.selectChapter(content);
  }

  getContentColor(type: string): string {
    return this.getChapterColor(type);
  }

  getContentIcon(type: string): string {
    return this.getChapterIcon(type);
  }

  downloadContent(content: any): void {
    if (content.fileUrl) {
      this.downloadFile(content.fileUrl, content.fileName || content.title);
    }
  }

  markContentCompleted(content: any): void {
    this.markChapterCompleted(content.id);
  }

  startActualQuiz(): void {
    // Change view to show the actual quiz questions
    this.currentView = 'actual-quiz';
    this.animationState = 'fade-in';
  }

  get currentQuestion() {
    return this.quiz?.questions[this.currentQuestionIndex];
  }

  selectAnswer(questionIndex: number, optionIndex: number): void {
    console.log('🎯 selectAnswer called with:', { questionIndex, optionIndex });

    // Use question index as key instead of questionId
    const key = `question_${questionIndex}`;
    this.answers[key] = optionIndex;

    console.log('💾 Answer saved:', key, '=', optionIndex);
    console.log('📊 Current answers:', this.answers);
    this.saveAnswers();
  }

  onAnswerSelected(event: {questionIndex: number, optionIndex: number}): void {
    console.log('🎯 onAnswerSelected called with:', event);
    this.selectAnswer(event.questionIndex, event.optionIndex);
  }

  // Helper methods for template comparisons
  isVideoType(type: string): boolean {
    return type === 'video';
  }

  isPowerPointType(type: string): boolean {
    return type === 'powerpoint';
  }

  isQuizView(view: string): boolean {
    return view === 'quiz';
  }

  isActualQuizView(view: string): boolean {
    return view === 'actual-quiz';
  }

  isAnswerSelected(questionIndex: number, optionIndex: number): boolean {
    const key = `question_${questionIndex}`;
    const selectedAnswer = this.answers[key];
    const isSelected = selectedAnswer === optionIndex;

    console.log('🔍 isAnswerSelected check:', {
      questionIndex,
      key,
      optionIndex,
      selectedAnswer,
      isSelected,
      allAnswers: this.answers
    });

    return isSelected;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < (this.quiz?.questions?.length || 0) - 1) {
      this.currentQuestionIndex++;
      this.saveQuizProgress();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.saveQuizProgress();
    }
  }

  submitQuiz(): void {
    if (this.quiz) {
      // Calculate score
      const totalQuestions = this.quiz.questions.length;
      let correctAnswers = 0;

      this.quiz.questions.forEach((question, index) => {
        const key = `question_${index}`;
        const userAnswer = this.answers[key];
        if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = percentage >= 60; // 60% to pass

      this.result = {
        score: correctAnswers,
        total: totalQuestions,
        passed: passed,
        percentage: percentage
      };

      this.showResults = true;
      this.saveQuizProgress();

      // Update course status
      const userId = localStorage.getItem('user_email') || 'anonymous';
      // Note: QuizAdminService doesn't have updateCourseStatus, so we'll skip this for now
      console.log('Quiz completed with result:', this.result);
    }
  }

  retakeQuiz(): void {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.showResults = false;
    this.result = null;

    // Clear saved data
    this.clearSavedQuizData();
  }

  navigateToQuiz(): void {
    this.router.navigate(['/courses', this.courseId, 'quiz']);
  }

  // Answer persistence methods
  private loadSavedAnswers(): void {
    try {
      const userId = localStorage.getItem('user_email') || 'anonymous';
      const key = `quiz_answers_${userId}_${this.courseId}`;
      const savedAnswers = localStorage.getItem(key);

      console.log('🔍 Loading answers for key:', key);
      console.log('📦 Saved answers from localStorage:', savedAnswers);

      if (savedAnswers) {
        this.answers = JSON.parse(savedAnswers);
        console.log('✅ Loaded saved answers:', this.answers);
      } else {
        console.log('⚠️ No saved answers found');
      }

      // Also load quiz progress
      const progressKey = `quiz_progress_${userId}_${this.courseId}`;
      const savedProgress = localStorage.getItem(progressKey);

      console.log('🔍 Loading progress for key:', progressKey);
      console.log('📦 Saved progress from localStorage:', savedProgress);

      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        this.currentQuestionIndex = progress.currentQuestionIndex || 0;
        this.showResults = progress.showResults || false;
        this.result = progress.result || null;
        console.log('✅ Loaded quiz progress:', progress);
      } else {
        console.log('⚠️ No saved progress found');
      }
    } catch (error) {
      console.error('❌ Error loading saved answers:', error);
    }
  }

  private saveAnswers(): void {
    try {
      const userId = localStorage.getItem('user_email') || 'anonymous';
      const key = `quiz_answers_${userId}_${this.courseId}`;
      localStorage.setItem(key, JSON.stringify(this.answers));
      console.log('Saved answers:', this.answers);
    } catch (error) {
      console.error('Error saving answers:', error);
    }
  }

  private saveQuizProgress(): void {
    try {
      const userId = localStorage.getItem('user_email') || 'anonymous';
      const key = `quiz_progress_${userId}_${this.courseId}`;
      const progress = {
        currentQuestionIndex: this.currentQuestionIndex,
        showResults: this.showResults,
        result: this.result
      };
      localStorage.setItem(key, JSON.stringify(progress));
      console.log('Saved quiz progress:', progress);
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  }

  private clearSavedQuizData(): void {
    try {
      const userId = localStorage.getItem('user_email') || 'anonymous';
      const answersKey = `quiz_answers_${userId}_${this.courseId}`;
      const progressKey = `quiz_progress_${userId}_${this.courseId}`;

      localStorage.removeItem(answersKey);
      localStorage.removeItem(progressKey);

      console.log('Cleared saved quiz data for user:', userId, 'course:', this.courseId);
    } catch (error) {
      console.error('Error clearing saved quiz data:', error);
    }
  }
}
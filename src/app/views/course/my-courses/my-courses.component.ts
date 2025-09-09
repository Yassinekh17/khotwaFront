import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalInscriptionService } from '../../../services/local-inscription.service';
import { InscriptionCoursService, EnrolledCourse as BackendEnrolledCourse } from '../../../services/inscription-cours.service';
import { CourseService, Cours } from '../../../services/course.service';
import { ProgressService, CourseProgress } from '../../../services/progress.service';
import { CoursContentService } from '../../../services/cours-content.service';
import { CourseCardComponent } from '../../../components/course-card/course-card.component';

interface LocalCourseProgress {
  courseId: number;
  completedChapters: number;
  totalChapters: number;
  quizScore?: number;
  quizPassed?: boolean;
  quizStatus?: 'NOT_TAKEN' | 'PASSED' | 'FAILED';
  lastAccessedChapter?: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'QUIZ_READY' | 'VALIDATED' | 'FAILED';
}

interface EnrolledCourse {
  idCours: number;
  titre: string;
  description: string;
  categorie: string;
  niveau: string;
  image?: string;
  progress: LocalCourseProgress;
  enrollmentDate: string;
  chapters?: any[]; // Store chapters for progress calculation
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseCardComponent],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css']
})
export class MyCoursesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  enrolledCourses: EnrolledCourse[] = [];
  loading = false;
  error: string | null = null;

  // Search and Filter properties
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedSort = 'recent';

  // Filter options
  categories: string[] = [];
  sortOptions = [
    { value: 'recent', label: 'Plus récent' },
    { value: 'title-asc', label: 'Titre (A-Z)' },
    { value: 'title-desc', label: 'Titre (Z-A)' },
    { value: 'progress-desc', label: 'Progression (desc)' },
    { value: 'progress-asc', label: 'Progression (asc)' }
  ];

  constructor(
    private localInscriptionService: LocalInscriptionService,
    private inscriptionService: InscriptionCoursService,
    private courseService: CourseService,
    private progressService: ProgressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEnrolledCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEnrolledCourses(): void {
    this.loading = true;
    this.error = null;

    try {
      // Get user email from localStorage (set during enrollment)
      const userEmail = localStorage.getItem('user_email');

      if (!userEmail) {
        this.error = 'Veuillez vous inscrire à un cours d\'abord';
        this.enrolledCourses = [];
        this.loading = false;
        return;
      }

      // Load enrolled courses from backend
      this.inscriptionService.getEnrolledCoursesWithDetails(userEmail)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (backendEnrolledCourses: BackendEnrolledCourse[]) => {
            // Convert backend format to component format
            this.enrolledCourses = backendEnrolledCourses.map(backendCourse => ({
              idCours: backendCourse.course.idCours!,
              titre: backendCourse.course.titre,
              description: backendCourse.course.description,
              categorie: backendCourse.course.categorie,
              niveau: backendCourse.course.niveau,
              image: backendCourse.course.image,
              enrollmentDate: backendCourse.enrollment.dateInscription || new Date().toISOString(),
              chapters: backendCourse.course.chapters || [], // Store chapters for progress calculation
              progress: this.loadProgressForCourse(backendCourse.course.idCours!)
            }));

            this.initializeFilters();
            this.applyFilters();
            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error loading enrolled courses:', error);
            this.error = 'Erreur lors du chargement des cours inscrits';
            this.loading = false;
          }
        });
    } catch (error) {
      this.error = 'Erreur lors du chargement des cours';
      this.loading = false;
    }
  }

  private loadProgressForCourse(courseId: number): LocalCourseProgress {
    // Use the new progress service method
    const progress = this.progressService.getProgressLocal(courseId.toString());

    // Update total chapters if course data is available
    const course = this.enrolledCourses.find(c => c.idCours === courseId);
    if (course && course.chapters) {
      progress.totalChapters = course.chapters.length;
    }

    // Convert to LocalCourseProgress format
    return {
      courseId: courseId,
      completedChapters: progress.completedChapters?.length || 0,
      totalChapters: progress.totalChapters || 10,
      quizScore: progress.quizScore,
      quizPassed: progress.quizStatus === 'PASSED',
      quizStatus: progress.quizStatus,
      lastAccessedChapter: progress.lastModuleId,
      status: this.mapProgressStatus(progress)
    };
  }

  private mapProgressStatus(progress: any): 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'QUIZ_READY' | 'VALIDATED' | 'FAILED' {
    const percentage = progress.progressPercent || 0;

    if (percentage === 0) return 'NOT_STARTED';
    if (percentage < 100) return 'IN_PROGRESS';
    if (percentage === 100) {
      if (progress.quizStatus === 'NOT_TAKEN') return 'QUIZ_READY';
      if (progress.quizStatus === 'PASSED') return 'VALIDATED';
      if (progress.quizStatus === 'FAILED') return 'FAILED';
    }
    return 'COMPLETED';
  }


  // Progress and Status Methods
  getProgressPercentage(course: EnrolledCourse): number {
    if (course.progress.totalChapters === 0) return 0;
    return Math.round((course.progress.completedChapters / course.progress.totalChapters) * 100);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'NOT_STARTED': return 'Non commencé';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'QUIZ_READY': return 'Prêt pour le quiz';
      case 'VALIDATED': return 'Validé';
      case 'FAILED': return 'Échoué';
      default: return 'Inconnu';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'NOT_STARTED': return 'text-gray-500';
      case 'IN_PROGRESS': return 'text-blue-600';
      case 'COMPLETED': return 'text-green-600';
      case 'QUIZ_READY': return 'text-yellow-600';
      case 'VALIDATED': return 'text-emerald-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-gray-500';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'NOT_STARTED': return 'bg-gray-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'QUIZ_READY': return 'bg-yellow-500';
      case 'VALIDATED': return 'bg-emerald-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getProgressBarClass(status: string): string {
    switch (status) {
      case 'NOT_STARTED': return 'bg-gray-400';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'QUIZ_READY': return 'bg-yellow-500';
      case 'VALIDATED': return 'bg-emerald-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  getActionButton(course: EnrolledCourse): { text: string; action: string; color: string; icon: string; route?: string } {
    const progressPercent = this.getProgressPercentage(course);

    // Logique stricte selon les spécifications
    if (progressPercent === 0) {
      // 0% : bouton Commencer
      return {
        text: 'Commencer',
        action: 'start',
        color: 'bg-green-600 hover:bg-green-700',
        icon: 'fas fa-play',
        route: `/courses/${course.idCours}/contenu`
      };
    } else if (progressPercent > 0 && progressPercent < 100) {
      // 0%-99% : bouton Continuer
      return {
        text: 'Continuer',
        action: 'continue',
        color: 'bg-blue-600 hover:bg-blue-700',
        icon: 'fas fa-arrow-right',
        route: `/courses/${course.idCours}/contenu`
      };
    } else if (progressPercent === 100) {
      // 100% : vérifier le statut du quiz
      if (course.progress.quizStatus === 'NOT_TAKEN') {
        // 100% et quiz pas fait : bouton Passer au quiz
        return {
          text: 'Passer au quiz',
          action: 'quiz',
          color: 'bg-yellow-600 hover:bg-yellow-700',
          icon: 'fas fa-question-circle',
          route: `/courses/${course.idCours}/quiz`
        };
      } else if (course.progress.quizStatus === 'PASSED') {
        // Quiz validé : statut Validé
        return {
          text: 'Validé',
          action: 'completed',
          color: 'bg-emerald-600 hover:bg-emerald-700',
          icon: 'fas fa-check-circle'
        };
      } else if (course.progress.quizStatus === 'FAILED') {
        // Quiz échoué : bouton Échoué - Refaire le quiz
        return {
          text: 'Échoué – Refaire le quiz',
          action: 'retry-quiz',
          color: 'bg-red-600 hover:bg-red-700',
          icon: 'fas fa-redo',
          route: `/courses/${course.idCours}/quiz?retake=true`
        };
      }
    }

    // Default fallback (ne devrait jamais arriver)
    console.warn(`⚠️ État inattendu pour le cours ${course.idCours}: ${progressPercent}%`);
    return {
      text: 'Commencer',
      action: 'start',
      color: 'bg-green-600 hover:bg-green-700',
      icon: 'fas fa-play',
      route: `/courses/${course.idCours}/contenu`
    };
  }

  // Action Handlers
  handleCourseAction(course: EnrolledCourse, event: { course: EnrolledCourse, action: string }): void {
    const action = event.action;
    switch (action) {
      case 'start':
        this.startCourse(course);
        break;
      case 'continue':
        this.continueCourse(course);
        break;
      case 'quiz':
        this.takeQuiz(course);
        break;
      case 'retry-quiz':
        this.retryQuiz(course);
        break;
      case 'certificate':
        this.downloadCertificate(course);
        break;
      case 'completed':
        // Already completed, maybe show certificate
        break;
    }
  }

  private downloadCertificate(course: EnrolledCourse): void {
    // TODO: Implement certificate download
    console.log('Downloading certificate for course:', course.titre);
  }

  private startCourse(course: EnrolledCourse): void {
    // Update progress status
    course.progress.status = 'IN_PROGRESS';
    course.progress.lastAccessedChapter = 1;
    this.saveProgress(course);

    // Navigate to course content
    this.router.navigate(['/courses', course.idCours, 'contenu']);
  }

  private continueCourse(course: EnrolledCourse): void {
    // Navigate to course content
    this.router.navigate(['/courses', course.idCours, 'contenu']);
  }

  private takeQuiz(course: EnrolledCourse): void {
    this.router.navigate(['/courses', course.idCours, 'quiz']);
  }

  private retryQuiz(course: EnrolledCourse): void {
    // Reset quiz status
    course.progress.quizScore = undefined;
    course.progress.quizPassed = undefined;
    this.saveProgress(course);

    this.router.navigate(['/courses', course.idCours, 'quiz']);
  }

  private saveProgress(course: EnrolledCourse): void {
    // In a real app, this would save to backend
    // For now, we'll use localStorage with user-specific keys
    const userEmail = localStorage.getItem('user_email') || 'anonymous';
    const progressKey = `course_progress_${userEmail}_${course.idCours}`;
    localStorage.setItem(progressKey, JSON.stringify(course.progress));
  }

  // Search and Filter Methods
  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedSort = 'recent';
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.enrolledCourses];

    // Search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.titre?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.categorie?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(course => course.categorie === this.selectedCategory);
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(course => course.progress.status === this.selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.selectedSort) {
        case 'recent':
          return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
        case 'title-asc':
          return (a.titre || '').localeCompare(b.titre || '');
        case 'title-desc':
          return (b.titre || '').localeCompare(a.titre || '');
        case 'progress-desc':
          return this.getProgressPercentage(b) - this.getProgressPercentage(a);
        case 'progress-asc':
          return this.getProgressPercentage(a) - this.getProgressPercentage(b);
        default:
          return 0;
      }
    });

    this.enrolledCourses = filtered;
  }

  private initializeFilters(): void {
    // Extract unique categories
    const categoriesSet = new Set<string>();
    this.enrolledCourses.forEach(course => {
      if (course.categorie) categoriesSet.add(course.categorie);
    });
    this.categories = Array.from(categoriesSet);
  }

  // Utility Methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStars(rating: number): number[] {
    const stars: number[] = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    if (rating % 1 !== 0) {
      stars.push(0.5);
    }
    return stars;
  }
}
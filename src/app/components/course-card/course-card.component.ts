import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgressService } from '../../services/progress.service';

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
}

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss']
})
export class CourseCardComponent {
  @Input() course!: EnrolledCourse;
  @Output() actionClicked = new EventEmitter<{course: EnrolledCourse, action: string}>();

  constructor(private progressService: ProgressService) {}

  getProgressPercentage(): number {
    if (this.course.progress.totalChapters === 0) return 0;
    return Math.round((this.course.progress.completedChapters / this.course.progress.totalChapters) * 100);
  }

  getStatusLabel(): string {
    switch (this.course.progress.status) {
      case 'NOT_STARTED': return 'Non commencé';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'QUIZ_READY': return 'Prêt pour le quiz';
      case 'VALIDATED': return 'Validé';
      case 'FAILED': return 'Échoué';
      default: return 'Inconnu';
    }
  }

  getStatusBadgeClass(): string {
    switch (this.course.progress.status) {
      case 'NOT_STARTED': return 'bg-gray-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'QUIZ_READY': return 'bg-yellow-500';
      case 'VALIDATED': return 'bg-emerald-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getStatusColorClass(): string {
    switch (this.course.progress.status) {
      case 'NOT_STARTED': return 'text-gray-400';
      case 'IN_PROGRESS': return 'text-blue-500';
      case 'COMPLETED': return 'text-green-500';
      case 'QUIZ_READY': return 'text-yellow-500';
      case 'VALIDATED': return 'text-emerald-500';
      case 'FAILED': return 'text-red-500';
      default: return 'text-gray-400';
    }
  }

  getProgressBarClass(): string {
    switch (this.course.progress.status) {
      case 'NOT_STARTED': return 'bg-gray-400';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'QUIZ_READY': return 'bg-yellow-500';
      case 'VALIDATED': return 'bg-emerald-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  getActionButton(): { text: string; action: string; color: string; icon: string; route?: string } {
    const progressPercent = this.getProgressPercentage();

    // Determine course state based on progress and quiz status
    if (progressPercent === 0) {
      // NOT_STARTED
      return {
        text: 'Commencer',
        action: 'start',
        color: 'bg-green-600 hover:bg-green-700',
        icon: 'fas fa-play',
        route: `/courses/${this.course.idCours}/view`
      };
    } else if (progressPercent < 100) {
      // IN_PROGRESS
      return {
        text: 'Continuer',
        action: 'continue',
        color: 'bg-blue-600 hover:bg-blue-700',
        icon: 'fas fa-arrow-right',
        route: `/courses/${this.course.idCours}/view`
      };
    } else if (progressPercent === 100) {
      // COMPLETED - check quiz status
      if (this.course.progress.quizStatus === 'NOT_TAKEN') {
        // QUIZ_READY
        return {
          text: 'Passer au quiz',
          action: 'quiz',
          color: 'bg-yellow-600 hover:bg-yellow-700',
          icon: 'fas fa-question-circle',
          route: `/courses/${this.course.idCours}/quiz`
        };
      } else if (this.course.progress.quizStatus === 'PASSED' && this.course.progress.quizScore! >= 60) {
        // VALIDATED
        return {
          text: 'Télécharger le certificat',
          action: 'certificate',
          color: 'bg-emerald-600 hover:bg-emerald-700',
          icon: 'fas fa-download'
        };
      } else if (this.course.progress.quizStatus === 'FAILED' || this.course.progress.quizScore! < 60) {
        // FAILED
        return {
          text: 'Repasser le quiz',
          action: 'retry-quiz',
          color: 'bg-red-600 hover:bg-red-700',
          icon: 'fas fa-redo',
          route: `/courses/${this.course.idCours}/quiz?retake=true`
        };
      }
    }

    // Default fallback
    return {
      text: 'Commencer',
      action: 'start',
      color: 'bg-green-600 hover:bg-green-700',
      icon: 'fas fa-play',
      route: `/courses/${this.course.idCours}/view`
    };
  }

  onActionClick(): void {
    const actionButton = this.getActionButton();
    if (!actionButton.route) {
      this.actionClicked.emit({ course: this.course, action: actionButton.action });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
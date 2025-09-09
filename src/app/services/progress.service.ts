import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CourseProgress {
  progressPercent: number;
  lastModuleId?: number;
  quizStatus: 'NOT_TAKEN' | 'PASSED' | 'FAILED';
  quizScore?: number;
  completedModules: number[];
  totalModules: number;
  completedChapters?: string[]; // For chapter-based progress
  totalChapters?: number;
}

export interface ModuleCompletion {
  userId: string;
  courseId: number;
  moduleId: number;
  completedAt: string;
}

export interface ChapterCompletion {
  userId: string;
  courseId: number;
  chapterId: string;
  completedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:8089/progress';

  constructor(private http: HttpClient) { }

  // Get progress for a specific user and course
  getProgress(userId: string, courseId: number): Observable<CourseProgress> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('courseId', courseId.toString());

    return this.http.get<CourseProgress>(`${this.apiUrl}/user`, { params });
  }

  // Mark a module as completed
  markModuleComplete(userId: string, courseId: number, moduleId: number): Observable<any> {
    const completion: ModuleCompletion = {
      userId,
      courseId,
      moduleId,
      completedAt: new Date().toISOString()
    };

    return this.http.post(`${this.apiUrl}/module/complete`, completion);
  }

  // Get the next unfinished module
  getNextUnfinishedModule(userId: string, courseId: number): Observable<number | null> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('courseId', courseId.toString());

    return this.http.get<{ moduleId: number | null }>(`${this.apiUrl}/next-module`, { params })
      .pipe(map(response => response.moduleId));
  }

  // Update quiz result
  updateQuizResult(userId: string, courseId: number, score: number): Observable<any> {
    const quizResult = {
      userId,
      courseId,
      score,
      passed: score >= 60,
      completedAt: new Date().toISOString()
    };

    return this.http.post(`${this.apiUrl}/quiz/result`, quizResult);
  }

  // Get all progress for a user
  getUserProgress(userId: string): Observable<CourseProgress[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<CourseProgress[]>(`${this.apiUrl}/user/all`, { params });
  }

  // Reset progress for a course (for testing or admin purposes)
  resetProgress(userId: string, courseId: number): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('courseId', courseId.toString());

    return this.http.delete(`${this.apiUrl}/reset`, { params });
  }

  // Chapter-based progress methods
  markChapterComplete(userId: string, courseId: number, chapterId: string): Observable<any> {
    const completion: ChapterCompletion = {
      userId,
      courseId,
      chapterId,
      completedAt: new Date().toISOString()
    };

    return this.http.post(`${this.apiUrl}/chapter/complete`, completion).pipe(
      catchError(error => {
        console.warn('Backend not available for chapter completion, using localStorage');
        this.saveChapterProgressLocally(courseId, chapterId);
        return of({ success: true });
      })
    );
  }

  getChapterProgress(courseId: number): Observable<string[]> {
    const userId = this.getCurrentUserId();
    const params = new HttpParams()
      .set('userId', userId)
      .set('courseId', courseId.toString());

    return this.http.get<{ completedChapters: string[] }>(`${this.apiUrl}/chapter/progress`, { params }).pipe(
      map(response => response.completedChapters),
      catchError(error => {
        console.warn('Backend not available for chapter progress, using localStorage');
        return of(this.getChapterProgressLocally(courseId));
      })
    );
  }

  // Local storage fallback methods
  private saveChapterProgressLocally(courseId: number, chapterId: string): void {
    const userId = this.getCurrentUserId();
    const key = `chapter_progress_${userId}_${courseId}`;
    const current = this.getChapterProgressLocally(courseId);
    if (!current.includes(chapterId)) {
      current.push(chapterId);
      localStorage.setItem(key, JSON.stringify(current));
    }
  }

  private getChapterProgressLocally(courseId: number): string[] {
    const userId = this.getCurrentUserId();
    const key = `chapter_progress_${userId}_${courseId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private getCurrentUserId(): string {
    // Get user ID from localStorage or auth service
    // Use email as user identifier since that's what's available
    return localStorage.getItem('user_email') || 'anonymous';
  }

  // Enhanced getProgressLocal with backend integration
  getProgressLocal(courseId: string): CourseProgress {
    const userId = this.getCurrentUserId();
    const numericCourseId = parseInt(courseId);

    console.log(`🔍 Getting progress for user ${userId}, course ${courseId}`);

    // Try to get from localStorage first as fallback
    const localKey = `course_progress_${userId}_${courseId}`;
    const localProgress = localStorage.getItem(localKey);

    if (localProgress) {
      const progress = JSON.parse(localProgress);
      console.log(`✅ Found local progress:`, progress);

      // Ensure consistent chapter count (5 chapters max)
      if (!progress.completedChapters) {
        progress.completedChapters = this.getChapterProgressLocally(numericCourseId);
      }

      // Standardiser à 5 chapitres et nettoyer les données
      progress.totalChapters = 5;
      progress.totalModules = 5;

      // Nettoyer les chapitres complétés (s'assurer qu'ils sont uniques et valides)
      if (progress.completedChapters) {
        progress.completedChapters = [...new Set(progress.completedChapters)]; // Supprimer les doublons
        progress.completedChapters = progress.completedChapters.filter((chapterId: string) => {
          // Vérifier que l'ID du chapitre est valide (format: courseId_chapterNumber)
          const parts = chapterId.split('_');
          return parts.length === 2 && parts[0] === courseId && parseInt(parts[1]) >= 1 && parseInt(parts[1]) <= 5;
        });
      }

      // Recalculate percentage based on 5 chapters
      const completedCount = progress.completedChapters.length;
      progress.progressPercent = Math.min(Math.round((completedCount / 5) * 100), 100);

      console.log(`📊 Progress calculated: ${completedCount}/5 chapters = ${progress.progressPercent}%`);

      // Sauvegarder les données nettoyées
      localStorage.setItem(localKey, JSON.stringify(progress));

      return progress;
    }

    console.log(`📝 No local progress found, returning default`);
    // Return default progress for new enrollment
    const defaultProgress: CourseProgress = {
      progressPercent: 0,
      quizStatus: 'NOT_TAKEN' as const,
      completedModules: [],
      totalModules: 5,
      completedChapters: [],
      totalChapters: 5
    };

    // Sauvegarder immédiatement les données par défaut
    localStorage.setItem(localKey, JSON.stringify(defaultProgress));

    return defaultProgress;
  }

  // Enhanced updateProgress with chapter support
  updateProgress(courseId: string, chapterId: string, completed: boolean): void {
    const userId = this.getCurrentUserId();
    const numericCourseId = parseInt(courseId);

    // Migrate old progress data if exists
    this.migrateOldProgressData(courseId);

    // Update chapter progress
    if (completed) {
      this.markChapterComplete(userId, numericCourseId, chapterId).subscribe();
    }

    // Update local progress
    const progress = this.getProgressLocal(courseId);
    if (!progress.completedChapters) {
      progress.completedChapters = [];
    }

    if (completed && !progress.completedChapters.includes(chapterId)) {
      progress.completedChapters.push(chapterId);
    } else if (!completed) {
      const index = progress.completedChapters.indexOf(chapterId);
      if (index > -1) {
        progress.completedChapters.splice(index, 1);
      }
    }

    // Standardiser à 5 chapitres maximum et recalculer le pourcentage
    progress.totalChapters = 5;
    const completedCount = progress.completedChapters.length;
    progress.progressPercent = Math.min(Math.round((completedCount / 5) * 100), 100);

    console.log(`📊 Updated progress: ${completedCount}/5 chapters = ${progress.progressPercent}%`);

    // Save to localStorage
    const localKey = `course_progress_${userId}_${courseId}`;
    localStorage.setItem(localKey, JSON.stringify(progress));
  }

  // Migrate old progress data without userId to new format
  private migrateOldProgressData(courseId: string): void {
    const userId = this.getCurrentUserId();
    const oldKey = `course_progress_${courseId}`;
    const newKey = `course_progress_${userId}_${courseId}`;

    const oldData = localStorage.getItem(oldKey);
    if (oldData && !localStorage.getItem(newKey)) {
      console.log(`🔄 Migrating old progress data for course ${courseId}`);
      localStorage.setItem(newKey, oldData);
      localStorage.removeItem(oldKey);
    }
  }
}

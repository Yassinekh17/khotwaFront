import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourseProgressService {

  constructor() { }

  // Get progress for a course
  getProgress(courseId: string): any {
    const userId = localStorage.getItem('user_email') || 'anonymous';

    // Try new format first
    let progress = localStorage.getItem(`course_progress_${userId}_${courseId}`);

    // If not found, try old format and migrate
    if (!progress) {
      const oldProgress = localStorage.getItem(`course_progress_${courseId}`);
      if (oldProgress) {
        console.log(`🔄 Migrating old progress data for course ${courseId}`);
        localStorage.setItem(`course_progress_${userId}_${courseId}`, oldProgress);
        localStorage.removeItem(`course_progress_${courseId}`);
        progress = oldProgress;
      }
    }

    return progress ? JSON.parse(progress) : { completedChapters: [], totalChapters: 0, isCompleted: false };
  }

  // Update progress for a course
  updateProgress(courseId: string, chapterId: string, completed: boolean): void {
    const userId = localStorage.getItem('user_email') || 'anonymous';
    const progress = this.getProgress(courseId);
    if (completed && !progress.completedChapters.includes(chapterId)) {
      progress.completedChapters.push(chapterId);
    } else if (!completed) {
      progress.completedChapters = progress.completedChapters.filter((id: string) => id !== chapterId);
    }
    progress.isCompleted = progress.completedChapters.length === progress.totalChapters;
    localStorage.setItem(`course_progress_${userId}_${courseId}`, JSON.stringify(progress));
  }

  // Set total chapters for a course
  setTotalChapters(courseId: string, total: number): void {
    const userId = localStorage.getItem('user_email') || 'anonymous';
    const progress = this.getProgress(courseId);
    progress.totalChapters = total;
    localStorage.setItem(`course_progress_${userId}_${courseId}`, JSON.stringify(progress));
  }

  // Check if course is completed
  isCourseCompleted(courseId: string): boolean {
    const progress = this.getProgress(courseId);
    return progress.isCompleted;
  }

  // Get completion percentage
  getCompletionPercentage(courseId: string): number {
    const progress = this.getProgress(courseId);
    if (progress.totalChapters === 0) return 0;
    return (progress.completedChapters.length / progress.totalChapters) * 100;
  }
}
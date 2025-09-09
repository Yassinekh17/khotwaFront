import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseProgressService } from '../../services/course-progress.service';
import { CourseService, Cours, Chapter } from '../../services/course.service';

@Component({
  selector: 'app-course-content',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-content.component.html',
  styleUrls: ['./course-content.component.scss']
})
export class CourseContentComponent implements OnInit {
  @Input() course!: Cours;
  @Input() courseId!: string;
  @Output() chapterCompleted = new EventEmitter<string>();
  @Output() quizReady = new EventEmitter<void>();

  selectedChapter: Chapter | null = null;
  viewMode: 'list' | 'content' = 'list';

  constructor(private progressService: CourseProgressService) {}

  ngOnInit(): void {
    // Start in list mode, don't auto-select a chapter
    this.viewMode = 'list';
    this.selectedChapter = null;
  }

  selectChapter(chapter: Chapter): void {
    this.selectedChapter = chapter;
    this.viewMode = 'content';
  }

  backToChapterList(): void {
    this.selectedChapter = null;
    this.viewMode = 'list';
  }

  markChapterCompleted(chapterId: string): void {
    this.progressService.updateProgress(this.courseId, chapterId, true);
    this.chapterCompleted.emit(chapterId);

    // Check if all chapters are completed
    if (this.isAllChaptersCompleted()) {
      this.quizReady.emit();
    }
  }

  isChapterCompleted(chapterId: string): boolean {
    const progress = this.progressService.getProgress(this.courseId);
    return progress.completedChapters.includes(chapterId);
  }

  isAllChaptersCompleted(): boolean {
    if (!this.course?.chapters) return false;
    return this.course.chapters.every(chapter => this.isChapterCompleted(chapter.id));
  }

  getCompletedChaptersCount(): number {
    if (!this.course?.chapters) return 0;
    return this.course.chapters.filter(chapter => this.isChapterCompleted(chapter.id)).length;
  }

  getTotalChaptersCount(): number {
    return this.course?.chapters?.length || 0;
  }

  getProgressPercentage(): number {
    const total = this.getTotalChaptersCount();
    if (total === 0) return 0;
    return Math.round((this.getCompletedChaptersCount() / total) * 100);
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

  getChapterTypeColor(type: string): string {
    switch (type) {
      case 'pdf': return 'text-red-500';
      case 'video': return 'text-blue-500';
      case 'powerpoint': return 'text-orange-500';
      case 'text': return 'text-green-500';
      default: return 'text-gray-500';
    }
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
}
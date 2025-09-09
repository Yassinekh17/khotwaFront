import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseProgressService } from '../../services/course-progress.service';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { CourseContentComponent } from '../../components/course-content/course-content.component';
import { CourseService, Cours, Chapter } from '../../services/course.service';

@Component({
  selector: 'app-course-view',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, CourseContentComponent],
  templateUrl: './course-view.component.html',
  styleUrls: ['./course-view.component.scss']
})
export class CourseViewComponent implements OnInit {
  courseId: string = '';
  course: Cours | null = null;
  selectedChapter: Chapter | null = null;
  viewMode: 'list' | 'content' = 'list'; // 'list' for chapter list, 'content' for chapter content
  progress: number = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private progressService: CourseProgressService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.loadCourse();
    this.loadProgress();
  }

  loadCourse(): void {
    const courseIdNumber = parseInt(this.courseId);
    if (courseIdNumber) {
      this.courseService.getCourseById(courseIdNumber).subscribe({
        next: (course: Cours) => {
          this.course = course;
          if (this.course?.chapters) {
            this.progressService.setTotalChapters(this.courseId, this.course.chapters.length);
          }
        },
        error: (error) => {
          console.error('Error loading course:', error);
          // Fallback to mock data for demo
          this.loadMockCourse();
        }
      });
    } else {
      // Fallback to mock data for demo
      this.loadMockCourse();
    }
  }

  private loadMockCourse(): void {
    // Mock course data with more chapters and types
    this.course = {
      idCours: parseInt(this.courseId) || 1,
      titre: 'Sample Course',
      description: 'Learn the fundamentals of modern web development',
      duree: 10,
      prix: 99,
      niveau: 'Beginner',
      categorie: 'Programming',
      format: 'Video',
      nb_etudiantsEnrolled: 0,
      rating: 0,
      chapters: [
        {
          id: '1',
          title: 'Introduction to Web Development',
          content: 'path/to/intro.pdf',
          type: 'pdf',
          description: 'Overview of web development concepts',
          order: 1
        },
        {
          id: '2',
          title: 'HTML Basics',
          content: 'path/to/html.mp4',
          type: 'video',
          description: 'Learn HTML structure and elements',
          order: 2
        },
        {
          id: '3',
          title: 'CSS Fundamentals',
          content: 'path/to/css.pdf',
          type: 'pdf',
          description: 'Styling web pages with CSS',
          order: 3
        },
        {
          id: '4',
          title: 'JavaScript Essentials',
          content: 'path/to/js.mp4',
          type: 'video',
          description: 'Programming basics with JavaScript',
          order: 4
        },
        {
          id: '5',
          title: 'Project Setup',
          content: '## Setting up your development environment\n\n1. Install Node.js\n2. Install VS Code\n3. Set up Git\n\nHappy coding!',
          type: 'text',
          description: 'Setting up your development environment',
          order: 5
        }
      ]
    } as Cours;
    if (this.course?.chapters) {
      this.progressService.setTotalChapters(this.courseId, this.course.chapters.length);
    }
  }

  loadProgress(): void {
    this.progress = this.progressService.getCompletionPercentage(this.courseId);
  }

  selectChapter(chapter: Chapter): void {
    this.selectedChapter = chapter;
    this.viewMode = 'content';
  }

  backToChapterList(): void {
    this.selectedChapter = null;
    this.viewMode = 'list';
    this.loadProgress(); // Refresh progress when returning to list
  }

  markChapterCompleted(chapterId: string): void {
    this.progressService.updateProgress(this.courseId, chapterId, true);
    this.backToChapterList(); // Return to chapter list after marking complete
  }

  isChapterCompleted(chapterId: string): boolean {
    const progress = this.progressService.getProgress(this.courseId);
    return progress.completedChapters.includes(chapterId);
  }

  goToQuiz(): void {
    this.router.navigate(['/courses', this.courseId, 'quiz']);
  }

  getChapterStatus(chapterId: string): 'not-started' | 'completed' {
    return this.isChapterCompleted(chapterId) ? 'completed' : 'not-started';
  }

  getCompletedChaptersCount(): number {
    if (!this.course?.chapters) return 0;
    return this.course.chapters.filter(ch => this.isChapterCompleted(ch.id)).length;
  }

  getTotalChaptersCount(): number {
    return this.course?.chapters?.length || 0;
  }

  getSelectedChapterIndex(): number {
    if (!this.course?.chapters || !this.selectedChapter) return 0;
    return this.course.chapters.indexOf(this.selectedChapter) + 1;
  }

  onChapterCompleted(chapterId: string): void {
    // Refresh progress when a chapter is completed
    this.loadProgress();
  }

  onQuizReady(): void {
    // Navigate to quiz when all chapters are completed
    this.goToQuiz();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CoursContentService, PdfResource } from '../../services/cours-content.service';
import { ProgressService } from '../../services/progress.service';
import { CourseService, Cours } from '../../services/course.service';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  courseId!: number;
  pdfResources: PdfResource[] = [];
  loading = true;
  error: string | null = null;
  userId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursContentService: CoursContentService,
    private progressService: ProgressService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.courseId = +this.route.snapshot.paramMap.get('id')!;
    this.userId = localStorage.getItem('user_email') || '';

    if (this.courseId) {
      this.loadPdfResources();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPdfResources(): void {
    this.loading = true;
    this.error = null;

    // First, check if the course has uploaded PDF files
    this.courseService.getCourseById(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (course: Cours) => {
          // Check for uploaded PDF file
          if (course.pdfFile) {
            // Create a PDF resource from the uploaded file
            this.pdfResources = [{
              id: 1,
              title: 'PDF du cours',
              url: course.pdfFile,
              fileSize: 0, // Could be calculated if needed
              pageCount: undefined
            }];
            this.loading = false;
          } else {
            // Fall back to regular PDF resources
            this.loadRegularPdfResources();
          }
        },
        error: (error) => {
          console.error('Error loading course:', error);
          // Fall back to regular PDF resources
          this.loadRegularPdfResources();
        }
      });
  }

  private loadRegularPdfResources(): void {
    this.coursContentService.getPdfList(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resources) => {
          this.pdfResources = resources;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading PDF resources:', error);
          this.error = 'Erreur lors du chargement des ressources PDF';
          this.loading = false;
        }
      });
  }

  downloadPdf(pdf: PdfResource): void {
    this.coursContentService.downloadPdf(this.courseId, pdf.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${pdf.title}.pdf`;
          link.click();

          // Clean up
          window.URL.revokeObjectURL(url);

          // Mark as viewed/completed
          this.markPdfViewed(pdf);
        },
        error: (error) => {
          console.error('Error downloading PDF:', error);
          alert('Erreur lors du téléchargement du PDF');
        }
      });
  }

  openPdf(pdf: PdfResource): void {
    // Open PDF in new tab
    window.open(pdf.url, '_blank');

    // Mark as viewed
    this.markPdfViewed(pdf);
  }

  private markPdfViewed(pdf: PdfResource): void {
    if (this.userId) {
      this.coursContentService.markModuleViewed(this.userId, this.courseId, pdf.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`PDF ${pdf.title} marked as viewed`);
          },
          error: (error) => {
            console.error('Error marking PDF as viewed:', error);
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

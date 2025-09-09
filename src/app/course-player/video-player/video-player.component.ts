import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CoursContentService, VideoResource } from '../../services/cours-content.service';
import { ProgressService } from '../../services/progress.service';
import { CourseService, Cours } from '../../services/course.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;

  courseId!: number;
  videoResources: VideoResource[] = [];
  currentVideo: VideoResource | null = null;
  loading = true;
  error: string | null = null;
  userId: string = '';
  currentVideoIndex = 0;

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
      this.loadVideoResources();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVideoResources(): void {
    this.loading = true;
    this.error = null;

    // First, check if the course has uploaded video files
    this.courseService.getCourseById(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (course: Cours) => {
          // Check for uploaded video file
          if (course.videoFile) {
            // Create a video resource from the uploaded file
            this.videoResources = [{
              id: 1,
              title: 'Vidéo du cours',
              url: course.videoFile,
              duration: undefined,
              thumbnail: undefined,
              format: 'uploaded'
            }];
            this.selectVideo(0);
            this.loading = false;
          } else {
            // Fall back to regular video resources
            this.loadRegularVideoResources();
          }
        },
        error: (error) => {
          console.error('Error loading course:', error);
          // Fall back to regular video resources
          this.loadRegularVideoResources();
        }
      });
  }

  private loadRegularVideoResources(): void {
    this.coursContentService.getVideoList(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resources) => {
          this.videoResources = resources;
          if (resources.length > 0) {
            this.selectVideo(0);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading video resources:', error);
          this.error = 'Erreur lors du chargement des ressources vidéo';
          this.loading = false;
        }
      });
  }

  selectVideo(index: number): void {
    if (index >= 0 && index < this.videoResources.length) {
      this.currentVideoIndex = index;
      this.currentVideo = this.videoResources[index];
    }
  }

  onVideoEnded(): void {
    if (this.currentVideo && this.userId) {
      // Mark video as completed
      this.progressService.markModuleComplete(this.userId, this.courseId, this.currentVideo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Video ${this.currentVideo!.title} marked as completed`);
            // Auto-advance to next video
            if (this.currentVideoIndex < this.videoResources.length - 1) {
              setTimeout(() => {
                this.selectVideo(this.currentVideoIndex + 1);
              }, 2000); // 2 second delay
            }
          },
          error: (error) => {
            console.error('Error marking video as completed:', error);
          }
        });
    }
  }

  onVideoPlay(): void {
    if (this.currentVideo && this.userId) {
      // Mark video as viewed
      this.coursContentService.markModuleViewed(this.userId, this.courseId, this.currentVideo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Video ${this.currentVideo!.title} marked as viewed`);
          },
          error: (error) => {
            console.error('Error marking video as viewed:', error);
          }
        });
    }
  }

  nextVideo(): void {
    if (this.currentVideoIndex < this.videoResources.length - 1) {
      this.selectVideo(this.currentVideoIndex + 1);
    }
  }

  previousVideo(): void {
    if (this.currentVideoIndex > 0) {
      this.selectVideo(this.currentVideoIndex - 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

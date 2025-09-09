import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Cours } from '../../services/course.service';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
  course: Cours | null = null;
  enrollmentCount: number = 0;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourseDetails(+id);
    } else {
      this.error = 'ID du cours manquant';
      this.loading = false;
    }
  }

  loadCourseDetails(courseId: number): void {
    this.loading = true;
    this.error = '';

    this.courseService.getCourseById(courseId).subscribe({
      next: (data) => {
        this.course = data;
        // Load enrollment count for this course
        this.loadEnrollmentCount(courseId);
      },
      error: (error) => {
        console.error('Error loading course details:', error);
        this.error = 'Erreur lors du chargement des détails du cours';
        this.loading = false;
      }
    });
  }

  loadEnrollmentCount(courseId: number): void {
    this.courseService.getEnrollmentsByCourse(courseId).subscribe({
      next: (enrollments) => {
        this.enrollmentCount = enrollments.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading enrollment count:', error);
        // If we can't load enrollment count, still show the course
        this.enrollmentCount = 0;
        this.loading = false;
      }
    });
  }

  enrollInCourse(): void {
    if (this.course?.idCours) {
      this.router.navigate(['/courses', this.course.idCours, 'enroll']);
    }
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }

  // Helper method to generate star rating display
  getStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

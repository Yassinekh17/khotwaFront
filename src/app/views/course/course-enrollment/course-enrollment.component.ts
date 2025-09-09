import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService, Cours, InscriptionCours } from '../../../services/course.service';
import { InscriptionCoursService } from '../../../services/inscription-cours.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-course-enrollment',
  templateUrl: './course-enrollment.component.html',
  styleUrls: ['./course-enrollment.component.css']
})
export class CourseEnrollmentComponent implements OnInit {
  course: Cours | null = null;
  enrollmentForm: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private courseService: CourseService,
    private inscriptionService: InscriptionCoursService,
    private notificationService: NotificationService
  ) {
    this.enrollmentForm = this.fb.group({
      nomComplet: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]],
      niveauExperience: ['Débutant', Validators.required],
      motivationEtObjectifs: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    const courseId = +this.route.snapshot.paramMap.get('id')!;
    if (courseId) {
      this.loadCourse(courseId);
    } else {
      this.error = 'ID du cours manquant';
    }
  }

  loadCourse(courseId: number): void {
    this.loading = true;
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Erreur lors du chargement du cours';
        this.loading = false;
      }
    });
  }

  submitEnrollment(): void {
    if (!this.course?.idCours || this.enrollmentForm.invalid) return;

    this.loading = true;
    this.error = null;

    const enrollmentData: InscriptionCours = {
      ...this.enrollmentForm.value,
      idCours: this.course.idCours
    };

    // Save user email for "my courses" retrieval
    localStorage.setItem('user_email', enrollmentData.email);

    this.inscriptionService.enrollInCourse(enrollmentData).subscribe({
      next: (response) => {
        console.log('✅ Course enrollment successful:', response);
        this.success = true;
        this.loading = false;

        // Show success notification
        this.notificationService.notifyCourseEnrollment(this.course!.titre, true);

        // Redirect to my courses after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/cours-inscrits']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Course enrollment error:', error);
        this.error = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        this.loading = false;

        // Show error notification
        this.notificationService.notifyCourseEnrollment(this.course!.titre, false);
      }
    });
  }

  goBack(): void {
    if (this.course?.idCours) {
      this.router.navigate(['/courses', this.course.idCours]);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  goToMyCourses(): void {
    this.router.navigate(['/cours-inscrits']);
  }

  getFieldError(fieldName: string): string {
    const field = this.enrollmentForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['email']) {
        return 'Adresse email invalide';
      }
      if (field.errors['pattern']) {
        return 'Numéro de téléphone invalide';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nomComplet: 'Le nom complet',
      email: 'L\'adresse email',
      telephone: 'Le numéro de téléphone',
      niveauExperience: 'Le niveau d\'expérience',
      motivationEtObjectifs: 'La motivation et les objectifs'
    };
    return labels[fieldName] || fieldName;
  }
}

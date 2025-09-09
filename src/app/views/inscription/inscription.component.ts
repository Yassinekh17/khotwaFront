import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Cours, InscriptionCours } from '../../services/course.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent implements OnInit {
  inscriptionForm: FormGroup;
  course: Cours | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  error: string = '';
  success: string = '';

  experienceLevels: string[] = [
    'Débutant',
    'Intermédiaire',
    'Avancé',
    'Expert'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {
    this.inscriptionForm = this.fb.group({
      nomComplet: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^(\+216|0)[0-9]{8}$/)]],
      niveauExperience: ['Débutant', Validators.required],
      motivationEtObjectifs: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(+courseId);
    } else {
      this.error = 'ID du cours manquant';
    }
  }

  loadCourse(courseId: number): void {
    this.loading = true;
    this.courseService.getCourseById(courseId).subscribe({
      next: (data) => {
        this.course = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Erreur lors du chargement du cours';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.inscriptionForm.valid && this.course?.idCours) {
      this.submitting = true;
      this.error = '';
      this.success = '';

      const inscriptionData: InscriptionCours = {
        ...this.inscriptionForm.value,
        idCours: this.course.idCours
      };

      this.courseService.enrollInCourse(inscriptionData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.success = '🎉 Inscription réussie ! Vous allez être redirigé vers vos cours.';
          this.inscriptionForm.reset({
            niveauExperience: 'Débutant'
          });

          // Redirect to "Mes cours" after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/mes-cours']);
          }, 3000);
        },
        error: (error) => {
          console.error('Error enrolling in course:', error);
          this.submitting = false;
          this.error = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.inscriptionForm.controls).forEach(key => {
      const control = this.inscriptionForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.inscriptionForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.getFieldLabel(fieldName) + ' est requis';
      }
      if (field.errors['email']) {
        return 'Veuillez entrer un email valide';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      }
      if (field.errors['pattern']) {
        return 'Veuillez entrer un numéro de téléphone valide (ex: +21612345678 ou 012345678)';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nomComplet: 'Le nom complet',
      email: 'L\'email',
      telephone: 'Le téléphone',
      niveauExperience: 'Le niveau d\'expérience',
      motivationEtObjectifs: 'La motivation et les objectifs'
    };
    return labels[fieldName] || fieldName;
  }

  goBack(): void {
    if (this.course?.idCours) {
      this.router.navigate(['/courses', this.course.idCours]);
    } else {
      this.router.navigate(['/courses']);
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionCoursService, EnrolledCourse as BackendEnrolledCourse } from '../../../services/inscription-cours.service';
import { CourseService, Cours } from '../../../services/course.service';
import { ProgressService } from '../../../services/progress.service';
import { CertificationService } from '../../../services/certification.service';

interface EnrolledCourse {
  idCours: number;
  titre: string;
  description: string;
  categorie: string;
  niveau: string;
  image?: string;
  progress: {
    completedChapters: number;
    totalChapters: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'QUIZ_READY' | 'VALIDATED' | 'FAILED';
    quizScore?: number;
    quizStatus?: 'NOT_TAKEN' | 'PASSED' | 'FAILED';
  };
  enrollmentDate: string;
  prix: number;
  duree: number;
  rating: number;
}

@Component({
  selector: 'app-cours-inscrits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cours-inscrits.component.html',
  styleUrls: ['./cours-inscrits.component.css']
})
export class CoursInscritsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  enrolledCourses: EnrolledCourse[] = [];
  filteredCourses: EnrolledCourse[] = [];
  loading = false;
  error: string | null = null;

  // Search and Filter properties
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedNiveau = '';
  selectedSort = 'recent';

  // Filter options
  categories: string[] = [];
  niveaux: string[] = [];
  sortOptions = [
    { value: 'recent', label: 'Plus récent' },
    { value: 'title-asc', label: 'Titre (A-Z)' },
    { value: 'title-desc', label: 'Titre (Z-A)' },
    { value: 'progress-desc', label: 'Progression (desc)' },
    { value: 'progress-asc', label: 'Progression (asc)' },
    { value: 'rating-desc', label: 'Note (desc)' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;

  // Debug properties
  userEmail: string = '';

  constructor(
    private inscriptionService: InscriptionCoursService,
    private courseService: CourseService,
    private progressService: ProgressService,
    private certificationService: CertificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('user_email') || '';
    this.loadEnrolledCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEnrolledCourses(): void {
    this.loading = true;
    this.error = null;

    try {
      const userEmail = localStorage.getItem('user_email');
      console.log('👤 Loading enrolled courses for user:', userEmail);

      if (!userEmail) {
        this.error = 'Veuillez vous inscrire à un cours d\'abord';
        this.enrolledCourses = [];
        this.loading = false;
        return;
      }

      this.inscriptionService.getEnrolledCoursesWithDetails(userEmail)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (backendEnrolledCourses: BackendEnrolledCourse[]) => {
            console.log('📚 Backend returned enrolled courses:', backendEnrolledCourses.length);

            this.enrolledCourses = backendEnrolledCourses.map(backendCourse => {
              console.log(`📖 Processing course: ${backendCourse.course.titre} (ID: ${backendCourse.course.idCours})`);
              console.log(`📝 Chapters in course: ${backendCourse.course.chapters?.length || 0}`);

              return {
                idCours: backendCourse.course.idCours!,
                titre: backendCourse.course.titre,
                description: backendCourse.course.description,
                categorie: backendCourse.course.categorie,
                niveau: backendCourse.course.niveau,
                image: backendCourse.course.image,
                enrollmentDate: backendCourse.enrollment.dateInscription || new Date().toISOString(),
                prix: backendCourse.course.prix,
                duree: backendCourse.course.duree,
                rating: backendCourse.course.rating,
                progress: this.loadProgressForCourse(backendCourse.course.idCours!)
              };
            });

            console.log('✅ Processed enrolled courses:', this.enrolledCourses.length);
            this.initializeFilters();
            this.applyFilters();
            this.loading = false;
          },
          error: (error: any) => {
            console.error('❌ Error loading enrolled courses:', error);
            this.error = 'Erreur lors du chargement des cours inscrits';
            this.loading = false;
          }
        });
    } catch (error) {
      console.error('❌ Exception in loadEnrolledCourses:', error);
      this.error = 'Erreur lors du chargement des cours';
      this.loading = false;
    }
  }

  private loadProgressForCourse(courseId: number) {
    const progress = this.progressService.getProgressLocal(courseId.toString());
    return {
      completedChapters: progress.completedChapters?.length || 0,
      totalChapters: progress.totalChapters || 10,
      status: (progress.quizStatus === 'PASSED' ? 'VALIDATED' :
             progress.quizStatus === 'FAILED' ? 'FAILED' :
             progress.progressPercent === 100 ? 'QUIZ_READY' :
             progress.progressPercent > 0 ? 'IN_PROGRESS' : 'NOT_STARTED') as any,
      quizScore: progress.quizScore,
      quizStatus: progress.quizStatus
    };
  }

  // Filter and Search Methods
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedNiveau = '';
    this.selectedSort = 'recent';
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.enrolledCourses];

    // Search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.titre?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.categorie?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(course => course.categorie === this.selectedCategory);
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(course => course.progress.status === this.selectedStatus);
    }

    // Niveau filter
    if (this.selectedNiveau) {
      filtered = filtered.filter(course => course.niveau === this.selectedNiveau);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.selectedSort) {
        case 'recent':
          return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
        case 'title-asc':
          return (a.titre || '').localeCompare(b.titre || '');
        case 'title-desc':
          return (b.titre || '').localeCompare(a.titre || '');
        case 'progress-desc':
          return (b.progress.completedChapters / b.progress.totalChapters) - (a.progress.completedChapters / a.progress.totalChapters);
        case 'progress-asc':
          return (a.progress.completedChapters / a.progress.totalChapters) - (b.progress.completedChapters / b.progress.totalChapters);
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    this.filteredCourses = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
  }

  private initializeFilters(): void {
    // Extract unique categories
    const categoriesSet = new Set<string>();
    const niveauxSet = new Set<string>();

    this.enrolledCourses.forEach(course => {
      if (course.categorie) categoriesSet.add(course.categorie);
      if (course.niveau) niveauxSet.add(course.niveau);
    });

    this.categories = Array.from(categoriesSet);
    this.niveaux = Array.from(niveauxSet);
  }

  // Pagination Methods
  getCurrentPageCourses(): EnrolledCourse[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredCourses.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Course Actions
  continueCourse(course: EnrolledCourse): void {
    this.router.navigate(['/courses', course.idCours, 'contenu']);
  }

  takeQuiz(course: EnrolledCourse): void {
    this.router.navigate(['/courses', course.idCours, 'quiz']);
  }

  downloadCertificate(course: EnrolledCourse): void {
    // TODO: Implement certificate download for courses
    console.log('Downloading certificate for course:', course.titre);
    alert('Fonctionnalité de téléchargement de certificat à implémenter');
  }

  // Utility Methods
  getProgressPercentage(course: EnrolledCourse): number {
    if (course.progress.totalChapters === 0) return 0;
    return Math.round((course.progress.completedChapters / course.progress.totalChapters) * 100);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'NOT_STARTED': return 'Non commencé';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'QUIZ_READY': return 'Prêt pour le quiz';
      case 'VALIDATED': return 'Validé';
      case 'FAILED': return 'Échoué';
      default: return 'Inconnu';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'NOT_STARTED': return 'text-gray-500';
      case 'IN_PROGRESS': return 'text-blue-600';
      case 'COMPLETED': return 'text-green-600';
      case 'QUIZ_READY': return 'text-yellow-600';
      case 'VALIDATED': return 'text-emerald-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-gray-500';
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

  getStars(rating: number): number[] {
    const stars: number[] = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    if (rating % 1 !== 0) {
      stars.push(0.5);
    }
    while (stars.length < 5) {
      stars.push(0);
    }
    return stars;
  }

  // Generate user-friendly gradient colors for course cards
  getCourseGradient(index: number): string {
    const gradients = [
      '#667EEA, #764BA2', // Soft purple to blue
      '#F093FB, #F5576C', // Soft pink to coral
      '#4FACFE, #00F2FE', // Soft blue to cyan
      '#43E97B, #38F9D7', // Soft green to mint
      '#FA709A, #FEE140', // Soft pink to yellow
      '#A8E6CF, #DCEDC1', // Soft mint to light green
      '#FFD3A5, #FD6585', // Soft peach to pink
      '#C2E9FB, #A1C4FD'  // Soft blue to light blue
    ];
    return gradients[index % gradients.length];
  }

}

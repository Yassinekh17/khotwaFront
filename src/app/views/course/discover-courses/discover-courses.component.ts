import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Cours, Quiz } from '../../../services/course.service';
import { QuizAdminService } from '../../../services/quiz-admin.service';

@Component({
  selector: 'app-discover-courses',
  templateUrl: './discover-courses.component.html',
  styleUrls: ['./discover-courses.component.css']
})
export class DiscoverCoursesComponent implements OnInit {
  courses: Cours[] = [];
  quizzes: { [courseId: number]: Quiz } = {};
  loading: boolean = true;
  error: string = '';
  searchTerm: string = '';
  selectedCategory: string = '';
  categories: string[] = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science'];

  constructor(
    private courseService: CourseService,
    private quizAdminService: QuizAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';

    this.courseService.getCoursesAddedByAdmin().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
        // Load quizzes for each course
        this.loadQuizzesForCourses();
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.error = 'Erreur lors du chargement des cours. Vérifiez que le serveur back-end est démarré sur le port 8089.';
        this.loading = false;
      }
    });
  }

  loadQuizzesForCourses(): void {
    this.courses.forEach(course => {
      if (course.idCours) {
        this.quizAdminService.getQuizByCourseId(course.idCours).subscribe({
          next: (quiz) => {
            this.quizzes[course.idCours!] = quiz;
          },
          error: (error) => {
            // Quiz not found or error - this is expected for courses without quizzes
            console.log(`No quiz found for course ${course.idCours}`);
          }
        });
      }
    });
  }

  get filteredCourses(): Cours[] {
    return this.courses.filter(course => {
      const matchesSearch = course.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === '' || this.selectedCategory === 'All' ||
                             course.categorie === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }


  enrollInCourse(courseId: number): void {
    // TODO: Implement enrollment logic
    console.log('Enrolling in course:', courseId);
    // For now, just navigate to course view
    this.router.navigate(['/courses', courseId, 'view']);
  }

  onSearchChange(): void {
    // Filter will be applied automatically through filteredCourses getter
  }

  onCategoryChange(): void {
    // Filter will be applied automatically through filteredCourses getter
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

  // Generate star rating array
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
}

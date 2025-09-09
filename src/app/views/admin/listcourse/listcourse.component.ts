import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Cours } from '../../../services/course.service';

@Component({
  selector: 'app-listcourse',
  templateUrl: './listcourse.component.html',
  styleUrls: ['./listcourse.component.css']
})
export class ListcourseComponent implements OnInit {
  courses: Cours[] = [];
  loading: boolean = true;
  error: string = '';
  searchTerm: string = '';
  selectedCategory: string = '';
  categories: string[] = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science'];

  constructor(
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';

    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.error = 'Erreur lors du chargement des cours';
        this.loading = false;
      }
    });
  }

  deleteCourse(course: Cours): void {
    if (course.idCours && confirm(`Êtes-vous sûr de vouloir supprimer le cours "${course.titre}" ?`)) {
      this.courseService.deleteCourse(course.idCours).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.idCours !== course.idCours);
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          this.error = 'Erreur lors de la suppression du cours';
        }
      });
    }
  }

  editCourse(course: Cours): void {
    // Navigate to edit course page (we'll implement this)
    if (course.idCours) {
      this.router.navigate(['/admin/listcourse/edit', course.idCours]);
    }
  }

  addCourse(): void {
    this.router.navigate(['/admin/listcourse/add']);
  }

  manageQuiz(course: Cours): void {
    if (course.idCours) {
      this.router.navigate(['/admin/listcourse', course.idCours, 'quiz']);
    }
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

  onSearchChange(): void {
    // Filter will be applied automatically through filteredCourses getter
  }

  onCategoryChange(): void {
    // Filter will be applied automatically through filteredCourses getter
  }

  refreshCourses(): void {
    this.loadCourses();
  }

  getCategoryClass(categorie: string): string {
    const categoryClasses: { [key: string]: string } = {
      'Programming': 'bg-blue-100 text-blue-800',
      'Design': 'bg-purple-100 text-purple-800',
      'Business': 'bg-green-100 text-green-800',
      'Marketing': 'bg-yellow-100 text-yellow-800',
      'Data Science': 'bg-red-100 text-red-800'
    };
    return categoryClasses[categorie] || 'bg-gray-100 text-gray-800';
  }

  getLevelClass(niveau: string): string {
    const levelClasses: { [key: string]: string } = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return levelClasses[niveau] || 'bg-gray-100 text-gray-800';
  }

  clearError(): void {
    this.error = '';
  }
}

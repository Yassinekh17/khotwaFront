import { Component, OnInit } from '@angular/core';
import { CoursService } from 'src/app/core/service/cours.service';
import { Cours } from 'src/app/core/models/Cours';
import { Router } from '@angular/router';

interface Course {
    category: string;
    title: string;
    rating: number;
    students: number;
    warning?: boolean;
  }
@Component({
  selector: "app-tables",
  templateUrl: "./listcour.component.html",
  styleUrls: ['./listCour.component.css']
})
export class ListCourComponent implements OnInit {
  coursList: Cours[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  categories: string[] = ['Web Development', 'Backend Development', 'Web Design', 'Cloud Computing', 'App']; // Example categories

  constructor(private coursService: CoursService,private router: Router) {}

  

  pages = [1, 2, 3, 4, 5];
  currentPage = 1;

  getCategoryClass(category: string): string {
    switch(category) {
      case 'IT & SOFTWARE': return 'it-software';
      case 'DESIGN': return 'design';
      case 'DEVELOPMENTS': return 'developments';
      case 'WARNING': return 'warning';
      default: return 'default';
    }
  }
  goToQuiz(): void {
    this.router.navigate(['/listQuizz']);
  }
  /*  goToQuiz(): void {
    this.router.navigate(['/quiz']);
  }*/
  changePage(page: number): void {
    this.currentPage = page;
    // Add your pagination logic here
  }
  ngOnInit(): void {
    this.getCourses();
  }
  getCourses(): void {
    this.coursService.getCoursList().subscribe((data: Cours[]) => {
      this.coursList = data;
    });
  }

  searchCours(): void {
    if (this.searchQuery.trim() === '') {
      this.getCourses(); // Reload all courses if search bar is empty
    } else {
      this.coursService.searchCours(this.searchQuery).subscribe((data: Cours[]) => {
        this.coursList = data;
      });
    }
  }
  filterByCategory(categorie: string): void {
    this.selectedCategory = categorie;  // Set the selected category
    this.coursService.searchCoursByCategory(categorie).subscribe((data: Cours[]) => {
      this.coursList = data;  // Filtered courses based on category
    });
  }
  goToCourseDetails(courseId: number): void {
    this.router.navigate(['/course', courseId]);
  }
  get filteredCourses(): Cours[] {
    // Apply search filter if any
    let filtered = this.coursList;
    if (this.searchQuery.trim() !== '') {
      filtered = filtered.filter(cours =>
        cours.titre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(cours =>
        cours.categorie.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }
    return filtered;
  }
  
}

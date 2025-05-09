import { Component, OnInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpResponse } from '@angular/common/http'; 
import { Cours, Quizz, Question, Reponse } from 'src/app/core/models/Cours';
import { CoursService } from 'src/app/core/service/cours.service';
import { QuizzService } from 'src/app/core/service/quizz.service';
import { NotificationService } from 'src/app/core/service/notification.service';

@Component({
  selector: "app-card-quizz",
  styleUrls: ["./card-quizz.component.scss"],
  templateUrl: "./card-quizz.component.html",
})
export class CardquizzComponent implements OnInit {
  coursList: Cours[] = [];
  filteredCourses: Cours[] = [];
  imageFile: File | null = null;
  fichierFile: File | null = null;
  videoFile: File | null = null;
  searchQuery: string = '';
  sortType: number = 0; // Track sorting type: 0 for name, 1 for date, 2 for category
  sortButtonText: string = "Sort by Name"; // Initial button text
  quizzList: Quizz[] = [];
  showForm = false;
  newCour: Cours = {
    id_cours: 0,
    titre: '',
    description: '',
    duree: 0,
    prix: 0,
    niveau: '',
    categorie: '',
    date_publication: new Date(),
    nb_etudiantsEnrolled: 0,
    rating: 0,
    format: '',
    fichier: '',
    image: '',
    video: ''
  };
  showQuizForm = false;
  currentQuizStep: 'quiz' | 'question' | 'response' = 'quiz';
  newQuizz: Quizz = {
    nomQuizz: '',
    cours: {} as Cours
  };
  currentQuestion: Question = {
    ennonce: '',
    bonneReponse: '',
    reponses: []
  };
  responses: Reponse[] = [];

  @Input()
  get color(): string {
    return this._color;
  }
  set color(color: string) {
    this._color = color !== "light" && color !== "dark" ? "light" : color;
  }
  private _color = "light";

  constructor(
    private notificationService: NotificationService,
    private quizzService: QuizzService) {}

  ngOnInit(): void {this.loadQuizzes();
    
  }
  showAddQuizForm(): void {
    this.showQuizForm = true;
    this.resetQuizForm();
  }

  resetQuizForm(): void {
    this.newQuizz = { nomQuizz: '', cours: this.newCour };
    this.currentQuestion = { ennonce: '', bonneReponse: '', reponses: [] };
    this.responses = Array(5).fill(0).map(() => ({ contenu: '' }));
    
  }

  handleQuizCreation(): void {
    if (this.currentQuizStep === 'quiz') {
      this.currentQuizStep = 'question';
    } else if (this.currentQuizStep === 'question') {
      this.currentQuizStep = 'response';
    }
  }
  loadQuizzes(): void {
    this.quizzService.getAllQuizzes().subscribe({
      next: (data) => {
        console.log("QUIZZES FROM API: ", data);
        this.quizzList = data;
      },
      error: (error) => {
        console.error('Error fetching quizzes:', error);
      },
    });
  }
  addQuestionToQuiz(quizz: Quizz): void {
    this.showQuizForm = true;
    this.currentQuizStep = 'question';
    this.newQuizz = quizz; // Set the current quiz
    this.currentQuestion = { ennonce: '', bonneReponse: '', reponses: [], quizz: quizz };
    this.responses = Array(5).fill(0).map(() => ({ contenu: '' }));
  }
  async submitQuestion(): Promise<void> {
    try {
      // Create question for the existing quiz
      const createdQuestion = await this.quizzService.addQuestion({
        ...this.currentQuestion,
        quizz: this.newQuizz
      }).toPromise();
  
      // Create responses for the question
      for (const response of this.responses) {
        if (response.contenu) {
          await this.quizzService.addReponse({
            ...response,
            question: createdQuestion
          }).toPromise();
        }
      }
  
      this.notificationService.showSuccess('Question added successfully!');
      this.showQuizForm = false;
      this.resetQuizForm();
      this.loadQuizzes(); // Refresh the list
    } catch (error) {
      
      console.error(error);
    }
  }
  // Add these methods
  deleteQuizz(quizzId: number): void {
    this.quizzService.deleteQuizz(quizzId).subscribe({
      next: () => {
        this.quizzList = this.quizzList.filter(q => q.idQuizz !== quizzId);
      },
      error: (error) => {
        console.error('Error deleting quiz:', error);
      }
    });
  }

  editQuizz(quizz: Quizz): void {
    // Implement edit logic
  }
  addResponseFields(): void {
    this.responses = [...this.responses, { contenu: '' }];
  }

  async submitQuiz(): Promise<void> {
    try {
      // Create quiz
      const createdQuizz = await this.quizzService.createQuizz({
        ...this.newQuizz,
        cours: this.newCour
      }).toPromise();

      // Create question
      const createdQuestion = await this.quizzService.addQuestion({
        ...this.currentQuestion,
        quizz: createdQuizz
      }).toPromise();

      // Create responses
      for (const response of this.responses) {
        if (response.contenu) {
          await this.quizzService.addReponse({
            ...response,
            question: createdQuestion
          }).toPromise();
        }
      }

      this.notificationService.showSuccess('Quiz created successfully!');
      this.showQuizForm = false;
      this.resetQuizForm();
      this.loadQuizzes();
    } catch (error) {
      
      console.error(error);
    }
  }

  // Update the template binding methods
  trackByIndex(index: number): number {
    return index;
  }
  
  
}

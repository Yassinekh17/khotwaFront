import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { QuizAdminService } from '../../../services/quiz-admin.service';
import { CourseService, Quiz, Question, Cours } from '../../../services/course.service';

@Component({
  selector: 'app-manage-quiz',
  templateUrl: './manage-quiz.component.html',
  styleUrls: ['./manage-quiz.component.css']
})
export class ManageQuizComponent implements OnInit {
  courseId: number = 0;
  course: Cours | null = null;
  quizForm: FormGroup;
  loading: boolean = false;
  saving: boolean = false;
  error: string = '';
  success: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private quizService: QuizAdminService,
    private courseService: CourseService
  ) {
    this.quizForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      duree: [30, [Validators.required, Validators.min(5)]],
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Course ID:', this.courseId);
    if (this.courseId) {
      this.loadCourse();
      this.loadExistingQuiz();
      // Don't add default question - let user add them manually
    }

    // Removed auto-clear test data - let users keep their quiz data
    // this.autoClearTestDataIfNeeded();
  }


  loadCourse(): void {
    // For now, we'll create a mock course object since we don't have course details endpoint
    this.course = {
      idCours: this.courseId,
      titre: `Cours ${this.courseId}`,
      description: 'Description du cours',
      duree: 60,
      prix: 50,
      niveau: 'Débutant',
      categorie: 'Programmation',
      nb_etudiantsEnrolled: 0,
      rating: 0,
      format: 'Video'
    };
  }

  loadExistingQuiz(): void {
    this.loading = true;
    this.quizService.getQuizByCourseId(this.courseId).subscribe({
      next: (quiz) => {
        if (quiz) {
          console.log('📝 Existing quiz found:', quiz);
          this.populateForm(quiz);
        } else {
          console.log('ℹ️ No existing quiz found for course:', this.courseId);
          console.log('👤 User can now create a new quiz from scratch');
        }
        this.loading = false;
      },
      error: (error) => {
        console.log('ℹ️ Error loading quiz or no quiz exists for course:', this.courseId);
        this.loading = false;
        console.log('👤 User can now create a new quiz from scratch');
      }
    });
  }

  populateForm(quiz: Quiz): void {
    this.quizForm.patchValue({
      titre: quiz.nomQuizz,
      description: quiz.cours?.description || '',
      duree: 30
    });

    // Clear existing questions
    this.questions.clear();

    // Add existing questions
    quiz.questions.forEach(question => {
      this.addQuestion(question);
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  addQuestion(existingQuestion?: Question): void {
    const questionGroup = this.fb.group({
      question: [existingQuestion?.question || '', [Validators.required, Validators.minLength(10)]],
      option1: [existingQuestion?.options[0] || '', Validators.required],
      option2: [existingQuestion?.options[1] || '', Validators.required],
      option3: [existingQuestion?.options[2] || '', Validators.required],
      option4: [existingQuestion?.options[3] || '', Validators.required],
      correctAnswer: [existingQuestion?.correctAnswer || 0, Validators.required]
    });

    this.questions.push(questionGroup);
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.quizForm.valid) {
      this.saving = true;
      this.error = '';
      this.success = '';

      const formValue = this.quizForm.value;

      // Convert form data to Quiz object
      const quiz: Quiz = {
        nomQuizz: formValue.titre,
        cours: this.course || {
          idCours: this.courseId,
          titre: `Cours ${this.courseId}`,
          description: formValue.description,
          duree: 60,
          prix: 50,
          niveau: 'Débutant',
          categorie: 'Programmation',
          nb_etudiantsEnrolled: 0,
          rating: 0,
          format: 'Video'
        },
        questions: formValue.questions.map((q: any) => ({
          question: q.question,
          options: [q.option1, q.option2, q.option3, q.option4],
          correctAnswer: q.correctAnswer
        }))
      };

      console.log('Sending quiz data to backend:', quiz);
      this.quizService.createQuiz(quiz).subscribe({
        next: (response) => {
          console.log('Quiz created successfully:', response);
          this.saving = false;
          this.success = 'Quiz créé avec succès!';
          setTimeout(() => {
            this.router.navigate(['/admin/listcourse']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error creating quiz:', error);
          this.saving = false;
          this.error = 'Erreur lors de la création du quiz. Veuillez réessayer.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.quizForm.controls).forEach(key => {
      const control = this.quizForm.get(key);
      control?.markAsTouched();
    });

    // Mark all questions as touched
    this.questions.controls.forEach(questionGroup => {
      if (questionGroup instanceof FormGroup) {
        Object.keys(questionGroup.controls).forEach(key => {
          const control = questionGroup.get(key);
          control?.markAsTouched();
        });
      }
    });
  }

  clearAllQuizData(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer TOUTES les données de quiz ? Cette action est irréversible et supprimera tous les quiz existants.')) {
      // Clear quiz data from localStorage
      localStorage.removeItem('course_quizzes');
      localStorage.removeItem('quiz_answers_anonymous_1');
      localStorage.removeItem('quiz_progress_anonymous_1');

      // Clear any other quiz-related keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('quiz_') || key.includes('course_quiz'))) {
          localStorage.removeItem(key);
        }
      }

      console.log('✅ Toutes les données de quiz ont été supprimées');
      alert('Toutes les données de quiz ont été supprimées avec succès !\n\nLe formulaire sera maintenant vide.');
      // Recharger la page pour voir les changements
      window.location.reload();
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/listcourse']);
  }

  getQuestionFormGroup(index: number): FormGroup {
    return this.questions.at(index) as FormGroup;
  }
}

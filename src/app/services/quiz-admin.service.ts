import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Quiz, Question, Reponse } from './course.service';

@Injectable({
  providedIn: 'root'
})
export class QuizAdminService {
  private apiUrl = 'http://localhost:8089/quiz'; // Spring Boot server on port 8089

  constructor(private http: HttpClient) {}

  // Get quiz for a specific course from localStorage
  getQuizByCourseId(courseId: number): Observable<Quiz> {
    return new Observable(observer => {
      try {
        const storedQuizzes = this.getStoredQuizzes();
        const quizForCourse = storedQuizzes.find(quiz => quiz.cours?.idCours === courseId);

        if (quizForCourse) {
          console.log('✅ Quiz found in localStorage:', quizForCourse);
          console.log('📝 Questions in quiz:', quizForCourse.questions);
          quizForCourse.questions.forEach((question, index) => {
            console.log(`❓ Question ${index + 1}:`, question.question);
            console.log(`🔢 Options for question ${index + 1}:`, question.options);
          });
          observer.next(quizForCourse);
          observer.complete();
        } else {
          console.log('⚠️ No quiz found in localStorage for course:', courseId);
          // Return mock quiz as fallback
          const mockQuiz = this.getMockQuiz(courseId);
          console.log('🔄 Returning mock quiz as fallback:', mockQuiz);
          observer.next(mockQuiz);
          observer.complete();
        }
      } catch (error) {
        console.error('Error loading quiz from localStorage:', error);
        // Return null instead of mock quiz
        observer.next(null as any);
        observer.complete();
      }
    });
  }

  // Create a new quiz and save to localStorage
  createQuiz(quiz: Quiz): Observable<Quiz> {
    return new Observable(observer => {
      try {
        const storedQuizzes = this.getStoredQuizzes();

        // Generate unique ID
        const newQuiz: Quiz = {
          ...quiz,
          idQuizz: Date.now() // Use timestamp as unique ID
        };

        // Check if quiz already exists for this course
        const existingIndex = storedQuizzes.findIndex(q => q.cours?.idCours === quiz.cours?.idCours);

        if (existingIndex >= 0) {
          // Update existing quiz
          storedQuizzes[existingIndex] = newQuiz;
        } else {
          // Add new quiz
          storedQuizzes.push(newQuiz);
        }

        // Save to localStorage
        this.saveStoredQuizzes(storedQuizzes);

        console.log('💾 Quiz saved to localStorage:', newQuiz);
        console.log('📝 Questions saved:', newQuiz.questions);
        newQuiz.questions.forEach((question, index) => {
          console.log(`❓ Question ${index + 1} saved:`, question.question);
          console.log(`🔢 Options for question ${index + 1}:`, question.options);
          console.log(`✅ Correct answer for question ${index + 1}:`, question.correctAnswer);
        });
        observer.next(newQuiz);
        observer.complete();

      } catch (error) {
        console.error('Error saving quiz to localStorage:', error);
        observer.error(error);
      }
    });
  }

  // Update an existing quiz in localStorage
  updateQuiz(quiz: Quiz): Observable<Quiz> {
    return new Observable(observer => {
      try {
        const storedQuizzes = this.getStoredQuizzes();
        const index = storedQuizzes.findIndex(q => q.idQuizz === quiz.idQuizz);

        if (index >= 0) {
          storedQuizzes[index] = quiz;
          this.saveStoredQuizzes(storedQuizzes);
          observer.next(quiz);
        } else {
          observer.error(new Error('Quiz not found'));
        }
        observer.complete();
      } catch (error) {
        console.error('Error updating quiz in localStorage:', error);
        observer.error(error);
      }
    });
  }

  // Delete a quiz from localStorage
  deleteQuiz(quizId: number): Observable<void> {
    return new Observable(observer => {
      try {
        const storedQuizzes = this.getStoredQuizzes();
        const filteredQuizzes = storedQuizzes.filter(q => q.idQuizz !== quizId);

        if (filteredQuizzes.length < storedQuizzes.length) {
          this.saveStoredQuizzes(filteredQuizzes);
          observer.next();
        } else {
          observer.error(new Error('Quiz not found'));
        }
        observer.complete();
      } catch (error) {
        console.error('Error deleting quiz from localStorage:', error);
        observer.error(error);
      }
    });
  }

  // Get all quizzes from localStorage
  getAllQuizzes(): Observable<Quiz[]> {
    return new Observable(observer => {
      try {
        const storedQuizzes = this.getStoredQuizzes();
        observer.next(storedQuizzes);
        observer.complete();
      } catch (error) {
        console.error('Error loading quizzes from localStorage:', error);
        observer.next([]);
        observer.complete();
      }
    });
  }

  // Clear all quiz data from localStorage (for testing/cleanup)
  clearAllQuizData(): Observable<void> {
    return new Observable(observer => {
      try {
        // Clear main quiz storage
        localStorage.removeItem('course_quizzes');

        // Clear all quiz-related keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('quiz_') ||
            key.startsWith('course_quiz') ||
            key.includes('quiz') ||
            key.includes('answers') ||
            key.includes('progress')
          )) {
            keysToRemove.push(key);
          }
        }

        // Remove all found keys
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('🗑️ Removed key:', key);
        });

        console.log('🗑️ All quiz data cleared from localStorage (' + keysToRemove.length + ' keys removed)');
        observer.next();
        observer.complete();
      } catch (error) {
        console.error('❌ Error clearing quiz data from localStorage:', error);
        observer.error(error);
      }
    });
  }

  // Add a question to a quiz
  addQuestionToQuiz(question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/question/add`, question);
  }

  // Update a question
  updateQuestion(question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/question/update`, question);
  }

  // Delete a question
  deleteQuestion(questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/question/delete/${questionId}`);
  }

  // Get questions for a quiz
  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    return this.http.get<Quiz>(`${this.apiUrl}/retrieveQuizz/${quizId}`).pipe(
      map((quiz: Quiz) => quiz.questions || []),
      catchError(error => {
        console.warn('Backend not available for quiz questions');
        return of([]);
      })
    );
  }

  // Add answer to a question
  addAnswerToQuestion(answer: Reponse): Observable<Reponse> {
    return this.http.post<Reponse>(`${this.apiUrl}/reponse/add`, answer).pipe(
      catchError(error => {
        console.warn('Backend not available for answer creation');
        return of(answer);
      })
    );
  }

  // Get answers for a question
  getAnswersByQuestionId(questionId: number): Observable<Reponse[]> {
    return this.http.get<Reponse[]>(`${this.apiUrl}/question/${questionId}/reponses`).pipe(
      catchError(error => {
        console.warn('Backend not available for answers');
        return of([]);
      })
    );
  }

  // Local storage methods
  private getStoredQuizzes(): Quiz[] {
    try {
      const stored = localStorage.getItem('course_quizzes');
      console.log('🔍 Raw data from localStorage:', stored);
      const quizzes = stored ? JSON.parse(stored) : [];
      console.log('📦 Parsed quizzes from localStorage:', quizzes);
      return quizzes;
    } catch (error) {
      console.error('❌ Error reading quizzes from localStorage:', error);
      return [];
    }
  }

  private saveStoredQuizzes(quizzes: Quiz[]): void {
    try {
      localStorage.setItem('course_quizzes', JSON.stringify(quizzes));
    } catch (error) {
      console.error('Error saving quizzes to localStorage:', error);
    }
  }

  private getMockQuiz(courseId: number): Quiz {
    return {
      idQuizz: 1,
      nomQuizz: 'Quiz de validation',
      cours: {
        idCours: courseId,
        titre: 'Cours Test',
        description: 'Description du cours',
        duree: 60,
        prix: 99,
        niveau: 'Débutant',
        categorie: 'Programmation',
        format: 'En ligne',
        nb_etudiantsEnrolled: 1,
        rating: 4.5
      },
      questions: [
        {
          idQuestion: 1,
          question: 'Quelle est la capitale de la France ?',
          options: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
          correctAnswer: 0 // Paris
        },
        {
          idQuestion: 2,
          question: 'Angular est un :',
          options: ['Framework JavaScript', 'Bibliothèque CSS', 'Base de données', 'Serveur web'],
          correctAnswer: 0 // Framework JavaScript
        },
        {
          idQuestion: 3,
          question: 'TypeScript apporte :',
          options: ['La typisation statique', 'L\'interprétation à l\'exécution', 'La compilation en temps réel', 'L\'absence de types'],
          correctAnswer: 0 // La typisation statique
        }
      ]
    };
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Question {
  idQuestion?: number;
  question: string;
  options: string[]; // Array of 4 options
  correctAnswer: number; // Index of correct answer (0-3)
  idQuiz?: number;
}

export interface Quiz {
  idQuiz?: number;
  titre: string;
  description?: string;
  idCours: number;
  questions: Question[];
  dateCreation?: string;
  duree?: number; // in minutes
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  percentage: number;
}

export interface QuizSubmission {
  userId: string;
  courseId: number;
  answers: { [questionId: string]: number }; // questionId -> selected option index
  score: number;
  passed: boolean;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8089/quiz';

  constructor(private http: HttpClient) { }

  // Get quiz for a course - check localStorage first, then API
  getQuizByCourseId(courseId: number): Observable<Quiz> {
    // First try to get from localStorage (created by admin)
    const storedQuizzes = this.getStoredQuizzes();
    const quizForCourse = storedQuizzes.find((quiz: any) => {
      // Handle both old format (idCours) and new format (cours.idCours)
      return (quiz.idCours === courseId) || (quiz.cours?.idCours === courseId);
    });

    if (quizForCourse) {
      console.log('Found quiz in localStorage for course:', courseId);
      return of(quizForCourse);
    }

    // If not found in localStorage, try API
    return this.http.get<Quiz>(`${this.apiUrl}/course/${courseId}`).pipe(
      catchError(error => {
        console.warn('Backend not available for quiz, using mock data');
        return of(this.getMockQuiz(courseId));
      })
    );
  }

  // Submit quiz answers
  submitQuiz(submission: QuizSubmission): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, submission).pipe(
      catchError(error => {
        console.warn('Backend not available for quiz submission, using localStorage');
        this.saveQuizResultLocally(submission);
        return of({ success: true });
      })
    );
  }

  // Get quiz result for user and course
  getQuizResult(userId: string, courseId: number): Observable<QuizResult | null> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('courseId', courseId.toString());

    return this.http.get<QuizResult>(`${this.apiUrl}/result`, { params }).pipe(
      catchError(error => {
        console.warn('Backend not available for quiz result, using localStorage');
        return of(this.getQuizResultLocally(courseId));
      })
    );
  }

  // Calculate score from answers
  calculateScore(answers: { [questionId: string]: number }, questions: Question[]): QuizResult {
    let correct = 0;
    questions.forEach(q => {
      const userAnswer = answers[q.idQuestion!];
      if (userAnswer === q.correctAnswer) {
        correct++;
      }
    });

    const score = correct;
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 60; // 60% to pass

    return { score, total, passed, percentage };
  }

  // Update course status after quiz completion
  updateCourseStatus(courseId: number, status: 'VALIDATED' | 'FAILED', userId: string): Observable<any> {
    const updateData = {
      userId,
      courseId,
      status,
      completedAt: new Date().toISOString()
    };

    return this.http.post(`${this.apiUrl}/course-status`, updateData).pipe(
      catchError(error => {
        console.warn('Backend not available for course status update');
        return of({ success: true });
      })
    );
  }

  // Generate certificate for completed course
  generateCertificate(courseTitle: string, studentName: string, completionDate: string): Promise<Blob> {
    // This would integrate with the CertificationService
    // For now, return a simple PDF
    return this.createSimpleCertificate(courseTitle, studentName, completionDate);
  }

  private getMockQuiz(courseId: number): Quiz {
    return {
      idQuiz: 1,
      titre: 'Quiz de validation',
      description: 'Testez vos connaissances acquises',
      idCours: courseId,
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
      ],
      duree: 30
    };
  }

  private saveQuizResultLocally(submission: QuizSubmission): void {
    const key = `quiz_result_${submission.courseId}`;
    localStorage.setItem(key, JSON.stringify(submission));
  }

  private getQuizResultLocally(courseId: number): QuizResult | null {
    const key = `quiz_result_${courseId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const submission = JSON.parse(stored);
      return {
        score: submission.score,
        total: submission.total || 10,
        passed: submission.passed,
        percentage: Math.round((submission.score / (submission.total || 10)) * 100)
      };
    }
    return null;
  }

  private createSimpleCertificate(courseTitle: string, studentName: string, completionDate: string): Promise<Blob> {
    // Simple certificate generation - in a real app, this would use jsPDF or similar
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 600);

      // Border
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 760, 560);

      // Title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF COMPLETION', 400, 100);

      // Student name
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(studentName.toUpperCase(), 400, 200);

      // Course completion text
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.fillText('has successfully completed the course', 400, 280);

      // Course title
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`"${courseTitle}"`, 400, 340);

      // Completion date
      ctx.fillStyle = '#000000';
      ctx.font = '18px Arial';
      ctx.fillText(`Completed on: ${completionDate}`, 400, 420);

      // Signature
      ctx.fillText('Authorized Signature', 650, 520);

      canvas.toBlob((blob) => {
        resolve(blob!);
      });
    });
  }

  // Local storage methods
  private getStoredQuizzes(): Quiz[] {
    try {
      const stored = localStorage.getItem('course_quizzes');
      if (stored) {
        const quizzes = JSON.parse(stored);
        // Convert old format to new format if needed
        return quizzes.map((quiz: any) => {
          if (quiz.idCours && !quiz.cours) {
            // Convert old format to new format
            return {
              ...quiz,
              cours: {
                idCours: quiz.idCours,
                titre: `Cours ${quiz.idCours}`,
                description: quiz.description || '',
                duree: 60,
                prix: 99,
                niveau: 'Débutant',
                categorie: 'Programmation',
                format: 'En ligne',
                nb_etudiantsEnrolled: 1,
                rating: 4.5
              }
            };
          }
          return quiz;
        });
      }
      return [];
    } catch (error) {
      console.error('Error reading quizzes from localStorage:', error);
      return [];
    }
  }
}
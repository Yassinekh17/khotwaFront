import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  content: string;
  type: string;
  fileUrl?: string; // Frontend enrichment for file URLs
}

export interface Cours {
  idCours?: number;
  titre: string;
  description: string;
  duree: number;
  prix: number;
  niveau: string;
  categorie: string;
  date_publication?: string;
  nb_etudiantsEnrolled: number;
  rating: number;
  format: string;
  fichier?: string;
  image?: string;
  video?: string;
  pdfFile?: string;
  videoFile?: string;
  powerpointFile?: string;
  addedByAdmin?: boolean;
  chapters?: Chapter[];
}

export interface Quiz {
  idQuizz?: number;
  nomQuizz: string;
  cours?: Cours; // Full course object instead of just ID
  questions: Question[];
}

export interface Question {
  idQuestion?: number;
  question: string;
  options: string[]; // Array of 4 options
  correctAnswer: number; // Index of correct answer (0-3)
  idQuiz?: number;
}

export interface Reponse {
  idReponse?: number;
  reponse: string;
  estCorrect: boolean;
  idQuestion: number;
}

export interface InscriptionCours {
  idInscriptionCours?: number;
  nomComplet: string;
  email: string;
  telephone: string;
  niveauExperience: string;
  motivationEtObjectifs: string;
  idCours: number;
  dateInscription?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8089/cours'; // Spring Boot server running on port 8089

  constructor(private http: HttpClient) {}

  // Get all courses
  getAllCourses(): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.apiUrl}/all`);
  }

  // Get course by ID
  getCourseById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.apiUrl}/${id}`);
  }

  // Add new course
  addCourse(course: Cours): Observable<Cours> {
    return this.http.post<Cours>(`${this.apiUrl}/add`, course);
  }

  // Update course
  updateCourse(course: Cours): Observable<Cours> {
    return this.http.put<Cours>(`${this.apiUrl}/update`, course);
  }

  // Delete course
  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Search courses by title
  searchCoursesByTitle(titre: string): Observable<Cours[]> {
    const params = new HttpParams().set('titre', titre);
    return this.http.get<Cours[]>(`${this.apiUrl}/search`, { params });
  }

  // Search courses by category
  searchCoursesByCategory(categorie: string): Observable<Cours[]> {
    const params = new HttpParams().set('categorie', categorie);
    return this.http.get<Cours[]>(`${this.apiUrl}/searchByCategory`, { params });
  }

  // Get courses added by admin only
  getCoursesAddedByAdmin(): Observable<Cours[]> {
    // For now, use /all endpoint since /byAdmin doesn't exist
    // All courses from admin interface should be admin-added
    return this.http.get<Cours[]>(`${this.apiUrl}/all`);
  }

  // Course Enrollment methods
  enrollInCourse(inscription: InscriptionCours): Observable<InscriptionCours> {
    // For now, return a mock successful response since backend endpoint may not be implemented
    console.log('Mock enrollment for testing:', inscription);
    const mockResponse: InscriptionCours = {
      ...inscription,
      idInscriptionCours: Math.floor(Math.random() * 1000),
      dateInscription: new Date().toISOString()
    };
    return of(mockResponse);

    // Uncomment when backend is ready:
    // return this.http.post<InscriptionCours>(`${this.apiUrl}/inscription-cours/add`, inscription);
  }

  getEnrollmentsByCourse(courseId: number): Observable<InscriptionCours[]> {
    // For now, return mock data since backend endpoint may not be implemented
    // In a real app, this would fetch from the backend
    const mockEnrollments: InscriptionCours[] = [
      {
        idInscriptionCours: 1,
        nomComplet: "Test User",
        email: "test@example.com",
        telephone: "+21612345678",
        niveauExperience: "Débutant",
        motivationEtObjectifs: "Test motivation",
        idCours: courseId,
        dateInscription: new Date().toISOString()
      }
    ];
    return of(mockEnrollments);

    // Uncomment when backend is ready:
    // return this.http.get<InscriptionCours[]>(`${this.apiUrl}/inscription-cours/cours/${courseId}`);
  }

  deleteEnrollment(enrollmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inscription-cours/delete/${enrollmentId}`);
  }

  // Local storage methods for chapters (for demo purposes)
  saveCourseChapters(courseId: number, chapters: Chapter[]): void {
    const key = `course_chapters_${courseId}`;
    localStorage.setItem(key, JSON.stringify(chapters));
  }

  getCourseChapters(courseId: number): Chapter[] {
    const key = `course_chapters_${courseId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  // Enhanced getCourseById with backend chapters and fileUrl enrichment
  getCourseByIdWithChapters(id: number): Observable<Cours> {
    console.log('🔍 Fetching course with chapters from backend:', id);

    return this.http.get<Cours>(`${this.apiUrl}/${id}`).pipe(
      map(course => {
        console.log(`✅ Course ${id} fetched:`, course.titre);
        console.log(`📚 Chapters found: ${course.chapters?.length || 0}`);

        // Enrich chapters with fileUrl
        if (course.chapters && course.chapters.length > 0) {
          course.chapters = course.chapters.map(chapter => {
            const enriched = this.enrichChapterWithFileUrl(chapter);
            console.log(`🔗 Chapter "${chapter.title}" enriched with fileUrl:`, enriched.fileUrl);
            return enriched;
          });
        } else {
          console.warn(`⚠️ No chapters found for course ${id}, using default chapters`);
          course.chapters = this.getDefaultChapters();
        }

        return course;
      }),
      catchError(error => {
        console.error('❌ Backend not available for course:', id, error);
        console.log('🔄 Falling back to local data');

        // Try localStorage first
        const localChapters = this.getCourseChapters(id);
        if (localChapters.length > 0) {
          console.log('✅ Using localStorage chapters');
          const mockCourse: Cours = {
            idCours: id,
            titre: 'Cours Local',
            description: 'Cours chargé depuis le stockage local',
            duree: 60,
            prix: 99,
            niveau: 'Beginner',
            categorie: 'Programming',
            format: 'Mixed',
            nb_etudiantsEnrolled: 1,
            rating: 4.5,
            chapters: localChapters.map(ch => this.enrichChapterWithFileUrl(ch))
          };
          return of(mockCourse);
        }

        // Last resort: default chapters
        console.log('📝 Using default chapters as last resort');
        const mockCourse: Cours = {
          idCours: id,
          titre: 'Cours Local',
          description: 'Cours avec chapitres par défaut',
          duree: 60,
          prix: 99,
          niveau: 'Beginner',
          categorie: 'Programming',
          format: 'Mixed',
          nb_etudiantsEnrolled: 1,
          rating: 4.5,
          chapters: this.getDefaultChapters()
        };
        return of(mockCourse);
      })
    );
  }

  // Enrich chapter with fileUrl based on type
  private enrichChapterWithFileUrl(chapter: Chapter): Chapter {
    const enrichedChapter = { ...chapter };

    // Add fileUrl based on chapter type
    switch (chapter.type) {
      case 'pdf':
        enrichedChapter.fileUrl = chapter.content || `/assets/pdfs/${chapter.id}.pdf`;
        break;
      case 'video':
        enrichedChapter.fileUrl = chapter.content || `/assets/videos/${chapter.id}.mp4`;
        break;
      case 'powerpoint':
        enrichedChapter.fileUrl = chapter.content || `/assets/ppts/${chapter.id}.pptx`;
        break;
      case 'text':
        // Text content is already in chapter.content
        break;
      default:
        enrichedChapter.fileUrl = chapter.content;
    }

    return enrichedChapter;
  }

  private getDefaultChapters(): Chapter[] {
    const chapters = [
      {
        id: '1',
        title: 'Introduction au cours',
        description: 'Découvrez les objectifs et le contenu de ce cours',
        order: 1,
        content: 'Bienvenue dans ce cours ! Vous allez découvrir les concepts fondamentaux et acquérir de nouvelles compétences.',
        type: 'text' as const
      },
      {
        id: '2',
        title: 'Chapitre 1: Concepts de base',
        description: 'Apprenez les concepts fondamentaux',
        order: 2,
        content: 'Ce chapitre couvre les concepts de base nécessaires pour comprendre le sujet.',
        type: 'text' as const
      },
      {
        id: '3',
        title: 'Chapitre 2: Application pratique',
        description: 'Mettez en pratique ce que vous avez appris',
        order: 3,
        content: 'Dans ce chapitre, vous allez appliquer les concepts appris dans des exercices pratiques.',
        type: 'text' as const
      },
      {
        id: '4',
        title: 'Chapitre 3: Projet final',
        description: 'Réalisez un projet complet',
        order: 4,
        content: 'Mettez toutes vos connaissances en pratique dans ce projet final.',
        type: 'text' as const
      }
    ];

    // Enrich with fileUrl
    return chapters.map(chapter => this.enrichChapterWithFileUrl(chapter));
  }
}
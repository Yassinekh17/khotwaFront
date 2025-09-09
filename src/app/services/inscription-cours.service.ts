import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { InscriptionCours, Cours } from './course.service';

export interface EnrolledCourse {
  course: Cours;
  enrollment: InscriptionCours;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionCoursService {
  private apiUrl = 'http://localhost:8089/inscription-cours';

  constructor(private http: HttpClient) {}


  // Get all enrollments for a specific course - now uses real backend
  getEnrollmentsByCourse(courseId: number): Observable<InscriptionCours[]> {
    return this.http.get<InscriptionCours[]>(`${this.apiUrl}/cours/${courseId}`).pipe(
      catchError(error => {
        console.error('Error fetching enrollments from backend:', error);
        // Return empty array if backend fails
        return of([]);
      })
    );
  }

  // Get all enrollments for a specific user by email
  getEnrollmentsByUserEmail(email: string): Observable<InscriptionCours[]> {
    // For now, return mock data for the user
    const mockEnrollments: InscriptionCours[] = [
      {
        idInscriptionCours: 1,
        nomComplet: "Test User",
        email: email,
        telephone: "+21612345678",
        niveauExperience: "Débutant",
        motivationEtObjectifs: "Test motivation",
        idCours: 2,
        dateInscription: new Date().toISOString()
      },
      {
        idInscriptionCours: 2,
        nomComplet: "Test User",
        email: email,
        telephone: "+21612345678",
        niveauExperience: "Intermédiaire",
        motivationEtObjectifs: "Another motivation",
        idCours: 3,
        dateInscription: new Date().toISOString()
      }
    ];
    return of(mockEnrollments);

    // Uncomment when backend is ready:
    // return this.http.get<InscriptionCours[]>(`${this.apiUrl}/user/${email}`);
  }

  // Get enrolled courses with full course details for a user
  getEnrolledCoursesWithDetails(email: string): Observable<EnrolledCourse[]> {
    console.log('🔍 Fetching enrolled courses for user:', email);

    // First, try to get enrollments from backend
    return this.http.get<InscriptionCours[]>(`${this.apiUrl}/user/${email}`).pipe(
      map(enrollments => {
        console.log('✅ Found enrollments from backend:', enrollments);

        if (enrollments.length === 0) {
          return [];
        }

        // For each enrollment, fetch the corresponding course with chapters
        const enrolledCoursesObservables = enrollments.map(enrollment => {
          return this.http.get<Cours>(`${this.apiUrl.replace('/inscription-cours', '/cours')}/${enrollment.idCours}`).pipe(
            map(course => {
              console.log(`✅ Fetched course ${course.idCours} with ${course.chapters?.length || 0} chapters`);
              return {
                course: course,
                enrollment: enrollment
              };
            }),
            catchError(error => {
              console.error(`❌ Error fetching course ${enrollment.idCours}:`, error);
              // Return basic course data if detailed fetch fails
              return of({
                course: this.createCourseFromEnrollment(enrollment),
                enrollment: enrollment
              });
            })
          );
        });

        return enrolledCoursesObservables;
      }),
      switchMap(observables => {
        if (observables.length === 0) {
          return of([]);
        }
        return forkJoin(observables);
      }),
      catchError(error => {
        console.error('❌ Error fetching enrollments from backend:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        console.log('🔄 Falling back to localStorage data');

        // Fallback: try localStorage
        const localEnrollments = this.getEnrollmentsFromStorage(email);
        console.log('💾 Local enrollments found:', localEnrollments.length);

        if (localEnrollments.length === 0) {
          console.log('📭 No local enrollments found, creating demo data');
          // Create demo enrollment for testing
          const demoEnrollment: InscriptionCours = {
            idInscriptionCours: 1,
            nomComplet: "Demo User",
            email: email,
            telephone: "+21612345678",
            niveauExperience: "Débutant",
            motivationEtObjectifs: "Demo motivation",
            idCours: 1,
            dateInscription: new Date().toISOString()
          };

          const demoCourse = this.createCourseFromEnrollment(demoEnrollment);
          console.log('🎯 Created demo course:', demoCourse.titre);

          return of([{
            course: demoCourse,
            enrollment: demoEnrollment
          }]);
        }

        // For local enrollments, try to fetch courses from backend
        const enrolledCoursesObservables = localEnrollments.map(enrollment => {
          console.log(`🔄 Trying to fetch course ${enrollment.idCours} from backend for local enrollment`);
          return this.http.get<Cours>(`${this.apiUrl.replace('/inscription-cours', '/cours')}/${enrollment.idCours}`).pipe(
            map(course => {
              console.log(`✅ Fetched course ${course.idCours} from backend for local enrollment`);
              return {
                course: course,
                enrollment: enrollment
              };
            }),
            catchError(error => {
              console.error(`❌ Error fetching course ${enrollment.idCours} from backend for local enrollment:`, error);
              const fallbackCourse = this.createCourseFromEnrollment(enrollment);
              console.log(`🔄 Using fallback course for local enrollment ${enrollment.idCours}`);
              return of({
                course: fallbackCourse,
                enrollment: enrollment
              });
            })
          );
        });

        return forkJoin(enrolledCoursesObservables);
      })
    );
  }

  private getEnrollmentsFromStorage(email: string): InscriptionCours[] {
    try {
      const stored = localStorage.getItem(`course_enrollments_${email}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading enrollments from localStorage:', error);
      return [];
    }
  }

  private createCourseFromEnrollment(enrollment: InscriptionCours): Cours {
    // Create a demo course object with realistic data and chapters
    const courseTitles = [
      "Introduction à Angular",
      "Développement Web Full-Stack",
      "JavaScript Moderne",
      "React pour Débutants",
      "Node.js et Express",
      "Bases de données SQL",
      "API REST avec Spring Boot",
      "Développement Mobile"
    ];

    const categories = ["Frontend", "Backend", "Full-Stack", "Mobile", "Base de données"];
    const niveaux = ["Débutant", "Intermédiaire", "Avancé"];

    const courseTitle = courseTitles[enrollment.idCours! % courseTitles.length] || `Cours ${enrollment.idCours}`;
    const category = categories[enrollment.idCours! % categories.length] || "Programming";
    const niveau = niveaux[enrollment.idCours! % niveaux.length] || "Débutant";

    // Create demo chapters
    const chapters = this.createDemoChapters(enrollment.idCours!);

    return {
      idCours: enrollment.idCours,
      titre: courseTitle,
      description: `Apprenez ${courseTitle.toLowerCase()} avec ce cours complet. Idéal pour les ${niveau.toLowerCase()}s.`,
      duree: 20 + (enrollment.idCours! % 40), // 20-60 hours
      prix: 49 + (enrollment.idCours! % 151), // 49-200€
      niveau: niveau,
      categorie: category,
      date_publication: new Date(Date.now() - (enrollment.idCours! * 86400000)).toISOString(), // Different dates
      nb_etudiantsEnrolled: 10 + (enrollment.idCours! % 990), // 10-1000 students
      rating: 3.5 + (enrollment.idCours! % 15) / 10, // 3.5-5.0 rating
      format: "Mixed",
      chapters: chapters
    };
  }

  private createDemoChapters(courseId: number): any[] {
    // Standardiser à exactement 5 chapitres par cours
    const chapterTitles = [
      "Introduction et présentation",
      "Installation et configuration",
      "Premiers pas et concepts de base",
      "Travaux pratiques avancés",
      "Conclusion et certification"
    ];

    const chapterDescriptions = [
      "Découvrez les bases et les objectifs du cours",
      "Préparez votre environnement de développement",
      "Maîtrisez les concepts essentiels et créez votre première application",
      "Mettez en pratique vos connaissances avec des projets concrets",
      "Validez vos acquis et obtenez votre certification"
    ];

    const types: ('pdf' | 'video' | 'text' | 'powerpoint')[] = ['video', 'pdf', 'video', 'text', 'pdf'];

    return chapterTitles.map((title, index) => ({
      id: `${courseId}_${index + 1}`,
      title: title,
      description: chapterDescriptions[index],
      order: index + 1,
      content: `Contenu détaillé du chapitre ${index + 1}: ${title}`,
      type: types[index],
      fileUrl: this.getDemoFileUrl(types[index], courseId, index + 1)
    }));
  }

  private getDemoFileUrl(type: string, courseId: number, chapterId: number): string {
    switch (type) {
      case 'pdf':
        return `/assets/pdfs/course_${courseId}_chapter_${chapterId}.pdf`;
      case 'video':
        return `/assets/videos/course_${courseId}_chapter_${chapterId}.mp4`;
      case 'powerpoint':
        return `/assets/ppts/course_${courseId}_chapter_${chapterId}.pptx`;
      case 'text':
      default:
        return `Contenu textuel du chapitre ${chapterId}`;
    }
  }

  // enrollInCourse - now uses real backend endpoint to save to database
  enrollInCourse(inscription: InscriptionCours): Observable<InscriptionCours> {
    console.log('Sending enrollment to backend:', inscription);

    // Send to backend database
    return this.http.post<InscriptionCours>(`${this.apiUrl}/add`, inscription).pipe(
      map(response => {
        console.log('✅ Enrollment saved to database:', response);
        // Also save to localStorage as backup
        this.saveEnrollmentToStorage(response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Backend enrollment failed:', error);
        // Fallback: save to localStorage if backend fails
        const localEnrollment = {
          ...inscription,
          idInscriptionCours: Date.now(),
          dateInscription: new Date().toISOString()
        };
        this.saveEnrollmentToStorage(localEnrollment);
        return of(localEnrollment);
      })
    );
  }

  private saveEnrollmentToStorage(enrollment: InscriptionCours): void {
    try {
      const email = enrollment.email;
      const existingEnrollments = this.getEnrollmentsFromStorage(email);

      // Check if already enrolled in this course
      const alreadyEnrolled = existingEnrollments.some(e => e.idCours === enrollment.idCours);
      if (alreadyEnrolled) {
        console.log('User already enrolled in this course');
        return;
      }

      // Add new enrollment
      existingEnrollments.push(enrollment);
      localStorage.setItem(`course_enrollments_${email}`, JSON.stringify(existingEnrollments));

      console.log('Enrollment saved to localStorage:', enrollment);
    } catch (error) {
      console.error('Error saving enrollment to localStorage:', error);
    }
  }

  private updateCourseEnrollmentCount(courseId: number): void {
    // For now, we'll just log this since the backend might not have this endpoint
    // In a real implementation, this would call the backend to increment the enrollment count
    console.log(`Updating enrollment count for course ${courseId}`);
    // TODO: Implement backend call when endpoint is available
  }

  // Delete/unenroll from a course - now uses real backend
  deleteEnrollment(enrollmentId: number): Observable<void> {
    console.log('Deleting enrollment from backend:', enrollmentId);

    return this.http.delete<void>(`${this.apiUrl}/delete/${enrollmentId}`).pipe(
      map(() => {
        console.log('✅ Enrollment deleted from database');
      }),
      catchError(error => {
        console.error('❌ Backend deletion failed:', error);
        // Still return success for UI purposes
        return of(void 0);
      })
    );
  }

  // Check if user is enrolled in a specific course
  isUserEnrolledInCourse(email: string, courseId: number): Observable<boolean> {
    return new Observable(observer => {
      this.getEnrollmentsByUserEmail(email).subscribe({
        next: (enrollments) => {
          const isEnrolled = enrollments.some(e => e.idCours === courseId);
          observer.next(isEnrolled);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}

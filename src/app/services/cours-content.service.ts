import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CourseModule {
  id: number;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'interactive' | 'mixed';
  content: any; // Flexible content based on type
  order: number;
  duration?: number; // in minutes
}

export interface PdfResource {
  id: number;
  title: string;
  url: string;
  fileSize?: number;
  pageCount?: number;
}

export interface VideoResource {
  id: number;
  title: string;
  url: string;
  duration?: number;
  thumbnail?: string;
  format: string;
}

export interface InteractiveUnit {
  id: number;
  title: string;
  type: 'quiz' | 'exercise' | 'simulation' | 'text';
  content: any;
  instructions?: string;
  estimatedTime?: number;
}

export interface CourseContent {
  courseId: number;
  format: 'pdf' | 'video' | 'interactive' | 'mixed';
  modules: CourseModule[];
  pdfResources?: PdfResource[];
  videoResources?: VideoResource[];
  interactiveUnits?: InteractiveUnit[];
}

@Injectable({
  providedIn: 'root'
})
export class CoursContentService {
  private apiUrl = 'http://localhost:8089/content';

  constructor(private http: HttpClient) { }

  // Get course by ID with format information
  getCourseById(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/course/${courseId}`);
  }

  // Get all modules for a course
  getModules(courseId: number): Observable<CourseModule[]> {
    return this.http.get<CourseModule[]>(`${this.apiUrl}/course/${courseId}/modules`);
  }

  // Get PDF resources for a course
  getPdfList(courseId: number): Observable<PdfResource[]> {
    return this.http.get<PdfResource[]>(`${this.apiUrl}/course/${courseId}/pdfs`);
  }

  // Get video resources for a course
  getVideoList(courseId: number): Observable<VideoResource[]> {
    return this.http.get<VideoResource[]>(`${this.apiUrl}/course/${courseId}/videos`);
  }

  // Get interactive units for a course
  getInteractiveUnits(courseId: number): Observable<InteractiveUnit[]> {
    return this.http.get<InteractiveUnit[]>(`${this.apiUrl}/course/${courseId}/interactive`);
  }

  // Get complete course content based on format
  getCourseContent(courseId: number): Observable<CourseContent> {
    return this.http.get<CourseContent>(`${this.apiUrl}/course/${courseId}/content`);
  }

  // Get specific module content
  getModuleContent(courseId: number, moduleId: number): Observable<CourseModule> {
    return this.http.get<CourseModule>(`${this.apiUrl}/course/${courseId}/module/${moduleId}`);
  }

  // Mark module as viewed (for tracking purposes)
  markModuleViewed(userId: string, courseId: number, moduleId: number): Observable<any> {
    const viewData = {
      userId,
      courseId,
      moduleId,
      viewedAt: new Date().toISOString()
    };

    return this.http.post(`${this.apiUrl}/module/view`, viewData);
  }

  // Get course structure (for navigation)
  getCourseStructure(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/course/${courseId}/structure`);
  }

  // Download PDF resource
  downloadPdf(courseId: number, pdfId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/course/${courseId}/pdf/${pdfId}/download`, {
      responseType: 'blob'
    });
  }

  // Get video streaming URL
  getVideoStreamUrl(courseId: number, videoId: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/course/${courseId}/video/${videoId}/stream`);
  }
}

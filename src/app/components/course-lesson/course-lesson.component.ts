import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoursService } from 'src/app/core/service/cours.service';
import { Cours } from 'src/app/core/models/Cours';
@Component({
  selector: 'app-course-lesson',
  templateUrl: './course-lesson.component.html',
  styleUrls: ['./course-lesson.component.scss']
})
export class CourseLessonComponent implements OnInit {
  course!: Cours;
  lesson = {
    id: 1,
    title: 'Sign up in Webflow',
    description: 'Get everything you need to build your first website. From creating your first page through to uploading your website to the internet.',
    videoUrl: 'https://example.com/video.mp4',
    duration: '15:23',
    attachments: [
      { name: 'Course materials.pdf', size: '1.2 MB' }
    ],
    notes: `In sit aliquip aute incididunt nulla, sed aliquam-magna finibus amet. Praesent eget sit in maximus agenda. Mauris eget elit in maximus agenda. Mauris eget elit in maximus agenda.

Nullam non magna finibus tellus sed finibus tellus. Donec lacus tellus, finibus tellus sed, semper lacus tellus. Donec lacus tellus, finibus tellus sed, semper lacus tellus.`
  };

  constructor(private route: ActivatedRoute, private coursService: CoursService) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const courseId = Number(params.get('id'));
      if (courseId) {
        this.loadCourse(courseId);
      }
    });
  }
  loadCourse(courseId: number): void {
    this.coursService.getCoursById(courseId).subscribe(course => {
      this.course = course;
    });
  }
  get attachments() {
    if (!this.course.fichier) return [];
    
    // Extract filename from URL
    const urlParts = this.course.fichier.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    return [{
      name: filename,
      size: 'PDF File', // You can implement actual size calculation if needed
      url: this.course.fichier
    }];
  }
  private getFileSize(url: string): string {
    // Implement actual size calculation if needed
    return 'PDF File'; // Placeholder
  }
}

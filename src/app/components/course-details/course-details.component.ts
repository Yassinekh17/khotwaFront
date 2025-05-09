import { Component , OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoursService } from 'src/app/core/service/cours.service';
import { Cours } from 'src/app/core/models/Cours';
@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit {
  course!: Cours;

  constructor(private route: ActivatedRoute, private coursService: CoursService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const courseId = Number(params.get('id'));
      if (courseId) {
        this.getCourseDetails(courseId);
      }
    });
  }

  getCourseDetails(courseId: number): void {
    this.coursService.getCoursById(courseId).subscribe((data: Cours) => {
      this.course = data;
    });
  }
}
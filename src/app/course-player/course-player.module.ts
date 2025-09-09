import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoursePlayerRoutingModule } from './course-player-routing.module';
import { CoursePlayerComponent } from './course-player.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { VideoPlayerComponent } from './video-player/video-player.component';


@NgModule({
  declarations: [
    PdfViewerComponent,
    VideoPlayerComponent
  ],
  imports: [
    CommonModule,
    CoursePlayerRoutingModule,
    CoursePlayerComponent
  ]
})
export class CoursePlayerModule { }

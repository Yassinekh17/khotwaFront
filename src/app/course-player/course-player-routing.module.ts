import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoursePlayerComponent } from './course-player.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { VideoPlayerComponent } from './video-player/video-player.component';

const routes: Routes = [
  {
    path: '',
    component: CoursePlayerComponent
  },
  {
    path: 'pdf',
    component: PdfViewerComponent
  },
  {
    path: 'video',
    component: VideoPlayerComponent
  },
  {
    path: 'interactive',
    component: PdfViewerComponent // Placeholder - will be replaced with InteractivePlayerComponent
  },
  {
    path: 'mixed',
    component: PdfViewerComponent // Placeholder - will be replaced with MixedViewerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoursePlayerRoutingModule { }

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// layouts
import { AdminComponent } from "./layouts/admin/admin.component";
import { AuthComponent } from "./layouts/auth/auth.component";

// admin views
import { DashboardComponent } from "./views/admin/dashboard/dashboard.component";
import { MapsComponent } from "./views/admin/maps/maps.component";
import { SettingsComponent } from "./views/admin/settings/settings.component";
import { TablesComponent } from "./views/admin/tables/tables.component";
import { CoursComponent  } from "./views/admin/cours/cours.component";
import { QuizzComponent } from "./views/admin/quizz/quizz.component";

// auth views
import { LoginComponent } from "./views/auth/login/login.component";
import { RegisterComponent } from "./views/auth/register/register.component";

// no layouts views
import { IndexComponent } from "./views/index/index.component";
import { LandingComponent } from "./views/landing/landing.component";
import { ProfileComponent } from "./views/profile/profile.component";
import { ListCourComponent } from "./views/courList/listCour.component";
import { ListQuizzComponent } from "./views/quizzList/listQuizz.component";
import { CourseDetailsComponent } from "./components/course-details/course-details.component";
import { CourseLessonComponent } from "./components/course-lesson/course-lesson.component";
import { QuizComponent } from "./components/quiz/quiz.component";
const routes: Routes = [
  
  // admin views
  {
    path: "admin",
    component: AdminComponent,
    children: [
      { path: "dashboard", component: DashboardComponent },
      { path: "settings", component: SettingsComponent },
      { path: "tables", component: TablesComponent },
      { path: "cours", component: CoursComponent },
      { path: "quizz", component: QuizzComponent },
      { path: "maps", component: MapsComponent },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },
 
  // auth views
  {
    path: "auth",
    component: AuthComponent,
    children: [
      { path: "login", component: LoginComponent },
      { path: "register", component: RegisterComponent },
      { path: "", redirectTo: "login", pathMatch: "full" },
    ],
  },
  // no layout views
  { path: "profile", component: ProfileComponent },
  { path: "listCour", component: ListCourComponent},
  { path: "listQuizz", component: ListQuizzComponent},
  { path: "quiz/:id", component: QuizComponent },
  { path: "landing", component: LandingComponent },
  { path: 'course/:id', component: CourseDetailsComponent },
  { path: 'course/:id/lesson', component: CourseLessonComponent },
  { path: "", component: IndexComponent },
  { path: "**", redirectTo: "", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

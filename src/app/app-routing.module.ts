import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// layouts
import { AdminComponent } from './layouts/admin/admin.component';
import { AuthComponent } from './layouts/auth/auth.component';

// admin views
import { MapsComponent } from "./views/admin/maps/maps.component";
import { SettingsComponent } from "./views/admin/settings/settings.component";
import { TablesComponent } from "./views/admin/tables/tables.component";
import { ListeventComponent } from "./views/admin/listevent/listevent.component";
import { AddeventComponent } from "./views/admin/listevent/addevent/addevent.component";
import { CoursComponent  } from "./views/admin/cours/cours.component";
import { QuizzComponent } from "./views/admin/quizz/quizz.component";



// auth views
import { LoginComponent } from './views/auth/login/login.component';
import { RegisterComponent } from './views/auth/register/register.component';


// admin views
import { DashboardComponent } from "./views/admin/dashboard/dashboard.component";



// no layouts views
import { IndexComponent } from "./views/index/index.component";
import { LandingComponent } from "./views/landing/landing.component";
import { ProfileComponent } from "./views/profile/profile.component";
import { ListeventComponent as UserListeventComponent } from "./views/event/listevent/listevent.component";
import { DetaileventComponent } from "./views/event/detailevent/detailevent.component";
import { RecommendationComponent } from "./views/event/recommendation/recommendation.component";
import { AbonnementComponent } from "./abonnement/abonnement.component";
import { AbonnementFormComponent } from "./abonnement-form/abonnement-form.component";
import { PaymentComponent } from "./payment/payment.component";
import { PredictionComponent } from "./prediction/prediction.component";

import { ListCourComponent } from "./views/courList/listCour.component";
import { ListQuizzComponent } from "./views/quizzList/listQuizz.component";
import { predictionresultComponent } from "./views/quizzList/predictionresult.component";
import { CourseDetailsComponent } from "./components/course-details/course-details.component";
import { CourseLessonComponent } from "./components/course-lesson/course-lesson.component";
import { QuizComponent } from "./components/quiz/quiz.component";
import { CardTableUpdateComponent } from './components/cards/card-table-update/card-table-update.component';
import { DashboardUserComponent } from './views/admin/dashboardUser/dashboardUser.component';
import { ForgotpwComponent } from './views/auth/forgotpw/forgotpw.component';
import { UserProfileUpdatePageComponent } from './views/user-profile-update/user-profile-update-page.component';
import { authGuard } from './auth.guard';
import { ChatComponent } from './components/chat/chat.component';
import { WebsocketTestComponent } from './components/websocket-test/websocket-test.component';
const routes: Routes = [
  // admin views
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      { path: "settings", component: SettingsComponent },
      { path: "tables", component: TablesComponent },
      { path: "listevent", component: ListeventComponent },
      { path: "listevent/add", component: AddeventComponent },
      { path: "Abonnements", component: AbonnementComponent },
      { path: "AjouterAbonnement", component: AbonnementFormComponent },
      { path: "predict", component: PredictionComponent },
      { path: "payer", component: PaymentComponent },
      { path: "maps", component: MapsComponent },
      { path: "cours", component: CoursComponent },
      { path: "quizz", component: QuizzComponent },
      { path: "chatDashboard", component: DashboardComponent },
      { path: 'dashboard', component: DashboardUserComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'user/update/:id', component: CardTableUpdateComponent },
      { path: 'maps', component: MapsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  // auth views
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgotpwd', component: ForgotpwComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // no layout views
  { path: "events", component: UserListeventComponent }, // Route pour la vue utilisateur
  { path: "events/:id", component: DetaileventComponent }, // Route pour la vue détaillée d'un événement
  { path: "recommendations", component: RecommendationComponent }, // Route pour les recommandations d'événements
  { path: "listCour", component: ListCourComponent},
  { path: "listQuizz", component: ListQuizzComponent},
  { path: "prediction", component: predictionresultComponent},
  { path: "quiz/:id", component: QuizComponent },
  { path: 'course/:id', component: CourseDetailsComponent },
  { path: 'course/:id/lesson', component: CourseLessonComponent },
   { path: "chat", component: ChatComponent },
  { path: "websocket-test", component: WebsocketTestComponent },
  { path: 'profile', component: ProfileComponent }, // original profile page
  { path: 'profile/edit', component: UserProfileUpdatePageComponent, canActivate: [authGuard] }, // new protected profile update page
  { path: 'landing', component: LandingComponent , canActivate: [authGuard]},
  { path: '', component: IndexComponent , canActivate: [authGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

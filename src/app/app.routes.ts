import { Routes } from '@angular/router';

// layouts
import { AdminComponent } from "./layouts/admin/admin.component";
import { AuthComponent } from "./layouts/auth/auth.component";
import { MainComponent } from "./layouts/main/main.component";

// admin views
import { DashboardComponent } from "./views/admin/dashboard/dashboard.component";
import { MapsComponent } from "./views/admin/maps/maps.component";
import { SettingsComponent } from "./views/admin/settings/settings.component";
import { TablesComponent } from "./views/admin/tables/tables.component";
import { ListeventComponent } from './views/admin/listevent/listevent.component';
import { AddeventComponent } from './views/admin/listevent/addevent/addevent.component';
import { ListcourseComponent } from './views/admin/listcourse/listcourse.component';
import { AddcourseComponent } from './views/admin/listcourse/addcourse/addcourse.component';
import { EditcourseComponent } from './views/admin/listcourse/editcourse/editcourse.component';
import { ManageQuizComponent } from './views/admin/manage-quiz/manage-quiz.component';

// auth views
import { LoginComponent } from "./views/auth/login/login.component";
import { RegisterComponent } from "./views/auth/register/register.component";

// no layouts views
import { IndexComponent } from "./views/index/index.component";
import { LandingComponent } from "./views/landing/landing.component";
import { ProfileComponent } from "./views/profile/profile.component";
import { ListeventComponent as UserListeventComponent } from './views/event/listevent/listevent.component';
import { DetaileventComponent } from './views/event/detailevent/detailevent.component';
import { CommentaireComponent } from './views/event/commentaire/commentaire.component';
import { RecommendationComponent } from './views/event/recommendation/recommendation.component';
import { RegistrationComponent } from './views/event/registration/registration.component';
import { MyEventsComponent } from './views/event/my-events/my-events.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { CourseViewComponent } from './views/course-view/course-view.component';
import { QuizViewComponent } from './views/quiz-view/quiz-view.component';
import { DiscoverCoursesComponent } from './views/course/discover-courses/discover-courses.component';
import { QuizClassifierComponent } from './views/course/quiz-classifier/quiz-classifier.component';
import { CourseDetailsComponent } from './views/course-details/course-details.component';
import { InscriptionComponent } from './views/inscription/inscription.component';
import { CourseEnrollmentComponent } from './views/course/course-enrollment/course-enrollment.component';
import { CoursInscritsComponent } from './views/course/cours-inscrits/cours-inscrits.component';

export const routes: Routes = [
  // admin views
  {
    path: "admin",
    component: AdminComponent,
    children: [
      { path: "dashboard", component: DashboardComponent },
      { path: "settings", component: SettingsComponent },
      { path: "tables", component: TablesComponent },
      { path: "listevent", component: ListeventComponent },
      { path: "listevent/add", component: AddeventComponent },
      { path: "listcourse", component: ListcourseComponent },
      { path: "listcourse/add", component: AddcourseComponent },
      { path: "listcourse/edit/:id", component: EditcourseComponent },
      { path: "listcourse/:id/quiz", component: ManageQuizComponent },
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
  // main layout views (with sidebar)
  {
    path: "",
    component: MainComponent,
    children: [
      { path: "profile", component: ProfileComponent },
      { path: "landing", component: LandingComponent },
      { path: "events", component: UserListeventComponent }, // Route pour la vue utilisateur
      { path: "events/:id", component: DetaileventComponent }, // Route pour la vue détaillée d'un événement
      { path: "events/:id/register", component: RegistrationComponent }, // Route pour l'inscription à un événement
      { path: "my-events", component: MyEventsComponent }, // Route pour mes événements inscrits
      { path: "recommendations", component: RecommendationComponent }, // Route pour les recommandations d'événements
      { path: "courses", component: DiscoverCoursesComponent }, // Route pour découvrir les cours
      { path: "courses/:id", component: CourseDetailsComponent }, // Route pour les détails du cours
      { path: "courses/:id/enroll", component: CourseEnrollmentComponent }, // Route pour l'inscription au cours
      { path: "courses/:id/contenu", loadChildren: () => import('./course-player/course-player.module').then(m => m.CoursePlayerModule) }, // Route pour le lecteur de contenu
      { path: "inscription/:id", component: InscriptionComponent }, // Route pour l'inscription au cours
      { path: "courses/:id/view", component: CourseViewComponent }, // Route pour la vue du cours
      { path: "courses/:id/quiz", component: QuizViewComponent }, // Route pour le quiz du cours
      { path: "quiz-classifier", component: QuizClassifierComponent }, // Route pour le classifier IA
      { path: "cours-inscrits", component: CoursInscritsComponent }, // Route pour les cours inscrits
      { path: "", component: IndexComponent }, // Page d'accueil
      { path: "**", redirectTo: "", pathMatch: "full" },
    ],
  },

];
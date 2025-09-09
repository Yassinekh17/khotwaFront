import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";  // Ajout de CommonModule

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

// layouts
import { AdminComponent } from "./layouts/admin/admin.component";
import { AuthComponent } from "./layouts/auth/auth.component";
import { MainComponent } from "./layouts/main/main.component";

// admin views
import { DashboardComponent } from "./views/admin/dashboard/dashboard.component";
import { MapsComponent } from "./views/admin/maps/maps.component";
import { SettingsComponent } from "./views/admin/settings/settings.component";
import { TablesComponent } from "./views/admin/tables/tables.component";

// auth views
import { LoginComponent } from "./views/auth/login/login.component";
import { RegisterComponent } from "./views/auth/register/register.component";

// no layouts views
import { IndexComponent } from "./views/index/index.component";
import { LandingComponent } from "./views/landing/landing.component";
import { ProfileComponent } from "./views/profile/profile.component";

// components for views and layouts

import { AdminNavbarComponent } from "./components/navbars/admin-navbar/admin-navbar.component";
import { AuthNavbarComponent } from "./components/navbars/auth-navbar/auth-navbar.component";
import { CardBarChartComponent } from "./components/cards/card-bar-chart/card-bar-chart.component";
import { CardLineChartComponent } from "./components/cards/card-line-chart/card-line-chart.component";
import { CardPageVisitsComponent } from "./components/cards/card-page-visits/card-page-visits.component";
import { CardProfileComponent } from "./components/cards/card-profile/card-profile.component";
import { CardSettingsComponent } from "./components/cards/card-settings/card-settings.component";
import { CardSocialTrafficComponent } from "./components/cards/card-social-traffic/card-social-traffic.component";
import { CardStatsComponent } from "./components/cards/card-stats/card-stats.component";
import { CardTableComponent } from "./components/cards/card-table/card-table.component";
import { FooterAdminComponent } from "./components/footers/footer-admin/footer-admin.component";
import { FooterComponent } from "./components/footers/footer/footer.component";
import { FooterSmallComponent } from "./components/footers/footer-small/footer-small.component";
import { HeaderStatsComponent } from "./components/headers/header-stats/header-stats.component";
import { IndexNavbarComponent } from "./components/navbars/index-navbar/index-navbar.component";
import { MapExampleComponent } from "./components/maps/map-example/map-example.component";
import { IndexDropdownComponent } from "./components/dropdowns/index-dropdown/index-dropdown.component";
import { TableDropdownComponent } from "./components/dropdowns/table-dropdown/table-dropdown.component";
import { PagesDropdownComponent } from "./components/dropdowns/pages-dropdown/pages-dropdown.component";
import { NotificationDropdownComponent } from "./components/dropdowns/notification-dropdown/notification-dropdown.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { UserDropdownComponent } from "./components/dropdowns/user-dropdown/user-dropdown.component";
import { ListeventComponent } from './views/admin/listevent/listevent.component';
import { AddeventComponent } from './views/admin/listevent/addevent/addevent.component';
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
import { ListcourseComponent } from './views/admin/listcourse/listcourse.component';
import { AddcourseComponent } from './views/admin/listcourse/addcourse/addcourse.component';
import { ManageQuizComponent } from './views/admin/manage-quiz/manage-quiz.component';
import { QuizClassifierComponent } from './views/course/quiz-classifier/quiz-classifier.component';
import { CourseDetailsComponent } from './views/course-details/course-details.component';
import { InscriptionComponent } from './views/inscription/inscription.component';
import { CourseEnrollmentComponent } from './views/course/course-enrollment/course-enrollment.component';
import { EditcourseComponent } from './views/admin/listcourse/editcourse/editcourse.component';
import { CoursInscritsComponent } from './views/course/cours-inscrits/cours-inscrits.component';


@NgModule({
  declarations: [
    DashboardComponent,
    CardBarChartComponent,
    CardLineChartComponent,
    IndexDropdownComponent,
    PagesDropdownComponent,
    TableDropdownComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    SidebarComponent,
    FooterComponent,
    FooterSmallComponent,
    FooterAdminComponent,
    CardPageVisitsComponent,
    CardProfileComponent,
    CardSettingsComponent,
    CardSocialTrafficComponent,
    CardStatsComponent,
    CardTableComponent,
    HeaderStatsComponent,
    MapExampleComponent,
    AuthNavbarComponent,
    AdminNavbarComponent,
    IndexNavbarComponent,
    AdminComponent,
    AuthComponent,
    MainComponent,
    MapsComponent,
    SettingsComponent,
    TablesComponent,
    LoginComponent,
    RegisterComponent,
    IndexComponent,
    LandingComponent,
    ProfileComponent,
    ListeventComponent,
    AddeventComponent,
    UserListeventComponent,
    DetaileventComponent,
    CommentaireComponent,
    RecommendationComponent,
    RegistrationComponent,
    MyEventsComponent,
    ThemeToggleComponent,
    ChatbotComponent,
    QuizViewComponent,
    DiscoverCoursesComponent,
    ListcourseComponent,
    AddcourseComponent,
    ManageQuizComponent,
    QuizClassifierComponent,
    CourseDetailsComponent,
    InscriptionComponent,
    CourseEnrollmentComponent,
    EditcourseComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule  // Ajout de CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

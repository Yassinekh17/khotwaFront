import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { NgxStripeModule } from 'ngx-stripe';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

// layouts
import { AdminComponent } from './layouts/admin/admin.component';
import { AuthComponent } from './layouts/auth/auth.component';

import { MapsComponent } from './views/admin/maps/maps.component';
import { SettingsComponent } from './views/admin/settings/settings.component';
import { TablesComponent } from './views/admin/tables/tables.component';
import { CoursComponent } from "./views/admin/cours/cours.component";
import { QuizzComponent } from "./views/admin/quizz/quizz.component";
import { DashboardComponent } from "./views/admin/dashboard/dashboard.component";

// auth views
import { LoginComponent } from './views/auth/login/login.component';
import { RegisterComponent } from './views/auth/register/register.component';

// no layouts views
import { IndexComponent } from "./views/index/index.component";
import { LandingComponent } from "./views/landing/landing.component";
import { ProfileComponent } from "./views/profile/profile.component";
import { ListCourComponent } from "./views/courList/listCour.component";
import { ListQuizzComponent } from "./views/quizzList/listQuizz.component";
import { predictionresultComponent } from "./views/quizzList/predictionresult.component";
// components for views and layouts

import { CardCourComponent } from "./components/cards/card-cour/card-cour.component";
import { CardquizzComponent } from "./components/cards/card-quizz/card-quizz.component";
import { CourTableDropdownComponent } from "./components/dropdowns/cour-table-dropdown/cour-table-dropdown.component";
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardTableUpdateComponent } from './components/cards/card-table-update/card-table-update.component';
import { AuthInterceptor } from './core/service/auth-interceptor.service';
import { DashboardUserComponent } from './views/admin/dashboardUser/dashboardUser.component';
import { ForgotpwComponent } from './views/auth/forgotpw/forgotpw.component';
import { CardRoleChartComponent } from './components/cards/card-role-chart/card-role-chart.component';
import { RecaptchaModule } from 'ng-recaptcha';
import { RatingpopupComponent } from './components/ratingpopup/ratingpopup.component';
import { UserProfileUpdateComponent } from './components/user-profile-update/user-profile-update.component';
import { UserProfileUpdatePageComponent } from './views/user-profile-update/user-profile-update-page.component';
import { UserProfileNavbarComponent } from './views/user-profile-update/user-profile-navbar.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { CourseDetailsComponent } from "./components/course-details/course-details.component";
import { CourseLessonComponent } from "./components/course-lesson/course-lesson.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationComponent } from "./components/notification/notification.component";
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatBotComponent } from './chat-bot/chat-bot.component';
import { CourseStatsComponent } from './course-stats/course-stats.component';
import { NgChartsModule } from 'ng2-charts';
import { QuizComponent } from "./components/quiz/quiz.component";
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
import { AbonnementComponent } from './abonnement/abonnement.component';
import { AbonnementFormComponent } from './abonnement-form/abonnement-form.component';
import { PaymentComponent } from './payment/payment.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { PredictionComponent } from './prediction/prediction.component';
import { PredictionService } from "./services/PredictionService";



import { ListeventComponent } from './views/admin/listevent/listevent.component';
import { AddeventComponent } from './views/admin/listevent/addevent/addevent.component';
import { ListeventComponent as UserListeventComponent } from './views/event/listevent/listevent.component';
import { DetaileventComponent } from './views/event/detailevent/detailevent.component';
import { CommentaireComponent } from './views/event/commentaire/commentaire.component';
import { RecommendationComponent } from './views/event/recommendation/recommendation.component'; // Ajout du composant utilisateur
import { ChatComponent } from './components/chat/chat.component';
import { SummaryComponent } from './summary/summary.component';
import { ChatService } from "./services/chat.service";
import { CardBarChartMessageComponent } from "./components/cards/card-bar-chart-Message/card-bar-chart.component";
import { CardMessageStatsComponent } from "./components/cards/card-message-stats/card-message-stats.component";
import { WebSocketService } from "./services/web-socket.service";
import { MockChatService } from "./services/mock-chat.service";
import { MockWebsocketService } from "./services/mock-websocket.service";
import { WebsocketTestComponent } from './components/websocket-test/websocket-test.component';
import { UserSubscriptionComponent } from './user-subscription/user-subscription.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardUserComponent,
    DashboardComponent,
    CardBarChartMessageComponent,
    CardMessageStatsComponent,
    CardLineChartComponent,
    IndexDropdownComponent,
    PagesDropdownComponent,
    TableDropdownComponent,
    CourTableDropdownComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    SidebarComponent,
    FooterComponent,
    FooterSmallComponent,
    FooterAdminComponent,
    CardPageVisitsComponent,
    CardProfileComponent,
    CardSettingsComponent,
    CardRoleChartComponent,
    CardSocialTrafficComponent,
    CardStatsComponent,
    CardTableComponent,
    CardCourComponent,
    CardquizzComponent,
    ListCourComponent,
    ListQuizzComponent,
    CourseDetailsComponent,
    CourseLessonComponent,
    NotificationComponent,
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
    MapsComponent,
    SettingsComponent,
    TablesComponent,
    LoginComponent,
    RegisterComponent,
    IndexComponent,
    LandingComponent,
    ChatBotComponent,
    ProfileComponent,
    CoursComponent,
    QuizzComponent,

    CourseStatsComponent,
  predictionresultComponent,

    CardTableUpdateComponent,
    ForgotpwComponent,
    RatingpopupComponent,
    UserProfileUpdateComponent,
    UserProfileUpdatePageComponent,
    UserProfileNavbarComponent,
    ThemeToggleComponent,
    ListeventComponent,
    AddeventComponent,
    UserListeventComponent,
    DetaileventComponent,
    CommentaireComponent,
    RecommendationComponent,  // Ajout du composant utilisateur

    AbonnementComponent,
    AbonnementFormComponent,
    PaymentComponent,
    ChatbotComponent,
    PredictionComponent,
     ProfileComponent,
    ChatComponent,
    SummaryComponent,
    WebsocketTestComponent,
    UserSubscriptionComponent,
  ],
  imports: [BrowserModule, AppRoutingModule,HttpClientModule,FormsModule, BrowserAnimationsModule,MatIconModule,ReactiveFormsModule,CommonModule,RecaptchaModule,
    MatSnackBarModule,NgChartsModule,QuizComponent,ToastrModule.forRoot()],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true, // Allow multiple interceptors
    },
    PredictionService,
    ChatService,
    WebSocketService
  ],  bootstrap: [AppComponent],
})
export class AppModule {}

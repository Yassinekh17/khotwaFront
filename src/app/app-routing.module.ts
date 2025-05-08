import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// layouts
import { AdminComponent } from './layouts/admin/admin.component';
import { AuthComponent } from './layouts/auth/auth.component';

// admin views

import { MapsComponent } from './views/admin/maps/maps.component';
import { SettingsComponent } from './views/admin/settings/settings.component';
import { TablesComponent } from './views/admin/tables/tables.component';

// auth views
import { LoginComponent } from './views/auth/login/login.component';
import { RegisterComponent } from './views/auth/register/register.component';

// no layouts views
import { IndexComponent } from './views/index/index.component';
import { LandingComponent } from './views/landing/landing.component';
import { ProfileComponent } from './views/profile/profile.component';
import { CardTableUpdateComponent } from './components/cards/card-table-update/card-table-update.component';
import { DashboardUserComponent } from './views/admin/dashboardUser/dashboardUser.component';
import { ForgotpwComponent } from './views/auth/forgotpw/forgotpw.component';
import { UserProfileUpdatePageComponent } from './views/user-profile-update/user-profile-update-page.component';
import { authGuard } from './auth.guard';
const routes: Routes = [
  // admin views (protected)
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardUserComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'user/update/:id', component: CardTableUpdateComponent },
      { path: 'maps', component: MapsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // auth views (public)
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
export class AppRoutingModule {}

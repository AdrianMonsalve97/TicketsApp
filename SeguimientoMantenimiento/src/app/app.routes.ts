import { Routes } from '@angular/router';
import { UserManagementComponent } from './features/user-management/user-management';
import { UserProfile } from './features/user-profile/user-profile';
import { Login } from './features/login/login';
import { ChangePasswordComponent } from './features/change-password/change-password';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuard] },
  { path: 'profile', component: UserProfile, canActivate: [authGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
  { path: 'login', component: Login },
];

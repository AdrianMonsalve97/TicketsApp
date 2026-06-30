import { Routes } from '@angular/router';
import { UserManagementComponent } from './features/user-management/user-management';
import { UserProfile } from './features/user-profile/user-profile';
import { Login } from './features/login/login';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  { path: 'users', component: UserManagementComponent },
  { path: 'profile', component: UserProfile },
  { path: 'login', component: Login },
];

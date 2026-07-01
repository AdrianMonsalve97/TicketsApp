import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthMockService } from '../services/auth-mock';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthMockService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  // Redirigir a login si no hay sesión
  router.navigate(['/login']);
  return false;
};

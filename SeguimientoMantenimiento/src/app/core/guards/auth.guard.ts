import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  if (currentUser) {
    if (currentUser.debeCambiarContrasena && !state.url.startsWith('/change-password')) {
      router.navigate(['/change-password']);
      return false;
    }

    return true;
  }

  // Redirigir a login si no hay sesión
  router.navigate(['/login']);
  return false;
};

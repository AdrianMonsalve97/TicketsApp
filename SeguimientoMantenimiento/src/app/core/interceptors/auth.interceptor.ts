import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthMockService } from '../services/auth-mock';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthMockService);
  const currentRole = authService.getCurrentRole();

  // En el mock inicial usamos Hamilton como ID de prueba
  const userId = 'DEV-Hamilton'; 

  if (userId && currentRole) {
    const clonedRequest = req.clone({
      setHeaders: {
        'X-User-Id': userId,
        'X-User-Role': currentRole,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};

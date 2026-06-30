import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Ruta corregida

@Injectable()
export class AuthInterceptorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();

    let clonedRequest = request;

    if (userId && userRole) {
      clonedRequest = request.clone({
        setHeaders: {
          'X-User-Id': userId,
          'X-User-Role': userRole,
        },
      });
    }

    return next.handle(clonedRequest);
  }
}

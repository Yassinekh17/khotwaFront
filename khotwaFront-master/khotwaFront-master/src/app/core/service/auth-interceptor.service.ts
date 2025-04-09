import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: UserService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token = localStorage.getItem('access_token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized (Token Expired)
          return this.authService.refreshToken().pipe(
            switchMap((newTokens: any) => {
              // Save the new tokens
              localStorage.setItem('access_token', newTokens.access_token);
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newTokens.access_token}`,
                },
              });
              return next.handle(req);
            })
          );
        }
        return throwError(error);
      })
    );
  }
}

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip token for authentication endpoints
    if (req.url.includes('/openid-connect/token')) {
      return next.handle(req);
    }

    // Check if token is about to expire and refresh it proactively
    if (this.tokenService.willTokenExpireSoon() && !this.isRefreshing) {
      this.tokenService.refreshTokenIfNeeded();
    }

    // Get token from token service
    let token = this.tokenService.getAccessToken();

    // If token exists, add it to the request
    if (token) {
      req = this.addTokenToRequest(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired
          return this.handle401Error(req, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.tokenService.refreshToken().pipe(
        switchMap((tokens: any) => {
          this.isRefreshing = false;

          // Token service already stores the tokens
          this.refreshTokenSubject.next(tokens.access_token);

          // Retry the failed request with the new token
          return next.handle(this.addTokenToRequest(request, tokens.access_token));
        }),
        catchError((err) => {
          this.isRefreshing = false;

          // If refresh token fails, log the user out
          console.error('Token refresh failed:', err);
          this.authService.logout();

          return throwError(() => new Error('Session expired. Please login again.'));
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Wait for the token to be refreshed
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }
  }
}

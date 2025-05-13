import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private refreshTokenInProgress = false;
  private tokenRefreshSubject = new BehaviorSubject<boolean>(false);
  
  // Keycloak token endpoint
  private tokenUrl = 'http://localhost:8081/realms/Khotwa/protocol/openid-connect/token';
  private clientId = 'khotwa-rest-api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize token refresh timer when service is created
    this.initTokenRefreshTimer();
  }

  /**
   * Get the access token from storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get the refresh token from storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Save tokens to localStorage
   */
  saveTokens(tokens: any): void {
    if (tokens.access_token) {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('token', tokens.access_token); // For backward compatibility
    }
    
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    
    if (tokens.expires_in) {
      const expiresAt = new Date().getTime() + (tokens.expires_in * 1000);
      localStorage.setItem('token_expires_at', expiresAt.toString());
      
      // Set up timer for token refresh
      this.setupTokenRefreshTimer(tokens.expires_in);
    }
  }

  /**
   * Clear all tokens from storage
   */
  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
  }

  /**
   * Check if the access token is expired
   */
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    return new Date().getTime() > parseInt(expiresAt, 10);
  }

  /**
   * Check if token will expire soon (within the next minute)
   */
  willTokenExpireSoon(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    // Check if token will expire in the next minute
    const expirationTime = parseInt(expiresAt, 10);
    const now = new Date().getTime();
    const oneMinuteFromNow = now + (60 * 1000);
    
    return expirationTime < oneMinuteFromNow;
  }

  /**
   * Refresh the access token using the refresh token
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', this.clientId)
      .set('refresh_token', refreshToken);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    
    return this.http.post<any>(this.tokenUrl, body.toString(), { headers })
      .pipe(
        tap(tokens => {
          this.saveTokens(tokens);
          this.tokenRefreshSubject.next(true);
        }),
        catchError(error => {
          this.clearTokens();
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
  }

  /**
   * Set up a timer to refresh the token before it expires
   */
  private setupTokenRefreshTimer(expiresInSeconds: number): void {
    // Refresh the token 1 minute before it expires
    const refreshTime = (expiresInSeconds - 60) * 1000;
    
    // Only set up timer if token expires in more than 1 minute
    if (refreshTime > 0) {
      setTimeout(() => {
        this.refreshTokenIfNeeded();
      }, refreshTime);
    }
  }

  /**
   * Initialize token refresh timer on service startup
   */
  private initTokenRefreshTimer(): void {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return;
    
    const expirationTime = parseInt(expiresAt, 10);
    const now = new Date().getTime();
    const timeUntilExpiry = expirationTime - now;
    
    // If token expires in more than 1 minute, set up refresh timer
    if (timeUntilExpiry > 60000) {
      const refreshTime = timeUntilExpiry - 60000; // 1 minute before expiry
      setTimeout(() => {
        this.refreshTokenIfNeeded();
      }, refreshTime);
    } 
    // If token expires in less than 1 minute but is still valid, refresh now
    else if (timeUntilExpiry > 0) {
      this.refreshTokenIfNeeded();
    }
  }

  /**
   * Refresh token if it's needed and not already in progress
   */
  refreshTokenIfNeeded(): void {
    if (this.refreshTokenInProgress) return;
    
    if (this.willTokenExpireSoon() && this.getRefreshToken()) {
      this.refreshTokenInProgress = true;
      
      this.refreshToken().subscribe({
        next: () => {
          this.refreshTokenInProgress = false;
          console.log('Token refreshed successfully');
        },
        error: (error) => {
          this.refreshTokenInProgress = false;
          console.error('Failed to refresh token:', error);
        }
      });
    }
  }

  /**
   * Decode JWT token to get payload
   */
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      return null;
    }
  }
}

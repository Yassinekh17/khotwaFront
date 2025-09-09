import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>('auto');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private appliedThemeSubject = new BehaviorSubject<string>('light');
  public appliedTheme$ = this.appliedThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check for saved theme preference or default to 'auto'
    const savedTheme = localStorage.getItem('theme') as Theme || 'auto';
    this.setTheme(savedTheme);
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.appliedThemeSubject.next(prefersDark ? 'dark' : 'light');
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentThemeSubject.value === 'auto') {
          this.appliedThemeSubject.next(e.matches ? 'dark' : 'light');
          root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    } else {
      this.appliedThemeSubject.next(theme);
      root.setAttribute('data-theme', theme);
    }
  }

  toggleTheme(): void {
    const current = this.currentThemeSubject.value;
    if (current === 'light') {
      this.setTheme('dark');
    } else if (current === 'dark') {
      this.setTheme('auto');
    } else {
      this.setTheme('light');
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  getAppliedTheme(): string {
    return this.appliedThemeSubject.value;
  }

  isDarkMode(): boolean {
    return this.appliedThemeSubject.value === 'dark';
  }
}

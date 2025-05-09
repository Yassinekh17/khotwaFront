import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeMode>('light');
  public theme$ = this.themeSubject.asObservable();
  
  constructor() {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  /**
   * Get the current theme
   */
  public getCurrentTheme(): ThemeMode {
    return this.themeSubject.getValue();
  }

  /**
   * Set the theme
   * @param theme The theme to set
   */
  public setTheme(theme: ThemeMode): void {
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Update the subject
    this.themeSubject.next(theme);
    
    // Apply theme to document body
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  /**
   * Toggle between light and dark themes
   */
  public toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}

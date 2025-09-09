import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Evenement } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<number[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  private readonly STORAGE_KEY = 'user_favorites';

  constructor() {
    this.loadFavoritesFromStorage();
  }

  private loadFavoritesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored);
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      this.favoritesSubject.next([]);
    }
  }

  private saveFavoritesToStorage(favorites: number[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

  addToFavorites(eventId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    if (!currentFavorites.includes(eventId)) {
      const newFavorites = [...currentFavorites, eventId];
      this.favoritesSubject.next(newFavorites);
      this.saveFavoritesToStorage(newFavorites);
    }
  }

  removeFromFavorites(eventId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    const newFavorites = currentFavorites.filter(id => id !== eventId);
    this.favoritesSubject.next(newFavorites);
    this.saveFavoritesToStorage(newFavorites);
  }

  toggleFavorite(eventId: number): void {
    if (this.isFavorite(eventId)) {
      this.removeFromFavorites(eventId);
    } else {
      this.addToFavorites(eventId);
    }
  }

  isFavorite(eventId: number): boolean {
    return this.favoritesSubject.value.includes(eventId);
  }

  getFavorites(): number[] {
    return this.favoritesSubject.value;
  }

  getFavoritesCount(): number {
    return this.favoritesSubject.value.length;
  }

  clearAllFavorites(): void {
    this.favoritesSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

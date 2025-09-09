import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // in milliseconds
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private notificationId = 0;

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  // Show success notification
  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  // Show error notification
  showError(title: string, message: string, duration: number = 7000): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration
    });
  }

  // Show info notification
  showInfo(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  // Show warning notification
  showWarning(title: string, message: string, duration: number = 6000): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  // Add custom notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${++this.notificationId}`,
      timestamp: new Date()
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, newNotification]);

    // Auto remove after duration
    if (newNotification.duration) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  }

  // Remove notification
  removeNotification(id: string): void {
    const currentNotifications = this.notifications.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications.next(filteredNotifications);
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications.next([]);
  }

  // Course enrollment notifications
  notifyCourseEnrollment(courseTitle: string, success: boolean = true): void {
    if (success) {
      this.showSuccess(
        'Inscription réussie !',
        `Vous êtes maintenant inscrit au cours "${courseTitle}". Vous pouvez commencer votre apprentissage dès maintenant.`,
        6000
      );
    } else {
      this.showError(
        'Erreur d\'inscription',
        `Impossible de s\'inscrire au cours "${courseTitle}". Veuillez réessayer.`,
        8000
      );
    }
  }

  // Event registration notifications
  notifyEventRegistration(eventTitle: string, success: boolean = true): void {
    if (success) {
      this.showSuccess(
        'Inscription à l\'événement réussie !',
        `Vous êtes maintenant inscrit à l'événement "${eventTitle}". Vous recevrez un rappel avant le début.`,
        6000
      );
    } else {
      this.showError(
        'Erreur d\'inscription',
        `Impossible de s\'inscrire à l'événement "${eventTitle}". Veuillez réessayer.`,
        8000
      );
    }
  }

  // Quiz completion notifications
  notifyQuizCompleted(courseTitle: string, score: number, passed: boolean): void {
    if (passed) {
      this.showSuccess(
        'Quiz réussi ! 🎉',
        `Félicitations ! Vous avez obtenu ${score}% au quiz du cours "${courseTitle}". Votre certificat est disponible.`,
        8000
      );
    } else {
      this.showWarning(
        'Quiz non réussi',
        `Vous avez obtenu ${score}% au quiz du cours "${courseTitle}". Vous pouvez le repasser pour améliorer votre score.`,
        8000
      );
    }
  }

  // Course completion notifications
  notifyCourseCompleted(courseTitle: string): void {
    this.showSuccess(
      'Cours terminé ! 🎓',
      `Félicitations ! Vous avez terminé le cours "${courseTitle}". Le quiz de validation est maintenant disponible.`,
      10000
    );
  }
}
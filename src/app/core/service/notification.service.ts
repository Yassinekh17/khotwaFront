import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationComponent } from '../../components/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string) {
    this.snackBar.openFromComponent(NotificationComponent, {
      duration: 30000, // 30 seconds
      panelClass: ['top-notification'],
      verticalPosition: 'top',
      horizontalPosition: 'center',
      data: { 
        message: message,
        type: 'success'
      }
    });
  }
}
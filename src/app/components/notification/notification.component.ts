// src/app/core/components/notification/notification.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  duration = 30000;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  dismiss() {
    this.data.preClose();
  }
}
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from 'src/app/core/service/analytics.service';

@Component({
  selector: 'app-dashboardUser',
  templateUrl: './dashboardUser.component.html',
})
export class DashboardUserComponent implements OnInit {
  startDate: string = '2025-04-01T00:00:00';
  endDate: string = '2025-04-06T23:59:59';
  actionCount: number = 0;
  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    console.log(localStorage.getItem('token'));
  }

  fetchActionsBetween(): void {
    this.analyticsService.getActionsBetween(this.startDate, this.endDate).subscribe({
      next: count => this.actionCount = count,
      error: err => console.error('Error fetching action count:', err)
    });
  }
}

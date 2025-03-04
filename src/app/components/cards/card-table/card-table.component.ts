import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/core/models/User';
import { UserActivityService } from 'src/app/core/service/user-activity.service';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-card-table',
  templateUrl: './card-table.component.html',
})
export class CardTableComponent implements OnInit {
  users: User[] = [];
  @Input()
  get color(): string {
    return this._color;
  }
  set color(color: string) {
    this._color = color !== 'light' && color !== 'dark' ? 'light' : color;
  }
  private _color = 'light';

  constructor(
    private service: UserService,
    private userActivityService: UserActivityService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }
  deleteUser(id: number) {
    this.service.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
      },
    });
  }
  loadUsers() {
    this.service.getUserList().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Users Loaded:', this.users);

        // Predict satisfaction for each user
        this.users.forEach((user: any) => {
          this.predictSatisfaction(user.email);
        });
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  predictSatisfaction(email: string) {
    this.userActivityService.predictSatisfaction(email).subscribe({
      next: (response) => {
        console.log(`Satisfaction Prediction for ${email}:`, response);
        // You can store the result inside the user object if needed
        this.users = this.users.map((user: any) =>
          user.email === email
            ? { ...user, satisfactionPrediction: response }
            : user
        );
      },
      error: (error) => {
        console.error(`Error predicting satisfaction for ${email}:`, error);
      },
    });
  }
}

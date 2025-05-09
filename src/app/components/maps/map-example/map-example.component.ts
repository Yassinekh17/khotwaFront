import { Component, OnInit } from "@angular/core";
import { UserService } from 'src/app/core/service/user.service';
import { Useryass } from 'src/app/core/models/User';

declare const google: any;

@Component({
  selector: "app-map-example",
  templateUrl: "./map-example.component.html",
  styleUrls: ['./map-example.component.css'],
})
export class MapExampleComponent implements OnInit {
  users: Useryass[] = [];
  selectedUser: Useryass | null = null;
  loading = false;
  predictionResult: string | null = null;
  predictionColor = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(users => this.users = users);
  }

  predict(user: Useryass) {
    this.selectedUser = user;
    this.predictionResult = null;
    this.loading = true;

    this.userService.predictUserOutcome(user).subscribe({
      next: (res) => {
        this.loading = false;
        this.predictionResult = res.prediction === 1 ? 'Success' : 'Failure';
        this.predictionColor = res.prediction === 1 ? 'green' : 'red';
      },
      error: () => {
        this.loading = false;
        this.predictionResult = 'Error during prediction';
        this.predictionColor = 'red';
      }
    });
  }

  closeModal() {
    this.selectedUser = null;
    this.predictionResult = null;
  }
}

import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/service/user.service';
import { Useryass } from 'src/app/core/models/Useryass';
import { Router } from '@angular/router';

@Component({
  selector: 'predictionresult',
  templateUrl: './predictionresult.component.html',
  styleUrls: ['./predictionresult.component.css'],
})
export class predictionresultComponent implements OnInit {
  showResultPopup = false;
  isLoading = false;
  predictionResult: number | null = null;

  // Features bound to form inputs
  features: Useryass = {
    id_user: 0,
    courseCompletion: 0,
    sessionDuration: 0,
    sessionsPerWeek: 0,
    userSatisfaction: 0,
    nom: '',
    prenom: '',
  };

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {}

  submitPrediction() {
    this.isLoading = true;
    this.showResultPopup = true;

    this.userService.predictUserOutcome(this.features).subscribe({
      next: (response) => {
        this.predictionResult = response.prediction;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Prediction failed', err);
        this.isLoading = false;
        this.predictionResult = null;
      }
    });
  }

  closeResultPopup() {
    this.showResultPopup = false;
    this.predictionResult = null;
  }
  goBack() {
    this.router.navigate(['/listQuizz']);
  }
}

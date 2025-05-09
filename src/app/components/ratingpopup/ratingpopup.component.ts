import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-ratingpopup',
  templateUrl: './ratingpopup.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class RatingpopupComponent implements OnInit {
  showPopup: boolean = false;
  showThankYouPopup: boolean = false;
  userRating: number = 5; // default value
  userEmail: string;

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Show popup after a delay
    setTimeout(() => {
      this.showPopup = true;
    }, 2000);
  }

  closePopup() {
    this.showPopup = false;
    this.showThankYouPopup = false;
  }

  closeThankYouPopup() {
    this.showThankYouPopup = false;
  }

  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  submitRating() {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = this.decodeToken(token);

      if (decodedToken) {
        this.userEmail = decodedToken.email;

        if (this.userEmail && this.userRating >= 1 && this.userRating <= 10) {
          this.userService.updateRating(this.userEmail, this.userRating).subscribe({
            next: () => {
              // Show thank you popup instead of alert
              this.showPopup = false;
              this.showThankYouPopup = true;

              // Auto-close thank you popup after 5 seconds
              setTimeout(() => {
                this.closeThankYouPopup();
              }, 5000);
            },
            error: (err) => {
              console.error('Failed to submit rating:', err);
              alert('Failed to submit rating. Please try again.');
            }
          });
        } else {
          alert('Please provide a valid rating between 1 and 10.');
        }
      }
    }
  }

  // Legacy method kept for compatibility
  showThankYouMessage() {
    this.showPopup = false;
    this.showThankYouPopup = true;
  }
}



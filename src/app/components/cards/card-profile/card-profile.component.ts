import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/service/user.service';
import { User } from 'src/app/core/models/User';
import { QuoteService } from 'src/app/core/service/quote-service.service';


@Component({
  selector: 'app-card-profile',
  templateUrl: './card-profile.component.html',
})
export class CardProfileComponent implements OnInit {
  userEmail: string | null = null;
  userData: User;
  quoteText: string = '';
  quoteAuthor: string = '';

  constructor(
    private userService: UserService,
    private quoteService: QuoteService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = this.decodeToken(token);

      if (decodedToken) {
        this.userEmail = decodedToken.email;
        this.userService.getUserByEmail(this.userEmail).subscribe({
          next: (res) => this.userData = res,
          error: (err) => console.error('Error fetching user by email:', err),
        });
      }
    }

    // Fetch Quote of the Day
    this.quoteService.getQuoteOfTheDay().subscribe({
      next: (res) => {
        this.quoteText = res[0].q;
        this.quoteAuthor = res[0].a;
      },
      error: (err) => console.error('Error fetching quote:', err),
    });
  }

  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

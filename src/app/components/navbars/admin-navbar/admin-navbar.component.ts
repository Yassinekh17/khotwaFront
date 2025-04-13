import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
})
export class AdminNavbarComponent implements OnInit {
  userEmail: string | null = null;
  constructor() {}

  ngOnInit(): void {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Decode the token and extract the email
      const decodedToken = this.decodeToken(token);

      if (decodedToken) {
        this.userEmail = decodedToken.email;// Extract the email from the decoded token
        console.log('User email:', this.userEmail); // You can use the email here
      } else {
        console.error('Failed to decode token');
      }
    } else {
      console.error('No token found in localStorage');
    }
  }

  // Decode JWT token
  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1]; // Get the payload part (second part of the JWT)
      return JSON.parse(atob(payload)); // Decode and parse the payload
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

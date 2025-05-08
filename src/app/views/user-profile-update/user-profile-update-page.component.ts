import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-user-profile-update-page',
  templateUrl: './user-profile-update-page.component.html',
})
export class UserProfileUpdatePageComponent implements OnInit {
  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page if not logged in
      this.router.navigate(['/auth/login']);
    }
  }
}

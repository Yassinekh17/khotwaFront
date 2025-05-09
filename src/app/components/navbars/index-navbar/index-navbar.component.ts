import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/core/service/user.service";

@Component({
  selector: "app-index-navbar",
  templateUrl: "./index-navbar.component.html",
})
export class IndexNavbarComponent implements OnInit {
  navbarOpen = false;
  userEmail: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.userEmail = decoded.email || decoded.sub || null;
      }
    }
  }
  setNavbarOpen() {
    this.navbarOpen = !this.navbarOpen;
  }
  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Logs out the user by removing the token from localStorage
   * and redirects to the login page
   */
  logout(): void {
    this.userService.logout();
  }
}

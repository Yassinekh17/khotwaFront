import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { createPopper } from '@popperjs/core';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
})
export class UserDropdownComponent implements OnInit, AfterViewInit {
  dropdownPopoverShow = false;
  userImage:  string | null = null;; // fallback

  @ViewChild('btnDropdownRef', { static: false }) btnDropdownRef: ElementRef;
  @ViewChild('popoverDropdownRef', { static: false }) popoverDropdownRef: ElementRef;

  constructor(private authService: UserService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      const email = decoded?.email;
      if (email) {
        this.authService.getUserByEmail(email).subscribe({
          next: (user) => {
            this.userImage = user.image;// change field as needed
          },
          error: (err) => {
            console.error('Failed to fetch user:', err);
          },
        });
      }
    }
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  ngAfterViewInit() {
    createPopper(
      this.btnDropdownRef.nativeElement,
      this.popoverDropdownRef.nativeElement,
      { placement: 'bottom-start' }
    );
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    this.dropdownPopoverShow = !this.dropdownPopoverShow;
  }

  logout() {
    this.authService.logout();
  }
}

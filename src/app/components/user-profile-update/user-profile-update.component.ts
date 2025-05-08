import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-user-profile-update',
  templateUrl: './user-profile-update.component.html',
})
export class UserProfileUpdateComponent implements OnInit {
  userId: string = '';
  nom: string = '';
  prenom: string = '';
  email: string = '';
  password: string = '';
  role: string = '';
  age: string = '';
  gender: string = '';
  country: string = '';
  image: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  updateSuccess: boolean = false;
  updateError: boolean = false;
  errorMessage: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      this.email = decoded?.email;

      if (this.email) {
        this.userService.getUserByEmail(this.email).subscribe({
          next: (user) => {
            this.userId = user.id_user;
            this.nom = user.nom || '';
            this.prenom = user.prenom || '';
            this.email = user.email || '';
            this.role = user.role || '';
            this.age = user.age || '';
            this.gender = user.gender || '';
            this.country = user.country || '';
            this.imagePreview = user.image || null;
          },
          error: (err) => {
            console.error('Error getting user:', err);
            this.updateError = true;
            this.errorMessage = 'Failed to load user data. Please try again later.';
          },
        });
      }
    }
  }

  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Token decoding failed', e);
      return null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.image = file;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    this.updateSuccess = false;
    this.updateError = false;
    
    this.userService
      .updateUser(this.userId, this.nom, this.prenom, this.email, this.password, this.role, this.image)
      .subscribe({
        next: () => {
          this.updateSuccess = true;
          // Reload user data to get the updated information
          setTimeout(() => {
            this.loadUserData();
            // Hide success message after 3 seconds
            setTimeout(() => {
              this.updateSuccess = false;
            }, 3000);
          }, 1000);
        },
        error: (err) => {
          console.error('Update failed', err);
          this.updateError = true;
          this.errorMessage = 'Failed to update profile. Please try again later.';
        },
      });
  }
}

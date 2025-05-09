import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-card-settings',
  templateUrl: './card-settings.component.html',
})
export class CardSettingsComponent implements OnInit {
  userId!: string;
  nom = '';
  prenom = '';
  email = '';
  password = '';
  role = '';
  age = '';
  gender = '';
  country = '';
  image: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      this.email = decoded?.email;

      if (this.email) {
        this.userService.getUserByEmail(this.email).subscribe({
          next: (user) => {
            this.userId = user.id_user;
            this.nom = user.nom;
            this.prenom = user.prenom;
            this.email = user.email;
            this.role = user.role;
            this.age = user.age || '';
            this.gender = user.gender || '';
            this.country = user.country || '';
            this.imagePreview = user.image;
            console.log("image in card-settings", user.imageUrl);
          },
          error: (err) => console.error('Error getting user:', err),
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

  update(): void {
    this.userService
      .updateUserComplete(
        this.userId,
        this.nom,
        this.prenom,
        this.email,
        this.password,
        this.role,
        this.age,
        this.gender,
        this.country,
        this.image
      )
      .subscribe({
        next: () => alert('Profile updated successfully!'),
        error: (err) => console.error('Update failed', err),
      });
  }
}

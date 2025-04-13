import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResponse } from 'src/app/core/models/AuthResponse';
import { UserActivityService } from 'src/app/core/service/user-activity.service';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  authForm: FormGroup;
  constructor(
    private authService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private userActivityService: UserActivityService
  ) {}

  ngOnInit(): void {
    this.authForm = this.fb.group({
      email: ['', Validators.required],
      mdp: ['', [Validators.required]],
      recaptcha: ['', Validators.required],
    });
  }
  errorMessage: string | null = null; // Add this property in your component
  submit() {
    console.log("submit");
    console.log(this.authForm.value);
    if (this.authForm.valid) {
      console.log("form valid");
      const { email, mdp, recaptcha } = this.authForm.value;
      const authValues = { username: email, password: mdp }; // Use correct field names

      this.authService.authenticate(authValues).subscribe({
        next: (data: any) => {
          console.log('Authentication successful:', data);

          // Store the token
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          this.userActivityService.addUserActivity(email, 'LOGIN').subscribe({
            next: () => console.log('User activity logged: LOGIN'),
            error: (err) => console.error('Failed to log user activity:', err),
          });

          // Decode the token to get roles
          const tokenPayload = this.decodeToken(data.access_token);
          const roles =
            tokenPayload?.resource_access?.['khotwa-rest-api']?.roles || [];

          console.log('User roles:', roles);

          // Fetch user data based on the email
          this.authService.getUserByEmail(email).subscribe({
            next: (userData: any) => {
              console.log('User data fetched:', userData);

              // You can now check the user's role and navigate accordingly
              if (userData.role == 'ADMINISTRATEUR') {
                this.router.navigate(['/admin/dashboard']);
              } else if (
                roles.includes('ETUDIANT') ||
                roles.includes('FORMATEUR')
              ) {
                window.location.href = 'http://localhost:4200/';
              } else {
                console.error('Unknown role:', roles);
              }
            },
            error: (error) => {
              console.error('Failed to fetch user by email:', error);
              this.errorMessage =
                error.error?.message || 'Failed to retrieve user data.';
            },
          });
        },
        error: (error) => {
          console.error('Authentication failed:', error.error);
          this.errorMessage =
            error.error?.error || 'Authentication failed. Please try again.';
        },
      });
    }else{
      console.log("form invalid");
    }
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1]; // Get the payload part
      return JSON.parse(atob(payload)); // Decode and parse
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.authForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
  getErrorMessage(controlName: string): string {
    const control = this.authForm.get(controlName);
    if (control?.hasError('required')) {
      if (controlName === 'recaptcha') {
        return 'Veuillez valider le CAPTCHA';
      }
      return 'Ce champ est obligatoire';
    }
    return '';
  }
  
  onCaptchaResolved(token: string) {
    console.log('Captcha resolved with token:', token);
    this.authForm.get('recaptcha')?.setValue(token);
  
 

  }
  
}

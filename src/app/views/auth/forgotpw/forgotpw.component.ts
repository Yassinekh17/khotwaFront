import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/service/user.service';


@Component({
  selector: 'app-forgotpw',
  templateUrl: './forgotpw.component.html',
})
export class ForgotpwComponent implements OnInit {
  forgotForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.forgotForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (controlName === 'email' && control?.hasError('email')) {
      return 'Adresse email invalide';
    }
    if (controlName === 'newPassword' && control?.hasError('minlength')) {
      return 'Mot de passe trop court';
    }
    return '';
  }

  submit(): void {
    if (this.forgotForm.valid) {
      const { email, newPassword } = this.forgotForm.value;
      this.authService.forgotpw(email, newPassword).subscribe({
        next: (res: any) => {
          this.successMessage = res.message;
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Password update failed.';
        }
      });
    }
  }
}


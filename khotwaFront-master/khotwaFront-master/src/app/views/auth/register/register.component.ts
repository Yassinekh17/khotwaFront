import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null; // Variable to hold the preview of the uploaded image
  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ETUDIANT', Validators.required],
      image: [null], // Image will be handled separately
    });
  }
  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      this.registerForm.patchValue({ image: file }); // Adding the file to the form control
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const nom = this.registerForm.value.prenom; // You might want to use nom instead of username
    const prenom = this.registerForm.value.nom; // Ensure this matches the backend 'prenom'
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;
    const role = this.registerForm.value.role;
    const image = this.registerForm.value.image;

    // Calling the register method from the service with the form values
    this.userService
      .register(nom, prenom, email, password, role, image)
      .subscribe(
        (response) => {
          this.showMessage('Registration successful!', 'success');
          console.log('Registration successful:', response);
        },
        (error) => {
          this.showMessage(
            'Registration failed. Please try again later.',
            'error'
          );
          console.error('Registration failed:', error);
        }
      );
  }
  showMessage(message: string, type: string): void {
    // For example, you could use an alert or create a message component
    if (type === 'success') {
      alert(message); // Success message
    } else if (type === 'error') {
      alert(message); // Error message
    }
  }
}

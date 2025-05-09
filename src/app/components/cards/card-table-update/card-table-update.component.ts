import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/models/User';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-card-table-update',
  templateUrl: './card-table-update.component.html',
})
export class CardTableUpdateComponent implements OnInit {
  id!: number;
  updateUserForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private act: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private service: UserService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.act.snapshot.params['id']);
    console.log(this.id);

    // Initialize the form with validation
    this.updateUserForm = this.fb.group({
      id_user: [this.id],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mdp: ['', [Validators.required]],
      role: ['', Validators.required],
      age: [''],
      gender: [''],
      country: [''],
    });

    // Fetch user data by ID and update the form
    this.service.getUserById(this.id).subscribe((user: User) => {
      this.updateUserForm.patchValue({
        prenom: user.prenom,
        nom: user.nom,
        mdp: user.mdp, // You may want to handle password securely
        email: user.email,
        role: user.role,
        age: user.age || '',
        gender: user.gender || '',
        country: user.country || '',
      });
    });
  }

  // Handle file selection for image
  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      this.updateUserForm.patchValue({ image: file }); // Adding the file to the form control
    }
  }

  // Get error message for required fields
  getErrorMessage(controlName: string): string {
    const control = this.updateUserForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    return '';
  }

  // Handle form submission
  onSubmit(): void {
    if (this.updateUserForm.invalid) {
      return;
    }
    const id_user = this.id.toString();
    const nom = this.updateUserForm.value.nom;
    const prenom = this.updateUserForm.value.prenom;
    const email = this.updateUserForm.value.email;
    const password = this.updateUserForm.value.mdp;
    const role = this.updateUserForm.value.role;
    const age = this.updateUserForm.value.age;
    const gender = this.updateUserForm.value.gender;
    const country = this.updateUserForm.value.country;
    const image = this.updateUserForm.value.image;

    console.log('id_user in update component', id_user);

    // Calling the update method from the service with all the form values
    this.service
      .updateUserComplete(
        id_user,
        nom,
        prenom,
        email,
        password,
        role,
        age,
        gender,
        country,
        image
      )
      .subscribe(
        (response) => {
          this.router.navigate(['/admin/tables']);
          console.log('update successful:', response);
        },
        (error) => {
          console.error('update failed:', error);
        }
      );
  }

  // Check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.updateUserForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}

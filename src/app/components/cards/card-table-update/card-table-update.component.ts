import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "src/app/core/models/User";
import { UserService } from "src/app/core/service/user.service";

@Component({
  selector: "app-card-table-update",
  templateUrl: "./card-table-update.component.html",
})
export class CardTableUpdateComponent implements OnInit {
  id!: number;
  updateUserForm: FormGroup;
  constructor(
    private act: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private service: UserService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.act.snapshot.params["id"]);
    console.log(this.id);
    this.updateUserForm = this.fb.group({
      id_user: [this.id],
      nom: ["", [Validators.required]],
      prenom: ["", [Validators.required]],
      email: ["", Validators.required],
      mdp: ["", [Validators.required]],
      role: ["", Validators.required],
    });

    this.service.getUserById(this.id).subscribe((user: User) => {
      // Update the form with the fetched data
      this.updateUserForm.patchValue({
        prenom: user.prenom,
        nom: user.nom,
        mdp: user.mdp, // You may want to omit this or encrypt it before updating
        email: user.email,
        role: user.role,
      });
    });
  }
  imageFile: File | null = null;
  onImageSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.imageFile = event.target.files[0];
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.updateUserForm.get(controlName);
    if (control?.hasError("required")) {
      return "Ce champ est obligatoire";
    }
    return "";
  }
  onSubmit(): void {
    const formData = new FormData();
    const user = this.updateUserForm.value;
    formData.append("user", JSON.stringify(user));

    if (this.imageFile) {
      formData.append("image", this.imageFile, this.imageFile.name);
    }

    this.service.updateUser(user).subscribe({
      next: (response) => {
        console.log("User updated successfully", response);
      },
      error: (error) => {
        console.error("Error updating user", error);
      },
      complete: () => {
        console.log("Request completed");
      },
    });
  }

  // Vérifier si un champ est invalide
  isFieldInvalid(fieldName: string): boolean {
    const field = this.updateUserForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}

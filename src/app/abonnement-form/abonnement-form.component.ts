import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AbonnementService } from '../services/abonnement.service';
import { PlanAbonnement, Abonnement } from '../models/abonnement.model';
import { UserService } from '../core/service/user.service';

@Component({
  selector: 'app-abonnement-form',
  templateUrl: './abonnement-form.component.html',
  styleUrls: ['./abonnement-form.component.css']
})
export class AbonnementFormComponent implements OnInit {
  id_user!: number;
  userEmail!: string;
  abonnementForm!: FormGroup;
  abonnement!: Abonnement;
  plans = Object.values(PlanAbonnement);
  prixParJour: { [key in PlanAbonnement]: number } = {
    MENSUEL: 5,
    TRIMESTRIEL: 5,
    ANNUEL: 5
  };

  constructor(
    private fb: FormBuilder,
    private abonnementService: AbonnementService,
    private router: Router, 
    private userService : UserService
  ) {}

  ngOnInit(): void {
    this.abonnementForm = this.fb.group({
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required],
      plan: [PlanAbonnement.MENSUEL, Validators.required],
      prix: [{ value: 0, disabled: true }, Validators.required]
    });

    this.abonnementForm.valueChanges.subscribe(() => {
      this.calculerPrix();
    });
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.userEmail = decoded.email || decoded.sub || null;
      }
    }
    this.userService.getUserByEmail(this.userEmail).subscribe({
      next: (user) => {
        this.id_user = user.id_user;
      },
      error: (err) => {
        console.error('Error getting user:', err);
      },
    });
  }

  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  calculerPrix(): void {
    const dateDebut = new Date(this.abonnementForm.get('date_debut')?.value);
    const dateFin = new Date(this.abonnementForm.get('date_fin')?.value);
    const plan: PlanAbonnement = this.abonnementForm.get('plan')?.value;
  
    if (dateDebut && dateFin && dateFin > dateDebut) {
      const differenceJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24));
      const prix = differenceJours * this.prixParJour[plan];
      this.abonnementForm.patchValue({ prix }, { emitEvent: false });
    }
  }
  onSubmit(): void {
    // Récupérer les valeurs du formulaire
    const formValue = this.abonnementForm.value;
  
    // Convertir les dates en objets Date
    const dateDebut = new Date(formValue.date_debut);
    const dateFin = new Date(formValue.date_fin);
  
    // Calculer le prix en fonction de la durée et du plan
    const plan: PlanAbonnement = formValue.plan;
    const differenceJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24));
    const prix = differenceJours * this.prixParJour[plan];
  
    // Créer l'objet Abonnement avec le prix calculé
    this.abonnement = {
      ...formValue,
      date_debut: dateDebut,
      date_fin: dateFin,
      prix: prix // Ajouter le prix calculé
    };
  
    console.log("Données envoyées :", this.abonnement); // Afficher les données dans la console
  
    // Envoyer l'objet Abonnement au backend
    this.abonnementService.addAbonnement(this.abonnement, this.id_user).subscribe(
      res => {
        this.abonnement = res;
        this.router.navigate(['/admin/payer']); // Rediriger après l'ajout
      },
      error => console.log("Erreur lors de l'ajout :", error) // Afficher l'erreur exacte
    );
  }
  
  


  /*goToPayment(): void {
    this.router.navigate(['/admin/payer']);
  }*/
}

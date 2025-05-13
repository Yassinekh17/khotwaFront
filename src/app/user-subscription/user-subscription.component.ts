import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Abonnement, PlanAbonnement } from '../models/abonnement.model';
import { AbonnementService } from '../services/abonnement.service';
import { UserService } from '../core/service/user.service';
import { TokenService } from '../core/service/token.service';
import { ToastrService } from 'ngx-toastr';

interface SubscriptionPlan {
  id: PlanAbonnement;
  title: string;
  price: number;
  duration: string;
  features: string[];
  recommended?: boolean;
}

@Component({
  selector: 'app-user-subscription',
  templateUrl: './user-subscription.component.html',
  styleUrls: ['./user-subscription.component.css']
})
export class UserSubscriptionComponent implements OnInit {
  userEmail!: string;
  id_user!: number;
  subscriptionForm!: FormGroup;
  abonnement!: Abonnement;
  selectedPlan: PlanAbonnement | null = null;
  showPaymentForm = false;
  isProcessing = false;
  subscriptionSuccess = false;
  successMessage = '';

  // Subscription plans with features
  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: PlanAbonnement.MENSUEL,
      title: 'Abonnement Mensuel',
      price: 30,
      duration: '1 mois',
      features: [
        'Accès à tous les cours',
        'Support par email',
        'Certificats de réussite',
        'Accès aux forums de discussion'
      ]
    },
    {
      id: PlanAbonnement.TRIMESTRIEL,
      title: 'Abonnement Trimestriel',
      price: 75,
      duration: '3 mois',
      features: [
        'Accès à tous les cours',
        'Support par email et chat',
        'Certificats de réussite',
        'Accès aux forums de discussion',
        'Téléchargement des cours pour un accès hors ligne'
      ],
      recommended: true
    },
    {
      id: PlanAbonnement.ANNUEL,
      title: 'Abonnement Annuel',
      price: 250,
      duration: '12 mois',
      features: [
        'Accès à tous les cours',
        'Support prioritaire par email, chat et téléphone',
        'Certificats de réussite',
        'Accès aux forums de discussion',
        'Téléchargement des cours pour un accès hors ligne',
        'Sessions de mentorat mensuelles',
        'Accès anticipé aux nouveaux cours'
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private abonnementService: AbonnementService,
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getUserInfo();
  }

  initForm(): void {
    this.subscriptionForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardName: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])/[0-9]{2}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });
  }

  getUserInfo(): void {
    const token = this.tokenService.getAccessToken();
    if (token) {
      const decoded = this.tokenService.decodeToken(token);
      if (decoded) {
        this.userEmail = decoded.email || decoded.sub || null;

        if (this.userEmail) {
          this.userService.getUserByEmail(this.userEmail).subscribe({
            next: (user) => {
              this.id_user = user.id_user;
              console.log('User ID retrieved:', this.id_user);
            },
            error: (err) => {
              console.error('Error getting user:', err);
              this.toastr.error('Erreur lors de la récupération des informations utilisateur');
            },
          });
        }
      }
    }
  }

  selectPlan(plan: PlanAbonnement): void {
    this.selectedPlan = plan;
    this.showPaymentForm = true;
  }

  getSelectedPlanDetails(): SubscriptionPlan | undefined {
    return this.subscriptionPlans.find(plan => plan.id === this.selectedPlan);
  }

  onSubmit(): void {
    if (this.subscriptionForm.invalid || !this.selectedPlan || !this.id_user) {
      this.toastr.error('Veuillez remplir correctement tous les champs');
      return;
    }

    this.isProcessing = true;

    const selectedPlanDetails = this.getSelectedPlanDetails();
    if (!selectedPlanDetails) {
      this.toastr.error('Plan non trouvé');
      this.isProcessing = false;
      return;
    }

    // Calculate dates based on plan
    const dateDebut = new Date();
    const dateFin = new Date();

    switch (this.selectedPlan) {
      case PlanAbonnement.MENSUEL:
        dateFin.setMonth(dateFin.getMonth() + 1);
        break;
      case PlanAbonnement.TRIMESTRIEL:
        dateFin.setMonth(dateFin.getMonth() + 3);
        break;
      case PlanAbonnement.ANNUEL:
        dateFin.setFullYear(dateFin.getFullYear() + 1);
        break;
    }

    // Create subscription object
    const abonnement: any = {
      date_debut: dateDebut,
      date_fin: dateFin,
      plan: this.selectedPlan,
      prix: selectedPlanDetails.price
    };

    // Call service to add subscription
    this.abonnementService.addAbonnement(abonnement, this.id_user).subscribe({
      next: (response) => {
        this.isProcessing = false;

        // Show success message
        this.subscriptionSuccess = true;
        const selectedPlanDetails = this.getSelectedPlanDetails();
        this.successMessage = `Félicitations! Votre abonnement ${selectedPlanDetails?.title} a été activé avec succès.`;

        this.toastr.success('Abonnement souscrit avec succès!');

        // Redirect after showing success message
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 5000); // Give user time to see the success message
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error adding subscription:', error);
        this.toastr.error('Erreur lors de la souscription à l\'abonnement');
      }
    });
  }

  cancelPayment(): void {
    this.showPaymentForm = false;
    this.selectedPlan = null;
    this.subscriptionForm.reset();
  }
}

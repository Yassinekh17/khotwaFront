import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InscriptionService } from '../../../services/inscription.service';
import { EventService, Evenement } from '../../../services/event.service';
import { LocalInscriptionService } from '../../../services/local-inscription.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  event: Evenement | null = null;
  inscriptionForm: FormGroup;
  inscriptionLoading: boolean = false;
  inscriptionSuccess: boolean = false;
  inscriptionError: string | null = null;
  loading: boolean = true;
  error: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private inscriptionService: InscriptionService,
    private eventService: EventService,
    private localInscriptionService: LocalInscriptionService
  ) {
    this.inscriptionForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const eventId = +params['id'];
      if (eventId) {
        this.loadEventDetails(eventId);
      } else {
        this.error = "ID d'événement non fourni";
        this.loading = false;
      }
    });
  }

  loadEventDetails(eventId: number): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails de l\'événement', err);
        this.error = "Impossible de charger les détails de l'événement";
        this.loading = false;
      }
    });
  }

  submitInscription(): void {
    if (!this.event?.eventId || this.inscriptionForm.invalid) return;

    this.inscriptionLoading = true;
    this.inscriptionError = null;
    this.inscriptionSuccess = false;

    const inscriptionData = this.inscriptionForm.value;

    console.log('🚀 [Registration] Démarrage du processus d\'inscription');
    console.log('📝 [Registration] Données du formulaire:', inscriptionData);
    console.log('🎯 [Registration] Événement:', this.event.title, '(ID:', this.event.eventId + ')');

    // Vérifier si l'utilisateur est déjà inscrit localement
    const alreadyRegistered = this.localInscriptionService.isUserRegisteredForEvent(this.event.eventId);

    if (alreadyRegistered) {
      this.inscriptionSuccess = true;
      this.inscriptionLoading = false;
      console.log('ℹ️ [Registration] Utilisateur déjà inscrit à cet événement localement');
      return;
    }

    // Essayer d'abord le backend, puis fallback vers local si échec
    console.log('🔗 [Registration] Tentative de connexion au backend...');

    // Appeler le service backend pour créer l'inscription
    this.inscriptionService.joinEvent(this.event.eventId, inscriptionData).subscribe({
      next: (response) => {
        console.log('✅ [Registration] Inscription créée avec succès sur le backend:', response);

        try {
          // Sauvegarder l'inscription localement aussi
          const localInscription = this.localInscriptionService.saveInscription(this.event!, inscriptionData);
          console.log('✅ [Registration] Inscription sauvegardée localement:', localInscription);

          this.inscriptionSuccess = true;
          this.inscriptionLoading = false;
          this.inscriptionForm.reset();

          // Message de succès
          console.log('🎉 [Registration] Inscription réussie ! Vous pouvez maintenant voir cet événement dans "Mes Événements"');

        } catch (error) {
          console.error('❌ [Registration] Erreur lors de la sauvegarde locale:', error);
          // L'inscription backend a réussi, donc on considère quand même comme succès
          this.inscriptionSuccess = true;
          this.inscriptionLoading = false;
          this.inscriptionForm.reset();
        }
      },
      error: (error) => {
        console.error('❌ [Registration] Erreur lors de l\'inscription backend:', error);
        console.log('🔄 [Registration] Backend indisponible, utilisation du mode hors ligne');

        // Fallback: sauvegarder localement même si le backend échoue
        console.log('💾 [Registration] Sauvegarde locale en cours...');

        try {
          const localInscription = this.localInscriptionService.saveInscription(this.event!, inscriptionData);
          console.log('✅ [Registration] Inscription sauvegardée localement:', localInscription);
          console.log('📋 [Registration] Détails de l\'inscription locale:', {
            id: localInscription.id,
            eventTitle: localInscription.event.title,
            userName: localInscription.userInfo.nom,
            registrationDate: localInscription.registrationDate
          });

          this.inscriptionSuccess = true;
          this.inscriptionLoading = false;
          this.inscriptionForm.reset();

          // Message de succès avec avertissement
          console.log('⚠️ [Registration] Inscription sauvegardée localement (backend indisponible)');
          console.log('🎉 [Registration] Vous pouvez voir cet événement dans "Mes Événements"');
          console.log('💡 [Registration] Astuce: Actualisez la page pour voir les changements');

        } catch (localError) {
          console.error('❌ [Registration] Erreur lors de la sauvegarde locale:', localError);
          this.inscriptionError = 'Erreur lors de l\'inscription. Veuillez réessayer.';
          this.inscriptionLoading = false;
        }
      }
    });
  }


  goBack(): void {
    this.router.navigate(['/events', this.event?.eventId]);
  }







  // Nettoyer les ressources lors de la destruction du composant
  ngOnDestroy(): void {
    // Pas de nettoyage nécessaire pour cette implémentation
  }

}

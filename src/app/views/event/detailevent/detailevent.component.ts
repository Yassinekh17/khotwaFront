import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, Evenement } from '../../../services/event.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommentaireService, CommentaireEvenement } from '../../../services/commentaire.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InscriptionService } from '../../../services/inscription.service';
import { LocalInscriptionService } from '../../../services/local-inscription.service';
import { ImageUploadService } from '../../../services/image-upload.service';

@Component({
  selector: 'app-detailevent',
  templateUrl: './detailevent.component.html',
  styleUrls: ['./detailevent.component.css']
})
export class DetaileventComponent implements OnInit {
  event: Evenement | null = null;
  qrCodeUrl: SafeUrl | null = null;
  isEventPassed: boolean = false;
  loading: boolean = true;
  error: string | null = null;

  // Commentaires
  commentaires: CommentaireEvenement[] = [];
  commentaireForm: FormGroup;
  commentairesLoading: boolean = false;
  commentairesError: string | null = null;
  commentSubmitting: boolean = false;

  // Inscription
  showInscriptionForm: boolean = false;
  inscriptionForm: FormGroup;
  inscriptionLoading: boolean = false;
  inscriptionSuccess: boolean = false;
  inscriptionError: string | null = null;

  // Plus d'ID utilisateur - inscription simplifiée

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private sanitizer: DomSanitizer,
    private commentaireService: CommentaireService,
    private inscriptionService: InscriptionService,
    private localInscriptionService: LocalInscriptionService,
    private imageUploadService: ImageUploadService,
    private fb: FormBuilder
  ) {
    this.commentaireForm = this.fb.group({
      texte: ['', [Validators.required, Validators.minLength(3)]],
      note: [5, [Validators.min(1), Validators.max(5)]]
    });

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
        this.loadAllCommentaires(eventId);
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
        this.isEventPassed = this.checkIfEventPassed(data.date);
        this.loadQRCode(eventId);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails de l\'événement', err);
        this.error = "Impossible de charger les détails de l'événement";
        this.loading = false;
      }
    });
  }

  loadQRCode(eventId: number): void {
    this.eventService.generateQRCode(eventId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du QR code', err);
        this.loading = false;
      }
    });
  }

  checkIfEventPassed(eventDate: Date): boolean {
    const today = new Date();
    const date = new Date(eventDate);
    return date < today;
  }

  joinEvent(): void {
    if (!this.event || !this.event.eventId) {
      this.inscriptionError = "Impossible de rejoindre cet événement.";
      return;
    }
    this.router.navigate(['/events', this.event.eventId, 'register']);
  }

  toggleInscriptionForm(): void {
    this.showInscriptionForm = !this.showInscriptionForm;
    this.inscriptionError = null;
  }

  submitInscription(): void {
    if (!this.event?.eventId || this.inscriptionForm.invalid) return;

    this.inscriptionLoading = true;
    this.inscriptionError = null;
    this.inscriptionSuccess = false;

    const inscriptionData = this.inscriptionForm.value;

    // Vérifier si l'utilisateur est déjà inscrit localement (simplifié)
    const localInscriptions = this.localInscriptionService.getAllInscriptions();
    const alreadyRegistered = localInscriptions.some(
      (insc: any) => insc.eventId === this.event!.eventId
    );

    if (alreadyRegistered) {
      this.inscriptionSuccess = true;
      this.inscriptionLoading = false;
      this.showInscriptionForm = false;
      console.log('ℹ️ [DetailEvent] Utilisateur déjà inscrit à cet événement localement');
      return;
    }

    // Procéder à l'inscription
    this.inscriptionService.joinEvent(this.event!.eventId!, inscriptionData).subscribe({
      next: () => {
        console.log('✅ [DetailEvent] Inscription réussie');
        this.inscriptionSuccess = true;
        this.inscriptionLoading = false;
        this.showInscriptionForm = false;
        this.inscriptionForm.reset();

        if (this.event) {
          const updatedEvent = {
            ...this.event,
            capacite: this.event.capacite - 1,
            currentParticipants: (this.event.currentParticipants || 0) + 1
          };

          // ✅ Envoyer directement updatedEvent sans FormData
          this.eventService.updateEvent(this.event.eventId!, updatedEvent).subscribe({
            next: (updatedEventData) => {
              this.event = updatedEventData;
            },
            error: (err) => {
              console.error('Erreur lors de la mise à jour de l\'événement après inscription', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('❌ [DetailEvent] Erreur lors de l\'inscription:', err);
        this.inscriptionError = "Erreur lors de l'inscription. Veuillez réessayer.";
        this.inscriptionLoading = false;
      }
    });
  }


  checkIfInscriptionCreated(): void {
    if (!this.event?.eventId) {
      this.inscriptionLoading = false;
      this.inscriptionError = "Impossible de vérifier l'inscription";
      return;
    }

    this.inscriptionLoading = true;

    setTimeout(() => {
      // Vérifier dans le stockage local si l'inscription a été créée
      const localInscriptions = this.localInscriptionService.getAllInscriptions();
      const isRegistered = localInscriptions.some(
        (insc: any) => insc.eventId === this.event!.eventId
      );

      if (isRegistered) {
        console.log('✅ [DetailEvent] Inscription confirmée dans le stockage local');
        this.inscriptionSuccess = true;
        this.inscriptionError = null;
        this.showInscriptionForm = false;

        if (this.event) {
          const updatedEvent = {
            ...this.event,
            capacite: this.event.capacite - 1,
            currentParticipants: (this.event.currentParticipants || 0) + 1
          };

          // ✅ Envoyer directement updatedEvent (PAS FormData)
          this.eventService.updateEvent(this.event.eventId!, updatedEvent).subscribe({
            next: (updatedEventData) => {
              this.event = updatedEventData;
            },
            error: (err) => {
              console.error('Erreur lors de la mise à jour de l\'événement après inscription', err);
            }
          });
        }
      } else {
        console.log('❌ [DetailEvent] Inscription non trouvée dans le stockage local');
        this.inscriptionError = "L'inscription n'a pas pu être finalisée. Veuillez réessayer.";
      }

      this.inscriptionLoading = false;
    }, 1000);
  }


  viewRecording(): void {
    window.open('https://exemple-reunion.com/recording', '_blank');
  }

  loadAllCommentaires(eventId: number): void {
    this.commentairesLoading = true;
    this.commentairesError = null;

    this.commentaireService.getCommentairesByEventId(eventId).subscribe({
      next: (data) => {
        this.commentaires = data;
        this.commentairesLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commentaires', err);
        this.commentairesError = "Impossible de charger les commentaires";
        this.commentairesLoading = false;
      }
    });
  }

  fixCommentUserID(comment: CommentaireEvenement): void {
    const defaultUserId = 1; // ID utilisateur par défaut
    const fixedComment = { ...comment, user: { id: defaultUserId } };

    this.commentaireService.updateCommentaire(comment.id!, fixedComment).subscribe({
      next: (updatedComment) => {
        console.log(`Commentaire ID ${comment.id} mis à jour avec user_id = ${defaultUserId}`);
        const index = this.commentaires.findIndex(c => c.id === comment.id);
        if (index !== -1) {
          this.commentaires[index] = updatedComment;
        }
      },
      error: (err) => {
        console.error(`Erreur lors de la mise à jour du commentaire ID ${comment.id}`, err);
      }
    });
  }

  submitCommentaire() {
    if (!this.commentaireForm.valid) {
      console.warn('Formulaire de commentaire invalide');
      return;
    }

    if (!this.event?.eventId) {
      console.error("Aucun ID d'événement trouvé !");
      return;
    }

    const commentaireData = this.commentaireForm.value;
    this.commentSubmitting = true;

    const defaultUserId = 1; // ID utilisateur par défaut pour les commentaires
    this.commentaireService.ajouterCommentaire(this.event.eventId, defaultUserId, {
      texte: commentaireData.texte,
      note: commentaireData.note
    }).subscribe({
      next: (response) => {
        console.log('Commentaire ajouté !', response);
        this.commentaireForm.reset({ texte: '', note: 5 }); // Réinitialise le formulaire
        this.loadAllCommentaires(this.event!.eventId!); // Recharge les commentaires
        this.commentSubmitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire', error);
        this.commentSubmitting = false;
      }
    });
  }

  getStarsArray(note: number): number[] {
    return Array(note).fill(0);
  }


  // Method to get the correct image source (handles stored images)
  getEventImageUrl(): string {
    console.log('📋 [DÉTAILS] getEventImageUrl appelée pour événement:', this.event?.title);
    console.log('🔗 [DÉTAILS] URL de l\'image dans l\'événement:', this.event?.imageUrl);

    if (!this.event?.imageUrl) {
      console.log('⚠️ [DÉTAILS] Aucune URL d\'image dans l\'événement, utilisation de l\'image par défaut');
      return 'assets/img/landing.jpg';
    }

    const result = this.imageUploadService.getImageSource(this.event.imageUrl);
    console.log('🎯 [DÉTAILS] URL finale retournée:', result);
    return result;
  }

}

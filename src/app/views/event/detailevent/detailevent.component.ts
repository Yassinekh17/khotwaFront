import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService, Evenement } from '../../../services/event.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommentaireService, CommentaireEvenement } from '../../../services/commentaire.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InscriptionService } from '../../../services/inscription.service';

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

  // ID utilisateur statique
  readonly userId: number = 1;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private sanitizer: DomSanitizer,
    private commentaireService: CommentaireService,
    private inscriptionService: InscriptionService,
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
    this.toggleInscriptionForm();
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

    this.inscriptionService.getUserInscriptions(this.userId).subscribe({
      next: (userInscriptions) => {
        const alreadyRegistered = userInscriptions.some(
          insc => insc.evenement && insc.evenement.eventId === this.event!.eventId
        );

        if (alreadyRegistered) {
          this.inscriptionSuccess = true;
          this.inscriptionLoading = false;
          this.showInscriptionForm = false;
          return;
        }

        this.inscriptionService.joinEvent(this.event!.eventId, inscriptionData).subscribe({
          next: () => {
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
            console.error('Erreur lors de l\'inscription', err);
            this.checkIfInscriptionCreated(); // Tu peux garder ce fallback
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors de la vérification des inscriptions', err);
        this.inscriptionError = "Impossible de vérifier vos inscriptions existantes";
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
      this.inscriptionService.getUserInscriptions(this.userId).subscribe({
        next: (inscriptions) => {
          const isRegistered = inscriptions.some(
            insc => insc.evenement && insc.evenement.eventId === this.event!.eventId
          );

          if (isRegistered) {
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
            this.inscriptionError = "L'inscription n'a pas pu être finalisée. Veuillez réessayer.";
          }

          this.inscriptionLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la vérification de l\'inscription', err);
          this.inscriptionError = "Impossible de vérifier votre inscription";
          this.inscriptionLoading = false;
        }
      });
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
    const fixedComment = { ...comment, user: { id: this.userId } };

    this.commentaireService.updateCommentaire(comment.id!, fixedComment).subscribe({
      next: (updatedComment) => {
        console.log(`Commentaire ID ${comment.id} mis à jour avec user_id = ${this.userId}`);
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

    this.commentaireService.ajouterCommentaire(this.event.eventId, this.userId, {
      texte: commentaireData.texte,
      note: commentaireData.note
    }).subscribe({
      next: (response) => {
        console.log('Commentaire ajouté !', response);
        this.commentaireForm.reset({ texte: '', note: 5 }); // Réinitialise le formulaire
        this.loadAllCommentaires(this.event!.eventId); // Recharge les commentaires
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

}

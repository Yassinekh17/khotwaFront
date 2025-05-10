import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, Evenement } from '../../../../services/event.service';
import { PredictService } from '../../../../services/predict.service';

// Define enums to match backend
export enum Type_evenement {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONOGING',
  COMPLETED = 'COMPLETED'
}

export enum Status_evenement {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}

@Component({
  selector: 'app-addevent',
  templateUrl: './addevent.component.html',
  styleUrls: ['./addevent.component.css']
})
export class AddeventComponent implements OnInit {
  userEmail!: string;
  eventForm: FormGroup;
  isEditMode = false;
  eventId: number | null = null;
  submitted = false;
  loading = false;
  error = '';
  statusOptions = Object.values(Status_evenement);
  typeOptions = Object.values(Type_evenement);

  // Propriétés pour la prédiction de catégorie
  predictedCategory: string = '';
  predictLoading: boolean = false;
  predictError: string = '';

  // Image handling properties
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private predictService: PredictService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.eventForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', Validators.required],
      location: ['', Validators.required],
      type: [Type_evenement.UPCOMING, Validators.required],
      status: [Status_evenement.UPCOMING, Validators.required],
      imageUrl: [''], // Add imageUrl field to the form
      capacite: [0, [Validators.required, Validators.min(1)]], // Ajout du champ capacité
      maxParticipants: [0, [Validators.required, Validators.min(1)]], // Ajout du nombre max de participants
      currentParticipants: [0, [Validators.min(0)]] // Ajout du nombre actuel de participants
    });
  }

  ngOnInit(): void {
    // Check if we are editing an existing event or creating a new one
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.eventId = +id;
      this.loadEventData();
    }
     const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.userEmail = decoded.email || decoded.sub || null;
      }
    }


  }

  loadEventData(): void {
    if (this.eventId) {
      this.loading = true;
      this.eventService.getEventById(this.eventId).subscribe({
        next: (event) => {
          // Format date for form input
          const eventDate = new Date(event.date);
          const formattedDate = eventDate.toISOString().substring(0, 16);

          this.eventForm.patchValue({
            title: event.title,
            description: event.description,
            date: formattedDate,
            location: event.location,
            type: event.type,
            status: event.status,
            imageUrl: event.imageUrl,
            capacite: event.capacite, // Ajout du champ capacité
            maxParticipants: event.maxParticipants, // Ajout du nombre max de participants
            currentParticipants: event.currentParticipants // Ajout du nombre actuel de participants
          });

          // If there is an image URL, set the preview
          if (event.imageUrl) {
            this.imagePreview = event.imageUrl;
          }

          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement de l\'événement: ' + err.message;
          this.loading = false;
        }
      });
    }
  }

  onImageSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedImage = inputElement.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(this.selectedImage.type)) {
        this.error = 'Format d\'image non supporté. Utilisez JPG, PNG ou GIF.';
        this.selectedImage = null;
        this.imagePreview = null;
        return;
      }

      // Validate file size (max 5MB)
      if (this.selectedImage.size > 5 * 1024 * 1024) {
        this.error = 'L\'image est trop volumineuse. Taille maximum: 5MB';
        this.selectedImage = null;
        this.imagePreview = null;
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedImage);

      // For testing without actual upload, just set a placeholder URL
      // In a real app, you would upload the image to a server and get a URL
      this.eventForm.patchValue({
        imageUrl: URL.createObjectURL(this.selectedImage)
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.eventForm.invalid) {
      return;
    }

    this.loading = true;

    // Convertir l'objet Evenement
    const eventData: Evenement = {
      ...this.eventForm.value,
      date: new Date(this.eventForm.value.date)
    };

    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent(this.eventId, eventData).subscribe({
        next: (updatedEvent) => {
          this.loading = false;

          if (updatedEvent.status === 'COMPLETED') {
            this.eventService.sendEmailOnCompletion(updatedEvent).subscribe({
              next: () => console.log('Email envoyé avec succès pour l\'événement terminé'),
              error: (err) => console.error('Erreur lors de l\'envoi de l\'email: ', err)
            });
          }

          this.navigateToList('Événement mis à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour: ' + err.message;
          this.loading = false;
        }
      });
    } else {
      this.eventService.createEvent(eventData, this.userEmail).subscribe({
        next: () => {
          this.loading = false;
          this.navigateToList('Événement créé avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création: ' + err.message;
          this.loading = false;
          console.error('Détails de l\'erreur:', err);
        }
      });
    }
  }

  predictCategory(): void {
    this.predictLoading = true;
    this.predictError = '';
    const title = this.eventForm.get('title')?.value;

    if (!title) {
      this.predictError = 'La title est requise pour la prédiction.';
      this.predictLoading = false;
      return;
    }

    this.predictService.predictCategory(title).subscribe({
      next: (category) => {
        this.predictedCategory = category;
        this.predictLoading = false;
      },
      error: (err) => {
        this.predictError = 'Erreur lors de la prédiction: ' + err.message;
        this.predictLoading = false;
      }
    });
  }

  navigateToList(message?: string): void {
    // Here you could use a notification service to show the message
    console.log(message);
    this.router.navigate(['/admin/listevent']);
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.eventForm.controls;
  }

  resetForm(): void {
    this.submitted = false;
    this.selectedImage = null;
    this.imagePreview = null;
    if (this.isEditMode) {
      this.loadEventData();
    } else {
      this.eventForm.reset({
        type: Type_evenement.UPCOMING,
        status: Status_evenement.UPCOMING,
        capacite: 0, // Ajout du champ capacité
        maxParticipants: 0, // Ajout du nombre max de participants
        currentParticipants: 0 // Ajout du nombre actuel de participants
      });
    }
  }

  
  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

}

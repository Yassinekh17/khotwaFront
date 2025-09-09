import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, Evenement } from '../../../../services/event.service';
import { PredictService } from '../../../../services/predict.service';
import { ImageUploadService } from '../../../../services/image-upload.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

// Define enums to match backend
export enum Type_evenement {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
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

  // Technologies IT disponibles
  technologies: string[] = [
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Python',
    'Java',
    'JavaScript',
    'TypeScript',
    'PHP',
    'C#',
    '.NET',
    'Spring Boot',
    'Django',
    'Flask',
    'Express.js',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'DevOps',
    'Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Blockchain',
    'Mobile Development',
    'Web Development',
    'Backend Development',
    'Frontend Development',
    'Full Stack',
    'Autres'
  ];
  createWithoutImage: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private predictService: PredictService,
    private imageUploadService: ImageUploadService,
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
      currentParticipants: [0, [Validators.min(0)]], // Ajout du nombre actuel de participants
      technologie: ['', Validators.required] // Nouveau champ technologie obligatoire
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
            currentParticipants: event.currentParticipants, // Ajout du nombre actuel de participants
            technologie: event.technologie || '' // Nouveau champ technologie
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

      // We'll upload the image when the form is submitted
      // Just set a temporary URL for preview purposes
      this.eventForm.patchValue({
        imageUrl: '' // Will be set after upload
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.eventForm.invalid) {
      return;
    }

    this.loading = true;

    // Handle image upload first if there's a selected image and user doesn't want to create without image
    if (this.selectedImage && !this.createWithoutImage) {
      this.uploadImageThenSaveEvent();
    } else {
      // Clear image URL if creating without image
      if (this.createWithoutImage) {
        this.eventForm.patchValue({
          imageUrl: ''
        });
      }
      this.saveEvent();
    }
  }

  private uploadImageThenSaveEvent(): void {
    if (!this.selectedImage) {
      this.saveEvent();
      return;
    }

    this.imageUploadService.uploadImage(this.selectedImage).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.Response) {
          const response = event.body;
          // Set the permanent image URL from the server response
          // Handle different possible response structures
          let imageUrl = '';
          if (response.imageUrl) {
            imageUrl = response.imageUrl;
          } else if (response.url) {
            imageUrl = response.url;
          } else if (response.data && response.data.url) {
            imageUrl = response.data.url;
          } else if (typeof response === 'string') {
            imageUrl = response;
          }

          this.eventForm.patchValue({
            imageUrl: imageUrl
          });

          // Now save the event with the image URL
          this.saveEvent();
        }
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement de l\'image:', err);
        // Option 1: Continuer sans image
        console.log('Continuer la création d\'événement sans image');
        this.eventForm.patchValue({
          imageUrl: '' // Pas d'image
        });
        this.saveEvent();
      }
    });
  }

  private saveEvent(): void {
    // Préparer les données pour le backend
    const formValue = this.eventForm.value;

    // Convertir la date au format ISO string pour le backend
    const eventDate = new Date(formValue.date);
    const isoDateString = eventDate.toISOString();

    // Gérer l'URL de l'image - éviter les data URLs du mock
    let imageUrl = formValue.imageUrl;
    if (imageUrl && imageUrl.startsWith('data:')) {
      // Si c'est une data URL (du mock), on l'ignore côté backend
      console.log('Data URL détectée, ignorée pour le backend');
      imageUrl = '';
    }

    // Créer l'objet de données nettoyé pour le backend
    const eventData: any = {
      title: formValue.title,
      description: formValue.description,
      date: isoDateString, // Envoyer comme string ISO
      location: formValue.location,
      type: formValue.type,
      status: formValue.status,
      capacite: formValue.capacite,
      technologie: formValue.technologie, // Nouveau champ technologie
      // Ne pas envoyer maxParticipants et currentParticipants si le backend ne les attend pas
      // maxParticipants: formValue.maxParticipants,
      // currentParticipants: formValue.currentParticipants || 0
    };

    // Ajouter l'URL de l'image seulement si elle existe et n'est pas vide
    if (imageUrl && imageUrl.trim() !== '') {
      eventData.imageUrl = imageUrl;
    }

    console.log('Données envoyées au backend:', eventData);
    console.log('Technologie sélectionnée:', formValue.technologie);
    console.log('Champ technologie dans eventData:', eventData.technologie);

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
          console.error('Erreur détaillée lors de la mise à jour:', err);
        }
      });
    } else {
      this.eventService.createEvent(eventData).subscribe({
        next: (createdEvent) => {
          this.loading = false;
          console.log('Événement créé avec succès:', createdEvent);
          console.log('Technologie dans l\'événement créé:', createdEvent.technologie);
          console.log('Type dans l\'événement créé:', createdEvent.type);
          this.navigateToList('Événement créé avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création: ' + err.message;
          this.loading = false;
          console.error('Erreur détaillée lors de la création:', err);
          console.error('Données qui ont causé l\'erreur:', eventData);
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
    this.createWithoutImage = false;
    if (this.isEditMode) {
      this.loadEventData();
    } else {
      this.eventForm.reset({
        type: Type_evenement.UPCOMING,
        status: Status_evenement.UPCOMING,
        capacite: 0, // Ajout du champ capacité
        maxParticipants: 0, // Ajout du nombre max de participants
        currentParticipants: 0, // Ajout du nombre actuel de participants
        technologie: '' // Nouveau champ technologie
      });
    }
  }
}

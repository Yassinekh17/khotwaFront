import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Message } from "src/app/core/models/Message";

import { MessageService } from "src/app/core/service/message.service";
import { SummaryService } from "src/app/services/summary.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
})
export class ProfileComponent implements OnInit {
  messages: Message[] = [];
  MessageForm: FormGroup;
  commentFormVisible: { [key: number]: boolean } = {};
  newComments: { [key: number]: string } = {};
  commentsVisible: { [key: number]: boolean } = {};

  constructor(private service: MessageService, private fb: FormBuilder, private summaryService: SummaryService) {}

  ngOnInit(): void {
    this.loadMessages();
    this.MessageForm = this.fb.group({
      contenu: ['', Validators.required], // Contenu du message
    });
  }

  loadMessages() {
    this.service.getMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.messages.forEach((message) => {
          this.service.countLikes(message.id_message!).subscribe({
            next: (count) => {
              message.likeCount = count;
            },
            error: (err) => {
              console.error(`Erreur lors du comptage des likes pour le message ${message.id_message}`, err);

              message.likeCount = 0;
            }
          });

          // Vérifie si l'utilisateur a liké ce message
          this.service.hasUserLiked(message.id_message!, 2).subscribe({
            next: (liked) => message.likedByUser = liked,
            error: () => message.likedByUser = false,
          });
          this.service.countComments(message.id_message!).subscribe({
            next: (count) => message.commentCount = count,
            error: () => message.commentCount = 0,
          });
          
        });
      },
      error: (error) => {
        console.error("Erreur lors du chargement des messages :", error);
      },
    });
  }

  deleteMessage(id: number) {
    this.service.deleteMessage(id).subscribe({
      next: () => {
        this.loadMessages();
      },
      error: (error) => {
        console.error("Error deleting message:", error);
      },
    });
  }

  onSubmit(): void {
    if (this.MessageForm.invalid) return;

    const message: Message = {
      contenu: this.MessageForm.value.contenu,
      dateEnvoi: new Date().toISOString(), // Format ISO 8601 comme Swagger
      expediteurId: 2,
    };

    this.service.addMessage(message).subscribe({
      next: (response) => {
        console.log("Message added successfully", response);
        this.loadMessages(); // Recharge les messages après ajout
        this.MessageForm.reset(); // Réinitialise le formulaire
      },
      error: (error) => {
        console.error("Error adding message", error);
      },
    });
  }
  toggleComments(messageId: number): void {
    const message = this.messages.find(m => m.id_message === messageId);
    if (!message) return;
  
    const isVisible = this.commentsVisible[messageId];
    this.commentsVisible[messageId] = !isVisible;
  
    if (!isVisible && !message.commentaires) {
      this.service.getSortCommentsForMessage(messageId).subscribe({
        next: (comments) => {
          message.commentaires = comments;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des commentaires :', err);
        }
      });
    }
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.MessageForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(controlName: string): string {
    return this.MessageForm.get(controlName)?.hasError('required')
      ? 'Ce champ est obligatoire'
      : '';
  }

  // Résumé
  summary: string = '';
  errorMessage: string = '';

  showSummary(inputText: String) {
    if (inputText.trim() === '') {
      this.errorMessage = 'Veuillez saisir un texte à résumer.';
      return;
    }

    this.errorMessage = '';

    this.summaryService.getSummary(inputText).subscribe(
      (response: any) => {
        if (response && response.summary) {
          alert(response.summary);
        } else {
          this.errorMessage = 'No summary available.';
        }
      },
      (error) => {
        this.errorMessage = 'Une erreur s\'est produite lors de la génération du résumé.';
        console.error(error);
      }
    );
  }
  toggleCommentForm(messageId: number): void {
    this.commentFormVisible[messageId] = !this.commentFormVisible[messageId];
  }
  
  publishComment(messageId: number): void {
    const contenu = this.newComments[messageId]?.trim();
    if (!contenu) return;
  
    const userId = 2; // Remplacer par l'ID réel de l'utilisateur
  
    this.service.addComment(messageId, userId, contenu).subscribe({
      next: () => {
        this.newComments[messageId] = '';
        this.commentFormVisible[messageId] = false;
  
        // Mettre à jour le compteur
        const message = this.messages.find(m => m.id_message === messageId);
        if (message) {
          this.service.countComments(messageId).subscribe({
            next: (count) => message.commentCount = count
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du commentaire :', err);
      }
    });
  }
  

  // Méthode pour gérer le Like
  likeMessage(messageId: number) {
    const userId = 2; // Replace with the authenticated user's ID
  
    // Find the message that was clicked
    const message = this.messages.find(m => m.id_message === messageId);
    if (!message) return;
  
    // Toggle the like state
    const isLike = !message.likedByUser;
  
    // Optimistically update the local UI state
    message.likedByUser = isLike;  // Toggle like/unlike
    message.likeCount = isLike ? message.likeCount + 1 : message.likeCount - 1; // Adjust like count
  
    // Call the backend to update the like/unlike status
    this.service.likeMessage(messageId, userId, isLike).subscribe({
      next: () => {
        // Success - the UI is already updated optimistically
        console.log('Successfully updated like status');
      },
      error: (err) => {
        // Error - revert the UI to the previous state if the like/unlike action failed
        console.error('Error while liking/unliking message:', err);
        message.likedByUser = !isLike;  // Revert to the previous state
        message.likeCount = isLike ? message.likeCount - 1 : message.likeCount + 1; // Revert the like count
      }
    });
  }
  
 
}
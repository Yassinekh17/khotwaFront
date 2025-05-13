import { Component, OnInit, ViewChild } from "@angular/core";
import { ChatBotComponent } from '../../chat-bot/chat-bot.component';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Message } from "src/app/core/models/Message";

import { MessageService } from "src/app/core/service/message.service";
import { SummaryService } from "src/app/services/summary.service";
import { UserService } from "src/app/core/service/user.service";
import { TokenService } from "src/app/core/service/token.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
})
export class ProfileComponent implements OnInit {
  userEmail!: string;
  id_user!: number;
  messages: Message[] = [];
  MessageForm: FormGroup;
  commentFormVisible: { [key: number]: boolean } = {};
  newComments: { [key: number]: string } = {};
  commentsVisible: { [key: number]: boolean } = {};

  constructor(
    private service: MessageService,
    private fb: FormBuilder,
    private summaryService: SummaryService,
    private userService: UserService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
    this.MessageForm = this.fb.group({
      contenu: ['', Validators.required], // Contenu du message
    });

    // Get token from token service
    const token = this.tokenService.getAccessToken();
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.userEmail = decoded.email || decoded.sub || null;

        if (this.userEmail) {
          // Get user details by email
          this.userService.getUserByEmail(this.userEmail).subscribe({
            next: (user) => {
              this.id_user = user.id_user;
              console.log('User ID retrieved:', this.id_user);
              // Reload messages to ensure likes are properly checked
              this.loadMessages();
            },
            error: (err) => {
              console.error('Error getting user:', err);
            },
          });
        } else {
          console.error('No email found in token');
        }
      } else {
        console.error('Failed to decode token');
      }
    } else {
      console.error('No token available');
    }
  }
decodeToken(token: string): any {
    try {
      return this.tokenService.decodeToken(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  loadMessages() {
    this.service.getMessages().subscribe({
      next: (data) => {
        console.log("load message data:", data);
        this.messages = data;
        this.messages.forEach((message) => {
          // Get user details for each message
          if (message.expediteurId) {
            this.userService.getUserById(message.expediteurId).subscribe({
              next: (user) => {
                // Add user properties to the message object
                message['userName'] = `${user.prenom} ${user.nom}`;
                message['userImage'] = user.image || 'assets/img/team-2-800x800.jpg';
                message['userRole'] = user.role;
                message['userCountry'] = user.country;
              },
              error: (err) => {
                console.error(`Error getting user details for message ${message.id_message}:`, err);
              }
            });
          }

          // Existing code for likes and comments
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
          if (this.id_user) {
            console.log(`Checking if user ${this.id_user} has liked message ${message.id_message}`);
            this.service.hasUserLiked(message.id_message!, this.id_user).subscribe({
              next: (liked) => {
                console.log(`User ${this.id_user} has ${liked ? 'liked' : 'not liked'} message ${message.id_message}`);
                message.likedByUser = liked;
              },
              error: (err) => {
                console.error(`Error checking if user has liked message ${message.id_message}:`, err);
                message.likedByUser = false;
              },
            });
          } else {
            console.log(`User ID not available yet for message ${message.id_message}, setting up watcher`);
            // If user ID is not available yet, set up a watcher to check again when it becomes available
            const checkInterval = setInterval(() => {
              if (this.id_user) {
                console.log(`User ID now available (${this.id_user}), checking like status for message ${message.id_message}`);
                this.service.hasUserLiked(message.id_message!, this.id_user).subscribe({
                  next: (liked) => {
                    console.log(`User ${this.id_user} has ${liked ? 'liked' : 'not liked'} message ${message.id_message}`);
                    message.likedByUser = liked;
                  },
                  error: (err) => {
                    console.error(`Error checking if user has liked message ${message.id_message}:`, err);
                    message.likedByUser = false;
                  },
                });
                clearInterval(checkInterval);
              }
            }, 500);
            // Clear interval after 5 seconds to prevent infinite checking
            setTimeout(() => clearInterval(checkInterval), 5000);
          }
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
      expediteurId: this.id_user, // Use the current user's ID
    };

    this.service.addMessage(message, this.id_user).subscribe({
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
          console.log("load comments for message:", comments);
          message.commentaires = comments;

          // Fetch user details for each comment
          message.commentaires.forEach(comment => {
            if (comment.auteurId) {
              this.userService.getUserById(comment.auteurId).subscribe({
                next: (user) => {
                  comment['userName'] = `${user.prenom} ${user.nom}`;
                  comment['userImage'] = user.image || 'assets/img/team-2-800x800.jpg';
                  comment['userRole'] = user.role;
                  comment['userCountry'] = user.country;
                },
                error: (err) => {
                  console.error(`Error getting user details for comment ${comment.id}:`, err);
                }
              });
            }
          });
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

     // Remplacer par l'ID réel de l'utilisateur

    this.service.addComment(messageId, this.id_user, contenu).subscribe({
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
    // Check if user ID is available
    if (!this.id_user) {
      console.error('Cannot like message: User ID is not available');
      return;
    }

    // Find the message that was clicked
    const message = this.messages.find(m => m.id_message === messageId);
    if (!message) {
      console.error(`Cannot like message: Message with ID ${messageId} not found`);
      return;
    }

    // Toggle the like state
    const isLike = !message.likedByUser;
    console.log(`User ${this.id_user} is ${isLike ? 'liking' : 'unliking'} message ${messageId}`);

    // Optimistically update the local UI state
    message.likedByUser = isLike;  // Toggle like/unlike
    message.likeCount = isLike ? (message.likeCount || 0) + 1 : Math.max(0, (message.likeCount || 0) - 1); // Adjust like count

    // Call the backend to update the like/unlike status
    console.log(`Sending ${isLike ? 'POST' : 'DELETE'} request for message ${messageId} by user ${this.id_user}`);
    this.service.likeMessage(messageId, this.id_user, isLike).subscribe({
      next: (response) => {
        // Success - the UI is already updated optimistically
        console.log(`Successfully ${isLike ? 'liked' : 'unliked'} message ${messageId}`, response);

        // Verify the like status after the action
        this.service.hasUserLiked(messageId, this.id_user).subscribe({
          next: (liked) => {
            console.log(`After ${isLike ? 'liking' : 'unliking'}, hasUserLiked returns: ${liked}`);
            if (liked !== isLike) {
              console.warn(`Like status mismatch: UI shows ${isLike} but server returns ${liked}`);
              // Update UI to match server state if there's a mismatch
              message.likedByUser = liked;
              message.likeCount = liked
                ? (message.likeCount || 0) + 1
                : Math.max(0, (message.likeCount || 0) - 1);
            }
          },
          error: (err) => console.error(`Error verifying like status after ${isLike ? 'liking' : 'unliking'}:`, err)
        });
      },
      error: (err) => {
        // Error - revert the UI to the previous state if the like/unlike action failed
        console.error(`Error while ${isLike ? 'liking' : 'unliking'} message ${messageId}:`, err);
        message.likedByUser = !isLike;  // Revert to the previous state
        message.likeCount = isLike ? Math.max(0, (message.likeCount || 0) - 1) : (message.likeCount || 0) + 1; // Revert the like count
      }
    });
  }


}

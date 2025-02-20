import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Message } from "src/app/core/models/Message";
import { MessageService } from "src/app/core/service/message.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
})
export class ProfileComponent implements OnInit {
  messages: Message[] = [];
  MessageForm: FormGroup;
  
  constructor(private service: MessageService, private fb: FormBuilder) {}

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
      },
      error: (error) => {
        console.error("Error fetching messages:", error);
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
      expediteurId: 2, // ID statique temporaire
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.MessageForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(controlName: string): string {
    return this.MessageForm.get(controlName)?.hasError('required')
      ? 'Ce champ est obligatoire'
      : '';
  }
}

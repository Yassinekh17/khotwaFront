import { Component } from '@angular/core';
import { GeminiService } from '../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  messages: {content: string, isUser: boolean}[] = [];
  userInput = '';
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private geminiService: GeminiService) {}

  async sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    // Ajout du message utilisateur
    this.messages.push({content: this.userInput, isUser: true});
    const prompt = this.userInput;
    this.userInput = '';
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const response = await this.geminiService.sendPrompt(prompt).toPromise();
      this.messages.push({
        content: response || "Je n'ai pas pu obtenir de réponse",
        isUser: false
      });
    } catch (error) {
      this.errorMessage = "Erreur de connexion au service AI";
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
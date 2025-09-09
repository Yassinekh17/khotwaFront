import { Component, Input, OnInit } from '@angular/core';
import { Evenement } from '../../services/event.service';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  @Input() event: Evenement | null = null;

  messages: ChatMessage[] = [];
  userInput: string = '';
  isOpen: boolean = false;
  isTyping: boolean = false;

  private messageId: number = 0;

  ngOnInit(): void {
    console.log('🤖 Chatbot component initialized');
    console.log('🤖 Event data:', this.event);
    this.addBotMessage('Bonjour ! Je suis l\'assistant virtuel pour cet événement. Comment puis-je vous aider ?');
  }

  toggleChat(): void {
    console.log('🤖 Toggle chat clicked, current state:', this.isOpen);
    this.isOpen = !this.isOpen;
    console.log('🤖 New state:', this.isOpen);
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    this.addUserMessage(userMessage);
    this.userInput = '';

    this.isTyping = true;

    // Simulate typing delay
    setTimeout(() => {
      this.processUserMessage(userMessage);
      this.isTyping = false;
    }, 1000);
  }

  private processUserMessage(message: string): void {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('lieu') || lowerMessage.includes('location') || lowerMessage.includes('où')) {
      this.addBotMessage(`L'événement "${this.event?.title}" se déroule à : ${this.event?.location}`);
    }
    else if (lowerMessage.includes('date') || lowerMessage.includes('quand') || lowerMessage.includes('horaire')) {
      const date = new Date(this.event?.date || '');
      this.addBotMessage(`L'événement est prévu le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
    }
    else if (lowerMessage.includes('replay') || lowerMessage.includes('enregistrement') || lowerMessage.includes('accès')) {
      if (this.isEventPassed()) {
        this.addBotMessage('L\'enregistrement de l\'événement sera disponible dans les 24h suivant la fin de l\'événement. Vous recevrez un email avec le lien d\'accès.');
      } else {
        this.addBotMessage('L\'événement n\'a pas encore eu lieu. L\'enregistrement sera disponible après l\'événement.');
      }
    }
    else if (lowerMessage.includes('inscription') || lowerMessage.includes('s\'inscrire') || lowerMessage.includes('register')) {
      this.addBotMessage('Pour vous inscrire à cet événement :\n1. Cliquez sur le bouton "S\'inscrire"\n2. Remplissez le formulaire avec vos informations\n3. Validez votre inscription\n\nVous recevrez une confirmation par email.');
    }
    else if (lowerMessage.includes('prix') || lowerMessage.includes('coût') || lowerMessage.includes('gratuit')) {
      this.addBotMessage('Cet événement est gratuit ! Aucune inscription payante n\'est requise.');
    }
    else if (lowerMessage.includes('capacité') || lowerMessage.includes('places') || lowerMessage.includes('participants')) {
      const available = (this.event?.capacite || 0) - (this.event?.currentParticipants || 0);
      this.addBotMessage(`Il reste ${available} places disponibles sur ${this.event?.capacite || 0} au total.`);
    }
    else {
      this.addBotMessage('Je peux vous aider avec :\n• Le lieu de l\'événement\n• La date et l\'horaire\n• L\'accès aux replays\n• La procédure d\'inscription\n• Les places disponibles\n\nPouvez-vous reformuler votre question ?');
    }
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      id: ++this.messageId,
      text,
      isUser: true,
      timestamp: new Date()
    });
  }

  private addBotMessage(text: string): void {
    this.messages.push({
      id: ++this.messageId,
      text,
      isUser: false,
      timestamp: new Date()
    });
  }

  private isEventPassed(): boolean {
    if (!this.event?.date) return false;
    const eventDate = new Date(this.event.date);
    const now = new Date();
    return eventDate < now;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
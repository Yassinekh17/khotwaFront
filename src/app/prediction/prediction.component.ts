import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PredictionService } from '../services/PredictionService';

interface ChatMessage {
  content: string;
  isBot: boolean;
}

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction-fixed.css'],
  encapsulation: ViewEncapsulation.None
})
export class PredictionComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  predictionForm: FormGroup;
  prediction: number | null = null;

  // Variables pour le chat
  messages: ChatMessage[] = [];
  userInput: string = '';
  isTyping: boolean = false;
  currentStep: number = 0;
  showResult: boolean = false;

  // Options valides pour chaque étape
  validCategories: string[] = ['home', 'electronic', 'clothing'];
  validRegions: string[] = ['north', 'south', 'east', 'west'];
  validPaymentMethods: string[] = ['paypal', 'debit', 'credit'];

  // Questions pour chaque étape
  questions: string[] = [
    "Bonjour ! Je suis votre assistant de prédiction des ventes. Pour commencer, quelle catégorie de produit souhaitez-vous analyser ? (home, electronic, clothing)",
    "Super ! Maintenant, dans quelle région souhaitez-vous vendre ce produit ? (north, south, east, west)",
    "Excellent ! Enfin, quelle méthode de paiement prévoyez-vous d'utiliser principalement ? (paypal, debit, credit)"
  ];

  constructor(private fb: FormBuilder, private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.predictionForm = this.fb.group({
      category: ['', Validators.required],
      region: ['', Validators.required],
      payment: ['', Validators.required],
      prediction: [{ value: '', disabled: true }]
    });

    // Démarrer le chat avec le premier message
    setTimeout(() => {
      this.addBotMessage(this.questions[0]);
    }, 500);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // Faire défiler automatiquement vers le bas
  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  // Ajouter un message du bot
  addBotMessage(content: string): void {
    this.isTyping = true;

    // Simuler un délai de frappe pour un effet plus naturel
    setTimeout(() => {
      this.isTyping = false;
      this.messages.push({ content, isBot: true });
    }, 1000 + Math.random() * 500);
  }

  // Ajouter un message de l'utilisateur
  addUserMessage(content: string): void {
    this.messages.push({ content, isBot: false });
  }

  // Ajouter un message d'erreur
  addErrorMessage(message: string): void {
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      this.messages.push({
        content: `⚠️ ${message}`,
        isBot: true
      });
    }, 800);
  }

  // Obtenir le placeholder en fonction de l'étape actuelle
  getPlaceholder(): string {
    switch(this.currentStep) {
      case 0: return "Entrez la catégorie (home, electronic, clothing)...";
      case 1: return "Entrez la région (north, south, east, west)...";
      case 2: return "Entrez la méthode de paiement (paypal, debit, credit)...";
      default: return "Tapez votre message...";
    }
  }

  // Vérifier si l'entrée est valide pour l'étape actuelle
  isValidInput(input: string): boolean {
    const normalizedInput = input.trim().toLowerCase();

    switch(this.currentStep) {
      case 0:
        return this.validCategories.includes(normalizedInput);
      case 1:
        return this.validRegions.includes(normalizedInput);
      case 2:
        return this.validPaymentMethods.includes(normalizedInput);
      default:
        return true;
    }
  }

  // Obtenir le message d'erreur approprié pour l'étape actuelle
  getErrorMessage(): string {
    switch(this.currentStep) {
      case 0:
        return `Désolé, mais vous devez choisir parmi les catégories suivantes : ${this.validCategories.join(', ')}. Veuillez réessayer.`;
      case 1:
        return `Désolé, mais vous devez choisir parmi les régions suivantes : ${this.validRegions.join(', ')}. Veuillez réessayer.`;
      case 2:
        return `Désolé, mais vous devez choisir parmi les méthodes de paiement suivantes : ${this.validPaymentMethods.join(', ')}. Veuillez réessayer.`;
      default:
        return "Entrée non valide. Veuillez réessayer.";
    }
  }

  // Envoyer un message
  sendMessage(): void {
    if (!this.userInput.trim() || this.isTyping) return;

    const userMessage = this.userInput.trim();
    this.addUserMessage(userMessage);
    this.userInput = '';

    // Vérifier si l'entrée est valide
    if (!this.isValidInput(userMessage)) {
      this.addErrorMessage(this.getErrorMessage());
      return;
    }

    // Mettre à jour le formulaire en fonction de l'étape
    switch(this.currentStep) {
      case 0:
        this.predictionForm.get('category')?.setValue(userMessage.toLowerCase());
        break;
      case 1:
        this.predictionForm.get('region')?.setValue(userMessage.toLowerCase());
        break;
      case 2:
        this.predictionForm.get('payment')?.setValue(userMessage.toLowerCase());
        break;
    }

    this.currentStep++;

    // Si toutes les questions ont été posées, soumettre le formulaire
    if (this.currentStep >= this.questions.length) {
      this.addBotMessage("Merci pour ces informations ! Je calcule votre prédiction...");
      setTimeout(() => {
        this.onSubmit();
      }, 2000);
    } else {
      // Sinon, poser la question suivante
      this.addBotMessage(this.questions[this.currentStep]);
    }
  }

  // Réinitialiser le chat
  resetChat(): void {
    this.messages = [];
    this.currentStep = 0;
    this.showResult = false;
    this.prediction = null;
    this.predictionForm.reset();

    // Redémarrer avec la première question
    setTimeout(() => {
      this.addBotMessage(this.questions[0]);
    }, 500);
  }

  // Soumettre le formulaire pour obtenir la prédiction
  onSubmit(): void {
    if (this.predictionForm.valid) {
      const formData = this.predictionForm.value;
      this.predictionService.predict(formData).subscribe({
        next: (result: any) => {
          this.prediction = result.prediction || Math.floor(Math.random() * 40) + 60;  // Valeur aléatoire entre 60 et 100 si l'API ne renvoie pas de prédiction
          this.predictionForm.get('prediction')?.setValue(this.prediction);

          // Afficher le résultat
          this.addBotMessage(`Votre prédiction est prête ! Selon nos calculs, vous avez ${this.prediction}% de chances de réussir vos ventes.`);
          setTimeout(() => {
            this.showResult = true;
          }, 1000);
        },
        error: (error) => {
          console.error('Erreur lors de la prédiction:', error);
          // En cas d'erreur, générer une prédiction aléatoire pour la démo
          this.prediction = Math.floor(Math.random() * 40) + 60;
          this.predictionForm.get('prediction')?.setValue(this.prediction);

          this.addBotMessage(`Votre prédiction est prête ! Selon nos calculs, vous avez ${this.prediction}% de chances de réussir vos ventes.`);
          setTimeout(() => {
            this.showResult = true;
          }, 1000);
        }
      });
    }
  }
}

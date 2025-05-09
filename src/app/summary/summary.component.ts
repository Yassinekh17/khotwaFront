import { Component } from '@angular/core';
import { SummaryService } from '../services/summary.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent {

  inputText: string = ''; // Texte saisi par l'utilisateur
  summary: string = '';   // Résumé généré par l'API
  errorMessage: string = ''; // Message d'erreur

  constructor(private summaryService: SummaryService) { }

  summarize() {
    if (this.inputText.trim() === '') {
      this.errorMessage = 'Veuillez saisir un texte à résumer.';
      return;
    }

    this.errorMessage = ''; // Réinitialiser le message d'erreur

    // Appeler le service pour obtenir le résumé
    this.summaryService.getSummary(this.inputText).subscribe(
      (response) => {
        this.summary = response;
        console.log(response); // Afficher le résumé
      },
      (error) => {
        this.errorMessage = 'Une erreur s\'est produite lors de la génération du résumé.';
        console.error(error);
      }
    );
  }
}
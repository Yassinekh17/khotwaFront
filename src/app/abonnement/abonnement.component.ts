import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbonnementService } from 'src/app/services/abonnement.service';
import { PlanAbonnement } from '../models/abonnement.model';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js'; // Importer Chart.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Pour générer des tableaux dans le PDF

@Component({
  selector: 'app-abonnement',
  templateUrl: './abonnement.component.html',
  styleUrls: ['./abonnement.component.css']
})
export class AbonnementComponent implements OnInit {
  abonnements: any;
  selectedPlan: string = ''; // Plan sélectionné pour filtrage
  color: string = 'light'; // Pour le thème du tableau
  sortDirection: string = 'asc'; // Ordre de tri : 'asc' ou 'desc'
  dropdownPopoverShow = false;
  suggestedPlan: PlanAbonnement | null = null; // Plan suggéré
  
 

  // Données pour le graphique en secteurs
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Mensuel', 'Trimestriel', 'Annuel'],
    datasets: [{
      data: [], // Les pourcentages seront calculés ici
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Couleurs du graphique
    }]
  };
  public pieChartType: ChartType = 'pie'; // Type de graphique
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Données pour le graphique en barres
  public barChartData: ChartData<'bar'> = {
    labels: ['Mensuel', 'Trimestriel', 'Annuel'],
    datasets: [{
      label: 'Prix moyen',
      data: [], // Les prix moyens seront calculés ici
      backgroundColor: '#EF4444', // Rouge
    }]
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  public barChartType: ChartType = 'bar';

  @ViewChild('btnDropdownRef', { static: false }) btnDropdownRef: ElementRef;

  constructor(
    private abonnementService: AbonnementService,
    private toastr: ToastrService
  ) { this.abonnements = [
    { id_abonnement: 1, date_debut: new Date(), date_fin: new Date(), plan: PlanAbonnement.MENSUEL, prix: 30 },
    { id_abonnement: 2, date_debut: new Date(), date_fin: new Date(), plan: PlanAbonnement.TRIMESTRIEL, prix: 80 },
    { id_abonnement: 3, date_debut: new Date(), date_fin: new Date(), plan: PlanAbonnement.ANNUEL, prix: 300 },
  ];}

  ngOnInit(): void {
    this.getAbonnements();
  }

  // Méthode pour récupérer tous les abonnements
  getAbonnements(): void {
    if (this.selectedPlan) {
      this.abonnementService.getAbonnementsByPlan(this.selectedPlan).subscribe(data => {
        this.abonnements = data;
        this.sortAbonnements();
        this.calculateChartData(); // Calculer les données du graphique
        this.calculatePriceData(); // Calculer les prix moyens
      });
    } else {
      this.abonnementService.getAbonnements().subscribe(data => {
        this.abonnements = data;
        this.sortAbonnements();
        this.calculateChartData(); // Calculer les données du graphique
        this.calculatePriceData(); // Calculer les prix moyens
      });
    }
  }

  // Méthode pour calculer les données du graphique en secteurs
  calculateChartData(): void {
    const counts = {
      MENSUEL: 0,
      TRIMESTRIEL: 0,
      ANNUEL: 0,
    };

    // Compter le nombre d'abonnements par plan
    this.abonnements.forEach((abonnement: any) => {
      counts[abonnement.plan]++;
    });

    // Mettre à jour les données du graphique
    this.pieChartData.datasets[0].data = [
      counts.MENSUEL,
      counts.TRIMESTRIEL,
      counts.ANNUEL,
    ];
  }

  // Méthode pour calculer les prix moyens
  calculatePriceData(): void {
    const totals = {
      MENSUEL: { count: 0, total: 0 },
      TRIMESTRIEL: { count: 0, total: 0 },
      ANNUEL: { count: 0, total: 0 },
    };

    // Calculer le total des prix par plan
    this.abonnements.forEach((abonnement: any) => {
      totals[abonnement.plan].count++;
      totals[abonnement.plan].total += abonnement.prix;
    });

    // Calculer les prix moyens
    this.barChartData.datasets[0].data = [
      totals.MENSUEL.total / totals.MENSUEL.count,
      totals.TRIMESTRIEL.total / totals.TRIMESTRIEL.count,
      totals.ANNUEL.total / totals.ANNUEL.count,
    ];
  }

  // Méthode appelée quand le filtre est changé
  onFilterChange(): void {
    this.getAbonnements();
  }

  // Méthode de tri des abonnements par prix
  sortAbonnements(): void {
    if (this.sortDirection === 'asc') {
      this.abonnements.sort((a: any, b: any) => a.prix - b.prix); // Tri ascendant
    } else {
      this.abonnements.sort((a: any, b: any) => b.prix - a.prix); // Tri descendant
    }
  }

  // Méthode pour changer la direction du tri
  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortAbonnements(); // Re-appliquer le tri
  }

  // Méthode pour activer/désactiver le dropdown
  toggleDropdown(event: Event): void {
    this.dropdownPopoverShow = !this.dropdownPopoverShow;
  }

  // Méthode pour sélectionner un plan d'abonnement
  onSelectPlan(plan: string): void {
    this.selectedPlan = plan;
    this.getAbonnements(); // Appliquer le filtre avec le plan sélectionné
    this.dropdownPopoverShow = false; // Fermer le dropdown
  }

  // Méthode pour supprimer un abonnement
  deleteAbonnement(id_abonnement: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      this.abonnementService.deleteAbonnement(id_abonnement).subscribe(
        () => {
          this.toastr.success('Abonnement supprimé avec succès !'); // Message de succès
          this.getAbonnements(); // Recharger la liste
        },
        error => {
          this.toastr.error('Erreur lors de la suppression de l\'abonnement.'); // Message d'erreur
          console.error('Erreur :', error);
        }
      );
    }
  }

  // Méthode pour télécharger la liste en PDF
  downloadPDF(): void {
    const doc = new jsPDF();

    // Titre du PDF
    doc.setFontSize(18);
    doc.text('Liste des Abonnements', 10, 10);

    // Données du tableau
    const data = this.abonnements.map((abonnement: any) => [
      abonnement.date_debut,
      abonnement.date_fin,
      abonnement.plan,
      abonnement.prix,
    ]);

    // En-têtes du tableau
    const headers = ['Date Début', 'Date Fin', 'Plan', 'Prix'];

    // Générer le tableau dans le PDF
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20, // Position verticale du tableau
    });

    // Télécharger le PDF
    doc.save('liste_abonnements.pdf');
  }
  // Méthode pour récupérer les abonnements triés par prix
getSortedAbonnements(sortDirection: string): void {
  this.abonnementService.getAbonnementsSortedByPrice(sortDirection).subscribe(data => {
    this.abonnements = data;
  });
}

// Méthode pour récupérer les statistiques
getStatistics(): void {
  this.abonnementService.getAbonnementStatistics().subscribe(data => {
    this.pieChartData.datasets[0].data = [
      data.counts.MENSUEL || 0,
      data.counts.TRIMESTRIEL || 0,
      data.counts.ANNUEL || 0,
    ];
    this.barChartData.datasets[0].data = [
      data.averagePrices.MENSUEL || 0,
      data.averagePrices.TRIMESTRIEL || 0,
      data.averagePrices.ANNUEL || 0,
    ];
  });
}
 // Fonction pour suggérer un plan
 suggestPlan(): void {
  const totalDepense = this.abonnements.reduce((sum, abonnement) => sum + abonnement.prix, 0);

  if (totalDepense >= 300) {
    this.suggestedPlan = PlanAbonnement.ANNUEL; // Si la dépense totale est élevée, suggérer un plan annuel
  } else if (totalDepense >= 100) {
    this.suggestedPlan = PlanAbonnement.TRIMESTRIEL; // Si la dépense est modérée, suggérer un plan trimestriel
  } else {
    this.suggestedPlan = PlanAbonnement.MENSUEL; // Sinon, suggérer un plan mensuel
  }
}



}
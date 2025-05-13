import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AbonnementService } from 'src/app/services/abonnement.service';
import { PlanAbonnement } from '../models/abonnement.model';
import { ToastrService } from 'ngx-toastr';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-abonnement',
  templateUrl: './abonnement.component.html',
  styleUrls: ['./abonnement.component.css']
})
export class AbonnementComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChartCanvas') pieChartCanvas: ElementRef;
  @ViewChild('barChartCanvas') barChartCanvas: ElementRef;

  private pieChart: Chart<'pie', number[], unknown>;
  private barChart: Chart<'bar', number[], unknown>;
  abonnements: any;
  selectedPlan: string = ''; // Plan sélectionné pour filtrage
  color: string = 'light'; // Pour le thème du tableau
  sortDirection: string = 'asc'; // Ordre de tri : 'asc' ou 'desc'
  dropdownPopoverShow = false;
  suggestedPlan: PlanAbonnement | null = null; // Plan suggéré
  showStatistics: boolean = false; // Pour afficher/masquer la section des statistiques



  // Données pour le graphique en secteurs
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Mensuel', 'Trimestriel', 'Annuel'],
    datasets: [{
      data: [], // Les pourcentages seront calculés ici
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Couleurs du graphique
      hoverBackgroundColor: ['#FF8C9E', '#6CBBF5', '#FFE07F'],
      borderWidth: 1,
      borderColor: '#fff'
    }]
  };
  public pieChartType: ChartType = 'pie'; // Type de graphique
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  // Données pour le graphique en barres
  public barChartData: ChartData<'bar'> = {
    labels: ['Mensuel', 'Trimestriel', 'Annuel'],
    datasets: [{
      label: 'Prix moyen',
      data: [], // Les prix moyens seront calculés ici
      backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)'],
      borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)'],
      borderWidth: 1,
      hoverBackgroundColor: ['rgba(255, 99, 132, 0.9)', 'rgba(54, 162, 235, 0.9)', 'rgba(255, 206, 86, 0.9)'],
    }]
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
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

  ngAfterViewInit(): void {
    // Les canvas sont maintenant disponibles
    if (this.showStatistics) {
      this.initCharts();
    }
  }

  private initCharts(): void {
    setTimeout(() => {
      if (!this.pieChartCanvas || !this.barChartCanvas) {
        console.error('Canvas elements not found');
        return;
      }

      // Détruire les graphiques existants s'ils existent
      if (this.pieChart) {
        this.pieChart.destroy();
      }
      if (this.barChart) {
        this.barChart.destroy();
      }

      // Données pour le graphique en secteurs
      const pieData = {
        labels: ['Mensuel', 'Trimestriel', 'Annuel'],
        datasets: [{
          data: [
            this.getPlanCount('MENSUEL'),
            this.getPlanCount('TRIMESTRIEL'),
            this.getPlanCount('ANNUEL')
          ],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF8C9E', '#6CBBF5', '#FFE07F'],
          borderWidth: 1,
          borderColor: '#fff'
        }]
      };

      // Options pour le graphique en secteurs
      const pieOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              padding: 20,
              boxWidth: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 10
          }
        }
      };

      // Initialiser le graphique en secteurs
      this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
        type: 'pie',
        data: pieData,
        options: pieOptions
      });

      // Données pour le graphique en barres
      const barData = {
        labels: ['Mensuel', 'Trimestriel', 'Annuel'],
        datasets: [{
          label: 'Prix moyen',
          data: [
            this.getPlanAveragePrice('MENSUEL'),
            this.getPlanAveragePrice('TRIMESTRIEL'),
            this.getPlanAveragePrice('ANNUEL')
          ],
          backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)'],
          borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)'],
          borderWidth: 1
        }]
      };

      // Options pour le graphique en barres
      const barOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      };

      // Initialiser le graphique en barres
      this.barChart = new Chart(this.barChartCanvas.nativeElement, {
        type: 'bar',
        data: barData,
        options: barOptions
      });
    }, 100); // Petit délai pour s'assurer que le DOM est prêt
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
    if (!this.abonnements || this.abonnements.length === 0) {
      this.pieChartData.datasets[0].data = [0, 0, 0];
      return;
    }

    const counts = {
      MENSUEL: 0,
      TRIMESTRIEL: 0,
      ANNUEL: 0,
    };

    // Compter le nombre d'abonnements par plan
    this.abonnements.forEach((abonnement: any) => {
      if (abonnement.plan && counts.hasOwnProperty(abonnement.plan)) {
        counts[abonnement.plan]++;
      }
    });

    // Mettre à jour les données du graphique
    this.pieChartData.datasets[0].data = [
      counts.MENSUEL,
      counts.TRIMESTRIEL,
      counts.ANNUEL,
    ];

    // Mettre à jour les labels avec les pourcentages
    const total = counts.MENSUEL + counts.TRIMESTRIEL + counts.ANNUEL;
    if (total > 0) {
      this.pieChartData.labels = [
        `Mensuel (${Math.round(counts.MENSUEL / total * 100)}%)`,
        `Trimestriel (${Math.round(counts.TRIMESTRIEL / total * 100)}%)`,
        `Annuel (${Math.round(counts.ANNUEL / total * 100)}%)`,
      ];
    }
  }

  // Méthode pour calculer les prix moyens
  calculatePriceData(): void {
    if (!this.abonnements || this.abonnements.length === 0) {
      this.barChartData.datasets[0].data = [0, 0, 0];
      return;
    }

    const totals = {
      MENSUEL: { count: 0, total: 0 },
      TRIMESTRIEL: { count: 0, total: 0 },
      ANNUEL: { count: 0, total: 0 },
    };

    // Calculer le total des prix par plan
    this.abonnements.forEach((abonnement: any) => {
      if (abonnement.plan && totals.hasOwnProperty(abonnement.plan) && typeof abonnement.prix === 'number') {
        totals[abonnement.plan].count++;
        totals[abonnement.plan].total += abonnement.prix;
      }
    });

    // Calculer les prix moyens avec gestion des divisions par zéro
    this.barChartData.datasets[0].data = [
      totals.MENSUEL.count > 0 ? Math.round(totals.MENSUEL.total / totals.MENSUEL.count) : 0,
      totals.TRIMESTRIEL.count > 0 ? Math.round(totals.TRIMESTRIEL.total / totals.TRIMESTRIEL.count) : 0,
      totals.ANNUEL.count > 0 ? Math.round(totals.ANNUEL.total / totals.ANNUEL.count) : 0,
    ];
  }

  // Méthode pour afficher les statistiques
  getStatistics(): void {
    console.log('getStatistics called');

    // Afficher la section des statistiques
    this.showStatistics = true;
    console.log('showStatistics set to:', this.showStatistics);

    // Calculer les données des graphiques
    setTimeout(() => {
      console.log('Initializing charts');
      this.initCharts();
    }, 300); // Délai pour permettre au DOM de se mettre à jour
  }

  // Méthode pour masquer les statistiques
  hideStatistics(): void {
    this.showStatistics = false;

    // Détruire les graphiques pour libérer les ressources
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = null;
    }
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

  // Méthode pour changer la direction du tri et trier les abonnements
  getSortedAbonnements(direction: string): void {
    this.sortDirection = direction === 'asc' ? 'desc' : 'asc';
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

  // Méthode pour calculer le revenu total
  getTotalRevenue(): number {
    if (!this.abonnements || this.abonnements.length === 0) {
      return 0;
    }

    return this.abonnements.reduce((total: number, abonnement: any) => {
      return total + (abonnement.prix || 0);
    }, 0);
  }

  // Méthode pour obtenir le plan le plus populaire
  getMostPopularPlan(): string {
    if (!this.abonnements || this.abonnements.length === 0) {
      return 'Aucun';
    }

    const counts = {
      MENSUEL: 0,
      TRIMESTRIEL: 0,
      ANNUEL: 0,
    };

    // Compter le nombre d'abonnements par plan
    this.abonnements.forEach((abonnement: any) => {
      counts[abonnement.plan]++;
    });

    // Trouver le plan avec le plus grand nombre
    let maxCount = 0;
    let mostPopularPlan = 'Aucun';

    for (const plan in counts) {
      if (counts[plan] > maxCount) {
        maxCount = counts[plan];
        mostPopularPlan = plan;
      }
    }

    return mostPopularPlan;
  }

  // Méthode pour obtenir le nombre d'abonnements par plan
  getPlanCount(plan: string): number {
    if (!this.abonnements || this.abonnements.length === 0) {
      return 0;
    }

    return this.abonnements.filter((abonnement: any) => abonnement.plan === plan).length;
  }

  // Méthode pour obtenir le pourcentage d'abonnements par plan
  getPlanPercentage(plan: string): number {
    if (!this.abonnements || this.abonnements.length === 0) {
      return 0;
    }

    const count = this.getPlanCount(plan);
    return Math.round((count / this.abonnements.length) * 100);
  }

  // Méthode pour obtenir le prix moyen par plan
  getPlanAveragePrice(plan: string): number {
    if (!this.abonnements || this.abonnements.length === 0) {
      return 0;
    }

    const planAbonnements = this.abonnements.filter((abonnement: any) => abonnement.plan === plan);
    if (planAbonnements.length === 0) {
      return 0;
    }

    const totalPrice = planAbonnements.reduce((total: number, abonnement: any) => {
      return total + (abonnement.prix || 0);
    }, 0);

    return Math.round(totalPrice / planAbonnements.length);
  }

  // Méthode pour obtenir le pourcentage du prix par rapport au prix maximum
  getPlanPricePercentage(plan: string): number {
    const avgPrice = this.getPlanAveragePrice(plan);

    // Calculer le prix maximum parmi tous les plans
    const maxPrice = Math.max(
      this.getPlanAveragePrice('MENSUEL'),
      this.getPlanAveragePrice('TRIMESTRIEL'),
      this.getPlanAveragePrice('ANNUEL')
    );

    if (maxPrice === 0) {
      return 0;
    }

    return Math.round((avgPrice / maxPrice) * 100);
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




}
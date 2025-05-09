import { Component, OnInit } from '@angular/core';
import { EventService, Evenement, Status_evenement } from '../../../services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listevent',
  templateUrl: './listevent.component.html',
  styleUrls: ['./listevent.component.css']
})
export class ListeventComponent implements OnInit {
  events: Evenement[] = [];
  filteredEvents: Evenement[] = [];
  loading: boolean = true;
  error: string | null = null;

  currentIndex: number = 0;  // Pour suivre l'index actuel des événements affichés
  eventsPerPage: number = 5; // Nombre d'événements affichés par page

  eventCategories: string[] = ['Conférence', 'Atelier', 'Séminaire', 'Formation', 'Networking'];
  currentFilter: string = 'all';

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.filteredEvents = [...this.events];
        this.loading = false;
        
        // Extraire les catégories uniques des événements
        this.updateEventCategories();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des événements: ' + err.message;
        this.loading = false;
      }
    });
  }

  // Nouvelle méthode pour extraire les catégories des événements
  updateEventCategories(): void {
    // Récupérer tous les types uniques des événements
    const uniqueTypes = [...new Set(this.events.map(event => event.type))];
    
    // Si nous avons des types, utilisons-les comme catégories
    if (uniqueTypes.length > 0) {
      this.eventCategories = uniqueTypes;
      console.log('Catégories mises à jour:', this.eventCategories);
    }
  }

  // Classe pour le statut d'un événement
  getStatusClass(status: Status_evenement): string {
    switch (status) {
      case Status_evenement.UPCOMING:
        return 'bg-yellow-500';
      case Status_evenement.ONGOING:
        return 'bg-green-500';
      case Status_evenement.COMPLETED:
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  }

  // Format de la date
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  // Navigation vers la page précédente
  navigateLeft(): void {
    if (this.currentIndex > 0) {
      this.currentIndex -= this.eventsPerPage;
      if (this.currentIndex < 0) this.currentIndex = 0;
    }
  }

  // Navigation vers la page suivante
  navigateRight(): void {
    const maxIndex = Math.max(0, this.filteredEvents.length - this.eventsPerPage);
    if (this.currentIndex < maxIndex) {
      this.currentIndex += this.eventsPerPage;
      if (this.currentIndex > maxIndex) this.currentIndex = maxIndex;
    }
  }

  // Obtenir le numéro de page courante
  currentPage(): number {
    return Math.floor(this.currentIndex / this.eventsPerPage);
  }

  // Générer un tableau pour l'affichage des points de navigation
  getPageArray(): number[] {
    const pageCount = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
    return Array(pageCount).fill(0).map((_, i) => i);
  }

  // Aller à une page spécifique
  goToPage(pageIndex: number): void {
    this.currentIndex = pageIndex * this.eventsPerPage;
  }

  // Nouvelle méthode pour naviguer vers la page de détails d'un événement
  viewEventDetails(eventId: number): void {
    if (eventId) {
      // Utilise la navigation programmatique au lieu de routerLink
      this.router.navigate(['/events', eventId]);
    } else {
      this.error = "Impossible d'accéder aux détails de cet événement.";
    }
  }

  searchEvents(event: any): void {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    // Si le terme de recherche est vide, réappliquer le filtre par catégorie
    if (!searchTerm) {
      this.filterByCategory(this.currentFilter);
      return;
    }
    
    // Filtrer d'abord par catégorie si nécessaire
    let baseList = this.currentFilter === 'all' 
      ? [...this.events] 
      : this.events.filter(event => event.type === this.currentFilter);
    
    // Filtrer uniquement par titre pour une recherche plus précise
    this.filteredEvents = baseList.filter(event => 
      event.title.toLowerCase().includes(searchTerm)
    );
    
    // Réinitialiser l'index de pagination
    this.currentIndex = 0;
  }

  sortEvents(event: any): void {
    const sortBy = event.target.value;
    
    switch(sortBy) {
      case 'date':
        this.filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'title':
        this.filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popularity':
        this.filteredEvents.sort((a, b) => (b.currentParticipants || 0) - (a.currentParticipants || 0));
        break;
      default:
        break;
    }
  }

  filterByCategory(category: string): void {
    this.currentFilter = category;
    
    if (category === 'all') {
      this.filteredEvents = [...this.events];
    } else {
      // Ajoutons un log pour voir les types d'événements disponibles
      console.log('Types disponibles:', this.events.map(e => e.type));
      
      // Filtrer les événements dont le type correspond à la catégorie sélectionnée
      // Utilisons includes() au lieu de === pour une correspondance partielle
      this.filteredEvents = this.events.filter(event => 
        event.type.toLowerCase().includes(category.toLowerCase()) || 
        category.toLowerCase().includes(event.type.toLowerCase())
      );
    }
    
    // Ajoutons un log pour voir combien d'événements ont été trouvés
    console.log(`Filtrage par "${category}": ${this.filteredEvents.length} événements trouvés`);
    
    // Réinitialiser l'index de pagination quand on change de catégorie
    this.currentIndex = 0;
  }
}







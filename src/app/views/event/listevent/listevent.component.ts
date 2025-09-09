import { Component, OnInit } from '@angular/core';
import { EventService, Evenement, Status_evenement } from '../../../services/event.service';
import { Router } from '@angular/router';
import { FavoritesService } from '../../../services/favorites.service';
import { ImageUploadService } from '../../../services/image-upload.service';

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
    private router: Router,
    private imageUploadService: ImageUploadService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    // Debug localStorage content
    this.imageUploadService.debugLocalStorage();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        console.log('Événements récupérés du backend:', data);
        console.log('Technologies des événements:', data.map(e => ({ title: e.title, technologie: e.technologie, type: e.type })));
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
    // Récupérer toutes les technologies uniques des événements
    const uniqueTechnologies = [...new Set(this.events.map(event => event.technologie).filter((tech): tech is string => tech !== undefined && tech !== null && tech.trim() !== ''))];

    console.log('Technologies trouvées dans les événements:', uniqueTechnologies);

    // Utiliser uniquement les technologies comme catégories de filtrage
    // Les statuts (upcoming, ongoing, completed) sont gérés séparément dans le template
    if (uniqueTechnologies.length > 0) {
      this.eventCategories = uniqueTechnologies;
      console.log('Catégories mises à jour avec les technologies:', this.eventCategories);
    } else {
      // Si pas de technologies, utiliser une liste vide
      this.eventCategories = [];
      console.log('Aucune technologie trouvée, liste vide');
    }

    console.log('Catégories finales disponibles:', this.eventCategories);
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

  // Method to get the correct image source (handles stored images)
  getEventImageUrl(event: Evenement): string {
    console.log('📋 getEventImageUrl appelée pour événement:', event.title);
    console.log('🔗 URL de l\'image dans l\'événement:', event.imageUrl);

    if (!event?.imageUrl) {
      console.log('⚠️ Aucune URL d\'image dans l\'événement, utilisation de l\'image par défaut');
      return '../../../../assets/img/landing.jpg';
    }

    const result = this.imageUploadService.getImageSource(event.imageUrl);
    console.log('🎯 URL finale retournée:', result);
    return result;
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
    console.log('=== DÉBUT FILTRAGE ===');
    console.log('Catégorie sélectionnée:', category);
    console.log('Nombre total d\'événements:', this.events.length);

    this.currentFilter = category;

    if (category === 'all') {
      this.filteredEvents = [...this.events];
      console.log('Filtrage "all": tous les événements affichés');
    } else {
      // Déterminer si c'est une technologie ou un statut
      const isStatus = this.isStatusFilter(category);
      console.log('Type de filtre:', isStatus ? 'STATUT' : 'TECHNOLOGIE');

      const beforeFilter = this.events.length;
      this.filteredEvents = this.events.filter(event => {
        let matches = false;

        if (isStatus) {
          // Filtrage par statut
          matches = !!(event.status && event.status.toLowerCase() === category.toLowerCase());
          console.log(`Événement "${event.title}": statut=${event.status}, filtre=${category}, correspond=${matches}`);
        } else {
          // Filtrage par technologie
          const hasTechnologie = event.technologie && event.technologie.trim() !== '';
          matches = !!(hasTechnologie && (
            event.technologie!.toLowerCase().includes(category.toLowerCase()) ||
            category.toLowerCase().includes(event.technologie!.toLowerCase())
          ));
          console.log(`Événement "${event.title}": technologie=${event.technologie}, filtre=${category}, correspond=${matches}`);
        }

        return matches;
      });

      console.log(`Avant filtrage: ${beforeFilter} événements`);
      console.log(`Après filtrage: ${this.filteredEvents.length} événements`);
    }

    // Log pour voir combien d'événements ont été trouvés
    console.log(`=== FIN FILTRAGE ===`);
    console.log(`Filtrage par "${category}": ${this.filteredEvents.length} événements trouvés`);

    // Réinitialiser l'index de pagination quand on change de catégorie
    this.currentIndex = 0;
  }

  // Méthode pour déterminer si le filtre est un statut ou une technologie
  private isStatusFilter(filter: string): boolean {
    const statusValues = ['upcoming', 'ongoing', 'completed'];
    return statusValues.includes(filter.toLowerCase());
  }

  // Favorites methods
  toggleFavorite(eventId: number): void {
    this.favoritesService.toggleFavorite(eventId);
  }

  isFavorite(eventId: number): boolean {
    return this.favoritesService.isFavorite(eventId);
  }

  // Technology styling methods
  getTechButtonStyle(tech: string, isActive: boolean): string {
    if (isActive) {
      return this.getTechActiveStyle(tech);
    } else {
      return this.getTechInactiveStyle(tech);
    }
  }

  private getTechActiveStyle(tech: string): string {
    const styles: { [key: string]: string } = {
      'React': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg',
      'Angular': 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg',
      'Vue.js': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
      'Node.js': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
      'Python': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg',
      'Java': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg',
      'JavaScript': 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg',
      'TypeScript': 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg',
      'PHP': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg',
      'C#': 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg',
      '.NET': 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg',
      'Spring Boot': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
      'Django': 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg',
      'Flask': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg',
      'Express.js': 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg',
      'MongoDB': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
      'PostgreSQL': 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg',
      'MySQL': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg',
      'Docker': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
      'Kubernetes': 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg',
      'AWS': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg',
      'Azure': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
      'DevOps': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg',
      'Machine Learning': 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg',
      'Data Science': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg',
      'Cybersecurity': 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg',
      'Blockchain': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg',
      'Mobile Development': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg',
      'Web Development': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
      'Backend Development': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
      'Frontend Development': 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg',
      'Full Stack': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg',
      'Autres': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
    };
    return styles[tech] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg';
  }

  private getTechInactiveStyle(tech: string): string {
    const styles: { [key: string]: string } = {
      'React': 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md border border-blue-200',
      'Angular': 'bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-md border border-red-200',
      'Vue.js': 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md border border-green-200',
      'Node.js': 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md border border-green-200',
      'Python': 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:shadow-md border border-yellow-200',
      'Java': 'bg-orange-50 text-orange-700 hover:bg-orange-100 hover:shadow-md border border-orange-200',
      'JavaScript': 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:shadow-md border border-yellow-200',
      'TypeScript': 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md border border-blue-200',
      'PHP': 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:shadow-md border border-purple-200',
      'C#': 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md border border-green-200',
      '.NET': 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:shadow-md border border-purple-200',
      'Spring Boot': 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md border border-green-200',
      'Django': 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md border border-green-200',
      'Flask': 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200',
      'Express.js': 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200',
      'MongoDB': 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md border border-green-200',
      'PostgreSQL': 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md border border-blue-200',
      'MySQL': 'bg-orange-50 text-orange-700 hover:bg-orange-100 hover:shadow-md border border-orange-200',
      'Docker': 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md border border-blue-200',
      'Kubernetes': 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md border border-blue-200',
      'AWS': 'bg-orange-50 text-orange-700 hover:bg-orange-100 hover:shadow-md border border-orange-200',
      'Azure': 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md border border-blue-200',
      'DevOps': 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:shadow-md border border-indigo-200',
      'Machine Learning': 'bg-pink-50 text-pink-700 hover:bg-pink-100 hover:shadow-md border border-pink-200',
      'Data Science': 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:shadow-md border border-purple-200',
      'Cybersecurity': 'bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-md border border-red-200',
      'Blockchain': 'bg-orange-50 text-orange-700 hover:bg-orange-100 hover:shadow-md border border-orange-200',
      'Mobile Development': 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:shadow-md border border-purple-200',
      'Web Development': 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md border border-blue-200',
      'Backend Development': 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md border border-green-200',
      'Frontend Development': 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:shadow-md border border-cyan-200',
      'Full Stack': 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:shadow-md border border-indigo-200',
      'Autres': 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200'
    };
    return styles[tech] || 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200';
  }

  getTechIcon(tech: string): string {
    const icons: { [key: string]: string } = {
      'React': 'fab fa-react',
      'Angular': 'fab fa-angular',
      'Vue.js': 'fab fa-vuejs',
      'Node.js': 'fab fa-node-js',
      'Python': 'fab fa-python',
      'Java': 'fab fa-java',
      'JavaScript': 'fab fa-js-square',
      'TypeScript': 'fab fa-js-square',
      'PHP': 'fab fa-php',
      'C#': 'fas fa-code',
      '.NET': 'fab fa-microsoft',
      'Spring Boot': 'fas fa-leaf',
      'Django': 'fas fa-code',
      'Flask': 'fas fa-flask',
      'Express.js': 'fas fa-server',
      'MongoDB': 'fas fa-database',
      'PostgreSQL': 'fas fa-database',
      'MySQL': 'fas fa-database',
      'Docker': 'fab fa-docker',
      'Kubernetes': 'fas fa-dharmachakra',
      'AWS': 'fab fa-aws',
      'Azure': 'fab fa-microsoft',
      'DevOps': 'fas fa-server',
      'Machine Learning': 'fas fa-brain',
      'Data Science': 'fas fa-chart-line',
      'Cybersecurity': 'fas fa-shield-alt',
      'Blockchain': 'fas fa-link',
      'Mobile Development': 'fas fa-mobile-alt',
      'Web Development': 'fas fa-globe',
      'Backend Development': 'fas fa-server',
      'Frontend Development': 'fas fa-desktop',
      'Full Stack': 'fas fa-layer-group',
      'Autres': 'fas fa-code'
    };
    return icons[tech] || 'fas fa-code';
  }

  getTechIconColor(tech: string): string {
    const colors: { [key: string]: string } = {
      'React': 'text-blue-600',
      'Angular': 'text-red-600',
      'Vue.js': 'text-green-600',
      'Node.js': 'text-green-600',
      'Python': 'text-yellow-600',
      'Java': 'text-orange-600',
      'JavaScript': 'text-yellow-600',
      'TypeScript': 'text-blue-600',
      'PHP': 'text-purple-600',
      'C#': 'text-green-600',
      '.NET': 'text-purple-600',
      'Spring Boot': 'text-green-600',
      'Django': 'text-green-600',
      'Flask': 'text-gray-600',
      'Express.js': 'text-gray-600',
      'MongoDB': 'text-green-600',
      'PostgreSQL': 'text-blue-600',
      'MySQL': 'text-orange-600',
      'Docker': 'text-blue-600',
      'Kubernetes': 'text-blue-600',
      'AWS': 'text-orange-600',
      'Azure': 'text-blue-600',
      'DevOps': 'text-indigo-600',
      'Machine Learning': 'text-pink-600',
      'Data Science': 'text-purple-600',
      'Cybersecurity': 'text-red-600',
      'Blockchain': 'text-orange-600',
      'Mobile Development': 'text-purple-600',
      'Web Development': 'text-blue-600',
      'Backend Development': 'text-green-600',
      'Frontend Development': 'text-cyan-600',
      'Full Stack': 'text-indigo-600',
      'Autres': 'text-gray-600'
    };
    return colors[tech] || 'text-gray-600';
  }
}







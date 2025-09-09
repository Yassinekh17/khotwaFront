import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EventService, Evenement } from '../../../services/event.service';
import { LocalInscriptionService, LocalInscription } from '../../../services/local-inscription.service';
import { InscriptionService } from '../../../services/inscription.service';
import { CertificationService } from '../../../services/certification.service';

interface RegisteredEvent extends Evenement {
  registrationDate: string;
  image?: string;
  inscriptionId?: number;
  userInfo?: {
    nom: string;
    email: string;
    telephone: string;
  };
}

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html'
})
export class MyEventsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  registeredEvents: RegisteredEvent[] = [];
  filteredEvents: RegisteredEvent[] = [];
  loading = false;
  error: string | null = null;

  // Search and Filter properties
  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';
  selectedLocation = '';
  selectedDate = '';
  selectedSort = 'date-desc';

  // Filter options
  categories: string[] = [];
  locations: string[] = [];
  sortOptions = [
    { value: 'date-desc', label: 'Date (récent)' },
    { value: 'date-asc', label: 'Date (ancien)' },
    { value: 'title-asc', label: 'Titre (A-Z)' },
    { value: 'title-desc', label: 'Titre (Z-A)' },
    { value: 'status', label: 'Statut' }
  ];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;

  constructor(
    private eventService: EventService,
    private localInscriptionService: LocalInscriptionService,
    private inscriptionService: InscriptionService,
    private certificationService: CertificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRegisteredEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRegisteredEvents(): void {
    this.loading = true;
    this.error = null;

    console.log('📋 [MyEvents] Chargement des événements inscrits depuis backend et localStorage...');

    // Charger depuis le service d'inscription (backend + localStorage)
    this.inscriptionService.getUserInscriptions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (inscriptions: any[]) => {
        console.log('✅ [MyEvents] Inscriptions récupérées:', inscriptions);

        if (inscriptions && inscriptions.length > 0) {
          this.registeredEvents = inscriptions.map((insc: any) => ({
            ...insc.evenement,
            registrationDate: insc.dateInscription,
            inscriptionId: insc.inscriptionId,
            userInfo: {
              nom: insc.nom,
              email: insc.email,
              telephone: insc.telephone
            }
          }));

          console.log('📋 [MyEvents] Événements inscrits chargés:', this.registeredEvents.length);
          console.log('📋 [MyEvents] Détails des événements:', this.registeredEvents.map(e => ({
            id: e.eventId,
            title: e.title,
            status: e.status,
            registrationDate: e.registrationDate
          })));

          // Initialize filters and apply them
          this.initializeFilters();
          this.applyFilters();
        } else {
          console.log('📋 [MyEvents] Aucune inscription trouvée');
          this.registeredEvents = [];
          this.filteredEvents = [];
          this.error = 'Aucun événement trouvé. Veuillez vous inscrire à des événements d\'abord.';
        }

        this.loading = false;
        console.log('✅ [MyEvents] Chargement terminé avec succès');
      },
      error: (error) => {
        console.error('❌ [MyEvents] Erreur lors du chargement des inscriptions:', error);
        this.error = 'Erreur lors du chargement des événements inscrits.';
        this.loading = false;

        // Fallback to local storage if service fails
        console.log('🔄 [MyEvents] Fallback vers localStorage');
        this.loadFromLocalStorage();
      }
    });
  }

  private loadFromLocalStorage(): void {
    const localInscriptions = this.localInscriptionService.getAllInscriptions();
    console.log('📋 [MyEvents] Inscriptions locales trouvées:', localInscriptions.length);

    if (localInscriptions && localInscriptions.length > 0) {
      this.registeredEvents = localInscriptions.map((insc: LocalInscription) => ({
        ...insc.event,
        registrationDate: insc.registrationDate.toISOString()
      }));

      console.log('📋 [MyEvents] Événements inscrits chargés depuis localStorage:', this.registeredEvents.length);
      console.log('📋 [MyEvents] Détails des événements:', this.registeredEvents.map(e => ({
        id: e.eventId,
        title: e.title,
        status: e.status,
        registrationDate: e.registrationDate
      })));

      // Initialize filters and apply them
      this.initializeFilters();
      this.applyFilters();
    } else {
      console.log('📋 [MyEvents] Aucune inscription trouvée');
      this.registeredEvents = [];
      this.filteredEvents = [];
      this.error = 'Aucun événement trouvé. Veuillez vous inscrire à des événements d\'abord.';
    }

    this.loading = false;
  }

  getCompletedEvents(): RegisteredEvent[] {
    return this.registeredEvents.filter(event => event.status === 'COMPLETED');
  }

  getOngoingEvents(): RegisteredEvent[] {
    const now = new Date();
    return this.registeredEvents.filter(event => {
      if (event.status === 'ONGOING') return true;

      // Check if current date is between start and end dates
      const eventDate = new Date(event.date);
      return eventDate <= now;
    });
  }

  getUpcomingEvents(): RegisteredEvent[] {
    const now = new Date();
    return this.registeredEvents.filter(event => {
      if (event.status === 'UPCOMING') return true;

      // Check if event is in the future
      const eventDate = new Date(event.date);
      return eventDate > now;
    });
  }

  getCompletedEventsCount(): number {
    return this.getCompletedEvents().length;
  }

  getOngoingEventsCount(): number {
    return this.getOngoingEvents().length;
  }

  getUpcomingEventsCount(): number {
    return this.getUpcomingEvents().length;
  }


  formatRegistrationDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  refreshEvents(): void {
    this.loadRegisteredEvents();
  }

  viewEventDetails(eventId: number): void {
    // Navigate to event details page
    console.log('View event details:', eventId);
  }

  markEventAsCompleted(event: RegisteredEvent): void {
    // Update event status to completed
    if (event.status) {
      event.status = 'COMPLETED' as any;
    }
    // You might want to call an API to update the status on the server
    console.log('Marked event as completed:', event.title);
  }

  debugInscriptions(): void {
    console.log('Current inscriptions:', this.registeredEvents);
    this.localInscriptionService.logAllInscriptions();
  }

  forceReload(): void {
    this.loadRegisteredEvents();
  }

  clearAllInscriptions(): void {
    this.localInscriptionService.clearAllInscriptions();
    this.registeredEvents = [];
    this.error = null;
  }

  navigateToEvents(): void {
    this.router.navigate(['/events']);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Search and Filter Methods
  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.selectedLocation = '';
    this.selectedDate = '';
    this.selectedSort = 'date-desc';
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.registeredEvents];

    // Search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(event => this.getEventStatus(event) === this.selectedStatus);
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(event =>
        event.technologie === this.selectedCategory || event.type === this.selectedCategory
      );
    }

    // Location filter
    if (this.selectedLocation) {
      filtered = filtered.filter(event => event.location === this.selectedLocation);
    }

    // Date filter
    if (this.selectedDate) {
      const filterDate = new Date(this.selectedDate);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.selectedSort) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'status':
          return this.getEventStatus(a).localeCompare(this.getEventStatus(b));
        default:
          return 0;
      }
    });

    this.filteredEvents = filtered;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  private getEventStatus(event: RegisteredEvent): string {
    if (event.status) return event.status;

    const now = new Date();
    const eventDate = new Date(event.date);

    if (eventDate < now) return 'COMPLETED';
    if (eventDate.toDateString() === now.toDateString()) return 'ONGOING';
    return 'UPCOMING';
  }

  // Pagination Methods
  getCurrentPageEvents(): RegisteredEvent[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredEvents.slice(startIndex, endIndex);
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Helper Methods
  getEventStatusLabel(event: RegisteredEvent): string {
    const status = this.getEventStatus(event);
    switch (status) {
      case 'COMPLETED': return 'Terminé';
      case 'ONGOING': return 'En cours';
      case 'UPCOMING': return 'À venir';
      default: return 'Inconnu';
    }
  }

  getStars(rating: number): number[] {
    const stars: number[] = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    if (rating % 1 !== 0) {
      stars.push(0.5);
    }
    return stars;
  }

  // Generate user-friendly gradient colors for event cards
  getEventGradient(index: number): string {
    const gradients = [
      '#667EEA, #764BA2', // Soft purple to blue
      '#F093FB, #F5576C', // Soft pink to coral
      '#4FACFE, #00F2FE', // Soft blue to cyan
      '#43E97B, #38F9D7', // Soft green to mint
      '#FA709A, #FEE140', // Soft pink to yellow
      '#A8E6CF, #DCEDC1', // Soft mint to light green
      '#FFD3A5, #FD6585', // Soft peach to pink
      '#C2E9FB, #A1C4FD'  // Soft blue to light blue
    ];
    return gradients[index % gradients.length];
  }


  // Download certificate for an event
  downloadCertificate(event: RegisteredEvent): void {
    console.log('📄 [MyEvents] Téléchargement du certificat pour:', event.title);

    // Get user name from event userInfo (from inscription data)
    const studentName = event.userInfo?.nom || 'Participant';

    console.log('👤 [MyEvents] Nom du participant:', studentName);

    // Use the certification service to download the certificate
    this.certificationService.downloadCertificate(event, studentName);

    console.log('✅ [MyEvents] Certificat généré et téléchargé');
  }

  // Initialize filters on component load
  private initializeFilters(): void {
    // Extract unique categories and locations
    const categoriesSet = new Set<string>();
    const locationsSet = new Set<string>();

    this.registeredEvents.forEach(event => {
      if (event.technologie) categoriesSet.add(event.technologie);
      if (event.type) categoriesSet.add(event.type);
      if (event.location) locationsSet.add(event.location);
    });

    this.categories = Array.from(categoriesSet);
    this.locations = Array.from(locationsSet);
  }
}
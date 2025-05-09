import { Component, OnInit } from '@angular/core';
import { EventService, Evenement, Status_evenement } from '../../../../app/services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listevent',
  templateUrl: './listevent.component.html',
  styleUrls: ['./listevent.component.css']
})
export class ListeventComponent implements OnInit {
  events: Evenement[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedEvent: Evenement | null = null;

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null; // Reset error on new load attempt
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Erreur lors du chargement des événements: ${err.message}`;
        this.loading = false;
      }
    });
  }

  deleteEvent(eventId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.loading = true; // Show loading indicator during deletion
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.events = this.events.filter(event => event.eventId !== eventId);
          this.loading = false; // Hide loading after deletion
        },
        error: (err) => {
          this.error = `Erreur lors de la suppression: ${err.message}`;
          this.loading = false; // Hide loading in case of error
        }
      });
    }
  }

  addEvent(): void {
    this.router.navigate(['/admin/listevent/add']);
  }

  editEvent(event: Evenement): void {
    this.router.navigate(['/admin/listevent/add', { id: event.eventId }]);
  }

  getStatusClass(status: Status_evenement): string {
    switch (status) {
      case Status_evenement.UPCOMING:
        return 'bg-yellow-500'; // Yellow for upcoming events
      case Status_evenement.ONGOING:
        return 'bg-green-500';  // Green for ongoing events
      case Status_evenement.COMPLETED:
        return 'bg-blue-500';   // Blue for completed events
      default:
        return 'bg-gray-300';   // Default gray for unknown status
    }
  }
}

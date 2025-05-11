import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/core/models/User';
import { UserActivityService } from 'src/app/core/service/user-activity.service';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-card-table',
  templateUrl: './card-table.component.html',
})
export class CardTableComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = []; // All filtered users
  paginatedUsers: User[] = []; // Users for current page

  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  searchQuery: string = '';

  @Input()
  get color(): string {
    return this._color;
  }
  set color(color: string) {
    this._color = color !== 'light' && color !== 'dark' ? 'light' : color;
  }
  private _color = 'light';

  constructor(
    private service: UserService,
    private userActivityService: UserActivityService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  deleteUser(id: number) {
    this.service.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
      },
    });
  }

  loadUsers() {
    this.service.getUserList().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...data]; // Keep filteredUsers updated
        console.log('Users Loaded:', this.users);

        // Initialize pagination
        this.currentPage = 1;

        // Track prediction completion
        let predictionsCompleted = 0;
        const totalPredictions = this.users.length;

        // If no users, update pagination immediately
        if (totalPredictions === 0) {
          this.updatePagination();
          return;
        }

        // Predict satisfaction for each user
        this.users.forEach((user: any) => {
          this.userActivityService.predictSatisfaction(user.email).subscribe({
            next: (response) => {
              console.log(`Satisfaction Prediction for ${user.email}:`, response);

              // Update user data with prediction
              this.users = this.users.map((u: any) =>
                u.email === user.email
                  ? { ...u, satisfactionPrediction: response }
                  : u
              );

              this.filteredUsers = this.filteredUsers.map((u: any) =>
                u.email === user.email
                  ? { ...u, satisfactionPrediction: response }
                  : u
              );

              // Increment completed predictions counter
              predictionsCompleted++;

              // If all predictions are complete or at least the first page is complete, update pagination
              if (predictionsCompleted === totalPredictions ||
                  (predictionsCompleted >= this.pageSize && this.currentPage === 1)) {
                this.updatePagination();
              }
            },
            error: (error) => {
              console.error(`Error predicting satisfaction for ${user.email}:`, error);

              // Even on error, increment counter to ensure pagination eventually updates
              predictionsCompleted++;

              if (predictionsCompleted === totalPredictions ||
                  (predictionsCompleted >= this.pageSize && this.currentPage === 1)) {
                this.updatePagination();
              }
            }
          });
        });

        // Set a timeout to ensure pagination is updated even if some predictions fail
        setTimeout(() => {
          if (predictionsCompleted < this.pageSize) {
            console.log('Forcing pagination update after timeout');
            this.updatePagination();
          }
        }, 3000);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  // The predictSatisfaction functionality has been integrated directly into loadUsers

  filterUsers() {
    console.log('Search Query:', this.searchQuery);

    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredUsers = this.users; // If empty, reset the list
    } else {
      this.filteredUsers = this.users.filter((user) => {
        return user.nom?.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    }

    // Reset to first page when filtering
    this.currentPage = 1;
    this.updatePagination();
    console.log('Filtered Users:', this.filteredUsers);
  }

  // Pagination methods
  updatePagination() {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);

    // Ensure current page is valid
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1; // If totalPages is 0, set to 1
    }

    // Get users for current page
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredUsers.length);
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);

    console.log(`Page ${this.currentPage} of ${this.totalPages}, showing ${this.paginatedUsers.length} users`);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}

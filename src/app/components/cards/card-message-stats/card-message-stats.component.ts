import { Component, OnInit } from '@angular/core';
import { MessageService } from 'src/app/core/service/message.service';
import { MessageLikeStats } from 'src/app/core/models/MessageLikeStats';

@Component({
  selector: 'app-card-message-stats',
  templateUrl: './card-message-stats.component.html',
})
export class CardMessageStatsComponent implements OnInit {
  messageStats: MessageLikeStats | null = null;
  loading = false;
  error: string | null = null;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadMessageStats();
  }

  loadMessageStats() {
    this.loading = true;
    this.error = null;
    
    console.log('Testing likes/stats endpoint...');
    
    this.messageService.getLikeStats().subscribe({
      next: (stats) => {
        console.log('Received message like stats:', stats);
        this.messageStats = stats[0] || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load message like stats:', err);
        this.error = `Error: ${err.message || 'Unknown error'}`;
        if (err.status) {
          this.error += ` (Status: ${err.status})`;
        }
        this.loading = false;
      }
    });
  }

  retry() {
    this.loadMessageStats();
  }

  testDirectEndpoint() {
    this.loading = true;
    this.error = null;
    
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
    
    console.log('Testing direct endpoint call with fetch API');
    console.log('Headers:', headers);
    
    fetch('http://localhost:8090/messages/messages/likes/stats', {
      method: 'GET',
      headers: headers
    })
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Fetch API received data:', data);
      this.messageStats = data[0] || null;
      this.loading = false;
    })
    .catch(err => {
      console.error('Fetch API error:', err);
      this.error = `Fetch Error: ${err.message || 'Unknown error'}`;
      this.loading = false;
    });
  }
}

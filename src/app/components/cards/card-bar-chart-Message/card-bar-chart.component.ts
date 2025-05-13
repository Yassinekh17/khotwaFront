import { Component, AfterViewInit } from "@angular/core";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { MessageService } from "src/app/core/service/message.service";
import { UserLikeStats } from "src/app/core/models/userlikestats";

@Component({
  selector: "app-card-bar-chart-Message",
  templateUrl: "./card-bar-chart-Message.component.html",
})
export class CardBarChartMessageComponent implements AfterViewInit {
  loading = false;
  error: string | null = null;
  stats: UserLikeStats[] = [];

  constructor(private messageService: MessageService) {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.loadChartData();
  }

  loadChartData() {
    console.log('Loading user like stats...');
    this.error = null;
    this.loading = true;

    // Show loading indicator
    this.showLoading(true);

    this.messageService.getUserLikeStats().subscribe({
      next: (stats) => {
        console.log('Received user like stats:', stats);
        this.stats = stats || [];

        // Hide loading indicator
        this.showLoading(false);
        this.loading = false;

        if (stats && stats.length > 0) {
          this.createChart(stats);
        } else {
          console.warn('No user like stats data received or empty array');
          this.error = 'No user statistics data available.';
          this.createFallbackChart();
        }
      },
      error: (err) => {
        console.error('Failed to load user like stats:', err);
        this.error = `Error loading statistics: ${err.message || 'Unknown error'}`;
        if (err.status) {
          this.error += ` (Status: ${err.status})`;
        }

        // Hide loading indicator
        this.showLoading(false);
        this.loading = false;
        this.createFallbackChart();
      }
    });
  }

  retryLoading() {
    this.loadChartData();
  }

  testDirectEndpoint() {
    this.error = null;
    this.loading = true;
    this.showLoading(true);

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
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

      // Process the data based on its format
      if (Array.isArray(data)) {
        // If it's an array, use it directly
        this.stats = data;
        this.createChart(data);
      } else if (data && typeof data === 'object') {
        // If it's a single object, create a mock array
        const mockStats: UserLikeStats[] = [
          { messageId: 1, contenu: 'Most Liked Message', likeCount: data.totalLikes || 0 },
          { messageId: 2, contenu: 'Average Message', likeCount: Math.round(data.averageLikesPerMessage || 0) }
        ];
        this.stats = mockStats;
        this.createChart(mockStats);
      }

      this.loading = false;
      this.showLoading(false);
    })
    .catch(err => {
      console.error('Fetch API error:', err);
      this.error = `Fetch Error: ${err.message || 'Unknown error'}`;
      this.loading = false;
      this.showLoading(false);
      this.createFallbackChart();
    });
  }

  showLoading(show: boolean) {
    const loadingElement = document.getElementById('chart-loading');
    if (loadingElement) {
      if (show) {
        loadingElement.classList.remove('hidden');
      } else {
        loadingElement.classList.add('hidden');
      }
    }
  }

  createFallbackChart() {
    console.log('Creating fallback chart with sample data');
    const sampleData = [
      { messageId: 1, contenu: 'Sample message about a new feature', likeCount: 15 },
      { messageId: 2, contenu: 'Announcement about upcoming event', likeCount: 10 },
      { messageId: 3, contenu: 'Important update for all users', likeCount: 8 },
      { messageId: 4, contenu: 'New course available now', likeCount: 5 },
      { messageId: 5, contenu: 'Weekend workshop announcement', likeCount: 3 }
    ];
    this.createChart(sampleData);
  }

  createChart(stats: any[]) {
    // Sort stats by likeCount in descending order
    const sortedStats = [...stats].sort((a, b) => b.likeCount - a.likeCount);

    // Limit to top 10 items for better visualization
    const topItems = sortedStats.slice(0, 10);

    // Determine if we're dealing with message stats or user stats
    const isMessageStats = topItems.length > 0 && topItems[0].hasOwnProperty('messageId');

    // Create appropriate labels based on the data type
    const labels = topItems.map(stat => {
      if (isMessageStats) {
        // For message stats, use a truncated version of the message content
        return this.truncateText(stat.contenu || `Message ${stat.messageId}`, 20);
      } else {
        // For user stats, use the username
        return stat.username || `User ${stat.userId}`;
      }
    });

    const config: any = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Likes',
          data: topItems.map(stat => stat.likeCount),
          backgroundColor: this.generateColors(topItems.length),
          borderColor: this.generateColors(topItems.length).map(color => color.replace('0.7', '1')),
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 30,
          maxBarThickness: 40,
          minBarLength: 2,
          hoverBackgroundColor: this.generateColors(topItems.length).map(color => color.replace('0.7', '0.9')),
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: topItems.length > 5 ? 'y' : 'x', // Use horizontal bars if we have many items
        layout: {
          padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#4a5568",
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
              drawBorder: false,
            },
            ticks: {
              color: "#4a5568",
              precision: 0,
              stepSize: 1,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
        },
        plugins: {
          title: {
            display: true,
            text: isMessageStats ? 'Most Liked Messages' : 'Top Users by Likes',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 6,
            callbacks: {
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                if (isMessageStats) {
                  // Show full message content in tooltip
                  return topItems[index].contenu || `Message ${topItems[index].messageId}`;
                }
                return tooltipItems[0].label;
              },
              label: (context) => {
                return `${context.parsed.y || context.parsed.x} likes`;
              }
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeOutQuart'
        }
      },
    };

    const ctx = document.getElementById("likes-bar-chart") as HTMLCanvasElement;
    if (ctx) {
      // Destroy any existing chart
      const existingChart = Chart.getChart(ctx);
      if (existingChart) {
        existingChart.destroy();
      }

      // Create new chart
      new Chart(ctx, config);
    } else {
      console.error("Canvas element 'likes-bar-chart' not found");
    }
  }

  generateColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360 / count) % 360;
      colors.push(`hsla(${hue}, 70%, 50%, 0.7)`);
    }
    return colors;
  }

  /**
   * Truncate text to a specified length and add ellipsis if needed
   */
  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
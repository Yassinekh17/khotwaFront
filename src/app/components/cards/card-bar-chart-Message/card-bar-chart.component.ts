import { Component, AfterViewInit } from "@angular/core";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { MessageService } from "src/app/core/service/message.service";

@Component({
  selector: "app-card-bar-chart-Message",
  templateUrl: "./card-bar-chart-Message.component.html",
})
export class CardBarChartMessageComponent implements AfterViewInit {
  constructor(private messageService: MessageService) {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.loadChartData();
  }

  loadChartData() {
    this.messageService.getUserLikeStats().subscribe({
      next: (stats) => {
        this.createChart(stats);
      },
      error: (err) => {
        console.error('Failed to load user like stats:', err);
      }
    });
  }

  createChart(stats: any[]) {
    // Sort stats by likeCount in descending order
    const sortedStats = [...stats].sort((a, b) => b.likeCount - a.likeCount);
    
    const config: ChartConfiguration<"bar", number[], string> = {
      type: "bar",
      data: {
        labels: sortedStats.map(stat => stat.username),
        datasets: [{
          label: 'Number of Likes',
          data: sortedStats.map(stat => stat.likeCount),
          backgroundColor: this.generateColors(sortedStats.length),
          borderColor: '#4c51bf',
          borderWidth: 1,
          barThickness: 20,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            grid: {
              display: false,
            },
            ticks: {
              color: "#000",
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              color: "#000",
              precision: 0,
              stepSize: 1
            }
          },
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} likes`;
              }
            }
          }
        }
      },
    };

    const ctx = document.getElementById("bar-chart") as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, config);
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
}
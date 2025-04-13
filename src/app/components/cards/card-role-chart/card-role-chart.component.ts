import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Chart, ChartConfiguration, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from "chart.js";

import { AnalyticsService } from "src/app/core/service/analytics.service";

@Component({
  selector: "app-card-role-chart",
  templateUrl: "./card-role-chart.component.html"
})
export class CardRoleChartComponent implements OnInit, AfterViewInit {
  constructor(private statsService: AnalyticsService) {}

  roles = ["ADMINISTRATEUR", "FORMATEUR", "ETUDIANT"];
  roleCounts: number[] = [];

  async ngOnInit() {
    await this.loadRoleData();
  }

  ngAfterViewInit() {
    // Chart registration
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);
  }

  async loadRoleData() {
    const promises = this.roles.map(role => this.statsService.getTotalUsersByRole(role).toPromise());
    this.roleCounts = await Promise.all(promises);

    this.renderChart();
  }

  renderChart() {
    const config: ChartConfiguration<"bar", number[], string> = {
      type: "bar",
      data: {
        labels: this.roles,
        datasets: [
          {
            label: "Users per Role",
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: this.roleCounts,
            barThickness: 30
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Users by Role"
          },
          legend: {
            display: false
          },
          tooltip: {
            mode: "index",
            intersect: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Roles"
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: "User Count"
            },
            grid: {
              color: "rgba(33, 37, 41, 0.2)"
            }
          }
        }
      }
    };

    const ctx = document.getElementById("role-chart") as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, config);
    }
  }
}

import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Chart, ChartConfiguration, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from "chart.js";

import { AnalyticsService } from "src/app/core/service/analytics.service";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  downloadChartAsPDF() {
    const chartCanvas = document.getElementById('role-chart') as HTMLCanvasElement;
    if (!chartCanvas) return;
  
    const imgData = chartCanvas.toDataURL('image/png', 1.0); // Maximum quality
    const pdf = new jsPDF('landscape', 'mm', 'a4');
  
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
  
    const imgProps = {
      width: chartCanvas.width,
      height: chartCanvas.height,
    };
  
    const aspectRatio = imgProps.height / imgProps.width;
    const imgWidth = pdfWidth - 20;
    const imgHeight = imgWidth * aspectRatio;
  
    // Title
    pdf.setFontSize(14);
    pdf.text('Monthly User Activity Report', pdfWidth / 2, 15, { align: 'center' });
  
    // Chart image
    pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);
  
    // Logo (optional)
    const logo = new Image();
    logo.src = 'assets/logo.png';
  
    logo.onload = () => {
      pdf.addImage(logo, 'PNG', 10, 5, 30, 15);
      pdf.save('users-by-role.pdf');
    };
  }
  
  
}

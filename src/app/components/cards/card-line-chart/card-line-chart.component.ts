import { Component, OnInit , AfterViewInit} from "@angular/core";
import {
  Chart,
  ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { HttpClient } from "@angular/common/http";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: "app-card-line-chart",
  templateUrl: "./card-line-chart.component.html",
})
export class CardLineChartComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchMonthlyActivity();
  }

  fetchMonthlyActivity() {
    const token = localStorage.getItem("token");
  
    this.http
      .get<[number, number][]>("http://localhost:8090/user/api/analytics/monthly-activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe(
        (data) => {
          const monthNames = [
            "",
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
  
          const labels = data.map(([monthNumber]) => monthNames[monthNumber]);
          const values = data.map(([_, count]) => count);
  
          this.renderChart(labels, values);
        },
        (error) => {
          console.error("Error fetching activity data", error);
        }
      );
  }
  

  renderChart(labels: string[], values: number[]) {
    Chart.register(
      LineController,
      LineElement,
      PointElement,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend,
      Title
    );

    const config: ChartConfiguration<"line", number[], string> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Monthly User Activity",
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: values,
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Monthly Activity (User Actions)",
            color: "white",
          },
          legend: {
            labels: {
              color: "white",
            },
            align: "end",
            position: "bottom",
          },
        },
        scales: {
          x: {
            ticks: {
              color: "white",
            },
            grid: {
              display: false,
            },
          },
          y: {
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255,255,255,0.2)",
            },
          },
        },
      },
    };

    const canvas = document.getElementById("line-chart") as HTMLCanvasElement;
    if (canvas) {
      new Chart(canvas, config);
    }
  }

  downloadChartAsPDF() {
    const chartContainer = document.getElementById('chart-wrapper');
    if (chartContainer) {
      html2canvas(chartContainer, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
  
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
        // 🔥 Add Title
        pdf.setFontSize(18);
        pdf.setTextColor(40);
        pdf.text('Monthly User Activity Report', pdfWidth / 2, 20, { align: 'center' });
  
        // Add chart image below title
        pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, pdfHeight);
  
        // 🔥 Add logo
        const logo = new Image();
        logo.src = 'assets/logo.png';
  
        logo.onload = () => {
          pdf.addImage(logo, 'PNG', 10, 10, 40, 20);
          pdf.save('monthly-user-activity.pdf');
        };
      });
    }
  }
  
  
  
}

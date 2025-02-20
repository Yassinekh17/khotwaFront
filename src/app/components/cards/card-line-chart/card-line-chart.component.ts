import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Chart, ChartConfiguration } from "chart.js"; // Use named imports

@Component({
  selector: "app-card-line-chart",
  templateUrl: "./card-line-chart.component.html",
})
export class CardLineChartComponent implements OnInit, AfterViewInit {
  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    const config: ChartConfiguration<"line", number[], string> = {
      type: "line", // Explicitly set the type as "line"
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        datasets: [
          {
            label: new Date().getFullYear().toString(),
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: [65, 78, 66, 44, 56, 67, 75],
          },
          {
            label: (new Date().getFullYear() - 1).toString(),
            backgroundColor: "#fff",
            borderColor: "#fff",
            data: [40, 68, 86, 74, 56, 60, 87],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          title: {
            display: false,
            text: "Sales Charts",
            color: "white", // Use 'color' instead of 'fontColor'
          },
          legend: {
            labels: {
              color: "white", // Use 'color' instead of 'fontColor'
            },
            align: "end",
            position: "bottom",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: false,
              text: "Month",
              color: "white", // Use 'color' instead of 'fontColor'
            },
            ticks: {
              color: "rgba(255,255,255,.7)", // Use 'color' instead of 'fontColor'
            },
            grid: {
              display: false, // Hide grid lines for the x-axis
            },
          },
          y: {
            display: true,
            title: {
              display: false,
              text: "Value",
              color: "white", // Use 'color' instead of 'fontColor'
            },
            ticks: {
              color: "rgba(255,255,255,.7)", // Use 'color' instead of 'fontColor'
            },
            grid: {
              color: "rgba(255, 255, 255, 0.15)", // Use 'color' instead of 'gridLines.color'
              lineWidth: 1,
            },
          },
        },
      },
    };

    const ctx = document.getElementById("line-chart") as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, config);
    }
  }
}
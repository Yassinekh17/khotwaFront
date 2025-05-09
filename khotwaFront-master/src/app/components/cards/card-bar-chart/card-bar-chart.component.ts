import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Chart, ChartConfiguration } from "chart.js"; // Import ChartConfiguration

@Component({
  selector: "app-card-bar-chart",
  templateUrl: "./card-bar-chart.component.html",
})
export class CardBarChartComponent implements OnInit, AfterViewInit {
  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    const config: ChartConfiguration<"bar", number[], string> = {
      type: "bar", // Explicitly set the type as "bar"
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
            backgroundColor: "#ed64a6",
            borderColor: "#ed64a6",
            data: [30, 78, 56, 34, 100, 45, 13],
            barThickness: 8,
          },
          {
            label: (new Date().getFullYear() - 1).toString(),
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: [27, 68, 86, 74, 10, 4, 87],
            barThickness: 8,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          title: {
            display: false,
            text: "Orders Chart",
          },
          legend: {
            labels: {
              color: "rgba(0,0,0,.4)",
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
            display: false,
            title: {
              display: true,
              text: "Month",
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
            },
            grid: {
              display: true, // Show grid lines for the y-axis
              color: "rgba(33, 37, 41, 0.2)",
              lineWidth: 1,
            },
          },
        },
      },
    };

    const ctx = document.getElementById("bar-chart") as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, config);
    }
  }
}
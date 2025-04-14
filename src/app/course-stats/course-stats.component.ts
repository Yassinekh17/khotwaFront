import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-course-stats',
  templateUrl: './course-stats.component.html',
  styleUrls: ['./course-stats.component.css']
})
export class CourseStatsComponent implements OnInit {
  @Input() coursList: any[] = [];

  // Pie Chart Configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Course Distribution by Category', color: '#4a5568' }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartType: ChartType = 'pie';

  // Bar Chart Configuration
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Courses', color: '#4a5568' } },
      y: { title: { display: true, text: 'Price ($)', color: '#4a5568' } }
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Course Prices', color: '#4a5568' }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Price' }]
  };

  ngOnInit(): void {
    this.updateCharts();
  }

  ngOnChanges(): void {
    this.updateCharts();
  }

  private updateCharts(): void {
    this.updatePieChart();
    this.updateBarChart();
  }

  private updatePieChart(): void {
    const categoryCount = this.coursList.reduce((acc, course) => {
      acc[course.categorie] = (acc[course.categorie] || 0) + 1;
      return acc;
    }, {});

    this.pieChartData = {
      labels: Object.keys(categoryCount),
      datasets: [{
        data: Object.values(categoryCount),
        backgroundColor: [
          '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'
        ],
        hoverBackgroundColor: [
          '#dc2626', '#ea580c', '#d97706', '#059669', '#2563eb', '#4f46e5', '#7c3aed'
        ]
      }]
    };
  }

  private updateBarChart(): void {
    const sortedCourses = [...this.coursList].sort((a, b) => a.prix - b.prix);
    
    this.barChartData = {
      labels: sortedCourses.map(c => c.titre),
      datasets: [{
        data: sortedCourses.map(c => c.prix),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        hoverBackgroundColor: '#dc2626'
      }]
    };
  }
}
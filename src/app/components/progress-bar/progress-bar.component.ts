import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  @Input() progress: number = 0;
  @Input() total: number = 100;
  @Input() showPercentage: boolean = true;
  @Input() showLabel: boolean = true;
  @Input() label: string = 'Progression';
  @Input() color: string = 'blue';
  @Input() animated: boolean = true;

  getProgressPercentage(): number {
    if (this.total === 0) return 0;
    return Math.round((this.progress / this.total) * 100);
  }

  getProgressBarClass(): string {
    const baseClasses = 'h-3 rounded-full transition-all duration-500 ease-out';
    const colorClasses = this.getColorClass();

    if (this.animated) {
      return `${baseClasses} ${colorClasses}`;
    }

    return `${baseClasses} ${colorClasses}`;
  }

  private getColorClass(): string {
    switch (this.color) {
      case 'green':
        return 'bg-green-500';
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'purple':
        return 'bg-purple-500';
      case 'indigo':
        return 'bg-indigo-500';
      case 'blue':
      default:
        return 'bg-blue-500';
    }
  }
}
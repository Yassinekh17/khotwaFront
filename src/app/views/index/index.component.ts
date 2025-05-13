import { Component, OnInit, OnDestroy } from "@angular/core";
import { ThemeService, ThemeMode } from "src/app/core/service/theme.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-index",
  templateUrl: "./index.component.html",
})
export class IndexComponent implements OnInit, OnDestroy {
  currentTheme: ThemeMode = 'light';
  private themeSubscription: Subscription | undefined;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Get initial theme
    this.currentTheme = this.themeService.getCurrentTheme();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  // Helper method to get the appropriate hero image based on theme
  getHeroImage(): string {
    return this.currentTheme === 'dark'
      ? 'assets/img/e-learning-hero-dark.svg'
      : 'assets/img/e-learning-hero.svg';
  }
}

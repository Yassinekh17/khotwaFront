import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NotificationComponent } from "./components/notification/notification.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  imports: [RouterOutlet, NotificationComponent],
  standalone: true
})
export class AppComponent {
  title = "angular-dashboard-page";
}

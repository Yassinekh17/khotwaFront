import { Component, OnInit } from "@angular/core";
import { Message } from "src/app/core/models/Message";
import { MessageService } from "src/app/core/service/message.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
})
export class ProfileComponent implements OnInit {
  messages:Message[] = [];
  constructor( private service :MessageService) {}

  ngOnInit(): void { this.loadMessages();}
  loadMessages() {
    this.service.getMessages().subscribe({
      next: (data) => {
        this.messages = data;
        console.log(this.messages);
      },
      error: (error) => {
        console.error("Error fetching messages:", error);
      },
    });
  }
  deleteMessage(id: number) {
    this.service.deleteMessage(id).subscribe({
      next: () => {
        this.loadMessages();
      },
      error: (error) => {
        console.error("Error deleting message:", error);
      },
    });
  }
}

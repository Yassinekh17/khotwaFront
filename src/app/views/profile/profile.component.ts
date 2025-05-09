import { Component, OnInit, ViewChild } from "@angular/core";
import { ChatBotComponent } from '../../chat-bot/chat-bot.component';

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
})
export class ProfileComponent implements OnInit {
  constructor() {}
  @ViewChild(ChatBotComponent) chatBot!: ChatBotComponent;
  ngOnInit(): void {}
  openChatBot() {
    if (this.chatBot) {
      this.chatBot.toggleChat();
    }}
}

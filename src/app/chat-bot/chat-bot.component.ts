import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  text: string;
  isUser: boolean;
  time: Date;
}

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  isOpen = false;
  isChatOpen = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.addBotMessage('Hello! How can Khotwa AI assist you today?');
    }
  }

  addBotMessage(text: string) {
    this.messages.push({ text, isUser: false, time: new Date() });
    this.scrollToBottom();
  }

  sendMessage() {
    const userMessage = this.userInput.trim();
    if (!userMessage) return;

    this.messages.push({ text: userMessage, isUser: true, time: new Date() });
    this.isLoading = true;
    this.userInput = '';

    this.http.post<{ message: string }>('http://localhost:8089/api/chat', { message: userMessage })
      .subscribe(response => {
        this.addBotMessage(response.message);
      }, error => {
        this.addBotMessage('Sorry, I encountered an error.');
      }, () => {
        this.isLoading = false;
      });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}

import { Component, OnInit } from '@angular/core';
import { ChatMessage, ChatService } from 'src/app/services/chat.service';
import { User, UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  sender: string = '1'; // Example sender ID
  recipientId: string = '2'; // Default recipient ID
  contacts: User[] = []; // List of users for contacts

  constructor(private chatService: ChatService, private userService: UserService) {}

  ngOnInit() {
    this.loadMessages();
    this.loadContacts();
  }

  loadMessages() {
    this.chatService.getMessagesBetweenUsers(this.sender, this.recipientId).subscribe(messages1 => {
      // this.chatService.getMessagesBetweenUsers(this.recipientId, this.sender).subscribe(messages2 => {
      //   this.messages = [...messages1, ...messages2]; // Merge messages from both users
      // });
      this.messages =messages1;
    });

    // this.webSocketService.message$.subscribe((message: any) => {
    //   if (message) {
    //     this.messages.push(message);
    //   }
    // });
  }

  loadContacts() {
    this.userService.getUsers().subscribe(users => {
      console.log(users)
      this.contacts = users.filter(user => user.id_user.toString() !== this.sender); // Exclude the sender from contacts
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const message: ChatMessage = {
        content: this.newMessage,
        sender: this.sender,
        recipientId: this.recipientId
      };
      this.chatService.sendMessage(message).subscribe(sentMessage => {
        // this.webSocketService.sendMessage('/app/chat.sendPrivateMessage', sentMessage);

        this.messages.push(sentMessage);
        this.newMessage = '';
      });
    }

 
  }

  selectContact(user: User) {
    this.recipientId = user.id_user.toString();
    this.loadMessages();
  }
}

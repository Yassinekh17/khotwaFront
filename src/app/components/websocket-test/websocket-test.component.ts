import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-websocket-test',
  templateUrl: './websocket-test.component.html',
  styleUrls: ['./websocket-test.component.css']
})
export class WebsocketTestComponent implements OnInit, OnDestroy {
  connectionStatus: string = 'Non connecté';
  connectionClass: string = 'disconnected';
  testMessage: string = '';
  receivedMessages: any[] = [];
  
  private messageSubscription: Subscription;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    // S'abonner aux messages WebSocket
    this.messageSubscription = this.webSocketService.message$.subscribe((message: any) => {
      if (!message) return;
      
      // Gérer les messages de statut de connexion
      if (message.type === 'CONNECTION_STATUS') {
        switch (message.status) {
          case 'connecting':
            this.connectionStatus = 'Connexion en cours...';
            this.connectionClass = 'connecting';
            break;
          case 'connected':
            this.connectionStatus = 'Connecté';
            this.connectionClass = 'connected';
            break;
          case 'disconnected':
            this.connectionStatus = 'Déconnecté';
            this.connectionClass = 'disconnected';
            break;
          case 'error':
          case 'connection_error':
          case 'init_error':
            this.connectionStatus = 'Erreur de connexion';
            this.connectionClass = 'error';
            break;
        }
      } else {
        // Ajouter le message reçu à la liste
        this.receivedMessages.unshift({
          content: JSON.stringify(message),
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });
    
    // Tester la connexion WebSocket
    this.testConnection();
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  testConnection(): void {
    const isConnected = this.webSocketService.testConnection();
    if (isConnected) {
      this.connectionStatus = 'Connecté';
      this.connectionClass = 'connected';
    } else {
      this.connectionStatus = 'Tentative de reconnexion...';
      this.connectionClass = 'connecting';
    }
  }

  sendTestMessage(): void {
    if (!this.testMessage.trim()) return;
    
    const testMessageObj = {
      content: this.testMessage,
      sender: 'test-user',
      recipientId: 'server',
      timestamp: new Date().toISOString()
    };
    
    const success = this.webSocketService.sendMessage('/app/chat.sendPrivateMessage', testMessageObj);
    
    if (success) {
      this.receivedMessages.unshift({
        content: `Message envoyé: ${this.testMessage}`,
        timestamp: new Date().toLocaleTimeString(),
        sent: true
      });
      this.testMessage = '';
    } else {
      this.receivedMessages.unshift({
        content: `Échec de l'envoi du message: ${this.testMessage}`,
        timestamp: new Date().toLocaleTimeString(),
        error: true
      });
    }
  }

  reconnect(): void {
    this.webSocketService.testConnection();
  }
}

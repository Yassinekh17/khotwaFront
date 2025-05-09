import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { ChatMessage, ChatService } from 'src/app/services/chat.service';
import { User, UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer') private chatContainer: ElementRef;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  sender: string = '5'; // Example sender ID
  recipientId: string = '1'; // Default recipient ID
  contacts: User[] = []; // List of users for contacts
  searchTerm: string = '';
  filteredContacts: User[] = [];
  isTyping: boolean = false;
  typingTimeout: any;

  // WebSocket connection status
  wsConnected: boolean = false;
  wsError: boolean = false;
  wsErrorMessage: string = '';

  // Direct WebSocket test status
  directWsConnected: boolean = false;

  private messageSubscription: Subscription;
  private typingSubscription: Subscription;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    // Charger d'abord les contacts, puis les messages
    this.loadContacts();

    // Configurer les écouteurs WebSocket
    this.setupWebSocketListeners();

    // Tester la connexion WebSocket périodiquement
    setInterval(() => {
      this.testWebSocketConnection();
    }, 30000); // Tester toutes les 30 secondes
  }

  // Rafraîchir les contacts sans perturber l'interface utilisateur
  refreshContacts() {
    console.log('Refreshing contacts...');
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        // Filtrer pour exclure l'utilisateur actuel
        const newContacts = users.filter((user: User) => user.id_user.toString() !== this.sender);

        // Trier les contacts par nom
        newContacts.sort((a, b) => {
          const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
          const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        // Mettre à jour les contacts seulement s'il y a des changements
        if (JSON.stringify(newContacts) !== JSON.stringify(this.contacts)) {
          console.log('Contacts updated:', newContacts.length);
          this.contacts = newContacts;

          // Mettre à jour la liste filtrée en préservant le filtre actuel
          this.filterContacts();
        } else {
          console.log('No changes in contacts');
        }
      },
      error: (error) => {
        console.error('Error refreshing contacts:', error);
      }
    });
  }

  testWebSocketConnection() {
    const isConnected = this.webSocketService.isConnected();
    console.log('WebSocket connection status:', isConnected ? 'Connected' : 'Disconnected');

    if (!isConnected) {
      console.log('Attempting to reconnect WebSocket...');
      this.webSocketService.testConnection();
    }
  }

  // Test direct WebSocket connection
  testDirectWebSocket() {
    console.log('Testing direct WebSocket connection...');
    // Use the mock WebSocket service instead
    this.webSocketService.testConnection();
    this.directWsConnected = this.webSocketService.isConnected();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  setupWebSocketListeners() {
    // Subscribe to new messages
    this.messageSubscription = this.webSocketService.message$.subscribe((message: any) => {
      if (!message) return;

      // Handle connection status messages
      if (message.type === 'CONNECTION_STATUS') {
        console.log(`WebSocket connection status: ${message.status}`);

        // Update connection status based on the message
        switch (message.status) {
          case 'connecting':
            this.wsConnected = false;
            this.wsError = false;
            this.wsErrorMessage = '';
            break;
          case 'connected':
            this.wsConnected = true;
            this.wsError = false;
            this.wsErrorMessage = '';
            break;
          case 'disconnected':
            this.wsConnected = false;
            this.wsError = false;
            this.wsErrorMessage = 'Déconnecté du serveur';
            break;
          case 'error':
          case 'connection_error':
          case 'init_error':
            this.wsConnected = false;
            this.wsError = true;
            this.wsErrorMessage = 'Erreur de connexion au serveur';
            console.error('WebSocket connection error:', message.error);
            break;
        }

        return;
      }

      // Handle regular chat messages
      // Only add the message if it's from the current conversation
      if (message.sender === this.recipientId || message.recipientId === this.recipientId) {
        console.log('Received message:', message);
        this.messages.push(message);
        this.scrollToBottom();
      }
    });

    // Subscribe to typing notifications
    this.typingSubscription = this.webSocketService.typing$.subscribe((data: any) => {
      if (data && data.sender === this.recipientId) {
        console.log('Typing notification received:', data);
        this.isTyping = true;
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
          this.isTyping = false;
        }, 3000);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
  }

  loadMessages() {
    console.log(`Loading messages between sender ${this.sender} and recipient ${this.recipientId}`);

    if (!this.sender || !this.recipientId) {
      console.warn('Sender or recipient ID is missing, cannot load messages');
      this.messages = [];
      return;
    }

    this.chatService.getMessagesBetweenUsers(this.sender, this.recipientId).subscribe({
      next: (messages) => {
        console.log('Messages received:', messages);

        // Filtrer les messages pour s'assurer qu'ils sont bien entre l'expéditeur et le destinataire
        this.messages = messages.filter(message =>
          (message.sender === this.sender && message.recipientId === this.recipientId) ||
          (message.sender === this.recipientId && message.recipientId === this.sender)
        );

        // Trier les messages par date
        this.messages.sort((a, b) => {
          const dateA = new Date(a.timestamp || 0);
          const dateB = new Date(b.timestamp || 0);
          return dateA.getTime() - dateB.getTime();
        });

        console.log(`Filtered ${this.messages.length} messages between users ${this.sender} and ${this.recipientId}`);

        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        // Initialize with empty array in case of error
        this.messages = [];
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);

        // Show error message to the user
        alert(error.message || 'Erreur lors du chargement des messages. Veuillez réessayer.');
      }
    });
  }

  loadContacts() {
    console.log('Loading contacts...');
    // Use the UserService to get users from the backend
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        console.log('Users received:', users);
        if (!users || users.length === 0) {
          console.warn('No users received from backend');
          // Initialize with empty arrays if no users
          this.contacts = [];
          this.filteredContacts = [];
          return;
        }

        // Filtrer pour exclure l'utilisateur actuel
        this.contacts = users.filter((user: User) => user.id_user.toString() !== this.sender);
        console.log('Filtered contacts:', this.contacts.length);

        // Trier les contacts par nom pour une meilleure lisibilité
        this.contacts.sort((a, b) => {
          const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
          const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        this.filteredContacts = [...this.contacts]; // Initialize filtered list with a copy

        // Si aucun destinataire n'est sélectionné, sélectionner le premier contact
        if ((this.recipientId === this.sender || !this.recipientId) && this.contacts.length > 0) {
          this.selectContact(this.contacts[0]);
        } else {
          // Vérifier si le destinataire actuel existe dans les contacts
          const currentRecipientExists = this.contacts.some(
            contact => contact.id_user.toString() === this.recipientId
          );

          // Si le destinataire n'existe pas, sélectionner le premier contact
          if (!currentRecipientExists && this.contacts.length > 0) {
            this.selectContact(this.contacts[0]);
          } else if (this.recipientId) {
            // Si le destinataire existe, charger les messages
            this.loadMessages();
          }
        }

        console.log('Contacts chargés:', this.contacts.length);
        if (this.getCurrentContact()) {
          console.log('Destinataire actuel:', this.getRecipientFullName());
        } else {
          console.log('Aucun destinataire sélectionné');
        }
      },
      error: (error: any) => {
        console.error('Error loading contacts:', error);

        // Initialize with empty arrays in case of error
        this.contacts = [];
        this.filteredContacts = [];

        // Show error message to the user
        alert('Erreur lors du chargement des contacts. Veuillez rafraîchir la page.');
      }
    });
  }

  getCurrentContact(): User | undefined {
    return this.contacts.find(c => c.id_user.toString() === this.recipientId);
  }

  // Obtenir le nom complet du destinataire actuel
  getRecipientFullName(): string {
    const recipient = this.getCurrentContact();
    if (recipient) {
      return `${recipient.prenom} ${recipient.nom}`;
    }
    return 'Destinataire inconnu';
  }

  // Obtenir le nom complet d'un utilisateur par son ID
  getUserFullName(userId: string): string {
    // Si c'est l'expéditeur actuel
    if (userId === this.sender) {
      return 'Vous';
    }

    // Si c'est le destinataire actuel
    if (userId === this.recipientId) {
      // Essayer de trouver l'utilisateur dans les contacts
      const user = this.contacts.find(c => c.id_user.toString() === userId);
      if (user) {
        return `${user.prenom} ${user.nom}`;
      }

      // Si le contact n'est pas trouvé, utiliser un nom par défaut basé sur l'ID
      return `Contact ${userId}`;
    }

    // Pour tout autre utilisateur
    const user = this.contacts.find(c => c.id_user.toString() === userId);
    if (user) {
      return `${user.prenom} ${user.nom}`;
    }

    return `Utilisateur ${userId}`;
  }

  // Obtenir les initiales d'un utilisateur pour l'avatar
  getUserInitials(user: User | string): string {
    // Si l'utilisateur est une chaîne (ID), générer des initiales basées sur l'ID
    if (typeof user === 'string') {
      const userId = user;

      // Si c'est l'expéditeur actuel
      if (userId === this.sender) {
        return 'VO'; // Vous
      }

      // Si c'est le destinataire actuel
      if (userId === this.recipientId) {
        return 'CT'; // Contact
      }

      // Générer des initiales basées sur l'ID
      return `U${userId.charAt(0)}`;
    }

    // Si l'utilisateur est un objet User
    if (user && user.prenom && user.nom) {
      return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
    }

    return 'UN'; // Unknown
  }

  filterContacts() {
    if (!this.searchTerm) {
      this.filteredContacts = [...this.contacts]; // Reset to all contacts when search is empty
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredContacts = this.contacts.filter(user =>
      (user.nom && user.nom.toLowerCase().includes(term)) ||
      (user.prenom && user.prenom.toLowerCase().includes(term))
    );
  }

  onTyping() {
    try {
      // Send typing notification through the mock WebSocket service
      const success = this.webSocketService.sendTypingNotification({
        sender: this.sender,
        recipientId: this.recipientId
      });

      if (!success) {
        console.warn('Failed to send typing notification - WebSocket not connected');
      }
    } catch (error) {
      console.error('Error in onTyping:', error);
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const message: ChatMessage = {
        content: this.newMessage,
        sender: this.sender,
        recipientId: this.recipientId,
        timestamp: new Date().toISOString() // Add timestamp
      };

      this.chatService.sendMessage(message).subscribe({
        next: (sentMessage) => {
          console.log('Message sent:', sentMessage);

          // Send the message via WebSocket for real-time updates
          try {
            this.webSocketService.sendMessage('/app/chat.sendPrivateMessage', sentMessage);
          } catch (error) {
            console.error('Error sending message via WebSocket:', error);
          }

          this.messages.push(sentMessage);
          this.newMessage = '';
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        },
        error: (error) => {
          console.error('Error sending message:', error);
          // Show an error message to the user
          alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
        }
      });
    }
  }

  selectContact(user: User) {
    this.recipientId = user.id_user.toString();
    this.loadMessages();
  }

  // Format message time for display
  getMessageTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Format timestamp to time
  formatMessageTime(timestamp: string): string {
    if (!timestamp) return this.getMessageTime();
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Get formatted date for messages
  getMessageDate(timestamp: string): string {
    if (!timestamp) return 'Aujourd\'hui';

    const messageDate = new Date(timestamp);
    const today = new Date();

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (messageDate.getDate() === today.getDate() - 1) {
      return 'Hier';
    } else {
      return messageDate.toLocaleDateString();
    }
  }
}

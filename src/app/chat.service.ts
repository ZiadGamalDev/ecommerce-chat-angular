import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messages$ = new BehaviorSubject<any[]>([]);
  private isTyping$ = new BehaviorSubject<boolean>(false);
  private agent$ = new BehaviorSubject<any | null>(null);
  private customerId: string | null = null;

  constructor() {
    this.customerId = localStorage.getItem('userId');

    this.socket = io('http://localhost:3000', { autoConnect: true });

    if (this.customerId) {
      this.socket.emit('join', { customerId: this.customerId });
    }

    this.listenForMessages();
  }

  private listenForMessages() {
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('messageSent', (msg) => {
      if (msg.customerId === this.customerId) {
        const currentMessages = this.messages$.getValue();
        if (
          !currentMessages.some(
            (m) => m.text === msg.text && m.sender === msg.sender
          )
        ) {
          this.messages$.next([...currentMessages, msg]);
        }
      }
    });

    this.socket.on('typingStarted', (data) => {
      if (data.customerId === this.customerId) {
        this.isTyping$.next(true);
      }
    });

    this.socket.on('typingStopped', (data) => {
      if (data.customerId === this.customerId) {
        this.isTyping$.next(false);
      }
    });

    this.socket.on('agentsAvailable', (availableAgents) => {
      this.agent$.next(availableAgents.length > 0 ? availableAgents[0] : null);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  checkAgents() {
    this.socket.emit('checkAgents');
  }

  sendMessage(message: string) {
    if (message.trim() && this.customerId) {
      const msg = {
        text: message,
        sender: 'customer',
        customerId: this.customerId,
        // timestamp: new Date().toISOString(),
      };
      this.socket.emit('sendMessage', msg);
      const currentMessages = this.messages$.getValue();
      this.messages$.next([...currentMessages, msg]);
    }
  }

  notifyTyping() {
    if (this.customerId) {
      this.socket.emit('startTyping', { customerId: this.customerId });
    }
  }

  stopTyping() {
    if (this.customerId) {
      this.socket.emit('stopTyping', { customerId: this.customerId });
    }
  }

  getMessages() {
    return this.messages$.asObservable();
  }

  getIsTyping() {
    return this.isTyping$.asObservable();
  }

  getAgent() {
    return this.agent$.asObservable();
  }
}


// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class ChatService {
//   private socket: Socket;
//   private messages$ = new BehaviorSubject<any[]>([
//     { text: 'Hello! How can I help you?', sender: 'agent', customerId: '123' },
//     { text: 'I have an issue with my order.', sender: 'customer', customerId: '123' }
//   ]);
//   private isTyping$ = new BehaviorSubject<boolean>(false);
//   private agent$ = new BehaviorSubject<any | null>({ name: 'John Doe', avatar: 'https://via.placeholder.com/50' });
//   private customerId: string | null = null;

//   constructor() {
//     this.socket = io('http://localhost:5000');
//   }

//   setCustomerId(id: string) {
//     this.customerId = id;
//   }

//   private listenForMessages() {
//     this.socket.on('receiveMessage', (msg) => {
//       if (msg.customerId === this.customerId) {
//         this.messages$.next([...this.messages$.getValue(), msg]);
//       }
//     });

//     this.socket.on('userTyping', (data) => {
//       if (data.customerId === this.customerId) {
//         this.isTyping$.next(true);
//         setTimeout(() => this.isTyping$.next(false), 1200);
//       }
//     });
//   }

//   private checkAgents() {
//     this.socket.emit('checkAgents');
//     this.socket.on('agentsAvailable', (availableAgents) => {
//       this.agent$.next(availableAgents.length > 0 ? availableAgents[0] : null);
//     });
//   }

//   sendMessage(message: string) {
//     if (message.trim() && this.customerId) {
//       const msg = { text: message, sender: 'customer', customerId: this.customerId };
//       this.messages$.next([...this.messages$.getValue(), msg]);
//     }
//   }

//   notifyTyping() {
//     if (this.customerId) {
//       // this.socket.emit('typing', { customerId: this.customerId });
//     }
//   }

//   getMessages() {
//     return this.messages$.asObservable();
//   }

//   getIsTyping() {
//     return this.isTyping$.asObservable();
//   }

//   getAgent() {
//     return this.agent$.asObservable();
//   }
// }

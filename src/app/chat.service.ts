// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class ChatService {
//   private socket: Socket;
//   private messages$ = new BehaviorSubject<any[]>([]);
//   private isTyping$ = new BehaviorSubject<boolean>(false);
//   private agent$ = new BehaviorSubject<any | null>(null);
//   private customerId: string | null = null;

//   constructor() {
//     this.socket = io('http://localhost:5000');
//     this.listenForMessages();
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

//   checkAgents() {
//     this.socket.emit('checkAgents');
//     this.socket.on('agentsAvailable', (availableAgents) => {
//       this.agent$.next(availableAgents.length > 0 ? availableAgents[0] : null);
//     });
//   }

//   sendMessage(message: string) {
//     if (message.trim() && this.customerId) {
//       const msg = {
//         text: message,
//         sender: 'customer',
//         customerId: this.customerId,
//       };
//       this.socket.emit('sendMessage', msg);
//       this.messages$.next([...this.messages$.getValue(), msg]);
//     }
//   }

//   notifyTyping() {
//     if (this.customerId) {
//       this.socket.emit('typing', { customerId: this.customerId });
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


import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messages$ = new BehaviorSubject<any[]>([ 
    { text: 'Hello! How can I help you?', sender: 'agent', customerId: '123' },
    { text: 'I have an issue with my order.', sender: 'customer', customerId: '123' }
  ]);
  private isTyping$ = new BehaviorSubject<boolean>(false);
  private agent$ = new BehaviorSubject<any | null>({ name: 'John Doe', avatar: 'https://via.placeholder.com/50' });
  private customerId: string | null = null;

  constructor() {
    this.socket = io('http://localhost:5000');
    // this.listenForMessages(); // معطل لاختبار البيانات الثابتة
    // this.checkAgents(); // معطل لاختبار البيانات الثابتة
  }

  setCustomerId(id: string) {
    this.customerId = id;
  }

  // استقبال الرسائل من السيرفر
  private listenForMessages() {
    this.socket.on('receiveMessage', (msg) => {
      if (msg.customerId === this.customerId) {
        this.messages$.next([...this.messages$.getValue(), msg]);
      }
    });

    this.socket.on('userTyping', (data) => {
      if (data.customerId === this.customerId) {
        this.isTyping$.next(true);
        setTimeout(() => this.isTyping$.next(false), 1200);
      }
    });
  }

  // التأكد من توفر العملاء
  private checkAgents() {
    this.socket.emit('checkAgents');
    this.socket.on('agentsAvailable', (availableAgents) => {
      this.agent$.next(availableAgents.length > 0 ? availableAgents[0] : null);
    });
  }

  // إرسال رسالة إلى السيرفر
  sendMessage(message: string) {
    if (message.trim() && this.customerId) {
      const msg = { text: message, sender: 'customer', customerId: this.customerId };
      // this.socket.emit('sendMessage', msg); // معطل لاختبار البيانات الثابتة
      this.messages$.next([...this.messages$.getValue(), msg]);
    }
  }

  // إعلام السيرفر بأن المستخدم يكتب
  notifyTyping() {
    if (this.customerId) {
      // this.socket.emit('typing', { customerId: this.customerId }); // معطل لاختبار البيانات الثابتة
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
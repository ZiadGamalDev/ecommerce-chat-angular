import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Message {
  text: string;
  sender: 'customer' | 'agent';
  chatId: string;
  timestamp?: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messages$ = new BehaviorSubject<any>([]);
  private isTyping$ = new BehaviorSubject<boolean>(false);
  private agent$ = new BehaviorSubject<any | null>(null);
  private chatId: string | null = null;

  // const customerSupportBaseUrl = 'http://localhost:3000/'
// const customerSupportBaseUrl = 'https://customer-support-rose.vercel.app/'

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.route.queryParamMap.subscribe((queryParams) => {
      const chatID = queryParams.get('chatId');
      this.chatId = chatID;
      localStorage.setItem('chatID', chatID || 'test');
      console.log('chatID:', chatID);
      console.log('token:', queryParams.get('token'));
    });

    this.socket = io('http://localhost:3000', {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  getMessagesFromBE(chatId: string): void {
    const url = `http://localhost:3000/messages/customer/${chatId}`;
    const token = localStorage.getItem('token');

    const headers = {
      'Authorization': `Bearer ${token}`
    };
  
    this.http.get<Message[]>(url, { headers }).subscribe(
      (messages) => {
        console.log('Received messages from BE:', messages);
        this.messages$.next(messages);
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }
  
  joinChat(chatId: string) {
    this.chatId = chatId;
    console.log('Attempting to join chat with ID:', this.chatId);
  
    if (this.socket.connected) {
      console.log('Socket is already connected');
      this.socket.emit('joinChat', {
        chatId: this.chatId,
        userType: 'customer',
      });
      this.listenForMessages();
    } else {
      console.log('Waiting for socket connection...');
      this.socket.once('connect', () => {
        console.log('Socket connected, joining chat...');
        this.socket.emit('joinChat', {
          chatId: this.chatId,
          userType: 'customer',
        });
        this.listenForMessages();
      });
    }
  }

  private listenForMessages() {
    this.socket.on('messageSent', ({ chatId, message }) => {
      console.log('Message received from server:', message);
      if (chatId === this.chatId) {
        const currentMessages = this.messages$.getValue();
        const newMessage: Message = {
          text: message,
          sender: 'agent',
          chatId: chatId,
          timestamp: new Date(),
        };

        this.messages$.next([...currentMessages, newMessage]);
      }
    });

    this.socket.on('messageDelivered', ({ chatId, message }) => {
      if (chatId === this.chatId) {
        const currentMessages = this.messages$.getValue();
        console.log(currentMessages);
        console.log(message);
        const newMessage: Message = {
          text: message,
          sender: 'customer',
          chatId: chatId,
          timestamp: new Date(),
        };

        this.messages$.next([...currentMessages, newMessage]);

        console.log(this.messages$.getValue());
      }
    });

    this.socket.on('typingStarted', () => {
      this.isTyping$.next(true);
    });

    this.socket.on('typingStopped', () => {
      this.isTyping$.next(false);
    });
  }

  sendMessage(message: string) {
    if (message.trim() && this.chatId && this.socket.connected) {
      const messageData = {
        chatId: this.chatId,
        message: message,
      };
      this.socket.emit('sendMessage', messageData);
    }
  }

  notifyTyping() {
    if (this.chatId && this.socket.connected) {
      this.socket.emit('startTyping', this.chatId);
    }
  }

  stopTyping() {
    if (this.chatId && this.socket.connected) {
      this.socket.emit('stopTyping', this.chatId);
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
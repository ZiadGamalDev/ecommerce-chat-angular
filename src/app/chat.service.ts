import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

interface Message {
  text: string;
  sender: 'customer' | 'agent';
  chatId: string;
  timestamp?: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messages$ = new BehaviorSubject<Message[]>([]);
  private isTyping$ = new BehaviorSubject<boolean>(false);
  private agent$ = new BehaviorSubject<any | null>(null);
  private chatId: string | null = null;

  constructor() {
    this.socket = io('http://localhost:3000', {
      autoConnect: true,
      transports: ['websocket', 'polling']
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

  joinChat(chatId: string) {
    this.chatId = chatId;
    if (this.socket.connected) {
      this.socket.emit('joinChat', { chatId: this.chatId, userType: 'customer' });
      this.listenForMessages();
    } else {
      this.socket.once('connect', () => {
        this.socket.emit('joinChat', { chatId: this.chatId, userType: 'customer' });
        this.listenForMessages();
      });
    }
  }

  private listenForMessages() {
    this.socket.on('messageSent', ({ chatId, message }) => {
      if (chatId === this.chatId) {
        const currentMessages = this.messages$.getValue();
        const newMessage: Message = {
          text: message,
          sender: 'agent',
          chatId: chatId,
          timestamp: new Date()
        };
        if (
          !currentMessages.some(
            (m) => m.text === message && m.sender === 'agent'
          )
        ) {
          this.messages$.next([...currentMessages, newMessage]);
        }
      }
    });

    this.socket.on('messageDelivered', ({ chatId, message }) => {
      if (chatId === this.chatId) {
        const currentMessages = this.messages$.getValue();
        const newMessage: Message = {
          text: message,
          sender: 'customer',
          chatId: chatId,
          timestamp: new Date()
        };
        if (
          !currentMessages.some(
            (m) => m.text === message && m.sender === 'customer'
          )
        ) {
          this.messages$.next([...currentMessages, newMessage]);
        }
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
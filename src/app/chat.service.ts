import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

interface UserRef {
  _id: string;
  name: string;
  email: string;
}

interface Message {
  id?: string;
  chatId: string;
  senderId: string | UserRef | null;
  receiverId?: string | UserRef | null;
  content: string;
  status?: string;
  createdAt?: Date | string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messages$ = new BehaviorSubject<Message[]>([]);
  private isTyping$ = new BehaviorSubject<boolean>(false);
  private agent$ = new BehaviorSubject<any | null>(null);
  private chatId: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.route.queryParamMap.subscribe((queryParams) => {
      const chatID = queryParams.get('chatId');
      this.chatId = chatID;
      localStorage.setItem('chatID', chatID || 'test');
      console.log('chatID:', chatID);
      console.log('token:', queryParams.get('token'));
      localStorage.setItem('token', queryParams.get('token') || '');
      localStorage.setItem('userId', queryParams.get('userId') || '');
    });

    this.socket = io(environment.socketUrl, {
      auth: {
        token: localStorage.getItem('token') || '',
      },
      autoConnect: true,
      transports: ['websocket', 'polling'],
      forceNew: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      upgrade: true,
      secure: environment.socketUrl.startsWith('https'),
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
    const url = `${environment.apiUrl}/messages/customer/${chatId}`;
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
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
      this.getMessagesFromBE(chatId);
    } else {
      console.log('Waiting for socket connection...');
      this.socket.once('connect', () => {
        console.log('Socket connected, joining chat...');
        this.socket.emit('joinChat', {
          chatId: this.chatId,
          userType: 'customer',
        });
        this.listenForMessages();
        this.getMessagesFromBE(chatId);
      });
    }
  }

  private listenForMessages() {
    this.socket.on('messageReceived', ({ message }) => {
      console.log('Message received from server:', message);
      if (message.chatId === this.chatId) {
        const currentMessages = this.messages$.getValue();
        const newMessage: Message = {
          id: message._id || message.id,
          chatId: message.chatId,
          senderId: message.senderId?._id || message.senderId || null,
          receiverId: message.receiverId?._id || message.receiverId || null,
          content: message.content,
          status: message.status,
          createdAt: message.createdAt
            ? new Date(message.createdAt)
            : new Date(),
        };
        if (!currentMessages.some((msg) => msg.id === newMessage.id)) {
          this.messages$.next([...currentMessages, newMessage]);
        }
      }
    });

    this.socket.on('messageDelivered', ({ message }) => {
      console.log('Message delivered from server:', message);
      if (message.chatId === this.chatId) {
        const currentMessages = this.messages$.getValue();
        const deliveredMessage: Message = {
          id: message._id || message.id,
          chatId: message.chatId,
          senderId: message.senderId?._id || message.senderId || null,
          receiverId: message.receiverId?._id || message.receiverId || null,
          content: message.content,
          status: message.status,
          createdAt: message.createdAt
            ? new Date(message.createdAt)
            : new Date(),
        };

        const updatedMessages = currentMessages.map((msg) =>
          msg.createdAt === deliveredMessage.createdAt && !msg.id
            ? deliveredMessage
            : msg

        );
        if (!updatedMessages.some((msg) => msg.id === deliveredMessage.id)) {
          this.messages$.next([...updatedMessages, deliveredMessage]);
        } else {
          this.messages$.next(updatedMessages);
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

  getMessages(): Observable<Message[]> {
    return this.messages$.asObservable();
  }

  getIsTyping(): Observable<boolean> {
    return this.isTyping$.asObservable();
  }

  getAgent(): Observable<any> {
    return this.agent$.asObservable();
  }
}

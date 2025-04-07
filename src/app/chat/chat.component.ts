import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  NgZone,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

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

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  messages: Message[] = [];
  message: string = '';
  agent: any = null;
  isTyping: boolean = false;
  isLoading: boolean = true;
  userId: string | null = null;
  private subscription = new Subscription();

  @ViewChild('chatBody') chatBody!: ElementRef;

  faSend = faPaperPlane;
  faUser = faUserCircle;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    console.log('Retrieved userId:', this.userId);

    const chatId = localStorage.getItem('chatID');

    if (!chatId) {
      console.warn('No chatID found');
      return;
    }

    this.chatService.joinChat(chatId);
    this.chatService.getMessagesFromBE(chatId);

    this.subscription.add(
      this.chatService.getMessages().subscribe((messages) => {
        this.ngZone.run(() => {
          console.log('Messages received in component:', messages);
          this.messages = messages.map((msg: any) => ({
            id: msg.id,
            chatId: msg.chatId,
            senderId: msg.senderId || null,
            receiverId: msg.receiverId || null,
            content: msg.content,
            status: msg.status,
            createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
          }));
        });
      })
    );

    this.subscription.add(
      this.chatService.getIsTyping().subscribe((typing) => {
        this.ngZone.run(() => {
          this.isTyping = typing;
        });
      })
    );

    this.subscription.add(
      this.chatService.getAgent().subscribe((agent) => {
        this.ngZone.run(() => {
          this.agent = agent;
          this.isLoading = false;
        });
      })
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.message.trim()) {
      const messageToSend = this.message;
      const chatId = localStorage.getItem('chatID');

      const newMessage: Message = {
        chatId: chatId || '',
        senderId: this.userId || '',
        content: messageToSend,
        status: 'sent',
        createdAt: new Date(),
      };
      this.messages = [...this.messages, newMessage];

      this.message = '';
      this.chatService.sendMessage(messageToSend);
      this.chatService.stopTyping();
    }
  }

  onTyping() {
    if (this.message.trim()) {
      this.chatService.notifyTyping();
    } else {
      this.chatService.stopTyping();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.chatService.stopTyping();
  }

  isMyMessage(message: Message): boolean {
    const userId = this.userId;

    const sender =
      typeof message.senderId === 'string'
        ? message.senderId
        : message.senderId?._id;

    const receiver =
      typeof message.receiverId === 'string'
        ? message.receiverId
        : message.receiverId?._id;

    if (sender === userId) return true;

    if (!sender && receiver !== userId) return true;

    return false;
  }

  private scrollToBottom(): void {
    if (this.chatBody) {
      const element = this.chatBody.nativeElement;
      const shouldAutoScroll =
        element.scrollHeight - element.scrollTop - element.clientHeight < 100;

      if (shouldAutoScroll) {
        requestAnimationFrame(() => {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth',
          });
        });
      }
    }
  }
}

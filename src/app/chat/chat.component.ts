import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

interface Message {
  text: string;
  sender: 'customer' | 'agent';
  chatId: string;
  timestamp?: Date;
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
  private subscription = new Subscription();

  @ViewChild('chatBody') chatBody!: ElementRef;

  faSend = faPaperPlane;
  faUser = faUserCircle;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const chatId = localStorage.getItem('chatID');
    
    if (!chatId) {
      console.warn('No chatID found');
      return;
    }

    this.chatService.joinChat(chatId);

    this.subscription.add(
      this.chatService.getMessages().subscribe((messages) => {
        this.messages = messages;
        if (messages.length === 0) {
          this.messages.push({
            text: 'Welcome to Customer Support! How can I help you today?',
            sender: 'agent',
            chatId: chatId,
            timestamp: new Date()
          });
        }
      })
    );

    this.subscription.add(
      this.chatService
        .getIsTyping()
        .subscribe((typing) => (this.isTyping = typing))
    );

    this.subscription.add(
      this.chatService.getAgent().subscribe((agent) => {
        this.agent = agent;
        this.isLoading = false;
      })
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.message.trim()) {
      const messageToSend = this.message;
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

  private scrollToBottom(): void {
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTop =
        this.chatBody.nativeElement.scrollHeight;
    }
  }
}
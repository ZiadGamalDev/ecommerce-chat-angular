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

interface Message {
  text: { content: string };
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
  messages: any = [];
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
    console.log("Retrieved userId:", this.userId);
    
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
            ...msg,
            text: typeof msg.text === 'string' ? { content: msg.text } : msg.text,
          }));
        });
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

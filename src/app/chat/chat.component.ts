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

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  messages: any[] = [];
  message: string = '';
  agent: any = null;
  isTyping: boolean = false;
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
    const customerId = localStorage.getItem('userId');
    
    if (!customerId) {
      console.warn('No customerId founded');
      this.router.navigate(['/']);
      return;
    }

    this.subscription.add(
      this.chatService.getMessages().subscribe((messages) => {
        this.messages = messages;
      })
    );

    this.subscription.add(
      this.chatService
        .getIsTyping()
        .subscribe((typing) => (this.isTyping = typing))
    );

    this.subscription.add(
      this.chatService.getAgent().subscribe((agent) => (this.agent = agent))
    );

    this.chatService.checkAgents();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.message.trim()) {
      this.chatService.sendMessage(this.message);
      this.message = '';
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

// import { Component, signal, effect, ViewChild, ElementRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { faPaperPlane, faUserCircle } from '@fortawesome/free-solid-svg-icons';
// import { FormsModule } from '@angular/forms';
// import { trigger, transition, style, animate } from '@angular/animations';

// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [CommonModule, FontAwesomeModule, FormsModule],
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css'],
//   animations: [
//     trigger('messageAnimation', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateY(10px)' }),
//         animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
//       ]),
//     ]),
//   ],
// })
// export class ChatComponent {
//   @ViewChild('chatBody') chatBody!: ElementRef;

//   faSend = faPaperPlane;
//   faUser = faUserCircle;

//   messages = signal<{ text: string; sender: string }[]>([
//     { text: 'Hello! How can I assist you?', sender: 'agent' },
//     { text: 'Thanks for reaching out! How can I help?', sender: 'agent' }
//   ]);
//   message: string = "";
//   agent = signal<{ name: string; avatar: string; id: number } | null>(null);
//   isTyping = signal<boolean>(false);

//   constructor() {
//     effect(() => {
//       if (this.messages().length && this.messages()[this.messages().length - 1].sender === 'customer') {
//         this.isTyping.set(true);
//         setTimeout(() => {
//           this.messages.update((msgs) =>
//             [...msgs ,{ text: 'Thanks for reaching out! How can I help?', sender: 'agent' }]
//           );
//           this.isTyping.set(false);
//         }, 1500);
//       }
//     });
//   }

//   toggleAgent() {
//     this.agent.set(
//       this.agent() ? null : { name: 'John Doe', avatar: '', id: 1 }
//     );
//   }

//   sendMessage() {
//     if (this.message.trim()) {
//       this.messages.update((msgs) => [
//         ...msgs,
//         { text: this.message, sender: 'customer' } // حدد المرسل
//       ]);
//       this.message = '';
//     }

//     this.scrollToBottom();
//   }

//   scrollToBottom() {
//     setTimeout(() => {
//       this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
//     }, 100);
//   }

//   receiveMessage(text: string) {
//     this.messages.update((msgs) => [
//       ...msgs,
//       { text: text, sender: 'agent' }
//     ]);
//   }
// }

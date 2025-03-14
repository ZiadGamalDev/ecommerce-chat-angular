// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { ChatService } from '../chat.service';
// import { Subscription } from 'rxjs';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { faPaperPlane, faUserCircle } from '@fortawesome/free-solid-svg-icons';

// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule, FontAwesomeModule],
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css'],
// })
// export class ChatComponent implements OnInit, OnDestroy {
//   messages: any[] = [];
//   message: string = '';
//   agent: any = null;
//   isTyping: boolean = false;
//   isAgentAvailable: boolean = false;
//   private subscription = new Subscription(); // تحسين الاشتراكات

//   faSend = faPaperPlane;
//   faUser = faUserCircle;

//   constructor(private chatService: ChatService, private route: ActivatedRoute) {}

//   ngOnInit() {
//     const customerId = this.route.snapshot.queryParamMap.get('customerId');
//     if (customerId) {
//       this.chatService.setCustomerId(customerId);
//     }

//     this.subscription.add(
//       this.chatService.getMessages().subscribe((messages) => (this.messages = messages))
//     );

//     this.subscription.add(
//       this.chatService.getIsTyping().subscribe((typing) => (this.isTyping = typing))
//     );

//     this.subscription.add(
//       this.chatService.getAgent().subscribe((agent) => {
//         this.agent = agent;
//         this.isAgentAvailable = !!agent;
//       })
//     );

//     this.chatService.checkAgents();
//   }

//   sendMessage() {
//     if (!this.isAgentAvailable) {
//       alert('No agents available. Please try again later.');
//       return;
//     }

//     if (this.message.trim()) {
//       this.chatService.sendMessage(this.message);
//       this.message = '';
//     }
//   }

//   onTyping() {
//     this.chatService.notifyTyping();
//   }

//   ngOnDestroy() {
//     this.subscription.unsubscribe();
//   }
// }


import { Component, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class ChatComponent {
  @ViewChild('chatBody') chatBody!: ElementRef;

  faSend = faPaperPlane;
  faUser = faUserCircle;

  messages = signal<{ text: string; sender: string }[]>([
    { text: 'Hello! How can I assist you?', sender: 'agent' },
    { text: 'Thanks for reaching out! How can I help?', sender: 'agent' }
  ]);
  message: string = "";
  agent = signal<{ name: string; avatar: string; id: number } | null>(null);
  isTyping = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.messages().length && this.messages()[this.messages().length - 1].sender === 'customer') {
        this.isTyping.set(true);
        setTimeout(() => {
          this.messages.update((msgs) =>
            [...msgs ,{ text: 'Thanks for reaching out! How can I help?', sender: 'agent' }]
          );
          this.isTyping.set(false);
        }, 1500);
      }
    });
  }

  toggleAgent() {
    this.agent.set(
      this.agent() ? null : { name: 'John Doe', avatar: '', id: 1 }
    );
  }

  sendMessage() {
    if (this.message.trim()) {
      this.messages.update((msgs) => [
        ...msgs,
        { text: this.message, sender: 'customer' } // حدد المرسل
      ]);
      this.message = ''; 
    }

    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }, 100);
  }
  
  receiveMessage(text: string) {
    this.messages.update((msgs) => [
      ...msgs,
      { text: text, sender: 'agent' }
    ]);
  }
}
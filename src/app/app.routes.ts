import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ChatComponent } from './chat/chat.component';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: ChatComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
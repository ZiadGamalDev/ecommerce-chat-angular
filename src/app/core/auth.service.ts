import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'https://customer-support-rose.vercel.app/';
  private tokenSubject = new BehaviorSubject<string | null>(null);

  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    } else {
      this.router.navigate(['/']);
    }
  }

  saveUser(token: string, userId: string) {
    this.tokenSubject.next(token);
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
  }

  removeUser() {
    this.tokenSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  logout() {
    this.removeUser();
    this.router.navigate(['/']);
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}auth/login`, { email, password })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Login error:', error);
          return throwError(error);
        })
      );
  }

  register(
    name: string,
    email: string,
    password: string,
    confirmedPassword: string
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}auth/register`, {
        name,
        email,
        password,
        confirmedPassword,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Registration error:', error);
          return throwError(error);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}

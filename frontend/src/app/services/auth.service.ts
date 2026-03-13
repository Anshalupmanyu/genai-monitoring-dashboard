import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { AuthResponse, User } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  
  // State
  private tokenSig = signal<string | null>(localStorage.getItem('token'));
  private currentUserSig = signal<User | null>(null);

  // Derived state
  isAuthenticated = computed(() => !!this.tokenSig());
  isAdmin = computed(() => this.currentUserSig()?.role === 'admin');
  currentUser = computed(() => this.currentUserSig());

  constructor(private http: HttpClient, private router: Router) {
    if (this.tokenSig()) {
      this.loadUserProfile().subscribe();
    }
  }

  getToken(): string | null {
    return this.tokenSig();
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res)),
      tap(() => this.loadUserProfile().subscribe())
    );
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    this.tokenSig.set(null);
    this.currentUserSig.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.access_token);
    this.tokenSig.set(authResult.access_token);
  }

  loadUserProfile(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUserSig.set(user)),
      catchError(err => {
        if (err.status === 401) {
          this.logout();
        }
        return of(null);
      })
    );
  }
}

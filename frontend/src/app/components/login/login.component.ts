import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card glass">
        
        <div class="auth-header">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h2>GenAI Monitor</h2>
          <p>{{ isLoginMode() ? 'Sign in to your account' : 'Create a new account' }}</p>
        </div>

        @if (errorMsg()) {
          <div class="error-banner">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {{ errorMsg() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #authForm="ngForm" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              class="form-input" 
              [(ngModel)]="formData.username" 
              required 
              placeholder="admin"
              autocomplete="username">
          </div>

          @if (!isLoginMode()) {
            <div class="form-group" style="animation: slideDown var(--transition-fast);">
              <label class="form-label" for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                [(ngModel)]="formData.email" 
                placeholder="admin@example.com"
                autocomplete="email">
            </div>
          }

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              [(ngModel)]="formData.password" 
              required 
              placeholder="••••••••"
              autocomplete="current-password">
          </div>

          <button type="submit" class="btn-primary w-100" [disabled]="loading() || !authForm.form.valid">
            @if (loading()) {
              <div class="spinner"></div>
            } @else {
              {{ isLoginMode() ? 'Sign In' : 'Sign Up' }}
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>
            {{ isLoginMode() ? "Don't have an account?" : "Already have an account?" }}
            <a href="javascript:void(0)" (click)="toggleMode()">
              {{ isLoginMode() ? 'Sign up' : 'Sign in' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 0%, var(--bg-surface) 0%, var(--bg-base) 100%);
      padding: 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 2rem;
      border-radius: var(--border-radius-lg);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: formEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: var(--accent-gradient);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      color: white;
      box-shadow: 0 0 20px rgba(122, 162, 247, 0.3);
    }
    
    .logo-icon svg { width: 28px; height: 28px; }

    .auth-header h2 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .error-banner {
      background: rgba(247, 118, 142, 0.1);
      border: 1px solid rgba(247, 118, 142, 0.2);
      color: var(--status-error);
      padding: 0.75rem 1rem;
      border-radius: var(--border-radius-sm);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      animation: slideDown var(--transition-fast);
    }

    .w-100 {
      width: 100%;
      margin-top: 0.5rem;
    }

    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.875rem;
    }

    .auth-footer a {
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 500;
      transition: color var(--transition-fast);
    }
    
    .auth-footer a:hover {
      color: var(--accent-secondary);
      text-decoration: underline;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes formEnter {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); height: 0; overflow: hidden; padding: 0; margin: 0; }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LoginComponent {
  isLoginMode = signal(true);
  loading = signal(false);
  errorMsg = signal('');

  formData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.errorMsg.set('');
  }

  onSubmit() {
    this.loading.set(true);
    this.errorMsg.set('');

    if (this.isLoginMode()) {
      this.authService.login({ username: this.formData.username, password: this.formData.password })
        .subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.loading.set(false);
            this.errorMsg.set(err.error?.detail || 'Invalid credentials');
          }
        });
    } else {
      this.authService.register(this.formData)
        .subscribe({
          next: () => {
            // Auto login after registration
            this.authService.login({ username: this.formData.username, password: this.formData.password })
              .subscribe(() => this.router.navigate(['/']));
          },
          error: (err) => {
            this.loading.set(false);
            this.errorMsg.set(err.error?.detail || 'Registration failed');
          }
        });
    }
  }
}

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar glass">
      <div class="navbar-container">
        <!-- Logo -->
        <a routerLink="/" class="navbar-brand">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <span class="logo-text">GenAI <span class="highlight">Monitor</span></span>
        </a>

        <!-- Links -->
        <div class="navbar-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            Dashboard
          </a>
          <a routerLink="/console" routerLinkActive="active" class="nav-link">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
            Prompt Console
          </a>
          @if (authService.isAdmin()) {
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-link admin-link">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Users
            </a>
          }
        </div>

        <!-- User Menu -->
        <div class="navbar-user">
          <div class="user-info">
            <span class="username">{{ authService.currentUser()?.username }}</span>
            <span class="role-badge" [class.admin]="authService.isAdmin()">{{ authService.currentUser()?.role }}</span>
          </div>
          <button class="btn-logout" (click)="logout()" title="Logout">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      z-index: 1000;
      border-bottom: 1px solid var(--border-color);
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--text-light);
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: var(--accent-gradient);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 0 15px rgba(122, 162, 247, 0.4);
    }
    .logo-icon svg { width: 20px; height: 20px; }

    .logo-text {
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
    }
    .logo-text .highlight { color: var(--accent-primary); }

    .navbar-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link:hover {
      color: var(--text-light);
      background-color: var(--bg-surface-hover);
    }

    .nav-link.active {
      color: var(--accent-primary);
      background-color: rgba(122, 162, 247, 0.1);
    }

    .admin-link {
      border: 1px dashed var(--border-color);
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .username {
      color: var(--text-light);
      font-weight: 500;
      font-size: 0.9rem;
    }

    .role-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background-color: var(--bg-elevated);
      color: var(--text-muted);
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 2px;
    }

    .role-badge.admin {
      background-color: rgba(224, 175, 104, 0.2);
      color: var(--status-warning);
    }

    .btn-logout {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-logout:hover {
      background-color: rgba(247, 118, 142, 0.1);
      color: var(--status-error);
      border-color: rgba(247, 118, 142, 0.3);
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

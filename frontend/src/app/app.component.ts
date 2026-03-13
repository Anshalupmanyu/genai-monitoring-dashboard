import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    @if (authService.isAuthenticated()) {
      <app-navbar></app-navbar>
    }
    <main class="app-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-content {
      padding-top: 70px; /* Space for fixed navbar */
      min-height: 100vh;
      animation: fadeIn var(--transition-normal);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}

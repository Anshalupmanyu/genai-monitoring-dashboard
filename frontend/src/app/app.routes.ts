import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard | GenAI Monitor'
      },
      {
        path: 'console',
        loadComponent: () => import('./components/prompt-console/prompt-console.component').then(m => m.PromptConsoleComponent),
        title: 'Prompt Console | GenAI Monitor'
      },
      {
        path: 'admin/users',
        canActivate: [authGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent),
        title: 'User Management | GenAI Monitor'
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

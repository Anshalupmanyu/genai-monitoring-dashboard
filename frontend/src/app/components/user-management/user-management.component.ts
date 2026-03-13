import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container container">
      <div class="page-header">
        <div>
          <h1>User Management</h1>
          <p>Admin panel to manage system access and roles.</p>
        </div>
        <div class="admin-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Admin Access
        </div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr>
                  <td style="color: var(--text-muted)">#{{ user.id }}</td>
                  <td class="user-name">
                    <div class="avatar-sm">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    {{ user.username }}
                    @if (user.id === authService.currentUser()?.id) {
                      <span class="you-badge">You</span>
                    }
                  </td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.created_at | date:'MMM d, yyyy' }}</td>
                  <td>
                    <select class="role-select" 
                            [ngModel]="user.role" 
                            (ngModelChange)="updateRole(user.id, $event)"
                            [disabled]="user.id === authService.currentUser()?.id"
                            [class.admin]="user.role === 'admin'">
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <!-- Deletion not fully implemented in API for simplicity, but UI exists -->
                    <button class="action-btn delete" 
                            title="Delete User"
                            [disabled]="user.id === authService.currentUser()?.id">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .admin-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(224, 175, 104, 0.15);
      color: var(--status-warning);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid rgba(224, 175, 104, 0.3);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .data-table th, .data-table td {
      padding: 1.25rem 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    .data-table th {
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.05em;
    }

    .user-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-light);
      font-weight: 500;
    }

    .avatar-sm {
      width: 28px;
      height: 28px;
      background: var(--bg-elevated);
      color: var(--text-muted);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .you-badge {
      background: rgba(122, 162, 247, 0.15);
      color: var(--accent-primary);
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .role-select {
      background-color: var(--bg-elevated);
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.75rem;
      border-radius: var(--border-radius-sm);
      font-size: 0.85rem;
      cursor: pointer;
      outline: none;
      transition: all var(--transition-fast);
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b92a5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      padding-right: 2rem;
    }

    .role-select:focus {
      border-color: var(--text-light);
    }
    
    .role-select.admin {
      color: var(--status-warning);
    }

    .role-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .action-btn {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .action-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .action-btn.delete:not(:disabled):hover {
      background: rgba(247, 118, 142, 0.1);
      color: var(--status-error);
      border-color: rgba(247, 118, 142, 0.3);
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users = signal<User[]>([]);

  constructor(
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.apiService.getUsers().subscribe(
      data => this.users.set(data)
    );
  }

  updateRole(userId: number, newRole: 'admin' | 'viewer') {
    this.apiService.updateUserRole(userId, newRole).subscribe(
      updatedUser => {
        this.users.update(list => 
          list.map(u => u.id === userId ? updatedUser : u)
        );
      }
    );
  }
}

import { Component, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PromptResponse } from '../../models/interfaces';

@Component({
  selector: 'app-prompt-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="console-container container">
      
      <div class="console-header">
        <div>
          <h2>Prompt Console</h2>
          <p>Send instructions to the local Mistral model</p>
        </div>
        <div class="model-badge">
          <span class="pulse"></span>
          Mistral 7B (Ollama)
        </div>
      </div>

      <div class="chat-interface card">
        <div class="chat-history" #scrollContainer>
          
          @if (prompts().length === 0 && !loading()) {
            <div class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <h3>Start a conversation</h3>
              <p>Type a prompt below to interact with the LLM</p>
            </div>
          }

          @for (prompt of prompts(); track prompt.id) {
            <!-- User Prompt -->
            <div class="message-row user-row">
              <div class="message user-message">
                {{ prompt.prompt_text }}
              </div>
            </div>

            <!-- AI Response -->
            <div class="message-row ai-row">
              <div class="avatar ai-avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
              </div>
              <div class="message-content">
                <div class="message ai-message" [class.error]="prompt.status === 'error'">
                  {{ prompt.response_text || 'Thinking...' }}
                </div>
                
                @if (prompt.metric && prompt.status === 'success') {
                  <div class="message-metrics">
                    <span class="metric-badge" title="Latency">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      {{ prompt.metric.latency_ms | number:'1.0-0' }}ms
                    </span>
                    <span class="metric-badge" title="Tokens (In/Out)">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                      {{ prompt.metric.input_tokens }} ↓ / {{ prompt.metric.output_tokens }} ↑
                    </span>
                    <span class="metric-badge highlight" title="Speed">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                      {{ (prompt.metric.output_tokens / (prompt.metric.latency_ms / 1000)) | number:'1.1-1' }} t/s
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          @if (loading()) {
            <!-- Loading Indicator -->
            <div class="message-row ai-row">
              <div class="avatar ai-avatar typing">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              </div>
            </div>
          }
        </div>

        <div class="chat-input-area">
          <form (ngSubmit)="sendPrompt()" class="input-form">
            <input 
              type="text" 
              class="form-input chat-input" 
              [(ngModel)]="currentPrompt" 
              name="promptText" 
              placeholder="Ask Mistral anything..." 
              [disabled]="loading()"
              autocomplete="off"
              autofocus>
            <button type="submit" class="btn-primary btn-send" [disabled]="!currentPrompt.trim() || loading()">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .console-container {
      max-width: 1000px;
      height: calc(100vh - 70px);
      display: flex;
      flex-direction: column;
      padding-bottom: 2rem;
    }

    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .model-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-elevated);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      border: 1px solid var(--border-color);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--status-success);
    }

    .pulse {
      width: 8px;
      height: 8px;
      background: var(--status-success);
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(158, 206, 106, 0.7);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(158, 206, 106, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(158, 206, 106, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(158, 206, 106, 0); }
    }

    .chat-interface {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
      border-radius: var(--border-radius-lg);
    }

    .chat-history {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      scroll-behavior: smooth;
    }

    .empty-state {
      margin: auto;
      text-align: center;
      color: var(--text-muted);
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      background: var(--bg-elevated);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      color: var(--accent-primary);
    }

    .message-row {
      display: flex;
      width: 100%;
    }

    .user-row {
      justify-content: flex-end;
      animation: slideInRight var(--transition-fast);
    }

    .ai-row {
      justify-content: flex-start;
      gap: 1rem;
      animation: slideInLeft var(--transition-fast);
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .ai-avatar {
      background: var(--accent-gradient);
      color: white;
    }

    .message-content {
      max-width: 80%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .message {
      padding: 1rem 1.25rem;
      border-radius: 18px;
      line-height: 1.5;
      font-size: 0.95rem;
      white-space: pre-wrap;
    }

    .user-message {
      background: var(--bg-elevated);
      color: var(--text-light);
      border-bottom-right-radius: 4px;
      max-width: 80%;
    }

    .ai-message {
      background: rgba(122, 162, 247, 0.1);
      border: 1px solid rgba(122, 162, 247, 0.2);
      color: var(--text-main);
      border-bottom-left-radius: 4px;
    }
    
    .ai-message.error {
      background: rgba(247, 118, 142, 0.1);
      border-color: rgba(247, 118, 142, 0.2);
      color: var(--status-error);
    }

    .message-metrics {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .metric-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      background: var(--bg-base);
      color: var(--text-muted);
      padding: 0.25rem 0.6rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .metric-badge.highlight {
      color: var(--accent-secondary);
      border-color: rgba(187, 154, 247, 0.3);
    }

    .chat-input-area {
      padding: 1rem 1.5rem;
      background: var(--bg-surface-hover);
      border-top: 1px solid var(--border-color);
    }

    .input-form {
      display: flex;
      gap: 0.75rem;
      align-items: stretch;
    }

    .chat-input {
      flex: 1;
      border-radius: 24px;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      background: var(--bg-base);
    }

    .btn-send {
      width: 54px;
      border-radius: 24px;
      padding: 0;
    }

    /* Typing indicator */
    .typing { gap: 3px; background: var(--bg-elevated); }
    .dot { width: 4px; height: 4px; background: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both; }
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class PromptConsoleComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  prompts = signal<PromptResponse[]>([]);
  loading = signal<boolean>(false);
  currentPrompt: string = '';

  constructor(private apiService: ApiService) {
    this.loadHistory();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch(err) {}
    }
  }

  loadHistory() {
    // Load last 100 prompts on init
    this.apiService.getPrompts(0, 100).subscribe(
      data => this.prompts.set(data.reverse())
    );
  }

  sendPrompt() {
    if (!this.currentPrompt.trim()) return;

    const text = this.currentPrompt;
    this.currentPrompt = '';
    this.loading.set(true);

    // Optimistically add to UI
    const tempId = Date.now();
    const tempPrompt: PromptResponse = {
      id: tempId,
      user_id: 0,
      prompt_text: text,
      response_text: null,
      model_name: 'mistral',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    this.prompts.update(p => [...p, tempPrompt]);

    this.apiService.inferPrompt(text).subscribe({
      next: (response) => {
        // Replace temp prompt with real response
        this.prompts.update(p => p.map(pr => pr.id === tempId ? response : pr));
        this.loading.set(false);
      },
      error: (err) => {
        // Handle error visually
        tempPrompt.status = 'error';
        tempPrompt.response_text = err.error?.detail || 'Failed to connect to backend';
        this.prompts.update(p => p.map(pr => pr.id === tempId ? tempPrompt : pr));
        this.loading.set(false);
      }
    });
  }
}

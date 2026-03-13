import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MetricsChartsComponent } from '../metrics-charts/metrics-charts.component';
import { MetricsSummary, MetricsTimeseries, Metric } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MetricsChartsComponent, DecimalPipe],
  template: `
    <div class="dashboard-container container">
      <div class="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Monitor your Generative AI inference metrics in real-time.</p>
        </div>
        <button routerLink="/console" class="btn-primary">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          New Inference
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="stat-card card">
          <div class="stat-icon calls-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div class="stat-content">
            <h4 class="stat-label">Total API Calls</h4>
            <div class="stat-value">{{ summary()?.total_prompts || 0 }}</div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon tokens-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <div class="stat-content">
            <h4 class="stat-label">Total Tokens Used</h4>
            <div class="stat-value">{{ summary()?.total_tokens || 0  | number }}</div>
            <div class="stat-subtext">Avg: {{ summary()?.avg_tokens_per_prompt || 0 }} / req</div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon latency-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-content">
            <h4 class="stat-label">Avg. Latency</h4>
            <div class="stat-value">{{ summary()?.avg_latency_ms || 0 }} <span class="unit">ms</span></div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon success-icon" [style.color]="summary()?.success_rate! < 90 ? 'var(--status-error)' : 'var(--status-success)'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="stat-content">
            <h4 class="stat-label">Success Rate</h4>
            <div class="stat-value">{{ summary()?.success_rate || 0 }}<span class="unit">%</span></div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      @if (timeseries().length > 0) {
        <app-metrics-charts [data]="timeseries()"></app-metrics-charts>
      }

      <div style="margin-top: 1.5rem;" class="card">
        <h3>Recent Inferences</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Tokens (In/Out)</th>
              </tr>
            </thead>
            <tbody>
              @for (metric of recentMetrics(); track metric.id) {
                <tr>
                  <td style="color: var(--text-muted)">#{{ metric.prompt_id }}</td>
                  <td>{{ metric.created_at | date:'M/d/yy, h:mm a' }}</td>
                  <td>
                    <span class="badge" [class.success]="metric.status === 'success'" [class.error]="metric.status === 'error'">
                      {{ metric.status }}
                    </span>
                  </td>
                  <td [style.color]="metric.latency_ms > 2000 ? 'var(--status-warning)' : ''">
                    {{ metric.latency_ms | number:'1.0-0' }}ms
                  </td>
                  <td>
                    <span class="token-val" title="Input">{{ metric.input_tokens }}</span> /
                    <span class="token-val highlight" title="Output">{{ metric.output_tokens }}</span>
                  </td>
                </tr>
              }
              @if (recentMetrics().length === 0) {
                <tr>
                  <td colspan="5" class="empty-row">No inferences yet. Go to Prompt Console to start!</td>
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
      align-items: center;
      margin-bottom: 2rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon svg { width: 24px; height: 24px; }
    
    .calls-icon { background: rgba(122, 162, 247, 0.15); color: var(--accent-primary); }
    .tokens-icon { background: rgba(187, 154, 247, 0.15); color: var(--accent-secondary); }
    .latency-icon { background: rgba(224, 175, 104, 0.15); color: var(--status-warning); }
    .success-icon { background: rgba(158, 206, 106, 0.15); color: var(--status-success); }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-light);
      line-height: 1;
    }
    
    .stat-value .unit {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-left: 2px;
    }

    .stat-subtext {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    /* Table styles */
    .table-responsive {
      overflow-x: auto;
      margin-top: 1rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .data-table th, .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .data-table th {
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .data-table tbody tr {
      transition: background-color var(--transition-fast);
    }
    
    .data-table tbody tr:hover {
      background-color: var(--bg-surface-hover);
    }

    .empty-row {
      text-align: center !important;
      padding: 3rem 1rem !important;
      color: var(--text-muted);
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    .badge.success { background: rgba(158, 206, 106, 0.15); color: var(--status-success); }
    .badge.error { background: rgba(247, 118, 142, 0.15); color: var(--status-error); }

    .token-val { color: var(--text-muted); }
    .token-val.highlight { color: var(--accent-secondary); font-weight: 500; }
  `]
})
export class DashboardComponent implements OnInit {
  summary = signal<MetricsSummary | null>(null);
  timeseries = signal<MetricsTimeseries[]>([]);
  recentMetrics = signal<Metric[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.apiService.getMetricsSummary().subscribe(s => this.summary.set(s));
    this.apiService.getMetricsTimeseries(100).subscribe(t => this.timeseries.set(t));
    this.apiService.getRecentMetrics(5).subscribe(m => this.recentMetrics.set(m));
  }
}

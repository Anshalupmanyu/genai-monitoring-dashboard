import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MetricsTimeseries } from '../../models/interfaces';

@Component({
  selector: 'app-metrics-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="charts-grid">
      <!-- Latency Line Chart -->
      <div class="chart-card card">
        <div class="chart-header">
          <h3>Response Latency (ms)</h3>
        </div>
        <div class="chart-body">
          <canvas baseChart
            [data]="latencyChartData"
            [options]="lineChartOptions"
            [type]="'line'">
          </canvas>
        </div>
      </div>

      <!-- Token Bar Chart -->
      <div class="chart-card card">
        <div class="chart-header">
          <h3>Token Usage </h3>
        </div>
        <div class="chart-body">
          <canvas baseChart
            [data]="tokenChartData"
            [options]="barChartOptions"
            [type]="'bar'">
          </canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    .chart-header {
      margin-bottom: 1rem;
      h3 { font-size: 1.1rem; color: var(--text-light); }
    }

    .chart-body {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class MetricsChartsComponent implements OnChanges {
  @Input() data: MetricsTimeseries[] = [];

  // Common Theme config for charts
  private themeConfig = {
    fontColor: '#8b92a5',
    gridColor: 'rgba(255, 255, 255, 0.05)',
  };

  // ── Latency Line Chart ──────────────────────────────
  public latencyChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Latency (ms)',
        backgroundColor: 'rgba(122, 162, 247, 0.2)',
        borderColor: '#7aa2f7',
        borderWidth: 2,
        pointBackgroundColor: '#7aa2f7',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(122, 162, 247, 1)',
        fill: 'origin',
        tension: 0.4 // Smooth curve
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { 
        grid: { color: this.themeConfig.gridColor },
        ticks: { color: this.themeConfig.fontColor, maxTicksLimit: 10 }
      },
      y: {
        beginAtZero: true,
        grid: { color: this.themeConfig.gridColor },
        ticks: { color: this.themeConfig.fontColor }
      }
    }
  };

  // ── Token Bar Chart ─────────────────────────────────
  public tokenChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Input Tokens',
        backgroundColor: 'rgba(187, 154, 247, 0.7)',
        borderColor: '#bb9af7',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        data: [],
        label: 'Output Tokens',
        backgroundColor: 'rgba(158, 206, 106, 0.7)',
        borderColor: '#9ece6a',
        borderWidth: 1,
        borderRadius: 4
      }
    ],
    labels: []
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: { color: this.themeConfig.fontColor }
      },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { 
        stacked: true,
        grid: { display: false },
        ticks: { color: this.themeConfig.fontColor, maxTicksLimit: 10 }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: this.themeConfig.gridColor },
        ticks: { color: this.themeConfig.fontColor }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.updateCharts();
    }
  }

  private updateCharts() {
    // Take up to last 50 data points for better visibility
    const displayData = [...this.data]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-50);

    const labels = displayData.map(d => {
      const date = new Date(d.timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    });

    // Update Latency Line Chart
    this.latencyChartData.labels = labels;
    this.latencyChartData.datasets[0].data = displayData.map(d => d.latency_ms);

    // Update Token Bar Chart
    this.tokenChartData.labels = labels;
    this.tokenChartData.datasets[0].data = displayData.map(d => d.input_tokens);
    this.tokenChartData.datasets[1].data = displayData.map(d => d.output_tokens);

    // Force re-render reference trick
    this.latencyChartData = { ...this.latencyChartData };
    this.tokenChartData = { ...this.tokenChartData };
  }
}

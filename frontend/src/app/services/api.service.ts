import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  PromptResponse, 
  MetricsSummary, 
  MetricsTimeseries, 
  Metric, 
  User 
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Prompts ────────────────────────────
  inferPrompt(promptText: string, modelName: string = 'mistral'): Observable<PromptResponse> {
    return this.http.post<PromptResponse>(`${this.baseUrl}/api/prompts/infer`, {
      prompt_text: promptText,
      model_name: modelName
    });
  }

  getPrompts(skip: number = 0, limit: number = 20): Observable<PromptResponse[]> {
    let params = new HttpParams().set('skip', skip).set('limit', limit);
    return this.http.get<PromptResponse[]>(`${this.baseUrl}/api/prompts/`, { params });
  }

  // ── Metrics ────────────────────────────
  getMetricsSummary(): Observable<MetricsSummary> {
    return this.http.get<MetricsSummary>(`${this.baseUrl}/api/metrics/summary`);
  }

  getMetricsTimeseries(limit: number = 50): Observable<MetricsTimeseries[]> {
    let params = new HttpParams().set('limit', limit);
    return this.http.get<MetricsTimeseries[]>(`${this.baseUrl}/api/metrics/timeseries`, { params });
  }

  getRecentMetrics(limit: number = 10): Observable<Metric[]> {
    let params = new HttpParams().set('limit', limit);
    return this.http.get<Metric[]>(`${this.baseUrl}/api/metrics/recent`, { params });
  }

  // ── Admin: Users ───────────────────────
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/api/users/`);
  }

  updateUserRole(userId: number, role: 'admin' | 'viewer'): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/api/users/${userId}`, { role });
  }
}

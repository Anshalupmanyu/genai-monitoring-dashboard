export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'viewer';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Metric {
  id: number;
  prompt_id: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: 'success' | 'error' | 'pending';
  created_at: string;
}

export interface PromptResponse {
  id: number;
  user_id: number;
  prompt_text: string;
  response_text: string | null;
  model_name: string;
  status: 'success' | 'error' | 'pending';
  created_at: string;
  metric?: Metric;
}

export interface MetricsSummary {
  total_prompts: number;
  total_tokens: number;
  avg_latency_ms: number;
  avg_tokens_per_prompt: number;
  success_rate: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

export interface MetricsTimeseries {
  timestamp: string;
  latency_ms: number;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
}

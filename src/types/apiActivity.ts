export type ApiLogCategory = 'external_request' | 'internal_action' | 'webhook_delivery' | 'system_cron';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'RPC';

export type ApiLogStatus = 'success' | 'warning' | 'error' | 'rate_limited';

export type ApiServiceProvider =
  | 'AWS'
  | 'Google Cloud'
  | 'Okta'
  | 'GitHub'
  | 'CrowdStrike'
  | 'Datadog'
  | 'Slack'
  | 'Internal GRC'
  | 'OpenAI'
  | 'Jira'
  | 'Cloudflare';

export interface ApiActivityActor {
  name: string;
  email: string;
  role: string;
  ipAddress: string;
  userAgent: string;
  isSystemDaemon?: boolean;
}

export interface ApiActivityLog {
  id: string;
  timestamp: string;
  relativeTime: string;
  category: ApiLogCategory;
  service: ApiServiceProvider;
  action: string;
  method: HttpMethod;
  endpoint: string;
  statusCode: number;
  status: ApiLogStatus;
  durationMs: number;
  payloadSizeBytes: number;
  actor: ApiActivityActor;
  requestHeaders: Record<string, string>;
  requestBody: Record<string, any> | string | null;
  responseBody: Record<string, any> | string | null;
  complianceControls: string[];
  sha256Hash: string;
  previousHash: string;
  correlationId: string;
  evidenceRef?: {
    type: 'test' | 'risk' | 'exception' | 'policy' | 'uar' | 'control';
    id: string;
    title: string;
  };
}

export interface ApiActivityMetrics {
  totalRequests24h: number;
  successRate: number;
  avgDurationMs: number;
  p99DurationMs: number;
  errorCount24h: number;
  rateLimitCount24h: number;
  activeCollectorPipelines: number;
  chainIntegrityVerified: boolean;
  tamperCount: number;
}

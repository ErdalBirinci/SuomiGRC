export type IncidentSeverity = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
export type IncidentStatus = 'investigating' | 'contained' | 'mitigated' | 'resolved' | 'closed';
export type IncidentCategory =
  | 'ransomware'
  | 'unauthorized_access'
  | 'data_exfiltration'
  | 'ddos'
  | 'credential_compromise'
  | 'phishing';

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  phase: 'detection' | 'containment' | 'eradication' | 'recovery';
}

export interface SecurityIncident {
  id: string;
  incidentNumber: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  detectedAt: string;
  containedAt?: string;
  resolvedAt?: string;
  incidentCommander: string;
  affectedSystems: string[];
  affectedRecordsCount: number;
  containsPII: boolean;
  
  // Regulatory Notification Deadlines
  gdpr72hDeadline: string;
  gdprRemainingHours: number;
  gdprNotificationStatus: 'not_required' | 'evaluating' | 'notified_dpa' | 'breached';
  dpaAuthorityName?: string;
  
  sec4DayDeadline?: string;
  secRemainingHours?: number;
  secStatus?: 'not_applicable' | 'under_counsel_review' | 'form_8k_filed';

  rootCauseAnalysis?: string;
  preventativeMeasures?: string[];
  timeline: IncidentTimelineEvent[];
  postMortemReportSealed: boolean;
  cryptographicSignature?: string;
}

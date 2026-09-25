export type ActionItemPriority = 'p0_critical' | 'p1_high' | 'p2_medium' | 'p3_low';

export type ActionItemCategory =
  | 'evidence_request'
  | 'control_remediation'
  | 'access_review'
  | 'waiver_approval'
  | 'policy_attestation'
  | 'vendor_assessment'
  | 'vulnerability_sla';

export type ActionItemStatus = 'pending' | 'in_progress' | 'completed' | 'snoozed';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: ActionItemCategory;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  dueDate: string;
  slaHoursRemaining: number;
  assignedRole: 'ciso' | 'compliance_analyst' | 'auditor' | 'all';
  targetTab: string;
  entityId?: string;
  metadata: {
    source: string; // e.g. 'Schellman PBC #14', 'AWS S3 Bucket Encryption'
    framework?: string; // e.g. 'SOC 2 CC6.1', 'ISO 27001 A.9.2'
    impact?: string;
    suggestedAction: string;
  };
  completedAt?: string;
  completedBy?: string;
}

export interface ActionItemStats {
  totalPending: number;
  criticalOverdue: number;
  dueToday: number;
  completedThisWeek: number;
  completionRate: number;
}

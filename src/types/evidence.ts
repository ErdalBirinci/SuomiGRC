import { FrameworkId } from './grc';

export type EvidenceStatus = 'pending' | 'approved' | 'rejected';

export type EvidenceCollectionMethod =
  | 'automated_sync'
  | 'manual_upload'
  | 'api_crawler'
  | 'agent_telemetry';

export type EvidenceFileType = 'pdf' | 'csv' | 'json' | 'png' | 'md' | 'zip' | 'log';

export interface EvidenceAuditLog {
  id: string;
  action: 'uploaded' | 'approved' | 'rejected' | 'updated' | 're_associated' | 'downloaded';
  performedBy: string;
  role: string;
  timestamp: string;
  note?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  fileType: EvidenceFileType;
  controlId: string; // Primary mapped Control ID (e.g. 'CTL-IAM-01')
  controlCode: string; // e.g. 'CTL-IAM-01'
  controlName: string;
  secondaryControlIds?: string[];
  frameworks: FrameworkId[];
  status: EvidenceStatus;
  statusReason?: string;
  uploadedAt: string;
  uploadedBy: {
    name: string;
    email: string;
    role: string;
    avatarInitials?: string;
  };
  reviewedBy?: {
    name: string;
    email: string;
    role: string;
    reviewedAt: string;
    note?: string;
  };
  collectionMethod: EvidenceCollectionMethod;
  source: string; // e.g. 'AWS CloudTrail', 'Okta Identity Engine', 'Manual Upload', 'GitHub Enterprise'
  validUntil: string;
  freshnessStatus: 'fresh' | 'expiring_soon' | 'stale';
  sha256Hash: string; // Cryptographic SHA-256 integrity hash
  tags: string[];
  previewContent?: {
    type: 'json' | 'log' | 'table' | 'markdown' | 'certificate';
    data: any;
    rawText?: string;
  };
  auditHistory?: EvidenceAuditLog[];
}

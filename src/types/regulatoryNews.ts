export type RegulatoryAuthority =
  | 'ALL'
  | 'CISA'
  | 'NIST'
  | 'GDPR/EDPB'
  | 'SEC'
  | 'EU NIS2/DORA'
  | 'HIPAA/HHS'
  | 'PCI-SSC';

export type RegulatorySeverity = 'critical' | 'high' | 'medium' | 'advisory';

export type RegulatoryCategory =
  | 'Vulnerability & Exploit Directive'
  | 'Framework & Standard Revision'
  | 'Enforcement & Penalty Ruling'
  | 'Data Privacy & Cross-Border'
  | 'Operational Resilience'
  | 'AI Governance & Safety'
  | 'Identity & Access Mandate';

export interface GroundingSource {
  title: string;
  uri: string;
  sourceAuthority?: string;
}

export interface RegulatoryNewsItem {
  id: string;
  title: string;
  authority: RegulatoryAuthority;
  category: RegulatoryCategory;
  publicationDate: string;
  timeAgo: string;
  severity: RegulatorySeverity;
  executiveSummary: string;
  keyTakeaways: string[];
  affectedFrameworks: string[];
  affectedControlCodes: string[];
  recommendedAction: string;
  primaryUrl: string;
  sources: GroundingSource[];
  isBookmarked?: boolean;
  complianceImpactScore: number; // 0-100
  isLiveGrounded?: boolean;
  regulatoryJurisdiction?: string;
  enforcementDeadline?: string;
}

export interface RegulatorySearchQuery {
  authority?: RegulatoryAuthority;
  searchTopic?: string;
  category?: string;
  severity?: RegulatorySeverity;
}

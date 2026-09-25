export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low';
export type VulnerabilityStatus = 'open' | 'in_progress' | 'remediated' | 'ignored_with_waiver';
export type VulnerabilitySource = 'snyk' | 'dependabot' | 'aws_inspector' | 'wiz' | 'crowdstrike' | 'prisma_cloud';

export interface VulnerabilityItem {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  cvssScore: number;
  source: VulnerabilitySource;
  sourceName: string;
  affectedAsset: string;
  assetType: 'container_image' | 'npm_package' | 'ec2_instance' | 'cloud_resource' | 'source_repo';
  detectedAt: string;
  remediationSlaDays: number;
  daysOpen: number;
  slaStatus: 'on_track' | 'approaching_sla' | 'sla_breached';
  status: VulnerabilityStatus;
  fixedInVersion?: string;
  remediationGuide: string;
  linkedControlCode: string;
  linkedControlName: string;
  assignedEngineer?: string;
  patchPrId?: string;
}

export interface VulnerabilitySummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  breachedSlaCount: number;
  slaComplianceRate: number;
  openCount: number;
  remediatedCount: number;
}

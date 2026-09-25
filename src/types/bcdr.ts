export type BcdrTier = 'Tier 1 - Mission Critical' | 'Tier 2 - Business Essential' | 'Tier 3 - Internal Support';

export interface BcdrSystemAsset {
  id: string;
  name: string;
  service: string;
  tier: BcdrTier;
  targetRTO: string; // e.g. "1 Hour"
  targetRPO: string; // e.g. "15 Minutes"
  lastDrillRTO: string;
  lastDrillRPO: string;
  backupStatus: 'replicated' | 'syncing' | 'failed' | 'immutable_locked';
  multiRegionVerified: boolean;
  primaryRegion: string;
  replicaRegion: string;
  lastVerifiedSnapshot: string;
  immutableLockDuration: string;
}

export interface TabletopDrillStep {
  stepNumber: number;
  phase: string;
  scenarioInject: string;
  options: {
    text: string;
    rtoImpact: string;
    frameworkAlignment: string;
    isRecommended: boolean;
  }[];
  selectedOptionIndex?: number;
}

export interface TabletopDrill {
  id: string;
  title: string;
  scenarioType: 'Ransomware & KMS Lockout' | 'Cloud Region Total Blackout' | 'Supply Chain Dependency Compromise';
  complianceClauses: string[]; // ['ISO 27001 A.17.1', 'SOC 2 A1.2', 'DORA Art. 11']
  scheduledDate: string;
  conductedDate?: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  drillLead: string;
  participants: string[];
  steps: TabletopDrillStep[];
  lessonsLearned: string[];
  formalMinutesHash?: string;
  auditorSignedOff: boolean;
}

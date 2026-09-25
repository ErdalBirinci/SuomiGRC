export type CloudProvider = 'aws' | 'gcp' | 'azure';

export type MappingStatus = 'auto_mapped' | 'pending_approval' | 'ignored' | 'unmapped';

export type ResourceSecurityPosture = 'compliant' | 'drift_detected' | 'evaluating';

export type SensitivityLevel = 'Restricted PII' | 'Confidential' | 'Internal' | 'Public';

export type UsageClassification =
  | 'Production Core'
  | 'Data Analytics & Lakehouse'
  | 'Identity & Auth'
  | 'Payment & Financial'
  | 'Public Edge'
  | 'Internal Tooling'
  | 'Staging / QA';

export interface SuggestedSecurityTag {
  key: string;
  value: string;
  reason: string;
  category: 'sensitivity' | 'framework' | 'encryption' | 'backup' | 'access' | 'owner' | 'retention' | 'audit';
  confidence: number; // 0 - 100
  isApplied?: boolean;
}

export interface MappedControlRule {
  controlId: string;
  controlCode: string;
  controlName: string;
  framework: string;
  confidenceScore: number; // 0 - 100
  mappingReason: string;
  appliedAutomatedTest: string;
  testId?: string;
}

export interface DiscoveredResource {
  id: string;
  arnOrUri: string;
  name: string;
  cloudProvider: CloudProvider;
  resourceType: string;
  region: string;
  accountName: string;
  accountId: string;
  discoveredAt: string;
  lastScannedAt: string;
  mappingStatus: MappingStatus;
  securityPosture: ResourceSecurityPosture;
  mappedControls: MappedControlRule[];
  tags: Record<string, string>;
  isNewDiscovery?: boolean;

  // Automated Tagging Engine Extensions
  sensitivityLevel?: SensitivityLevel;
  usageClassification?: UsageClassification;
  suggestedTags?: SuggestedSecurityTag[];
  taggingStatus?: 'fully_tagged' | 'suggestions_pending' | 'untagged';
  lastTagScanTime?: string;
}

export interface TaggingEngineStats {
  totalResources: number;
  fullyTaggedCount: number;
  suggestionsPendingCount: number;
  untaggedCount: number;
  coveragePercentage: number;
  totalSuggestedTagsCount: number;
}

export interface CloudAccountConnector {
  id: string;
  provider: CloudProvider;
  accountName: string;
  accountId: string;
  regionsMonitored: string[];
  connectionStatus: 'active' | 'syncing' | 'error';
  lastScanTime: string;
  scanCadence: 'Continuous (EventBridge / PubSub)' | 'Hourly Sweep' | 'Daily (6h)';
  totalResourcesCount: number;
  newResourcesCount: number;
  autoMappingAccuracy: number; // e.g. 96.4
}

export interface CloudDiscoveryStats {
  totalDiscovered: number;
  autoMappedCount: number;
  pendingApprovalCount: number;
  driftDetectedCount: number;
  awsCount: number;
  gcpCount: number;
  azureCount: number;
  autoMappingRate: number;
}

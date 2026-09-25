export type FrameworkId = 'soc2' | 'iso27001' | 'hipaa' | 'gdpr' | 'pci_dss' | 'nist_csf' | 'dora' | 'nis2';

export interface Framework {
  id: FrameworkId;
  name: string;
  code: string;
  version: string;
  description: string;
  totalControls: number;
  passingControls: number;
  readinessPercentage: number;
  auditTargetDate: string;
  auditorPartner: string;
  status: 'In Audit Window' | 'Ready for Audit' | 'Remediation Required' | 'Monitoring';
}

export type IntegrationCategory =
  | 'cloud'
  | 'idp'
  | 'vcs'
  | 'mdm'
  | 'ticketing'
  | 'security';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  iconName: string;
  status: 'connected' | 'action_required' | 'syncing' | 'disconnected';
  lastSyncedAt: string;
  monitoredResourcesCount: number;
  passingTestsCount: number;
  totalTestsCount: number;
  accountScope: string;
  authType: 'OAuth 2.0' | 'IAM Role' | 'API Token' | 'Agent';
  supportedFrameworks: FrameworkId[];
}

export type TestSeverity = 'critical' | 'high' | 'medium' | 'low';
export type TestStatus = 'passing' | 'failing' | 'warning' | 'paused';

export interface FailingResource {
  id: string;
  name: string;
  arnOrPath: string;
  owner: string;
  detectedAt: string;
  remediationSuggestion: string;
}

export interface AutomatedTest {
  id: string;
  title: string;
  description: string;
  integrationId: string;
  integrationName: string;
  category: string;
  status: TestStatus;
  severity: TestSeverity;
  frequency: 'Continuous (5m)' | 'Hourly' | 'Daily' | 'Weekly';
  lastRunAt: string;
  failingResources: FailingResource[];
  remediationCode: {
    language: 'bash' | 'terraform' | 'json';
    code: string;
  };
  satisfiedControls: string[]; // Control IDs e.g., 'CC6.1', 'A.9.2'
}

export type ControlLifecycleStatus = 'Draft' | 'Implementation' | 'Monitoring' | 'Retired';

export interface ControlLifecycleTransition {
  from: ControlLifecycleStatus;
  to: ControlLifecycleStatus;
  timestamp: string;
  changedBy: string;
  reason?: string;
}

export interface Control {
  id: string;
  code: string;
  name: string;
  domain: string;
  description: string;
  owner: string;
  status: 'automated_passing' | 'automated_failing' | 'manual_verified' | 'in_progress';
  lifecycleStatus?: ControlLifecycleStatus;
  lifecycleNotes?: string;
  lifecycleHistory?: ControlLifecycleTransition[];
  frameworkMappings: {
    frameworkId: FrameworkId;
    requirementCode: string;
    requirementTitle: string;
  }[];
  automatedTestIds: string[];
  evidenceCount: number;
  lastAudited: string;
}

export type RiskLevel = 1 | 2 | 3 | 4 | 5; // 1: Very Low, 5: Critical
export type TreatmentStrategy = 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';

export interface RiskItem {
  id: string;
  title: string;
  category: 'Infrastructure & Cloud' | 'Access & Identity' | 'Third-Party & Vendor' | 'Data Privacy' | 'Operational & Human';
  inherentLikelihood: RiskLevel;
  inherentImpact: RiskLevel;
  residualLikelihood: RiskLevel;
  residualImpact: RiskLevel;
  treatment: TreatmentStrategy;
  treatmentDetails: string;
  owner: string;
  mitigatingControlIds: string[];
  lastReviewedDate: string;
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Under Review';
}

export type VendorTier = 'Tier 1 (Critical)' | 'Tier 2 (High)' | 'Tier 3 (Medium)' | 'Tier 4 (Low)';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  tier: VendorTier;
  dataAccess: 'Customer PII & Production' | 'Internal Data Only' | 'Metadata Only' | 'None';
  soc2ReportStatus: 'Verified (Current)' | 'Expiring Soon' | 'Missing / Not Provided' | 'Under Review';
  dpaSigned: boolean;
  questionnaireScore: number; // 0 - 100
  nextReviewDate: string;
  owner: string;
  riskRating: 'Low' | 'Medium' | 'High';
}

export interface Policy {
  id: string;
  code: string;
  title: string;
  version: string;
  status: 'Published' | 'Under Review' | 'Draft';
  owner: string;
  lastApprovedAt: string;
  nextReviewDue: string;
  employeeAcksCount: number;
  totalEmployeesCount: number;
  content: string;
  frameworksCovered: FrameworkId[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  startDate: string;
  backgroundCheckStatus: 'Completed' | 'Pending' | 'Failed';
  securityTrainingStatus: 'Completed' | 'Overdue' | 'In Progress';
  policiesSigned: boolean;
  mdmEnrolled: boolean;
  mfaActive: boolean;
}

export interface AuditRequest {
  id: string;
  controlCode: string;
  framework: FrameworkId;
  requestTitle: string;
  auditorName: string;
  auditorFirm: string;
  status: 'Approved' | 'In Review' | 'Requested' | 'Clarification Needed';
  dueDate: string;
  evidenceItems: {
    id: string;
    title: string;
    source: string;
    uploadedAt: string;
  }[];
}

export type WebhookPlatform = 'slack' | 'teams' | 'generic';
export type WebhookSeverityFilter = 'all' | 'critical_high' | 'critical_only';

export interface WebhookConfig {
  id: string;
  name: string;
  platform: WebhookPlatform;
  webhookUrl: string;
  channel: string;
  enabled: boolean;
  signingSecret?: string;
  severityFilter: WebhookSeverityFilter;
  triggers: {
    testFailures: boolean;
    testResolved: boolean;
    auditRequests: boolean;
    dailyDigest: boolean;
  };
  createdAt: string;
  lastTriggeredAt?: string;
  lastStatus?: '200 OK' | 'Failed' | 'Never Triggered';
  successfulDeliveries: number;
  failedDeliveries: number;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  webhookName: string;
  platform: WebhookPlatform;
  event: 'test.failed' | 'test.resolved' | 'test.ping' | 'audit.request' | 'daily.digest';
  timestamp: string;
  status: 'success' | 'failed';
  statusCode: number;
  latencyMs: number;
  payloadSummary: string;
  fullPayload: Record<string, any>;
  testDetails?: {
    testId: string;
    testTitle: string;
    severity: string;
    integrationName: string;
    failingCount: number;
  };
}

// -------------------------------------------------------------
// Vanta-Grade Advanced Enterprise Features
// -------------------------------------------------------------

// 1. User Access Reviews (UAR)
export interface UserAccessReviewCampaign {
  id: string;
  title: string;
  period: string; // e.g. "Q3 2026"
  status: 'active' | 'completed' | 'draft';
  dueDate: string;
  frameworkStandard: string;
  reviewerRole: string;
  totalAccounts: number;
  approvedAccounts: number;
  revokedAccounts: number;
  pendingAccounts: number;
  targetSystems: string[];
}

export interface UserAccessItem {
  id: string;
  campaignId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  systemId: 'aws' | 'github' | 'okta' | 'gcp' | 'azure' | 'db';
  systemName: string;
  roleOrPermission: string;
  accountType: 'human' | 'admin' | 'contractor' | 'service_account';
  lastActiveAt: string;
  decision: 'pending' | 'approved' | 'revoked';
  decisionReason?: string;
  decidedAt?: string;
  decidedBy?: string;
  flaggedAnomaly?: string; // e.g. "Terminated employee still has AWS Admin"
}

// 2. AI Security Questionnaires & RFP Auto-Responder
export interface SecurityQuestionnaire {
  id: string;
  clientName: string;
  title: string;
  standard: 'SIG Lite' | 'CAIQ v4' | 'Custom Enterprise' | 'VSA' | 'CIS Controls';
  status: 'draft' | 'in_progress' | 'completed';
  totalQuestions: number;
  answeredQuestions: number;
  averageConfidence: number;
  uploadedAt: string;
  lastGeneratedAt?: string;
}

export interface QuestionnaireItem {
  id: string;
  questionnaireId: string;
  questionNumber: number;
  section: string;
  questionText: string;
  suggestedAnswer: string;
  confidence: number; // e.g. 98%
  status: 'auto_filled' | 'verified' | 'manual_edit';
  citedControlCodes: string[];
  citedPolicyIds: string[];
  auditEvidenceNote: string;
}

// 3. Desktop Agent & Fleet Telemetry (Vanta Agent)
export interface DesktopDevice {
  id: string;
  deviceName: string;
  serialNumber: string;
  osType: 'macOS' | 'Windows' | 'Linux';
  osVersion: string;
  assignedEmployeeName: string;
  assignedEmployeeEmail: string;
  agentVersion: string;
  lastCheckIn: string;
  status: 'compliant' | 'non_compliant' | 'offline';
  checks: {
    diskEncryption: boolean;
    diskEncryptionType: 'FileVault 2' | 'BitLocker' | 'LUKS';
    screenLockSeconds: number; // e.g. 300 (5 mins)
    passwordManagerActive: boolean;
    passwordManagerName: string;
    edrAgentActive: boolean;
    edrAgentName: string;
    autoUpdateEnabled: boolean;
    firewallActive: boolean;
  };
  ipAddress: string;
  location: string;
}

// 4. Employee Security LMS & Interactive Training
export interface TrainingQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  youtubeId: string;
  directVideoUrl?: string;
  sourceOrganization: string;
  sourceUrl?: string;
  description: string;
  keyTakeaways: string[];
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: 'Security Awareness' | 'HIPAA Privacy' | 'Secure Coding (OWASP)' | 'Phishing Prevention';
  passingScorePercentage: number;
  videoDuration: string;
  modulesCount: number;
  keyTakeaways: string[];
  quizQuestions: TrainingQuizQuestion[];
  youtubeId?: string;
  directVideoUrl?: string;
  sourceOrganization?: string;
  lessons?: CourseLesson[];
}

export interface EmployeeCourseProgress {
  id: string;
  courseId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progressPercent: number;
  quizScore?: number;
  completedAt?: string;
  certificateHash?: string;
}

// 5. Compliance Drift & Evidence Vault (Time Machine)
export interface ComplianceSnapshot {
  date: string;
  overallPassingPct: number;
  passingTests: number;
  failingTests: number;
  driftDeltaPct: number;
  notableEvent?: string;
}

// 6. SLA Tracking & Audit Exceptions
export interface AuditException {
  id: string;
  testId: string;
  testTitle: string;
  riskRating: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  compensatingControls: string;
  requestedBy: string;
  approvedBy: string;
  status: 'active' | 'expired' | 'revoked';
  approvedAt: string;
  expiresAt: string;
  slaDaysRemaining: number;
}

// 7. Custom Test Rule Builder
export interface CustomTestRule {
  id: string;
  title: string;
  description: string;
  integrationId: string;
  integrationName: string;
  queryType: 'sql' | 'aws_cloudwatch' | 'rest_api' | 'github_check';
  queryPayload: string;
  expectedCondition: string;
  mappedControls: string[];
  severity: TestSeverity;
  status: TestStatus;
  lastExecutedAt?: string;
}

// 8. Trust Center NDA & Dynamic Watermarking
export interface NdaRecord {
  id: string;
  signerName: string;
  signerEmail: string;
  signerCompany: string;
  documentTitle: string;
  signedAt: string;
  ipAddress: string;
  watermarkText: string;
  status: 'signed';
}

// 9. D3.js Compliance Readiness Heatmap
export interface DepartmentHeatmapCell {
  departmentId: string;
  departmentName: string;
  domainId: string;
  domainName: string;
  maturityScore: number; // 0 to 100
  totalControls: number;
  passingControls: number;
  failingControls: number;
  status: 'optimal' | 'substantial' | 'attention_needed' | 'high_risk';
  leadOwner: string;
  topRiskFinding?: string;
  frameworkStandard: string;
}

export interface BusinessUnitMaturity {
  id: string;
  name: string;
  lead: string;
  employeeCount: number;
  overallMaturity: number;
}

// ==========================================
// 10. REVOLUTIONARY GRC 3.0 NEXT-GEN TYPES
// ==========================================

// Feature 1: Auto-Remediation as Code (GitOps & Terraform PR Engine)
export type RemediationFormat = 'terraform' | 'pulumi' | 'kubernetes' | 'aws_cli' | 'github_actions';

export interface AutoRemediationPatch {
  id: string;
  testId: string;
  testTitle: string;
  targetProvider: 'aws' | 'gcp' | 'github' | 'kubernetes' | 'azure';
  resourceType: string;
  resourceId: string;
  format: RemediationFormat;
  filePath: string;
  gitBranch: string;
  prTitle: string;
  prDescription: string;
  codeDiff: {
    original: string;
    patch: string;
  };
  cliCommand: string;
  rollbackCommand: string;
  safetyScore: number; // 0-100 (100 = 0% risk of breaking production)
  status: 'draft' | 'pr_opened' | 'dry_run_success' | 'applied' | 'verified';
  prUrl?: string;
  prNumber?: number;
  lastSimulatedAt?: string;
  simulationOutput?: string[];
}

// Feature 2: Predictive Audit Simulator & Monte Carlo Engine
export interface MonteCarloTrialResult {
  trialIndex: number;
  opinion: 'clean' | 'qualified_exception' | 'adverse';
  exceptionsCount: number;
  auditorSampleSize: number;
  simulatedScore: number;
}

export interface PredictiveAuditReport {
  overallCleanProbability: number; // e.g. 78.4%
  qualifiedRiskProbability: number; // e.g. 19.2%
  adverseRiskProbability: number; // e.g. 2.4%
  targetAuditorFirm: 'Big 4 (PwC/EY/Deloitte/KPMG)' | 'Schellman' | 'Coalfire' | 'A-LIGN' | 'BDO';
  auditWindow: string; // e.g. "Q4 2026 Type II"
  sampleSizeRange: [number, number]; // [25, 45]
  highestRiskControls: {
    controlId: string;
    controlCode: string;
    title: string;
    failureProbability: number;
    impactOnPassRate: number; // e.g. +6.4% if fixed
    recommendedAction: string;
    department: string;
    effortHours: number;
  }[];
  monteCarloTrials: MonteCarloTrialResult[];
}

// Feature 3: Cross-Framework Delta & Harmonization ROI Engine
export interface FrameworkDeltaComparison {
  sourceFrameworkId: string;
  sourceFrameworkName: string;
  targetFrameworkId: string;
  targetFrameworkName: string;
  overlapPercentage: number;
  totalTargetControls: number;
  inheritedControlsCount: number;
  partialControlsCount: number;
  gapControlsCount: number;
  estimatedEngineeringHoursSaved: number;
  estimatedDollarSavings: number;
  timeToAuditWeeksCompressed: number;
  controlMappings: {
    id: string;
    targetControlId: string;
    targetControlTitle: string;
    targetDomain: string;
    matchStatus: 'identical' | 'partial_gap' | 'complete_gap';
    inheritedSourceControlId?: string;
    inheritedEvidenceTitle?: string;
    additionalRequirement?: string;
    recommendedQuickFix?: string;
  }[];
}

// Feature 4: Zero-Knowledge Live Trust Center Verification Sandbox
export interface ZkVerificationProbe {
  id: string;
  title: string;
  category: 'encryption' | 'data_isolation' | 'merkle_audit_integrity' | 'disaster_recovery' | 'iam_zero_trust';
  description: string;
  zkCircuitType: string; // e.g. "Groth16 / SnarkJs on SHA256 Pre-image"
  publicInputs: Record<string, string>;
  verificationKeyFingerprint: string;
  status: 'idle' | 'running' | 'verified_clean' | 'failed';
  proofLatencyMs: number;
  lastVerifiedAt?: string;
  cryptographicProofHash?: string;
  proofBadgeLabel: string;
  inspectorExplanation: string;
}

// Feature 5: Cyber Insurance Arbiter & Underwriter Telemetry Hub
export interface CyberInsuranceCarrierScore {
  carrierName: string;
  logoColor: string;
  underwritingEligibility: 'Tier 1 Preferred' | 'Tier 2 Standard' | 'High Risk Conditional' | 'Declined';
  baseAnnualPremium: number;
  discountedAnnualPremium: number;
  annualSavings: number;
  insurabilityIndex: number; // 0-100
  warrantyChecklist: {
    id: string;
    requirement: string;
    severity: 'fatal_disqualifier' | 'rate_modifier' | 'recommended';
    currentStatus: 'compliant' | 'non_compliant' | 'partial';
    telemetrySource: string;
    premiumImpactUsd: number;
  }[];
}

// Feature 6: Shadow-AI & SaaS Data Exfiltration Sentinel
export interface ShadowAiTool {
  id: string;
  name: string;
  category: 'LLM Agent' | 'Code Assistant' | 'Image Gen' | 'Data Analytics' | 'Workflow Automation';
  discoveredUsersCount: number;
  firstDetectedAt: string;
  governanceStatus: 'sanctioned' | 'quarantined' | 'under_review' | 'blocked';
  dataRetentionPolicy: 'zero_retention_enterprise' | '30_days_retained' | 'trains_on_user_prompts' | 'unknown';
  compliancePosture: {
    hasSoc2: boolean;
    hasGdprDpa: boolean;
    hasHipaaBaa: boolean;
    dataResidency: 'US' | 'EU' | 'Multi-Region' | 'Non-Compliant' | 'Unknown';
  };
  dlpIncidentsDetected: number;
  topRiskDescription: string;
  primaryRiskRating: 'Critical' | 'High' | 'Medium' | 'Low';
  oauthTokenScope?: string;
}

export interface ShadowAiDlpEvent {
  id: string;
  toolId: string;
  toolName: string;
  detectedAt: string;
  userEmail: string;
  violationType: 'PII_SSN' | 'API_SECRET_KEY' | 'SOURCE_CODE_IP' | 'CREDIT_CARD_PAN' | 'HEALTH_PHI';
  redactedSnippet: string;
  actionTaken: 'blocked_in_transit' | 'token_revoked' | 'alert_sent_to_soc' | 'quarantined';
}




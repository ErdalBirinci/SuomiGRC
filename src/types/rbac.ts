export type UserRole = 'ciso' | 'compliance_analyst' | 'auditor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  organization: string;
  avatarInitials: string;
  badgeLabel: string;
  badgeColor: string;
  description: string;
}

export type PermissionAction =
  | 'pass_automated_test'
  | 'trigger_webhook'
  | 'edit_webhook_config'
  | 'execute_auto_remediation'
  | 'approve_audit_exception'
  | 'create_audit_exception'
  | 'create_edit_risk'
  | 'delete_risk'
  | 'create_edit_policy'
  | 'conduct_uar'
  | 'manage_vendors'
  | 'manage_integrations'
  | 'approve_audit_request'
  | 'upload_audit_evidence'
  | 'export_audit_binder'
  | 'configure_shadow_ai'
  | 'manage_fleet_devices'
  | 'action:create_test'
  | 'action:run_test'
  | 'action:remediate';

export interface RoleDefinition {
  id: UserRole;
  name: string;
  shortTitle: string;
  user: UserProfile;
  allowedTabs: string[];
  restrictedTabs: string[];
  actions: Record<PermissionAction, boolean>;
  dashboardMode: 'executive' | 'operational' | 'assurance';
  summary: string;
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  ciso: {
    id: 'user-ciso-01',
    name: 'Alexander Lindqvist',
    email: 'ciso@nordicscale.com',
    role: 'ciso',
    title: 'Chief Information Security Officer (CISO)',
    organization: 'NordicScale Technologies Inc.',
    avatarInitials: 'AL',
    badgeLabel: 'CISO • Executive Super Admin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Full unconstrained administrative privileges across all 24 governance modules, API activity ledger, policy approvals, GitOps auto-remediation, and risk waivers.',
  },
  compliance_analyst: {
    id: 'user-analyst-02',
    name: 'Maya Patel',
    email: 'compliance@nordicscale.com',
    role: 'compliance_analyst',
    title: 'Lead Compliance & Risk Analyst',
    organization: 'NordicScale Technologies Inc.',
    avatarInitials: 'MP',
    badgeLabel: 'Compliance Analyst • Operational Admin',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Operational control management, evidence collection, access reviews, vendor assessments, and risk register updates. High-impact production actions require CISO sign-off.',
  },
  auditor: {
    id: 'user-auditor-03',
    name: 'Bradley Campbell, CPA, CISSP',
    email: 'bcampbell@coalfire-assurance.com',
    role: 'auditor',
    title: 'External Lead Engagement Partner',
    organization: 'Coalfire Systems & Schellman LLP',
    avatarInitials: 'BC',
    badgeLabel: 'External Auditor • Read-Only Assurance',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Third-party certified audit partner. Read-only inspection of controls, continuous evidence, drift vault, and sample fulfillment. Strict isolation from internal production credentials.',
  },
};

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  ciso: {
    id: 'ciso',
    name: 'Chief Information Security Officer',
    shortTitle: 'CISO',
    user: PRESET_USERS.ciso,
    allowedTabs: [
      'overview',
      'action-items',
      'integrations',
      'cloud-discovery',
      'controls',
      'vulnerabilities',
      'frameworks',
      'remediation-code',
      'predictive-audit',
      'framework-delta',
      'zk-sandbox',
      'cyber-insurance',
      'shadow-ai',
      'uar',
      'questionnaires',
      'fleet',
      'training',
      'personnel',
      'risks',
      'vendors',
      'exceptions',
      'policies',
      'iso-soa',
      'regulatory-news',
      'drift',
      'auditor',
      'auditor-marketplace',
      'evidence-vault',
      'trust-center',
      'webhooks',
      'activity-log',
    ],
    restrictedTabs: [],
    actions: {
      pass_automated_test: true,
      trigger_webhook: true,
      edit_webhook_config: true,
      execute_auto_remediation: true,
      approve_audit_exception: true,
      create_audit_exception: true,
      create_edit_risk: true,
      delete_risk: true,
      create_edit_policy: true,
      conduct_uar: true,
      manage_vendors: true,
      manage_integrations: true,
      approve_audit_request: true,
      upload_audit_evidence: true,
      export_audit_binder: true,
      configure_shadow_ai: true,
      manage_fleet_devices: true,
      'action:create_test': true,
      'action:run_test': true,
      'action:remediate': true,
    },
    dashboardMode: 'executive',
    summary: 'Executive Governance, complete configuration ownership, and production remediation authority.',
  },
  compliance_analyst: {
    id: 'compliance_analyst',
    name: 'Compliance Analyst',
    shortTitle: 'Analyst',
    user: PRESET_USERS.compliance_analyst,
    allowedTabs: [
      'overview',
      'action-items',
      'cloud-discovery',
      'controls',
      'vulnerabilities',
      'frameworks',
      'uar',
      'questionnaires',
      'fleet',
      'training',
      'personnel',
      'risks',
      'vendors',
      'exceptions',
      'policies',
      'iso-soa',
      'regulatory-news',
      'drift',
      'auditor',
      'auditor-marketplace',
      'evidence-vault',
      'trust-center',
      'activity-log',
      'framework-delta',
      'zk-sandbox',
      'predictive-audit',
      // Restricted from production infrastructure connectors and raw secret configs
    ],
    restrictedTabs: [
      'integrations', // Cloud API tokens & IdP secret management
      'webhooks', // SIEM credentials & webhook signing secrets
      'remediation-code', // Production GitOps PR deployment requires CISO
      'cyber-insurance', // Executive actuarial balance sheets
      'shadow-ai', // Employee private prompt interception & DLP policy enforcement
    ],
    actions: {
      pass_automated_test: true, // Can re-run & pass tests
      trigger_webhook: false, // Cannot broadcast test failures to company-wide channels
      edit_webhook_config: false,
      execute_auto_remediation: false, // Cannot directly merge GitOps remediation
      approve_audit_exception: false, // Can request exception, cannot self-approve
      create_audit_exception: true,
      create_edit_risk: true,
      delete_risk: false,
      create_edit_policy: true,
      conduct_uar: true,
      manage_vendors: true,
      manage_integrations: false,
      approve_audit_request: false, // Auditor approves requests
      upload_audit_evidence: true, // Can submit evidence to auditor
      export_audit_binder: true,
      configure_shadow_ai: false,
      manage_fleet_devices: false,
      'action:create_test': true,
      'action:run_test': true,
      'action:remediate': false,
    },
    dashboardMode: 'operational',
    summary: 'Daily operational compliance workflows, risk registers, and evidence collection without raw production key access.',
  },
  auditor: {
    id: 'auditor',
    name: 'External CPA / ISO Auditor',
    shortTitle: 'Auditor',
    user: PRESET_USERS.auditor,
    allowedTabs: [
      'action-items', // Personal audit inspection queue
      'cloud-discovery', // Read-only cloud asset inventory & control mapping audit
      'auditor', // Primary portal
      'evidence-vault', // Certified evidence vault inspection and status sign-off
      'overview', // Assurance view
      'controls', // Read-only controls inspection
      'vulnerabilities', // Read-only vulnerability inspection
      'frameworks', // Read-only matrix
      'iso-soa', // Read-only ISO Statement of Applicability
      'drift', // Read-only observation period snapshots
      'risks', // Read-only 5x5 risk register
      'policies', // Read-only policy vault
      'trust-center', // Public/NDA trust center
      'activity-log', // Read-only non-repudiation API activity logs
    ],
    restrictedTabs: [
      'integrations', // Zero access to cloud infrastructure credentials
      'webhooks', // Zero access to internal company alerting
      'remediation-code', // Zero access to code auto-patching
      'predictive-audit', // Internal simulations
      'framework-delta', // Internal business ROI
      'zk-sandbox', // Internal sandbox
      'cyber-insurance', // Internal financials
      'shadow-ai', // Internal employee surveillance / DLP
      'uar', // Internal HR entitlement operations
      'questionnaires', // Internal sales questionnaires
      'fleet', // Internal device MDM hardware
      'training', // Internal employee training LMS records
      'personnel', // Confidential employee PII and background check records
      'vendors', // Internal contract negotiations
      'exceptions', // Direct waiver approvals (viewed inside Auditor Workspace tab)
      'regulatory-news', // Internal threat intelligence
      'auditor-marketplace', // Internal commercial auditor quoting
    ],
    actions: {
      pass_automated_test: false, // Strictly read-only: cannot tamper with evidence
      trigger_webhook: false,
      edit_webhook_config: false,
      execute_auto_remediation: false,
      approve_audit_exception: false,
      create_audit_exception: false,
      create_edit_risk: false,
      delete_risk: false,
      create_edit_policy: false,
      conduct_uar: false,
      manage_vendors: false,
      manage_integrations: false,
      approve_audit_request: true, // Key auditor capability: mark PBC items Approved/Rejected
      upload_audit_evidence: false, // Provided by client
      export_audit_binder: true, // Download signed audit packages
      configure_shadow_ai: false,
      manage_fleet_devices: false,
      'action:create_test': false,
      'action:run_test': false,
      'action:remediate': false,
    },
    dashboardMode: 'assurance',
    summary: 'Certified independent assessment mode. Strict read-only isolation with full evidence request sign-off capability.',
  },
};

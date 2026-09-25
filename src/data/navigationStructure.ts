import {
  LayoutDashboard,
  Server,
  ShieldCheck,
  Layers,
  AlertTriangle,
  Building2,
  FileText,
  Users,
  FileCheck2,
  Globe2,
  Sparkles,
  Laptop,
  GraduationCap,
  History,
  FileWarning,
  UserCheck,
  Code2,
  Brain,
  GitCompare,
  KeyRound,
  ShieldAlert,
  Bot,
  Bell,
  Activity,
  FolderLock,
  Bug,
  Award,
  CheckSquare,
  Cloud,
  UserMinus,
  Flame,
  Database,
  GitPullRequest,
  LucideIcon,
} from 'lucide-react';
import { UserRole } from '../types/rbac';

export interface NavItemDef {
  id: string;
  label: string;
  shortLabel?: string;
  description: string;
  icon: LucideIcon;
  category: NavCategoryId;
  isNew?: boolean;
  isPrimary?: boolean; // Highlighted as daily essential in simplified mode
  allowedRoles?: UserRole[];
}

export type NavCategoryId =
  | 'core'
  | 'autonomous_grc'
  | 'workforce_ops'
  | 'risk_governance'
  | 'audit_trust';

export interface NavCategoryDef {
  id: NavCategoryId;
  title: string;
  shortTitle: string;
  description: string;
  items: NavItemDef[];
}

export const NAV_CATEGORIES: NavCategoryDef[] = [
  {
    id: 'core',
    title: 'Core Compliance & Architecture',
    shortTitle: 'Core',
    description: 'Executive overview, platform connectors, continuous controls, and matrix',
    items: [
      {
        id: 'overview',
        label: 'Executive Dashboard',
        shortLabel: 'Dashboard',
        description: 'Multi-framework readiness, real-time posture & compliance telemetry',
        icon: LayoutDashboard,
        category: 'core',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'action-items',
        label: 'My Action Items',
        shortLabel: 'Action Items',
        description: 'Personalized prioritized queue for evidence requests, remediations & access reviews',
        icon: CheckSquare,
        category: 'core',
        isNew: true,
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'integrations',
        label: 'Integrations Hub',
        shortLabel: 'Integrations',
        description: '28+ Cloud, IdP, MDM, CI/CD, and SaaS security connectors',
        icon: Server,
        category: 'core',
        isPrimary: true,
        allowedRoles: ['ciso'],
      },
      {
        id: 'cloud-discovery',
        label: 'Cloud Discovery & Mapping',
        shortLabel: 'Cloud Discovery',
        description: 'Periodic multi-cloud sweeps (AWS, GCP, Azure) to auto-map new resources to controls',
        icon: Cloud,
        category: 'core',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'controls',
        label: 'Controls & Tests',
        shortLabel: 'Controls',
        description: 'Continuous automated tests, technical evidence, and drift checks',
        icon: ShieldCheck,
        category: 'core',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'vulnerabilities',
        label: 'Vulnerabilities & CVEs',
        shortLabel: 'Vulnerabilities',
        description: 'Snyk, Dependabot & Wiz continuous vulnerability triage, CVSS scoring & SLAs',
        icon: Bug,
        category: 'core',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'frameworks',
        label: 'Cross-Framework Matrix',
        shortLabel: 'Matrix',
        description: 'Unified cross-walk between SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS',
        icon: Layers,
        category: 'core',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'easm-pentest',
        label: 'External Attack Surface & Pentest',
        shortLabel: 'EASM & Pentest',
        description: 'Public domain discovery, open ports, expiring SSL/TLS & annual pentest reports',
        icon: Globe2,
        category: 'core',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
    ],
  },
  {
    id: 'autonomous_grc',
    title: 'Autonomous GRC 3.0 (AI & Automation)',
    shortTitle: 'Autonomous GRC',
    description: 'Next-gen GitOps auto-remediation, Monte Carlo audit simulation, ZK proofs & DLP',
    items: [
      {
        id: 'remediation-code',
        label: 'Auto-Remediation as Code',
        shortLabel: 'Auto-Remediation',
        description: 'Automated Terraform/GitOps pull request generator for failing controls',
        icon: Code2,
        category: 'autonomous_grc',
        isNew: true,
        isPrimary: true,
        allowedRoles: ['ciso'],
      },
      {
        id: 'ticketing-sync',
        label: 'Jira & Linear Remediation Sync',
        shortLabel: 'Jira / Linear Sync',
        description: 'Bi-directional developer ticketing, GitOps PR linkage & SLA enforcement',
        icon: GitPullRequest,
        category: 'autonomous_grc',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'predictive-audit',
        label: 'Predictive Audit Simulator',
        shortLabel: 'Audit Simulator',
        description: 'Monte Carlo simulation of auditor findings and sample requests',
        icon: Brain,
        category: 'autonomous_grc',
        isNew: true,
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'framework-delta',
        label: 'Cross-Framework Delta ROI',
        shortLabel: 'Delta ROI',
        description: 'Effort & cost-to-add analysis for expanding to new security standards',
        icon: GitCompare,
        category: 'autonomous_grc',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'zk-sandbox',
        label: 'ZK Verification Sandbox',
        shortLabel: 'ZK Proofs',
        description: 'Zero-Knowledge cryptographic proofs for vendor security sharing',
        icon: KeyRound,
        category: 'autonomous_grc',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'cyber-insurance',
        label: 'Cyber Insurance Arbiter',
        shortLabel: 'Insurance Arbiter',
        description: 'Actuarial risk underwriting telemetry and premium discount arbiter',
        icon: ShieldAlert,
        category: 'autonomous_grc',
        isNew: true,
        allowedRoles: ['ciso'],
      },
      {
        id: 'shadow-ai',
        label: 'Shadow-AI & DLP Sentinel',
        shortLabel: 'Shadow-AI',
        description: 'Discovery, data residency checks & prompt loss prevention for enterprise LLMs',
        icon: Bot,
        category: 'autonomous_grc',
        isNew: true,
        allowedRoles: ['ciso'],
      },
    ],
  },
  {
    id: 'workforce_ops',
    title: 'Workforce & Device Security',
    shortTitle: 'Operations',
    description: 'Identity access reviews, AI security questionnaires, fleet MDM and training',
    items: [
      {
        id: 'uar',
        label: 'User Access Reviews',
        shortLabel: 'Access Reviews',
        description: 'Quarterly entitlement campaigns, privilege revoking & manager approvals',
        icon: UserCheck,
        category: 'workforce_ops',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'questionnaires',
        label: 'AI Questionnaires',
        shortLabel: 'Questionnaires',
        description: 'Automated RFP/vendor security questionnaire responder powered by policy vault',
        icon: Sparkles,
        category: 'workforce_ops',
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'fleet',
        label: 'Desktop Fleet MDM',
        shortLabel: 'Fleet MDM',
        description: 'Endpoint posture, disk encryption, screen lock & OS patch compliance',
        icon: Laptop,
        category: 'workforce_ops',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'training',
        label: 'Security Training LMS',
        shortLabel: 'Security LMS',
        description: 'Annual employee security awareness training tracking and quiz completion',
        icon: GraduationCap,
        category: 'workforce_ops',
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'personnel',
        label: 'Personnel Compliance',
        shortLabel: 'Personnel',
        description: 'Background checks, signed NDAs, contractor lifecycle, and on/offboarding',
        icon: Users,
        category: 'workforce_ops',
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'offboarding',
        label: 'Offboarding & 24h SLA Tracker',
        shortLabel: 'Offboarding SLA',
        description: 'Automated SaaS deprovisioning, device return & MDM remote wipe audits',
        icon: UserMinus,
        category: 'workforce_ops',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
    ],
  },
  {
    id: 'risk_governance',
    title: 'Risk, Policies & Governance',
    shortTitle: 'Governance',
    description: 'Enterprise 5x5 risk matrices, third-party vendor risk, and compliance drift',
    items: [
      {
        id: 'incident-response',
        label: 'Incident Response & 72h DPA',
        shortLabel: 'Incident Response',
        description: 'Security incident commander portal, GDPR 72h countdown & post-mortem audits',
        icon: Flame,
        category: 'risk_governance',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'bcdr',
        label: 'BCDR & Tabletop Simulator',
        shortLabel: 'BCDR & Tabletop',
        description: 'RTO/RPO telemetry, WORM immutable database snapshots & annual ransomware drills',
        icon: Database,
        category: 'risk_governance',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'risks',
        label: '5x5 Risk Register',
        shortLabel: 'Risk Register',
        description: 'Likelihood x Impact matrix, treatment strategies & risk ownership',
        icon: AlertTriangle,
        category: 'risk_governance',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'vendors',
        label: 'Vendor Risk (TPRM)',
        shortLabel: 'Vendor Risk',
        description: 'Third-party vendor tiering, DPA contracts, and subprocessor monitoring',
        icon: Building2,
        category: 'risk_governance',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'exceptions',
        label: 'Risk SLA & Exceptions',
        shortLabel: 'Exceptions & SLA',
        description: 'Formal risk waivers, mitigation plans, expiry tracking & executive approvals',
        icon: FileWarning,
        category: 'risk_governance',
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'policies',
        label: 'Policy Center',
        shortLabel: 'Policy Center',
        description: 'Version-controlled organizational security policies & employee attestation',
        icon: FileText,
        category: 'risk_governance',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'iso-soa',
        label: 'ISO 27001 SoA Generator',
        shortLabel: 'ISO SoA',
        description: 'Statement of Applicability Annex A 93 controls generator & auditor export',
        icon: Award,
        category: 'risk_governance',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'regulatory-news',
        label: 'Regulatory News Aggregator',
        shortLabel: 'Regulatory News',
        description: 'Google Search grounded updates from NIST, CISA, GDPR & global compliance authorities',
        icon: Globe2,
        category: 'risk_governance',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'drift',
        label: 'Compliance Drift Vault',
        shortLabel: 'Drift Vault',
        description: 'Historical point-in-time compliance snapshots & regression timeline',
        icon: History,
        category: 'risk_governance',
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
    ],
  },
  {
    id: 'audit_trust',
    title: 'Audit Assurance & External Trust',
    shortTitle: 'Assurance & Trust',
    description: 'Certified auditor workspace, public trust center, and real-time webhook alerting',
    items: [
      {
        id: 'auditor',
        label: 'Auditor Workspace',
        shortLabel: 'Auditor Portal',
        description: 'Direct collaboration portal for CPA auditors with sample request fulfillment',
        icon: FileCheck2,
        category: 'audit_trust',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'auditor-marketplace',
        label: 'Auditor Network & RFP',
        shortLabel: 'Auditor Network',
        description: 'Connect with accredited AICPA / ISO audit firms, compare quotes & scopes',
        icon: Building2,
        category: 'audit_trust',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst'],
      },
      {
        id: 'evidence-vault',
        label: 'Evidence Vault',
        shortLabel: 'Evidence Vault',
        description: 'Associate and track files & documents mapped to controls for audit readiness',
        icon: FolderLock,
        category: 'audit_trust',
        isNew: true,
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'activity-log',
        label: 'API Activity Log',
        shortLabel: 'Activity Log',
        description: 'Real-time compliance audit trail of internal system actions & external API requests',
        icon: Activity,
        category: 'audit_trust',
        isNew: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'trust-center',
        label: 'Live Trust Center',
        shortLabel: 'Trust Center',
        description: 'Customer-facing security portal with self-service NDA protected report access',
        icon: Globe2,
        category: 'audit_trust',
        isPrimary: true,
        allowedRoles: ['ciso', 'compliance_analyst', 'auditor'],
      },
      {
        id: 'webhooks',
        label: 'Webhook Alerting',
        shortLabel: 'Alerting',
        description: 'Real-time HTTP webhook delivery to Slack, Teams, PagerDuty, and SIEM',
        icon: Bell,
        category: 'audit_trust',
        allowedRoles: ['ciso'],
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItemDef[] = NAV_CATEGORIES.flatMap((c) => c.items);

export function getNavItemById(id: string): NavItemDef | undefined {
  return ALL_NAV_ITEMS.find((item) => item.id === id);
}

export function getCategoryByItemId(id: string): NavCategoryDef | undefined {
  return NAV_CATEGORIES.find((c) => c.items.some((item) => item.id === id));
}

export function getPrimaryNavItems(role?: UserRole): NavItemDef[] {
  return ALL_NAV_ITEMS.filter((item) => {
    if (!item.isPrimary) return false;
    if (role && item.allowedRoles && !item.allowedRoles.includes(role)) return false;
    return true;
  });
}


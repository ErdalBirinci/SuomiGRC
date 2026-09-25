import { FrameworkId } from './grc';

export interface AuditorFirm {
  id: string;
  name: string;
  badge: string;
  rating: number;
  reviewCount: number;
  headquarters: string;
  globalOffices: string[];
  supportedFrameworks: FrameworkId[];
  specializations: string[];
  basePriceEstimate: string;
  turnaroundWeeks: string;
  description: string;
  logoInitial: string;
  accentColor: string;
  vantaPartnerTier: 'Premier Partner' | 'Certified Global CPA' | 'Accredited Registrar';
  sampleClients: string[];
  leadPartners: {
    name: string;
    title: string;
    certifications: string[];
  }[];
}

export interface AuditEngagementBooking {
  id: string;
  firmId: string;
  firmName: string;
  frameworks: FrameworkId[];
  targetObservationStart: string;
  targetObservationEnd: string;
  status: 'draft_rfp' | 'proposal_received' | 'engagement_signed' | 'audit_in_progress' | 'report_issued';
  estimatedCost: string;
  leadAuditor: string;
  signedNda: boolean;
  pbcFulfillmentRate: number;
}

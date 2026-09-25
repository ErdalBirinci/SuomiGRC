export type IsoTheme = 'Organizational' | 'People' | 'Physical' | 'Technological';
export type IsoApplicability = 'Applicable' | 'Excluded';
export type IsoImplementationState = 'Implemented' | 'In Progress' | 'Planned';

export interface IsoSoaControlItem {
  id: string; // e.g. 'A.5.1'
  theme: IsoTheme;
  title: string;
  description: string;
  applicability: IsoApplicability;
  justification: string;
  implementationState: IsoImplementationState;
  linkedTechnicalTestIds: string[];
  linkedEvidenceVaultIds: string[];
  owner: string;
  lastReviewDate: string;
}

export interface IsoSoaSummary {
  totalControls: number;
  applicableCount: number;
  excludedCount: number;
  implementedCount: number;
  inProgressCount: number;
  plannedCount: number;
  overallComplianceRate: number;
}

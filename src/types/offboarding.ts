export interface DeprovisioningCheck {
  id: string;
  system: 'Google Workspace' | 'AWS Production IAM' | 'GitHub Organization' | 'Okta SSO' | 'Slack Enterprise' | '1Password Enterprise';
  systemIcon: string;
  accountIdentifier: string;
  role: string;
  status: 'revoked' | 'pending' | 'failed';
  revokedAt?: string;
  revokedBy?: string;
  confirmationHash?: string;
}

export interface DeviceReturnInfo {
  serialNumber: string;
  model: string;
  isReturned: boolean;
  receivedDate?: string;
  remoteWipeStatus: 'completed' | 'command_sent' | 'pending' | 'not_applicable';
  wipeTimestamp?: string;
  mdmServerAck?: string;
}

export interface OffboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  role: string;
  departureDate: string;
  departureType: 'Voluntary' | 'Involuntary' | 'Contractor End';
  slaHoursLimit: number; // e.g. 24h
  hoursRemaining: number;
  slaStatus: 'within_sla' | 'at_risk' | 'breached' | 'completed';
  overallStatus: 'in_progress' | 'completed' | 'action_required';
  checklist: DeprovisioningCheck[];
  device: DeviceReturnInfo;
  ndaReattestationSigned: boolean;
  auditorSignoffHash?: string;
  completedAt?: string;
}

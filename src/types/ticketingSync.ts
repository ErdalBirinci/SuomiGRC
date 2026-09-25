export interface RemediationTicket {
  id: string;
  platform: 'jira' | 'linear' | 'github';
  ticketKey: string; // e.g. "SEC-142" or "LIN-92"
  title: string;
  failingTestId: string;
  failingControlCode: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  assigneeName: string;
  assigneeAvatar: string;
  assignedTeam: string;
  status: 'todo' | 'in_progress' | 'pr_in_review' | 'resolved';
  slaDeadline: string;
  slaDaysRemaining: number;
  isOverdue: boolean;
  linkedPrUrl?: string;
  syncStatus: 'synced_bidirectional' | 'pending_push' | 'sync_error';
  lastSyncedAt: string;
}

import React, { useState } from 'react';
import { RemediationTicket } from '../types/ticketingSync';
import { AutomatedTest } from '../types/grc';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Code2,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Send,
} from 'lucide-react';

interface TicketingSyncHubProps {
  tickets: RemediationTicket[];
  failingTests: AutomatedTest[];
  onUpdateTickets: (tickets: RemediationTicket[]) => void;
  onNavigateTab?: (tab: string) => void;
}

export const TicketingSyncHub: React.FC<TicketingSyncHubProps> = ({
  tickets,
  failingTests,
  onUpdateTickets,
  onNavigateTab,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'jira' | 'linear' | 'github'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New ticket state
  const [selectedTestId, setSelectedTestId] = useState(failingTests[0]?.id || '');
  const [targetPlatform, setTargetPlatform] = useState<'jira' | 'linear'>('jira');
  const [ticketSummary, setTicketSummary] = useState('');
  const [assigneeName, setAssigneeName] = useState('Janne Niemi (SRE Lead)');
  const [targetTeam, setTargetTeam] = useState('Infrastructure Team');

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleSyncTickets = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const updated = tickets.map((t) => ({
        ...t,
        lastSyncedAt: 'Just now',
        syncStatus: 'synced_bidirectional' as const,
      }));
      onUpdateTickets(updated);
      showNotification('Jira & Linear webhooks polled. 3 issues in sync with GitHub PRs.');
    }, 1500);
  };

  const handleUpdateTicketStatus = (ticketId: string, nextStatus: RemediationTicket['status']) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: nextStatus,
            lastSyncedAt: 'Just now',
          }
        : t
    );
    onUpdateTickets(updated);
    showNotification(`Ticket updated to ${nextStatus.replace('_', ' ').toUpperCase()} in Jira/Linear.`);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const test = failingTests.find((t) => t.id === selectedTestId) || failingTests[0];
    const prefix = targetPlatform === 'jira' ? 'SEC' : 'LIN';
    const randNum = Math.floor(Math.random() * 800 + 100);

    const newTicket: RemediationTicket = {
      id: `tkt-${Date.now()}`,
      platform: targetPlatform,
      ticketKey: `${prefix}-${randNum}`,
      title: ticketSummary.trim() || `Remediate failing continuous check: ${test?.title || 'Security Control'}`,
      failingTestId: test?.id || 'manual-ctrl',
      failingControlCode: 'CC6.1',
      severity: 'high',
      assigneeName: assigneeName,
      assigneeAvatar: assigneeName.substring(0, 2).toUpperCase(),
      assignedTeam: targetTeam,
      status: 'todo',
      slaDeadline: '14 Days from now',
      slaDaysRemaining: 14,
      isOverdue: false,
      syncStatus: 'synced_bidirectional',
      lastSyncedAt: 'Just now',
    };

    onUpdateTickets([newTicket, ...tickets]);
    setIsCreateModalOpen(false);
    setTicketSummary('');
    showNotification(`Ticket ${newTicket.ticketKey} dispatched to ${targetPlatform === 'jira' ? 'Jira' : 'Linear'} board!`);
  };

  const filteredTickets = tickets.filter((t) => {
    if (platformFilter !== 'all' && t.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.ticketKey.toLowerCase().includes(q) ||
        t.assigneeName.toLowerCase().includes(q) ||
        t.failingControlCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Code2 className="w-5 h-5 text-blue-600" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Jira · Linear · GitHub Issues Two-Way Sync
            </span>
            <span className="text-xs text-slate-500 font-mono">Automated Remediation SLA Enforcement</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Developer Ticketing & Remediation SLA Sync
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Automatically converts continuous control test failures into developer backlog tickets in Jira and Linear. When the developer merges the fix, the automated test passes and the ticket closes automatically.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSyncTickets}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Polling Webhooks...' : 'Sync Jira & Linear'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Remediation Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs block">Active Remediation Tickets</span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {tickets.filter((t) => t.status !== 'resolved').length} Open
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">Jira (2) · Linear (1)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs block">Remediation SLA Compliance</span>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1">100% on Track</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">0 overdue tickets</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs block">GitOps PRs Linked</span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">2 Pull Requests</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Terraform & GitHub Actions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs block">Two-Way Webhook State</span>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1">Healthy (200 OK)</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Real-time bi-directional sync</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              platformFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Platforms ({tickets.length})
          </button>
          <button
            onClick={() => setPlatformFilter('jira')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              platformFilter === 'jira' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Jira Software
          </button>
          <button
            onClick={() => setPlatformFilter('linear')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              platformFilter === 'linear' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Linear App
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search key, control, assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    ticket.platform === 'jira'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  {ticket.ticketKey}
                </span>

                <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Control {ticket.failingControlCode}
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    ticket.severity === 'critical'
                      ? 'bg-rose-500 text-white'
                      : ticket.severity === 'high'
                      ? 'bg-amber-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {ticket.severity}
                </span>

                <h3 className="font-bold text-sm text-slate-900">{ticket.title}</h3>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={ticket.status}
                  onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value as any)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:ring-1 focus:ring-blue-500 ${
                    ticket.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : ticket.status === 'pr_in_review'
                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pr_in_review">PR in Review</option>
                  <option value="resolved">Resolved / Closed</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    {ticket.assigneeAvatar}
                  </div>
                  <span className="font-medium text-slate-800">{ticket.assigneeName}</span>
                  <span className="text-slate-400">({ticket.assignedTeam})</span>
                </div>

                {ticket.linkedPrUrl && (
                  <a
                    href={ticket.linkedPrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline font-mono text-[11px]"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>PR #142 (Terraform)</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>SLA: {ticket.slaDeadline}</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  ✓ Two-way sync verified ({ticket.lastSyncedAt})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Create Remediation Ticket in Jira / Linear</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Issue Tracker</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetPlatform('jira')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                      targetPlatform === 'jira'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    Jira Software (Cloud)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetPlatform('linear')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                      targetPlatform === 'linear'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    Linear Workspace
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Associated Failing Continuous Test</label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                >
                  {failingTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.title}
                    </option>
                  ))}
                  {failingTests.length === 0 && (
                    <option value="test-rds-multi-az">AWS RDS Multi-AZ & KMS Encryption Test</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Custom Ticket Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Enforce SSE-KMS Default Encryption on AWS RDS"
                  value={ticketSummary}
                  onChange={(e) => setTicketSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assignee</label>
                  <input
                    type="text"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Team</label>
                  <input
                    type="text"
                    value={targetTeam}
                    onChange={(e) => setTargetTeam(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] leading-relaxed">
                <strong>Two-Way Automation:</strong> The issue will be stamped with the failing test ARN. When SRE opens a pull request with the git commit message referencing this ticket key, test verification will run in CI.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Create & Push Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

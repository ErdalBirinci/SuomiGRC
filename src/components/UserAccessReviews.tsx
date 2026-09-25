import React, { useState } from 'react';
import {
  UserAccessReviewCampaign,
  UserAccessItem,
} from '../types/grc';
import { PlatformLogo } from './PlatformLogo';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  Plus,
  ArrowRight,
  FileCheck2,
  Calendar,
  Layers,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface UserAccessReviewsProps {
  campaigns: UserAccessReviewCampaign[];
  items: UserAccessItem[];
  onUpdateItems: (items: UserAccessItem[]) => void;
  onUpdateCampaigns: (campaigns: UserAccessReviewCampaign[]) => void;
}

export const UserAccessReviews: React.FC<UserAccessReviewsProps> = ({
  campaigns,
  items,
  onUpdateItems,
  onUpdateCampaigns,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || 'uar-q3-2026'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<'all' | 'pending' | 'approved' | 'revoked'>('all');
  const [showSignoffSuccess, setShowSignoffSuccess] = useState(false);
  const [reasonModalItem, setReasonModalItem] = useState<UserAccessItem | null>(null);
  const [revocationReason, setRevocationReason] = useState('');

  const currentCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const campaignItems = items.filter((item) => item.campaignId === selectedCampaignId);

  const filteredItems = campaignItems.filter((item) => {
    if (systemFilter !== 'all' && item.systemId !== systemFilter) return false;
    if (decisionFilter !== 'all' && item.decision !== decisionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.employeeName.toLowerCase().includes(q) ||
        item.employeeEmail.toLowerCase().includes(q) ||
        item.roleOrPermission.toLowerCase().includes(q) ||
        item.systemName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = campaignItems.filter((i) => i.decision === 'pending').length;
  const approvedCount = campaignItems.filter((i) => i.decision === 'approved').length;
  const revokedCount = campaignItems.filter((i) => i.decision === 'revoked').length;
  const totalCount = campaignItems.length;
  const completionPct = totalCount > 0 ? Math.round(((approvedCount + revokedCount) / totalCount) * 100) : 0;

  const handleApprove = (itemId: string) => {
    const updated = items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            decision: 'approved' as const,
            decisionReason: 'Access reviewed and validated as necessary for legitimate job duties.',
            decidedAt: 'Just now',
            decidedBy: 'CISO / Security Reviewer (You)',
          }
        : i
    );
    onUpdateItems(updated);
  };

  const handleOpenRevokeModal = (item: UserAccessItem) => {
    setReasonModalItem(item);
    setRevocationReason(item.flaggedAnomaly || 'Role no longer requires this privileged entitlement.');
  };

  const handleConfirmRevoke = () => {
    if (!reasonModalItem) return;
    const updated = items.map((i) =>
      i.id === reasonModalItem.id
        ? {
            ...i,
            decision: 'revoked' as const,
            decisionReason: revocationReason || 'Access revoked during formal UAR review.',
            decidedAt: 'Just now',
            decidedBy: 'CISO / Security Reviewer (You)',
          }
        : i
    );
    onUpdateItems(updated);
    setReasonModalItem(null);
    setRevocationReason('');
  };

  const handleBulkApprovePending = () => {
    const updated = items.map((i) => {
      if (i.campaignId === selectedCampaignId && i.decision === 'pending' && !i.flaggedAnomaly) {
        return {
          ...i,
          decision: 'approved' as const,
          decisionReason: 'Bulk verified standard business entitlements.',
          decidedAt: 'Just now',
          decidedBy: 'CISO / Security Reviewer (You)',
        };
      }
      return i;
    });
    onUpdateItems(updated);
  };

  const handleCompleteCampaignSignoff = () => {
    const updatedCampaigns = campaigns.map((c) =>
      c.id === selectedCampaignId ? { ...c, status: 'completed' as const } : c
    );
    onUpdateCampaigns(updatedCampaigns);
    setShowSignoffSuccess(true);
    setTimeout(() => setShowSignoffSuccess(false), 5000);
  };

  const exportAuditReport = () => {
    const headers = ['Employee Name', 'Email', 'System', 'Entitlement Role', 'Account Type', 'Decision', 'Reviewer Notes', 'Decided At'];
    const rows = campaignItems.map((i) => [
      `"${i.employeeName}"`,
      `"${i.employeeEmail}"`,
      `"${i.systemName}"`,
      `"${i.roleOrPermission}"`,
      `"${i.accountType}"`,
      `"${i.decision.toUpperCase()}"`,
      `"${i.decisionReason || ''}"`,
      `"${i.decidedAt || 'Pending'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SOC2_CC6.2_UAR_Report_${currentCampaign.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              SOC 2 CC6.2 & ISO 27001 A.9.2.5
            </span>
            <span className="text-xs text-slate-500 font-mono">Quarterly Access Campaigns</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            User Access Reviews (UAR)
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Perform auditable quarterly access certifications across connected production platforms (AWS, GitHub, Okta, RDS DB).
            Detect orphaned accounts, enforce the Principle of Least Privilege (PoLP), and generate signed auditor packages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportAuditReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Auditor CSV</span>
          </button>

          {completionPct === 100 && currentCampaign.status !== 'completed' ? (
            <button
              onClick={handleCompleteCampaignSignoff}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Sign-Off Campaign</span>
            </button>
          ) : (
            <button
              onClick={handleBulkApprovePending}
              disabled={pendingCount === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Bulk Approve Clean ({pendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {showSignoffSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Campaign {currentCampaign.title} officially signed off and archived!
            </span>
            <span className="text-emerald-700">Cryptographic audit log has been sealed and dispatched to Auditor Vault.</span>
          </div>
          <button onClick={() => setShowSignoffSuccess(false)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Campaign Selector & Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Campaign Info Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Selected Campaign</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                currentCampaign.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {currentCampaign.status}
            </span>
          </div>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 mt-1 focus:ring-1 focus:ring-blue-500"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.period})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Due Date: {currentCampaign.dueDate}</span>
          </div>
        </div>

        {/* Progress Card */}
        <button
          onClick={() => setDecisionFilter(decisionFilter === 'pending' ? 'all' : 'pending')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            decisionFilter === 'pending'
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Certification Progress</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-300 ${
                completionPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>{approvedCount + revokedCount} reviewed</span>
            <span className="font-medium text-amber-600 underline">{pendingCount} pending (filter)</span>
          </div>
        </button>

        {/* Approved Count */}
        <button
          onClick={() => setDecisionFilter(decisionFilter === 'approved' ? 'all' : 'approved')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
            decisionFilter === 'approved'
              ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono">{approvedCount}</div>
            <div className="text-xs text-slate-500">Approved Entitlements</div>
            <div className="text-[10px] text-emerald-600 font-medium">Click to filter approved</div>
          </div>
        </button>

        {/* Revoked Count */}
        <button
          onClick={() => setDecisionFilter(decisionFilter === 'revoked' ? 'all' : 'revoked')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
            decisionFilter === 'revoked'
              ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono">{revokedCount}</div>
            <div className="text-xs text-slate-500">Revoked / Deprovisioned</div>
            <div className="text-[10px] text-red-600 font-medium">Click to filter revoked</div>
          </div>
        </button>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee, email, role, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* System Filter */}
          <select
            value={systemFilter}
            onChange={(e) => setSystemFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Systems</option>
            <option value="aws">AWS Production</option>
            <option value="github">GitHub Enterprise</option>
            <option value="okta">Okta Identity</option>
            <option value="db">PostgreSQL RDS</option>
            <option value="gcp">Google Cloud</option>
          </select>

          {/* Decision Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setDecisionFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                decisionFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              All ({campaignItems.length})
            </button>
            <button
              onClick={() => setDecisionFilter('pending')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                decisionFilter === 'pending' ? 'bg-white text-amber-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setDecisionFilter('approved')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                decisionFilter === 'approved' ? 'bg-white text-emerald-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setDecisionFilter('revoked')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                decisionFilter === 'revoked' ? 'bg-white text-red-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Revoked ({revokedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Review Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User & Identity</th>
                <th className="py-3 px-4">System & Target</th>
                <th className="py-3 px-4">Entitlement / Privilege</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Review Decision</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No account entitlements found</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust search parameters or system filters.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isApproved = item.decision === 'approved';
                  const isRevoked = item.decision === 'revoked';
                  const isPending = item.decision === 'pending';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        item.flaggedAnomaly ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* User & Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {item.employeeName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{item.employeeName}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">{item.employeeEmail}</span>
                            <span className="text-[10px] text-slate-400 block">{item.department}</span>
                          </div>
                        </div>

                        {item.flaggedAnomaly && (
                          <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{item.flaggedAnomaly}</span>
                          </div>
                        )}
                      </td>

                      {/* System & Target */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-white border border-slate-200 rounded-md shrink-0">
                            <PlatformLogo platformId={item.systemId} name={item.systemName} size="xs" />
                          </div>
                          <div>
                            <span className="font-medium text-slate-800 block">{item.systemName}</span>
                            <span className="text-[10px] uppercase font-mono text-slate-400">{item.systemId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Entitlement / Privilege */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block w-fit max-w-[220px] truncate">
                          {item.roleOrPermission}
                        </span>
                        {item.roleOrPermission.toLowerCase().includes('admin') && (
                          <span className="inline-block mt-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                            Privileged Access
                          </span>
                        )}
                      </td>

                      {/* Account Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase font-mono ${
                            item.accountType === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : item.accountType === 'contractor'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.accountType}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {item.lastActiveAt}
                      </td>

                      {/* Review Decision */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isApproved && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                            <div className="text-[10px] text-slate-400">By {item.decidedBy}</div>
                          </div>
                        )}
                        {isRevoked && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[11px]">
                              <XCircle className="w-3 h-3 text-red-600" />
                              Revoked
                            </span>
                            <div className="text-[10px] text-slate-400">Ticket queued in Jira</div>
                          </div>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Review
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border shadow-2xs ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                            }`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenRevokeModal(item)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border shadow-2xs ${
                              isRevoked
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                            }`}
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Justification Modal */}
      {reasonModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Revoke Entitlement: {reasonModalItem.employeeName}
                </h3>
              </div>
              <button
                onClick={() => setReasonModalItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 leading-relaxed">
                <p className="font-semibold mb-1">Audit Notice (SOC 2 CC6.2)</p>
                Revoking this role will automatically schedule a Jira de-provisioning ticket for the Cloud Platform Team and record this decision in the auditor timeline.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Target</label>
                <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[11px]">
                  {reasonModalItem.systemName} · {reasonModalItem.roleOrPermission}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Revocation Reason & Auditor Justification Note
                </label>
                <textarea
                  rows={3}
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  placeholder="Explain why this account no longer satisfies the least privilege requirement..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setReasonModalItem(null)}
                className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AuditException, AutomatedTest } from '../types/grc';
import {
  FileWarning,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  Lock,
  XCircle,
  FileCheck2,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AuditExceptionsHubProps {
  exceptions: AuditException[];
  tests: AutomatedTest[];
  onUpdateExceptions: (exceptions: AuditException[]) => void;
}

export const AuditExceptionsHub: React.FC<AuditExceptionsHubProps> = ({
  exceptions,
  tests,
  onUpdateExceptions,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  // Form states
  const [selectedTestId, setSelectedTestId] = useState(tests.find((t) => t.status === 'failing')?.id || tests[0]?.id || '');
  const [reason, setReason] = useState('');
  const [compensatingControls, setCompensatingControls] = useState('');
  const [expiresAt, setExpiresAt] = useState('2026-11-15');
  const [cisoApprovalConfirmed, setCisoApprovalConfirmed] = useState(false);

  const filteredExceptions = exceptions.filter((exc) => {
    if (statusFilter !== 'all' && exc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        exc.testTitle.toLowerCase().includes(q) ||
        exc.reason.toLowerCase().includes(q) ||
        exc.compensatingControls.toLowerCase().includes(q) ||
        exc.requestedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = exceptions.filter((e) => e.status === 'active').length;
  const expiredCount = exceptions.filter((e) => e.status === 'expired').length;

  const handleRevoke = (id: string) => {
    const updated = exceptions.map((e) =>
      e.id === id ? { ...e, status: 'revoked' as const } : e
    );
    onUpdateExceptions(updated);
  };

  const handleCreateException = () => {
    const matchedTest = tests.find((t) => t.id === selectedTestId);
    if (!matchedTest || !reason || !compensatingControls) return;

    const newException: AuditException = {
      id: `exc-${Date.now()}`,
      testId: matchedTest.id,
      testTitle: matchedTest.title,
      riskRating: matchedTest.severity === 'critical' ? 'Critical' : matchedTest.severity === 'high' ? 'High' : 'Medium',
      reason,
      compensatingControls,
      requestedBy: 'Aino Virtanen (Lead Architect)',
      approvedBy: 'Matti Korhonen (CISO)',
      status: 'active',
      approvedAt: 'Today',
      expiresAt,
      slaDaysRemaining: 30,
    };

    onUpdateExceptions([newException, ...exceptions]);
    setShowCreateModal(false);
    setReason('');
    setCompensatingControls('');
    setCisoApprovalConfirmed(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <FileWarning className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              SLA Enforcement & Risk Acceptance
            </span>
            <span className="text-xs text-slate-500 font-mono">Formal Audit Exceptions</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Remediation SLAs & Auditor Exception Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage strict vulnerability remediation SLAs (Critical: 7 days, High: 30 days).
            When a business requirement justifies temporary non-compliance, formal risk acceptance waivers with compensating controls prevent auditor findings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Grant Formal Audit Exception</span>
          </button>
        </div>
      </div>

      {/* SLA Tiers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Critical SLA */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Critical Severity SLA</span>
            <span className="text-red-700 font-bold font-mono text-[10px] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              7 DAYS
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">100%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Zero SLA breaches</div>
          <div className="text-[10px] text-slate-400 mt-1">Blocking for SOC 2 Type II</div>
        </div>

        {/* High SLA */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>High Severity SLA</span>
            <span className="text-amber-700 font-bold font-mono text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              30 DAYS
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">1 Active</div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5">8 days remaining</div>
          <div className="text-[10px] text-slate-400 mt-1">Compensating IP ACL active</div>
        </div>

        {/* Medium SLA */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Medium Severity SLA</span>
            <span className="text-blue-700 font-bold font-mono text-[10px] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              90 DAYS
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">1 Active</div>
          <div className="text-[11px] text-slate-600 font-medium mt-0.5">38 days remaining</div>
          <div className="text-[10px] text-slate-400 mt-1">VPC peering isolation</div>
        </div>

        {/* Active Waivers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Auditor Waivers</span>
            <span className="text-purple-700 font-bold font-mono text-[10px] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              {activeCount} ACTIVE
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">{exceptions.length} Total</div>
          <div className="text-[11px] text-purple-700 font-medium mt-0.5">All signed by CISO</div>
          <div className="text-[10px] text-slate-400 mt-1">Visible to auditor partner</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search exceptions, compensating controls, or tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              statusFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
            }`}
          >
            All ({exceptions.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              statusFilter === 'active' ? 'bg-white text-amber-700 font-semibold shadow-2xs' : 'text-slate-600'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              statusFilter === 'expired' ? 'bg-white text-red-700 font-semibold shadow-2xs' : 'text-slate-600'
            }`}
          >
            Expired ({expiredCount})
          </button>
        </div>
      </div>

      {/* Exceptions List */}
      <div className="space-y-4">
        {filteredExceptions.map((exc) => {
          const isActive = exc.status === 'active';

          return (
            <div
              key={exc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 border border-amber-200">
                    <FileWarning className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          exc.riskRating === 'Critical'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : exc.riskRating === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {exc.riskRating} Severity
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Test ID: {exc.testId}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {exc.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{exc.testTitle}</h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-amber-600 flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exc.slaDaysRemaining} Days Remaining</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Expires: {exc.expiresAt}</div>
                </div>
              </div>

              {/* Justification & Compensating Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-700 block">Business Justification:</span>
                  <p className="text-slate-600 leading-relaxed">{exc.reason}</p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1">
                  <span className="font-semibold text-emerald-900 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Compensating Controls (Auditor Mitigation):
                  </span>
                  <p className="text-emerald-950 leading-relaxed">{exc.compensatingControls}</p>
                </div>
              </div>

              {/* Footer Sign-off Info */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Requested by: <strong className="text-slate-700">{exc.requestedBy}</strong></span>
                  <span>Approved by: <strong className="text-slate-700">{exc.approvedBy}</strong></span>
                  <span>Approved on: {exc.approvedAt}</span>
                </div>

                {isActive && (
                  <button
                    onClick={() => handleRevoke(exc.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Revoke Waiver Early
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Audit Exception Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <FileWarning className="w-4 h-4" />
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Grant Formal Audit Exception / Risk Waiver
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Automated Test / Non-Compliant Resource
                </label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.severity.toUpperCase()}] {t.title} ({t.integrationName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Justification (Required for SOC 2 Type II PBC)
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this control cannot be immediately remediated within the SLA window..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Compensating Technical Controls (Mandatory Mitigation)
                </label>
                <textarea
                  rows={2}
                  value={compensatingControls}
                  onChange={(e) => setCompensatingControls(e.target.value)}
                  placeholder="e.g. Strict IP whitelist VPN restrictions, temporary isolation in dedicated staging VPC, mTLS..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Waiver Expiration Date (Max 90 days)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Approver Authority
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="Matti Korhonen (CISO)"
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cisoApprovalConfirmed}
                  onChange={(e) => setCisoApprovalConfirmed(e.target.checked)}
                  className="mt-0.5 text-amber-600 rounded"
                />
                <span className="text-slate-600">
                  I confirm this waiver has been reviewed by the CISO office and logged in the formal SOC 2 management letter.
                </span>
              </label>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateException}
                disabled={!reason || !compensatingControls || !cisoApprovalConfirmed}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs disabled:opacity-50"
              >
                Sign & Activate Waiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

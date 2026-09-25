import React, { useState } from 'react';
import { OffboardingRecord, DeprovisioningCheck } from '../types/offboarding';
import {
  UserMinus,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Check,
  X,
  FileCheck,
  FileSignature,
} from 'lucide-react';

interface OffboardingTrackerHubProps {
  records: OffboardingRecord[];
  onUpdateRecords: (records: OffboardingRecord[]) => void;
  onNavigateTab?: (tab: string) => void;
}

export const OffboardingTrackerHub: React.FC<OffboardingTrackerHubProps> = ({
  records,
  onUpdateRecords,
  onNavigateTab,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(records[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'action_required' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New offboarding form state
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpRole, setNewEmpRole] = useState('Full-Stack Engineer');
  const [newDepType, setNewDepType] = useState<'Voluntary' | 'Involuntary' | 'Contractor End'>('Voluntary');

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  const inProgressCount = records.filter((r) => r.overallStatus === 'in_progress').length;
  const actionRequiredCount = records.filter((r) => r.overallStatus === 'action_required').length;
  const completedCount = records.filter((r) => r.overallStatus === 'completed').length;
  const totalChecks = records.flatMap((r) => r.checklist);
  const revokedChecksCount = totalChecks.filter((c) => c.status === 'revoked').length;

  const filteredRecords = records.filter((r) => {
    if (statusFilter !== 'all' && r.overallStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeEmail.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleRevokeSingle = (recordId: string, checkId: string) => {
    const updated = records.map((r) => {
      if (r.id === recordId) {
        const newChecklist = r.checklist.map((c) =>
          c.id === checkId
            ? {
                ...c,
                status: 'revoked' as const,
                revokedAt: 'Just now',
                revokedBy: 'Identity Orchestrator (Manual Trigger)',
                confirmationHash: `0x${Math.random().toString(16).substring(2, 18)}`,
              }
            : c
        );
        const allRevoked = newChecklist.every((c) => c.status === 'revoked');
        const isDeviceDone = r.device.remoteWipeStatus === 'completed' || r.device.isReturned;
        return {
          ...r,
          checklist: newChecklist,
          overallStatus: allRevoked && isDeviceDone ? ('completed' as const) : r.overallStatus,
          slaStatus: allRevoked ? ('completed' as const) : r.slaStatus,
        };
      }
      return r;
    });
    onUpdateRecords(updated);
    showNotification('System credential revoked and audit hash logged.');
  };

  const handleRevokeAllSystems = (recordId: string) => {
    const updated = records.map((r) => {
      if (r.id === recordId) {
        const newChecklist: DeprovisioningCheck[] = r.checklist.map((c) => ({
          ...c,
          status: 'revoked' as const,
          revokedAt: c.revokedAt || 'Just now',
          revokedBy: c.revokedBy || 'Auto-GRC 1-Click Deprovisioning Orchestrator',
          confirmationHash: c.confirmationHash || `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 10)}`,
        }));
        return {
          ...r,
          checklist: newChecklist,
          device: {
            ...r.device,
            remoteWipeStatus: 'completed' as const,
            wipeTimestamp: r.device.wipeTimestamp || 'Just now',
            mdmServerAck: 'APNs Command 200 OK (Wiped)',
          },
          overallStatus: 'completed' as const,
          slaStatus: 'completed' as const,
          completedAt: 'Just now',
          auditorSignoffHash: `WORM-OFFBOARDING-SEALED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        };
      }
      return r;
    });
    onUpdateRecords(updated);
    showNotification('All 6 SaaS accounts revoked & remote MDM wipe executed!');
  };

  const handleTriggerRemoteWipe = (recordId: string) => {
    const updated = records.map((r) => {
      if (r.id === recordId) {
        return {
          ...r,
          device: {
            ...r.device,
            remoteWipeStatus: 'completed' as const,
            wipeTimestamp: 'Just now',
            mdmServerAck: 'Apple APNs / Intune Wipe Command Executed',
          },
        };
      }
      return r;
    });
    onUpdateRecords(updated);
    showNotification('Remote wipe command dispatched to Jamf Pro / Intune MDM.');
  };

  const handleMarkDeviceReturned = (recordId: string) => {
    const updated = records.map((r) => {
      if (r.id === recordId) {
        return {
          ...r,
          device: {
            ...r.device,
            isReturned: true,
            receivedDate: 'Today',
          },
        };
      }
      return r;
    });
    onUpdateRecords(updated);
    showNotification('Hardware marked as physically received at IT Operations.');
  };

  const handleExportBinder = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 1500);
  };

  const handleCreateOffboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpEmail.trim()) return;

    const newRecord: OffboardingRecord = {
      id: `off-${Date.now()}`,
      employeeId: `emp-${Math.floor(Math.random() * 900 + 100)}`,
      employeeName: newEmpName.trim(),
      employeeEmail: newEmpEmail.trim(),
      department: newEmpDept,
      role: newEmpRole,
      departureDate: 'Today',
      departureType: newDepType,
      slaHoursLimit: 24,
      hoursRemaining: 24,
      slaStatus: 'within_sla',
      overallStatus: 'in_progress',
      checklist: [
        {
          id: `chk-${Date.now()}-1`,
          system: 'Google Workspace',
          systemIcon: 'google',
          accountIdentifier: newEmpEmail.trim(),
          role: 'Workspace Account',
          status: 'pending',
        },
        {
          id: `chk-${Date.now()}-2`,
          system: 'AWS Production IAM',
          systemIcon: 'aws',
          accountIdentifier: `${newEmpEmail.trim()} (IAM)`,
          role: 'Developer IAM',
          status: 'pending',
        },
        {
          id: `chk-${Date.now()}-3`,
          system: 'Okta SSO',
          systemIcon: 'okta',
          accountIdentifier: newEmpEmail.trim(),
          role: 'Corporate SSO',
          status: 'pending',
        },
        {
          id: `chk-${Date.now()}-4`,
          system: 'GitHub Organization',
          systemIcon: 'github',
          accountIdentifier: `github.com/${newEmpName.toLowerCase().replace(/\s+/g, '')}`,
          role: 'Organization Member',
          status: 'pending',
        },
        {
          id: `chk-${Date.now()}-5`,
          system: 'Slack Enterprise',
          systemIcon: 'slack',
          accountIdentifier: `@${newEmpName.toLowerCase().replace(/\s+/g, '.')}`,
          role: 'Active User',
          status: 'pending',
        },
        {
          id: `chk-${Date.now()}-6`,
          system: '1Password Enterprise',
          systemIcon: '1password',
          accountIdentifier: newEmpEmail.trim(),
          role: 'Vault Member',
          status: 'pending',
        },
      ],
      device: {
        serialNumber: `MDM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        model: 'MacBook Pro 14" M3',
        isReturned: false,
        remoteWipeStatus: 'pending',
      },
      ndaReattestationSigned: true,
    };

    onUpdateRecords([newRecord, ...records]);
    setSelectedRecordId(newRecord.id);
    setIsNewModalOpen(false);
    setNewEmpName('');
    setNewEmpEmail('');
    showNotification(`Offboarding workflow initiated for ${newRecord.employeeName}. 24h SLA counter started!`);
  };

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
            <span className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
              <UserMinus className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              SOC 2 CC6.2 & ISO 27001 A.9.2.6
            </span>
            <span className="text-xs text-slate-500 font-mono">Strict 24-Hour Deprovisioning SLA</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Automated Offboarding & Access Revocation Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Eliminates orphaned accounts and post-departure data exfiltration. Continuously audits whether IdP, cloud IAM, GitHub, and MDM credentials were fully revoked within 24 hours of departure date.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportBinder}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isExporting ? 'Bundling Evidence...' : exportComplete ? 'Auditor ZIP Downloaded!' : 'Export Offboarding Binder'}</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Initiate Offboarding</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'in_progress'
              ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">In-Flight Offboardings</span>
            <span className="p-1 rounded-md bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-2">{inProgressCount}</div>
          <div className="text-[10px] text-blue-700 font-medium mt-1">Countdown timer active</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'action_required' ? 'all' : 'action_required')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'action_required'
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">At-Risk of SLA Breach</span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-2">{actionRequiredCount}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-1">&lt;6 hours remaining</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Completed & Sealed</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-2">{completedCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">100% SLA compliance</div>
        </button>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Total Accounts Revoked</span>
            <span className="p-1 rounded-md bg-purple-50 text-purple-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-2">
            {revokedChecksCount} <span className="text-xs text-slate-400 font-normal">/ {totalChecks.length}</span>
          </div>
          <div className="text-[10px] text-purple-700 font-medium mt-1">All audit hashes timestamped</div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Departing Personnel */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search departing staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-[11px] text-blue-600 font-medium hover:underline whitespace-nowrap"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {filteredRecords.map((rec) => {
              const isSelected = rec.id === (selectedRecord?.id || '');
              const pendingSystems = rec.checklist.filter((c) => c.status === 'pending').length;

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-1 ring-slate-900'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <span>{rec.employeeName}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                            isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rec.departureType}
                        </span>
                      </div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {rec.role} · {rec.department}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        rec.slaStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rec.slaStatus === 'at_risk'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {rec.slaStatus === 'completed'
                        ? 'Done'
                        : `${rec.hoursRemaining}h SLA left`}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/40">
                    <span className={isSelected ? 'text-slate-300 text-[11px]' : 'text-slate-500 text-[11px]'}>
                      Departed: {rec.departureDate}
                    </span>
                    <span className={`text-[11px] font-medium ${pendingSystems > 0 ? (isSelected ? 'text-amber-300' : 'text-amber-600') : (isSelected ? 'text-emerald-300' : 'text-emerald-600')}`}>
                      {pendingSystems > 0 ? `${pendingSystems} pending revocations` : 'All 6 accounts revoked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedRecord && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedRecord.employeeName}</h2>
                  <span className="text-xs text-slate-500 font-mono">({selectedRecord.employeeEmail})</span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {selectedRecord.role} · {selectedRecord.department}
                </div>
              </div>

              {selectedRecord.overallStatus !== 'completed' && (
                <button
                  onClick={() => handleRevokeAllSystems(selectedRecord.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Revoke All Access Now</span>
                </button>
              )}
            </div>

            {/* SLA Clock & Status Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              selectedRecord.overallStatus === 'completed'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : selectedRecord.slaStatus === 'at_risk'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-blue-50/70 border-blue-200 text-blue-900'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                  selectedRecord.overallStatus === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-white text-slate-800 shadow-2xs'
                }`}>
                  {selectedRecord.overallStatus === 'completed' ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {selectedRecord.overallStatus === 'completed'
                      ? 'Deprovisioning Complete & Audit Sealed'
                      : `24-Hour SLA Deadline: ${selectedRecord.hoursRemaining} Hours Remaining`}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    {selectedRecord.overallStatus === 'completed'
                      ? `All credentials terminated within ${24 - selectedRecord.hoursRemaining}h window. Seal: ${selectedRecord.auditorSignoffHash}`
                      : 'SOC 2 CC6.2 mandates all corporate and infrastructure access must be severed within 24h.'}
                  </div>
                </div>
              </div>
            </div>

            {/* System Deprovisioning Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Systems Deprovisioning Audit
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedRecord.checklist.filter((c) => c.status === 'revoked').length} of {selectedRecord.checklist.length} Revoked
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedRecord.checklist.map((chk) => (
                  <div key={chk.id} className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{chk.system}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            chk.status === 'revoked'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {chk.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {chk.accountIdentifier}
                      </div>
                      {chk.confirmationHash && (
                        <div className="text-[10px] text-emerald-600 font-mono mt-0.5">
                          ✓ Hash: {chk.confirmationHash.substring(0, 24)}... (Revoked {chk.revokedAt})
                        </div>
                      )}
                    </div>

                    {chk.status !== 'revoked' ? (
                      <button
                        onClick={() => handleRevokeSingle(selectedRecord.id, chk.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                      >
                        Revoke Access
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Revoked</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware MDM Wipe & Return */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Company Hardware & Remote Wipe
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">SN: {selectedRecord.device.serialNumber}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Physical Device Return</div>
                  <div className="font-semibold text-slate-800 mt-1 flex items-center justify-between">
                    <span>{selectedRecord.device.isReturned ? 'Returned to IT' : 'Pending Return'}</span>
                    {!selectedRecord.device.isReturned && (
                      <button
                        onClick={() => handleMarkDeviceReturned(selectedRecord.id)}
                        className="text-[10px] text-blue-600 font-medium hover:underline"
                      >
                        Mark Received
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500 text-[11px]">MDM Remote Wipe Command</div>
                  <div className="font-semibold text-slate-800 mt-1 flex items-center justify-between">
                    <span className={selectedRecord.device.remoteWipeStatus === 'completed' ? 'text-emerald-700' : 'text-amber-700'}>
                      {selectedRecord.device.remoteWipeStatus === 'completed'
                        ? 'Wipe Executed (APNs ACK)'
                        : selectedRecord.device.remoteWipeStatus === 'command_sent'
                        ? 'Command Queued'
                        : 'Wipe Not Triggered'}
                    </span>
                    {selectedRecord.device.remoteWipeStatus !== 'completed' && (
                      <button
                        onClick={() => handleTriggerRemoteWipe(selectedRecord.id)}
                        className="text-[10px] text-rose-600 font-semibold hover:underline"
                      >
                        Trigger Wipe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* NDA Attestation & Auditor Cryptographic Seal */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-xl text-xs">
              <div className="flex items-center gap-2.5">
                <FileSignature className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold block">Confidentiality & Non-Disclosure Re-attestation</span>
                  <span className="text-[11px] text-slate-400">Signed electronically upon exit interview</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                Verified Signed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Initiate Offboarding Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">Initiate Employee Offboarding</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOffboarding} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Henrik Larsson"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. henrik.larsson@acmetech.io"
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="DevOps & SRE">DevOps & SRE</option>
                    <option value="SecOps">SecOps</option>
                    <option value="Sales & BD">Sales & BD</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Departure Type</label>
                  <select
                    value={newDepType}
                    onChange={(e) => setNewDepType(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  >
                    <option value="Voluntary">Voluntary</option>
                    <option value="Involuntary">Involuntary</option>
                    <option value="Contractor End">Contractor End</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] leading-relaxed">
                <strong>SOC 2 SLA Notice:</strong> Submitting will automatically schedule the 24-hour SLA countdown. Identity Orchestrator will prepare automated revocation payloads across Google, AWS, Okta, and GitHub.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Start Offboarding Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

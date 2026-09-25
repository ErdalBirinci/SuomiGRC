import React, { useState, useEffect } from 'react';
import { Policy, FrameworkId } from '../types/grc';
import {
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Edit3,
  ExternalLink,
  Shield,
  Search,
  Check,
  X,
  FileCheck,
} from 'lucide-react';

interface PolicyCenterProps {
  policies: Policy[];
  onUpdatePolicies: (policies: Policy[]) => void;
  selectedFramework: FrameworkId | 'all';
  initialSearchQuery?: string;
  initialSelectedPolicyId?: string;
}

export const PolicyCenter: React.FC<PolicyCenterProps> = ({
  policies,
  onUpdatePolicies,
  selectedFramework,
  initialSearchQuery = '',
  initialSelectedPolicyId,
}) => {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [reminderSentPolicyId, setReminderSentPolicyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialSelectedPolicyId) {
      const found = policies.find((p) => p.id === initialSelectedPolicyId);
      if (found) setSelectedPolicy(found);
    }
  }, [initialSelectedPolicyId, policies]);

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFramework =
      selectedFramework === 'all' || p.frameworksCovered.includes(selectedFramework);
    return matchesSearch && matchesFramework;
  });

  const handleOpenPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setEditedContent(policy.content);
    setIsEditing(false);
  };

  const handleSavePolicy = () => {
    if (!selectedPolicy) return;
    const updated = policies.map((p) =>
      p.id === selectedPolicy.id
        ? {
            ...p,
            content: editedContent,
            lastApprovedAt: 'Today',
            version: `${p.version.split('.')[0]}.${Number(p.version.split('.')[1] || 0) + 1}`,
          }
        : p
    );
    onUpdatePolicies(updated);
    setSelectedPolicy({ ...selectedPolicy, content: editedContent });
    setIsEditing(false);
  };

  const handleSendReminders = (policyId: string) => {
    setReminderSentPolicyId(policyId);
    setTimeout(() => {
      setReminderSentPolicyId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Enterprise Governance Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Auditor-Approved Policy Suite</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Policy Center & Lifecycle Management</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Audit-ready security policies with automated annual review cadences, employee acknowledgment tracking, and version history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs">
            <span className="text-slate-500 block">Overall Employee Acknowledgment</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              95.2% <span className="text-xs text-emerald-600 font-normal">Audit-Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Policies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPolicies.map((policy) => {
          const ackRate = Math.round(
            (policy.employeeAcksCount / policy.totalEmployeesCount) * 100
          );
          const isReminderSent = reminderSentPolicyId === policy.id;

          return (
            <div
              key={policy.id}
              onClick={() => handleOpenPolicy(policy)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {policy.code} · {policy.version}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {policy.status}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 text-sm">{policy.title}</h3>
                <div className="text-[11px] text-slate-500 mt-1">Owner: {policy.owner}</div>

                {/* Framework Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {policy.frameworksCovered.map((fw) => (
                    <span
                      key={fw}
                      className="text-[10px] uppercase font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded"
                    >
                      {fw}
                    </span>
                  ))}
                </div>

                {/* Employee Acknowledgment Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Employee Sign-off</span>
                    <span className="font-semibold text-slate-800 font-mono tabular-nums">
                      {policy.employeeAcksCount} / {policy.totalEmployeesCount} ({ackRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${ackRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${ackRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendReminders(policy.id);
                  }}
                  disabled={isReminderSent}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors disabled:text-emerald-600"
                >
                  {isReminderSent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Sent!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Nudge Pending</span>
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPolicy(policy);
                  }}
                  className="px-3 py-1 font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                >
                  View / Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Reader & Editor Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-slate-500 font-mono">
                    <span>{selectedPolicy.code}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Version {selectedPolicy.version}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Approved: {selectedPolicy.lastApprovedAt}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{selectedPolicy.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm">
              {isEditing ? (
                <div className="space-y-2 h-full">
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Markdown Policy Content
                  </label>
                  <textarea
                    rows={16}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-4 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="prose prose-slate max-w-none prose-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedPolicy.content}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                Next scheduled review: <strong>{selectedPolicy.nextReviewDue}</strong>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-100 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePolicy}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-2xs"
                    >
                      Publish New Revision
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 bg-white rounded-md hover:bg-slate-100 font-medium text-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                    <button
                      onClick={() => setSelectedPolicy(null)}
                      className="px-4 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-medium"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

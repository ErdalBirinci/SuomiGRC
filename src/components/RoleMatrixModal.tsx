import React from 'react';
import { useRBAC } from '../context/RbacContext';
import { ALL_NAV_ITEMS } from '../data/navigationStructure';
import {
  X,
  Shield,
  ShieldCheck,
  UserCheck,
  Eye,
  Check,
  Lock,
  Minus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../types/rbac';

interface RoleMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleMatrixModal: React.FC<RoleMatrixModalProps> = ({ isOpen, onClose }) => {
  const { currentRole, setRole, allRoles } = useRBAC();

  if (!isOpen) return null;

  const keyActions: { id: string; label: string; description: string; ciso: boolean; analyst: boolean; auditor: boolean }[] = [
    {
      id: 'evidence_review',
      label: 'Approve & Reject Audit Evidence',
      description: 'Sign off on Provided-By-Client (PBC) control evidence requests during active audit window',
      ciso: true,
      analyst: false,
      auditor: true,
    },
    {
      id: 'pass_test',
      label: 'Execute & Verify Automated Control Tests',
      description: 'Trigger continuous API re-testing against cloud resources to refresh evidence',
      ciso: true,
      analyst: true,
      auditor: false,
    },
    {
      id: 'create_risk',
      label: 'Create & Update 5x5 Risks',
      description: 'Add new inherent risks, assign residual impact, and map treatment strategies',
      ciso: true,
      analyst: true,
      auditor: false,
    },
    {
      id: 'approve_exceptions',
      label: 'Formally Approve Risk Exceptions & Waivers',
      description: 'Executive sign-off accepting non-compliant controls with compensating controls',
      ciso: true,
      analyst: false,
      auditor: false,
    },
    {
      id: 'auto_remediation',
      label: 'Deploy GitOps Auto-Remediation PRs',
      description: 'Execute Terraform code generation and push branch PRs to production repositories',
      ciso: true,
      analyst: false,
      auditor: false,
    },
    {
      id: 'webhook_dispatch',
      label: 'Configure SIEM & Webhook Alerting',
      description: 'Rotate webhook signing secrets and broadcast security failure alerts to Slack/Teams',
      ciso: true,
      analyst: false,
      auditor: false,
    },
    {
      id: 'user_access_reviews',
      label: 'Conduct Quarterly Entitlement Campaigns',
      description: 'Review manager signoffs, revoke dormant access, and certify least privilege',
      ciso: true,
      analyst: true,
      auditor: false,
    },
    {
      id: 'export_binder',
      label: 'Export Signed Evidence Packages (ZIP)',
      description: 'Download SHA-256 cryptographically timestamped evidence packages for CPA filing',
      ciso: true,
      analyst: true,
      auditor: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Enterprise Role-Based Access Control (RBAC) Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Granular dashboard view permissions and action capabilities by corporate role
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {allRoles.map((role) => {
              const isSelected = role.id === currentRole;
              return (
                <div
                  key={role.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{role.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {role.user.name} · {role.user.title}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    {role.summary}
                  </p>
                  <button
                    onClick={() => setRole(role.id)}
                    disabled={isSelected}
                    className={`mt-3 w-full py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? 'Currently Viewing As' : `Switch to ${role.shortTitle}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Capabilities Comparison Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Action Capabilities by Role
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Action Capability</th>
                    <th className="py-2.5 px-3 text-center">CISO (Admin)</th>
                    <th className="py-2.5 px-3 text-center">Compliance Analyst</th>
                    <th className="py-2.5 px-3 text-center">External Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keyActions.map((action) => (
                    <tr key={action.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{action.label}</div>
                        <div className="text-[10px] text-slate-500">{action.description}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {action.ciso ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                            <Minus className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {action.analyst ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                            <Minus className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {action.auditor ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700" title="Restricted for external auditor independence">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Module View Access Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Dashboard & Module Accessibility Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-900 block mb-1">CISO Scope</span>
                <p className="text-[11px] text-purple-800 leading-snug">
                  Unrestricted access to all 25 modules, Evidence Vault, API activity ledger, executive financial exposure, actuarial insurance ratings, and raw platform connectors.
                </p>
                <div className="mt-2 text-[10px] font-mono text-purple-700">25 of 25 Modules Allowed</div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">Compliance Analyst Scope</span>
                <p className="text-[11px] text-blue-800 leading-snug">
                  Full operational controls, Evidence Vault, API activity audit log, vendor TPRM, questionnaires, LMS, fleet MDM, and risk register. Direct GitOps pull push & SIEM secrets locked.
                </p>
                <div className="mt-2 text-[10px] font-mono text-blue-700">20 of 25 Modules Allowed</div>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1">Auditor Assurance Scope</span>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Auditor Workspace, Evidence Vault inspection & sign-off, continuous API activity audit trail, test evidence, cross-framework matrix, point-in-time drift vault, and risk register (read-only). Sensitive HR and engineering configs isolated.
                </p>
                <div className="mt-2 text-[10px] font-mono text-amber-700">10 of 25 Modules Allowed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            AICPA Trust Services Criteria CC6.1 & CC6.3 Access Separation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};

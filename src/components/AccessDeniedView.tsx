import React from 'react';
import { useRBAC } from '../context/RbacContext';
import { getNavItemById } from '../data/navigationStructure';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Eye,
  Key,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { UserRole } from '../types/rbac';

interface AccessDeniedViewProps {
  attemptedTabId?: string;
  attemptedTab?: string;
  onNavigateTab?: (tabId: string) => void;
  onSwitchTab?: (tabId: string) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  attemptedTabId,
  attemptedTab,
  onNavigateTab,
  onSwitchTab,
}) => {
  const targetTabId = attemptedTabId || attemptedTab || 'overview';
  const handleNavigate = onNavigateTab || onSwitchTab || (() => {});
  const { currentRole, currentUser, roleDefinition, setRole, allRoles } = useRBAC();
  const navItem = getNavItemById(targetTabId);
  const moduleName = navItem ? navItem.label : targetTabId;

  // Contextual reason explanations
  const getRestrictionExplanation = () => {
    if (currentRole === 'auditor') {
      return {
        reason: 'Third-Party Independent Auditor Isolation',
        details: `As an external CPA / ISO assurance auditor (${currentUser.title}), your access is restricted to read-only evidence binders, controls verification, and sample request fulfillment. Direct access to internal operational configurations, employee personal data (PII), or live infrastructure credentials is prohibited under AICPA Trust Services Criteria independence standards.`,
        recommendedTab: 'auditor',
        recommendedLabel: 'Return to Auditor Workspace',
      };
    }

    if (currentRole === 'compliance_analyst') {
      return {
        reason: 'Separation of Duties & Production Guardrails',
        details: `As a Compliance Analyst (${currentUser.title}), you have access to core compliance operations, risk registers, and evidence collection. However, high-impact modules involving direct production GitOps auto-remediation, webhook secret rotation, employee prompt DLP, or actuarial insurance underwriting require CISO Executive Super Admin sign-off.`,
        recommendedTab: 'overview',
        recommendedLabel: 'Return to Compliance Dashboard',
      };
    }

    return {
      reason: 'Role-Based Access Control Policy',
      details: 'You do not have sufficient permissions to view this module.',
      recommendedTab: 'overview',
      recommendedLabel: 'Return to Dashboard',
    };
  };

  const info = getRestrictionExplanation();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-200">
      {/* Main Restriction Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Warning Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  Access Restricted (HTTP 403 Forbidden)
                </span>
                <span className="text-xs text-slate-400">RBAC Policy Enforced</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {moduleName} is Locked for {currentUser.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {info.reason} · AICPA & ISO 27001 Principle of Least Privilege
              </p>
            </div>
          </div>

          {/* Current Role Badge */}
          <div className="sm:self-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right">
              <span className="text-[10px] text-slate-300 block uppercase tracking-wider font-semibold">
                Active User Profile
              </span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-blue-300 block">
                {currentUser.title}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Access Policy Explanation</span>
            </h4>
            <p>{info.details}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => handleNavigate(info.recommendedTab)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-2"
            >
              <span>{info.recommendedLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Role Elevation Switcher Button */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Evaluate this module with elevated role:
              </span>
              <button
                onClick={() => setRole('ciso')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 shadow-2xs"
                title="Switch active role to CISO (Executive Super Admin)"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Switch to CISO (Super Admin)</span>
              </button>
            </div>
          </div>

          {/* Matrix of Role Capabilities & Restrictions */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <span>Role-Based Access Control (RBAC) Comparison</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allRoles.map((role) => {
                const isSelected = role.id === currentRole;
                const canAccessThisTab = role.allowedTabs.includes(targetTabId);

                return (
                  <div
                    key={role.id}
                    className={`rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">{role.shortTitle}</span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                          Current
                        </span>
                      ) : (
                        <button
                          onClick={() => setRole(role.id)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Switch →
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 font-medium mb-1">
                      {role.user.title}
                    </div>

                    <p className="text-[10px] text-slate-500 mb-3 leading-snug line-clamp-2">
                      {role.summary}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Access to {moduleName}:</span>
                      {canAccessThisTab ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Allowed</span>
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-rose-600" />
                          <span>Restricted</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

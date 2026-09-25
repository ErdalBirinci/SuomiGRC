import React from 'react';
import { useRBAC } from '../context/RbacContext';
import {
  Eye,
  UserCheck,
} from 'lucide-react';

interface RoleContextBannerProps {
  onOpenMatrix?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const RoleContextBanner: React.FC<RoleContextBannerProps> = ({
  onOpenMatrix,
  onNavigateTab,
}) => {
  const { currentRole, currentUser, setRole } = useRBAC();

  if (currentRole === 'ciso') {
    return null; // CISO has full default admin view, keep UI completely clean
  }

  if (currentRole === 'auditor') {
    return (
      <div className="bg-amber-950/70 border border-amber-800/80 rounded-xl px-4 py-2 text-xs text-amber-200 mb-2">
        <div className="max-w-[1536px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-900/80 text-amber-300 shrink-0 border border-amber-700/50">
              <Eye className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong>External Auditor Mode:</strong> Signed in as{' '}
              <span className="font-semibold text-white">{currentUser.name}</span> ({currentUser.title}). Read-only verification active.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenMatrix && (
              <button
                onClick={onOpenMatrix}
                className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px]"
              >
                RBAC Matrix
              </button>
            )}
            <button
              onClick={() => setRole('ciso')}
              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-[11px] transition-colors shadow-xs"
            >
              Switch to CISO
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentRole === 'compliance_analyst') {
    return (
      <div className="bg-cyan-950/70 border border-cyan-800/80 rounded-xl px-4 py-2 text-xs text-cyan-200 mb-2">
        <div className="max-w-[1536px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-900/80 text-cyan-300 shrink-0 border border-cyan-700/50">
              <UserCheck className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong>Compliance Analyst Mode:</strong> Signed in as{' '}
              <span className="font-semibold text-white">{currentUser.name}</span> ({currentUser.title}). Operational control workflows enabled.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenMatrix && (
              <button
                onClick={onOpenMatrix}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-[11px]"
              >
                RBAC Matrix
              </button>
            )}
            <button
              onClick={() => setRole('ciso')}
              className="px-2.5 py-1 bg-[#0052CC] hover:bg-blue-600 text-white font-bold rounded-lg text-[11px] transition-colors shadow-xs"
            >
              Elevate to CISO
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

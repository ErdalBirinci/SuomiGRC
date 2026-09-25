import React, { useState, useRef, useEffect } from 'react';
import { useRBAC } from '../context/RbacContext';
import { UserRole } from '../types/rbac';
import {
  ShieldCheck,
  UserCheck,
  Eye,
  ChevronDown,
  Check,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface RoleSwitcherProps {
  variant?: 'topbar' | 'compact' | 'pill';
  onOpenRoleMatrix?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  variant = 'topbar',
  onOpenRoleMatrix,
}) => {
  const { currentRole, currentUser, setRole, allRoles } = useRBAC();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ciso':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'compliance_analyst':
        return <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'auditor':
        return <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ciso':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'compliance_analyst':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'auditor':
        return 'bg-amber-950 text-amber-300 border-amber-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all shadow-xs ${
          isOpen
            ? 'bg-slate-800 text-white border-cyan-500/50 ring-1 ring-cyan-400/30'
            : currentRole === 'auditor'
            ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border-amber-800/80'
            : currentRole === 'compliance_analyst'
            ? 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border-cyan-800/80'
            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-cyan-500/40'
        }`}
        title={`Current RBAC Role: ${currentUser.title}. Click to switch role.`}
      >
        <div className="flex items-center gap-1.5">
          {getRoleIcon(currentRole)}
          <span className="font-bold tracking-tight font-sans">
            {currentRole === 'ciso'
              ? 'CISO'
              : currentRole === 'compliance_analyst'
              ? 'Analyst'
              : 'Auditor'}
          </span>
          <span
            className={`hidden xl:inline text-[10px] font-semibold font-mono px-1 py-0.2 rounded border ${
              isOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : getRoleBadgeStyle(currentRole)
            }`}
          >
            {currentRole === 'ciso'
              ? 'Executive'
              : currentRole === 'compliance_analyst'
              ? 'Operations'
              : 'Assurance'}
          </span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {/* Role Selector Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-92 z-50 obsidian-card border border-slate-800 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
          <div className="px-2 py-1.5 border-b border-slate-800 mb-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Switch user persona to test view &amp; action restrictions
              </p>
            </div>
            {onOpenRoleMatrix && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenRoleMatrix();
                }}
                className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-sans"
              >
                <span>Matrix</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {allRoles.map((role) => {
              const isSelected = role.id === currentRole;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setRole(role.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500/50 ring-1 ring-cyan-400/30'
                      : 'hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        role.id === 'ciso'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : role.id === 'compliance_analyst'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {role.user.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">
                          {role.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded border font-semibold ${getRoleBadgeStyle(
                            role.id
                          )}`}
                        >
                          {role.shortTitle}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                        {role.user.name}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                        {role.summary}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Check className="w-3 h-3 font-bold" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 px-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Enforces AICPA &amp; ISO 27001 Access Separation</span>
            <span className="text-slate-400">Tenant: #9841</span>
          </div>
        </div>
      )}
    </div>
  );
};

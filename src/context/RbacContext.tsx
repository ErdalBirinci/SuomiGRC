import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  UserProfile,
  RoleDefinition,
  PermissionAction,
  PRESET_USERS,
  ROLE_DEFINITIONS,
} from '../types/rbac';

interface RbacContextType {
  currentRole: UserRole;
  currentUser: UserProfile;
  roleDefinition: RoleDefinition;
  setRole: (role: UserRole) => void;
  canAccessTab: (tabId: string) => boolean;
  canPerformAction: (action: PermissionAction) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAuditor: boolean;
  isCiso: boolean;
  isComplianceAnalyst: boolean;
  allRoles: RoleDefinition[];
}

const RbacContext = createContext<RbacContextType | undefined>(undefined);

const STORAGE_KEY = 'suomi_grc_rbac_role';

export const RbacProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'ciso' || saved === 'compliance_analyst' || saved === 'auditor')) {
        return saved as UserRole;
      }
    } catch {
      // Fallback
    }
    return 'ciso';
  });

  const currentUser = PRESET_USERS[currentRole];
  const roleDefinition = ROLE_DEFINITIONS[currentRole];

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // Ignore
    }
  };

  const canAccessTab = (tabId: string): boolean => {
    return roleDefinition.allowedTabs.includes(tabId);
  };

  const canPerformAction = (action: PermissionAction): boolean => {
    return !!roleDefinition.actions[action];
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }
    return currentRole === roles;
  };

  const isAuditor = currentRole === 'auditor';
  const isCiso = currentRole === 'ciso';
  const isComplianceAnalyst = currentRole === 'compliance_analyst';

  const allRoles = Object.values(ROLE_DEFINITIONS);

  return (
    <RbacContext.Provider
      value={{
        currentRole,
        currentUser,
        roleDefinition,
        setRole,
        canAccessTab,
        canPerformAction,
        hasRole,
        isAuditor,
        isCiso,
        isComplianceAnalyst,
        allRoles,
      }}
    >
      {children}
    </RbacContext.Provider>
  );
};

export const useRBAC = (): RbacContextType => {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RbacProvider');
  }
  return context;
};

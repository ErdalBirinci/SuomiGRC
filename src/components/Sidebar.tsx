import React, { useState, useMemo } from 'react';
import {
  NAV_CATEGORIES,
  NavItemDef,
  NavCategoryDef,
  getCategoryByItemId,
} from '../data/navigationStructure';
import { useRBAC } from '../context/RbacContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Shield,
  Check,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  SlidersHorizontal,
  X,
  Lock,
  Compass,
  Star,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Activity,
  Zap,
  Radio,
} from 'lucide-react';
import { SuomiGrcLogoMark } from './PlatformLogo';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  failingTestsCount: number;
  nonCompliantDevicesCount: number;
  activeExceptionsCount: number;
  activeWebhooksCount: number;
  pendingActionItemsCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  failingTestsCount,
  nonCompliantDevicesCount,
  activeExceptionsCount,
  activeWebhooksCount,
  pendingActionItemsCount = 0,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Navigation mode: 'focused' (essentials & active) vs 'all' (complete 31 modules)
  const [navMode, setNavMode] = useState<'focused' | 'all'>('focused');

  // In-menu module search filter
  const [filterQuery, setFilterQuery] = useState('');

  // RBAC Context
  const { currentRole, currentUser, canAccessTab } = useRBAC();

  // Theme Context
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Track collapsed categories in 'all' mode. Default: collapse categories that don't have the active tab
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const activeCat = getCategoryByItemId(activeTab);
    NAV_CATEGORIES.forEach((cat) => {
      initial[cat.id] = cat.id !== activeCat?.id && cat.id !== 'core';
    });
    return initial;
  });

  // Tenant switcher popover
  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState('Acme Technologies (Prod)');

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Get dynamic count badge for specific items
  const getItemBadge = (itemId: string) => {
    switch (itemId) {
      case 'action-items':
        return pendingActionItemsCount > 0 ? { count: pendingActionItemsCount, type: 'warning' } : null;
      case 'controls':
        return failingTestsCount > 0 ? { count: failingTestsCount, type: 'danger' } : null;
      case 'fleet':
        return nonCompliantDevicesCount > 0 ? { count: nonCompliantDevicesCount, type: 'warning' } : null;
      case 'exceptions':
        return activeExceptionsCount > 0 ? { count: activeExceptionsCount, type: 'neutral' } : null;
      case 'webhooks':
        return activeWebhooksCount > 0 ? { count: activeWebhooksCount, type: 'success' } : null;
      default:
        return null;
    }
  };

  // Filter items by query and nav mode
  const filteredCategories = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();

    return NAV_CATEGORIES.map((cat) => {
      let items = cat.items;

      // In focused mode: only primary items OR the currently active item
      if (navMode === 'focused' && !q) {
        items = items.filter((item) => item.isPrimary || item.id === activeTab);
      }

      // If search query is typed, search across all items
      if (q) {
        items = items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        );
      }

      return {
        ...cat,
        items,
      };
    }).filter((cat) => cat.items.length > 0);
  }, [filterQuery, navMode, activeTab]);

  // Total visible modules count
  const visibleItemsCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <aside
      className={`relative transition-all duration-200 shrink-0 rounded-2xl shadow-2xl h-[calc(100vh-5.5rem)] sticky top-20 flex flex-col justify-between select-none overflow-hidden ${
        isLight
          ? 'bg-white text-slate-800 border border-slate-200/90 shadow-lg'
          : 'bg-[#0A0F1D] text-slate-200 border border-slate-800/90'
      } ${isCollapsed ? 'w-[68px]' : 'w-64'}`}
      aria-label="suomiGRC Navigation Rail"
    >
      {/* Top Section: Workspace / Tenant Switcher */}
      <div className={`p-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
        {!isCollapsed ? (
          <div className="relative">
            <button
              onClick={() => setIsTenantOpen(!isTenantOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left group ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-blue-400'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800/90 hover:border-cyan-500/30'
              }`}
              title="Switch Workspace Tenant"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                    currentTenant.includes('Sandbox')
                      ? 'bg-amber-600'
                      : 'bg-gradient-to-br from-[#0052CC] to-[#00D2FF] text-slate-950 font-black'
                  }`}
                >
                  {currentTenant.includes('Sandbox') ? 'SB' : 'AC'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-semibold text-xs truncate transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-blue-700' : 'text-white group-hover:text-cyan-300'
                  }`}>
                    {currentTenant.includes('Sandbox') ? 'Acme Sandbox' : 'Acme Technologies'}
                  </div>
                  <div className={`text-[10px] truncate flex items-center gap-1.5 font-mono ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        currentTenant.includes('Sandbox')
                          ? 'bg-amber-500'
                          : 'bg-emerald-500 animate-pulse'
                      }`}
                    />
                    <span>{currentTenant.includes('Sandbox') ? 'Audit Staging' : 'Production (EU)'}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 ml-1 transition-colors" />
            </button>

            {/* Tenant Switcher Dropdown */}
            {isTenantOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsTenantOpen(false)}
                />
                <div className={`absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 duration-150 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-[#0F172A] border-slate-700 text-slate-200'
                }`}>
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Workspaces &amp; Environments
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTenant('Acme Technologies (Prod)');
                      setIsTenantOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left font-medium transition-colors ${
                      isLight ? 'hover:bg-slate-50 text-slate-900' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>Acme Technologies (Prod)</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">LIVE</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">EU-Central · Tenant #9841</div>
                    </div>
                    {currentTenant.includes('Prod') && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTenant('Acme Security Sandbox');
                      setIsTenantOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors ${
                      isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Acme Sandbox &amp; Staging</div>
                      <div className="text-[10px] text-slate-400 font-mono">Staging · Auditor Read-Only</div>
                    </div>
                    {currentTenant.includes('Sandbox') && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </button>
                  <div className={`my-1 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`} />
                  <div className="px-3 py-1.5 text-[11px] text-blue-600 flex items-center gap-1.5 font-mono">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Evidence Vault Locked</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <button
              onClick={() => setIsTenantOpen(!isTenantOpen)}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0052CC] to-[#00D2FF] text-slate-950 flex items-center justify-center font-black text-xs hover:opacity-90 shadow-md"
              title="Acme Technologies • Production"
            >
              AC
            </button>
          </div>
        )}

        {/* Mode Segmented Switcher & Search */}
        {!isCollapsed && (
          <div className="mt-2.5 space-y-2">
            {/* View Mode Toggle: Essentials vs All Modules */}
            <div className={`flex items-center p-0.5 border rounded-lg text-xs ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
            }`}>
              <button
                onClick={() => setNavMode('focused')}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
                  navMode === 'focused'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'bg-slate-800 text-white shadow-xs font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Simplified clean view: core daily essentials only"
              >
                <Star className={`w-3 h-3 ${navMode === 'focused' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                <span>Essentials</span>
              </button>
              <button
                onClick={() => setNavMode('all')}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
                  navMode === 'all'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'bg-slate-800 text-white shadow-xs font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Complete directory: all 31 compliance modules"
              >
                <Layers className={`w-3 h-3 ${navMode === 'all' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>All (31)</span>
              </button>
            </div>

            {/* Quick Filter Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={navMode === 'focused' ? 'Filter essentials...' : 'Filter 31 modules...'}
                className={`w-full pl-8 pr-7 py-1 text-xs border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200 focus:bg-slate-900'
                }`}
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3 dark-scroll">
        {filteredCategories.map((category) => {
          const isCategoryCollapsed = navMode === 'all' && collapsedCategories[category.id] && !filterQuery;

          return (
            <div key={category.id} className="space-y-0.5">
              {/* Category Header */}
              {!isCollapsed ? (
                <div className={`flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider font-mono rounded group ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <span className="truncate">{category.shortTitle}</span>
                  {navMode === 'all' && !filterQuery && (
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                      title={isCategoryCollapsed ? 'Expand category' : 'Collapse category'}
                    >
                      {isCategoryCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className={`h-px my-1.5 mx-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800/80'}`} />
              )}

              {/* Items List */}
              {(!isCategoryCollapsed || isCollapsed) && (
                <div className="space-y-0.5">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const badge = getItemBadge(item.id);
                    const isAllowed = canAccessTab(item.id);

                    if (isCollapsed) {
                      // Collapsed Rail View
                      return (
                        <div key={item.id} className="relative group flex justify-center">
                          <button
                            onClick={() => onSelectTab(item.id)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all relative ${
                              isActive
                                ? 'bg-gradient-to-r from-[#0052CC] to-[#0284C7] text-white shadow-md'
                                : isLight
                                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                            title={item.label}
                          >
                            <Icon className="w-4 h-4" />
                            {badge && (
                              <span
                                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${
                                  isLight ? 'border-white' : 'border-[#0A0F1D]'
                                } ${
                                  badge.type === 'danger'
                                    ? 'bg-rose-500'
                                    : badge.type === 'warning'
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-400'
                                }`}
                              />
                            )}
                          </button>
                        </div>
                      );
                    }

                    // Expanded List View
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group relative ${
                          isActive
                            ? isLight
                              ? 'bg-blue-50 text-blue-700 border-l-2 border-[#0052CC] font-bold shadow-xs'
                              : 'bg-gradient-to-r from-[#0052CC]/25 to-cyan-950/30 text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                            : !isAllowed
                            ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 opacity-60'
                            : isLight
                            ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? isLight
                                  ? 'text-blue-700'
                                  : 'text-cyan-400'
                                : !isAllowed
                                ? 'text-slate-400'
                                : isLight
                                ? 'text-slate-500 group-hover:text-slate-800'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {!isAllowed && (
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-mono font-semibold flex items-center gap-0.5 border ${
                                isLight
                                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                                  : 'bg-slate-900 text-slate-500 border-slate-800'
                              }`}
                              title="Restricted for active role"
                            >
                              <Lock className="w-2.5 h-2.5" />
                            </span>
                          )}

                          {badge && (
                            <span
                              className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                                isActive
                                  ? isLight
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-cyan-500 text-slate-950'
                                  : badge.type === 'danger'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : badge.type === 'warning'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {badge.count}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty Search Result */}
        {filteredCategories.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400 font-mono">
            No modules match &quot;{filterQuery}&quot;
          </div>
        )}

        {/* Switch to Full Directory Button (in focused mode) */}
        {!isCollapsed && navMode === 'focused' && (
          <div className="pt-2 px-1">
            <button
              onClick={() => setNavMode('all')}
              className={`w-full py-1.5 px-2.5 rounded-lg border border-dashed text-[11px] flex items-center justify-between transition-colors font-medium ${
                isLight
                  ? 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-700'
                  : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-cyan-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Show all 31 modules</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">+{31 - visibleItemsCount}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Section: Continuous Radar Telemetry Pod & Persona indicator */}
      <div className={`p-2.5 border-t space-y-2 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070B14] border-slate-800/90'
      }`}>
        {!isCollapsed ? (
          <>
            {/* Continuous Radar Widget */}
            <div className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-radar-dot" />
                </div>
                <div className="min-w-0">
                  <div className={`font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <span>Continuous Radar</span>
                  </div>
                  <div className="font-mono text-[11px] text-emerald-600 font-semibold truncate">
                    100% Sweep Nominal
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold">
                LIVE
              </span>
            </div>

            {/* Active User Summary Row */}
            <div className="px-1.5 py-1 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] text-white shrink-0 ${
                    currentRole === 'ciso'
                      ? 'bg-purple-600'
                      : currentRole === 'compliance_analyst'
                      ? 'bg-blue-600'
                      : 'bg-amber-600'
                  }`}
                >
                  {currentUser.avatarInitials}
                </div>
                <span className={`font-medium truncate text-[11px] ${
                  isLight ? 'text-slate-800' : 'text-slate-300'
                }`}>
                  {currentUser.name}
                </span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold shrink-0 ${
                  currentRole === 'ciso'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : currentRole === 'compliance_analyst'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {currentRole === 'ciso' ? 'CISO' : currentRole === 'compliance_analyst' ? 'Analyst' : 'Auditor'}
              </span>
            </div>

            {/* Collapse Sidebar Button */}
            <button
              onClick={onToggleCollapse}
              className={`w-full flex items-center justify-center gap-1.5 py-1 px-2 text-xs font-medium rounded-lg transition-colors ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Collapse sidebar"
            >
              <ChevronsLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Collapse Sidebar</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative w-4 h-4 flex items-center justify-center" title="Continuous Radar: 100% Nominal">
              <span className="w-2 h-2 rounded-full bg-emerald-500 live-radar-dot" />
            </div>
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[9px] text-white ${
                currentRole === 'ciso'
                  ? 'bg-purple-600'
                  : currentRole === 'compliance_analyst'
                  ? 'bg-blue-600'
                  : 'bg-amber-600'
              }`}
              title={`Role: ${currentUser.title}`}
            >
              {currentUser.avatarInitials}
            </div>
            <button
              onClick={onToggleCollapse}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Expand sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

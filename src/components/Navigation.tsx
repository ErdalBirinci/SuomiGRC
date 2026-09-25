import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FrameworkId,
  Control,
  RiskItem,
  Vendor,
  Policy,
  AutomatedTest,
} from '../types/grc';
import {
  NAV_CATEGORIES,
  ALL_NAV_ITEMS,
  getNavItemById,
  getCategoryByItemId,
  NavCategoryId,
} from '../data/navigationStructure';
import { useRBAC } from '../context/RbacContext';
import { useTheme } from '../context/ThemeContext';
import { RoleSwitcher } from './RoleSwitcher';
import { RoleMatrixModal } from './RoleMatrixModal';
import { ThemeToggle } from './ThemeToggle';
import {
  LayoutDashboard,
  Server,
  ShieldCheck,
  Layers,
  AlertTriangle,
  Building2,
  FileText,
  Users,
  FileCheck2,
  Globe2,
  ChevronDown,
  Bell,
  Sparkles,
  Laptop,
  GraduationCap,
  History,
  FileWarning,
  UserCheck,
  Code2,
  Brain,
  GitCompare,
  KeyRound,
  ShieldAlert,
  Bot,
  LayoutGrid,
  Search,
  CheckCircle2,
  Shield,
  Download,
  Menu,
  X,
  Lock,
  PanelLeftClose,
  PanelLeft,
  Check,
  ExternalLink,
  Eye,
  Activity,
  Zap,
} from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';
import { SuomiGrcLogoMark } from './PlatformLogo';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  selectedFramework: FrameworkId | 'all';
  onSelectFramework: (fw: FrameworkId | 'all') => void;
  failingTestsCount: number;
  activeWebhooksCount?: number;
  controls: Control[];
  risks: RiskItem[];
  vendors: Vendor[];
  policies: Policy[];
  tests?: AutomatedTest[];
  onNavigateToEntity: (
    tab: 'controls' | 'risks' | 'vendors' | 'policies',
    searchQuery: string,
    options?: { subTab?: 'tests' | 'controls'; entityId?: string; testItem?: AutomatedTest }
  ) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const FRAMEWORK_OPTIONS: {
  id: FrameworkId | 'all';
  label: string;
  shortLabel: string;
  badge: string;
  desc: string;
}[] = [
  {
    id: 'all',
    label: 'Unified Frameworks',
    shortLabel: 'Unified Scope',
    badge: 'All 8',
    desc: 'Unified cross-mapped compliance controls',
  },
  {
    id: 'soc2',
    label: 'SOC 2 Type II',
    shortLabel: 'SOC 2',
    badge: 'AICPA',
    desc: 'Security, Availability, Confidentiality trust criteria',
  },
  {
    id: 'iso27001',
    label: 'ISO/IEC 27001:2022',
    shortLabel: 'ISO 27001',
    badge: 'Annex A',
    desc: 'Information Security Management System',
  },
  {
    id: 'hipaa',
    label: 'HIPAA Security',
    shortLabel: 'HIPAA',
    badge: 'ePHI',
    desc: 'Health Insurance Portability & Accountability',
  },
  {
    id: 'gdpr',
    label: 'EU GDPR Privacy',
    shortLabel: 'GDPR',
    badge: 'EU 2016',
    desc: 'General Data Protection Regulation',
  },
  {
    id: 'pci_dss',
    label: 'PCI DSS v4.0',
    shortLabel: 'PCI DSS',
    badge: 'Cardholder',
    desc: 'Payment Card Industry Data Security Standard',
  },
  {
    id: 'nist_csf',
    label: 'NIST CSF 2.0',
    shortLabel: 'NIST CSF',
    badge: 'Federal',
    desc: 'Cybersecurity Framework (Govern, Identify, Protect)',
  },
  {
    id: 'dora',
    label: 'EU DORA (Digital Resilience)',
    shortLabel: 'EU DORA',
    badge: 'Fintech',
    desc: 'Digital Operational Resilience Act for Financial Services',
  },
  {
    id: 'nis2',
    label: 'EU NIS2 Directive',
    shortLabel: 'EU NIS2',
    badge: 'Critical Infra',
    desc: 'Network and Information Systems Directive',
  },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  selectedFramework,
  onSelectFramework,
  failingTestsCount,
  activeWebhooksCount = 2,
  controls,
  risks,
  vendors,
  policies,
  tests = [],
  onNavigateToEntity,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  // Popover state management
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [megaMenuFilter, setMegaMenuFilter] = useState('');
  const [isFrameworkDropdownOpen, setIsFrameworkDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAuditPackModalOpen, setIsAuditPackModalOpen] = useState(false);
  const [isExportingPack, setIsExportingPack] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // RBAC Context integration & Theme Context
  const { currentRole, currentUser, canAccessTab, allRoles, setRole } = useRBAC();
  const { theme } = useTheme();
  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);

  // Popover container refs for clean outside-click handling
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const frameworkRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Active module context calculation
  const currentItem = getNavItemById(activeTab);
  const currentCategory = getCategoryByItemId(activeTab);
  const ActiveIcon = currentItem?.icon || LayoutDashboard;

  const currentFrameworkDef = useMemo(() => {
    return (
      FRAMEWORK_OPTIONS.find((fw) => fw.id === selectedFramework) ||
      FRAMEWORK_OPTIONS[0]
    );
  }, [selectedFramework]);

  // Notification items simulation (grounded in actual system state)
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Automated Control Drift Detected',
      time: '12m ago',
      type: 'warning',
      desc: `${
        failingTestsCount > 0 ? failingTestsCount : 1
      } test(s) failed continuous evidence check: RDS Multi-AZ verification.`,
      targetTab: 'controls',
    },
    {
      id: 'n2',
      title: 'Terraform Remediation PR Prepared',
      time: '34m ago',
      type: 'info',
      desc: 'GitOps PR #142 generated for AWS S3 Default SSE-KMS encryption enforcement.',
      targetTab: 'remediation-code',
    },
    {
      id: 'n3',
      title: 'Real-time Webhook Dispatched',
      time: '1h ago',
      type: 'success',
      desc: 'Compliance telemetry successfully pushed to #security-alerts Slack channel.',
      targetTab: 'webhooks',
    },
  ]);

  // Clean outside-click detection without breaking page interaction
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (megaMenuRef.current && !megaMenuRef.current.contains(target)) {
        setIsMegaMenuOpen(false);
      }
      if (frameworkRef.current && !frameworkRef.current.contains(target)) {
        setIsFrameworkDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsFrameworkDropdownOpen(false);
        setIsNotificationsOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileDrawerOpen(false);
        setIsAuditPackModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleExportAuditPack = () => {
    setIsExportingPack(true);
    setTimeout(() => {
      setIsExportingPack(false);
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        setIsAuditPackModalOpen(false);
      }, 2000);
    }, 1200);
  };

  const [mobileNavMode, setMobileNavMode] = useState<'focused' | 'all'>('focused');
  const [mobileQuery, setMobileQuery] = useState('');
  const [megaMenuCategory, setMegaMenuCategory] = useState<NavCategoryId | 'all'>('all');

  const filteredMobileCategories = useMemo(() => {
    const q = mobileQuery.trim().toLowerCase();
    return NAV_CATEGORIES.map((cat) => {
      let items = cat.items;
      if (mobileNavMode === 'focused' && !q) {
        items = items.filter((item) => item.isPrimary || item.id === activeTab);
      }
      if (q) {
        items = items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        );
      }
      return { ...cat, items };
    }).filter((cat) => cat.items.length > 0);
  }, [mobileNavMode, mobileQuery, activeTab]);

  // Filter categories for the Mega Menu
  const filteredMegaCategories = useMemo(() => {
    let cats = NAV_CATEGORIES;
    if (megaMenuCategory !== 'all') {
      cats = cats.filter((c) => c.id === megaMenuCategory);
    }
    if (!megaMenuFilter.trim()) return cats;
    const q = megaMenuFilter.toLowerCase();
    return cats.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [megaMenuFilter, megaMenuCategory]);

  return (
    <>
      {/* Top Bar Header with Obsidian Tactical & High Contrast Light Theme Support */}
      <header
        className={`sticky top-0 z-40 transition-colors duration-200 backdrop-blur-md border-b ${
          theme === 'light'
            ? 'bg-white/95 text-slate-900 border-slate-200 shadow-xs'
            : 'bg-[#0A0F1D]/95 text-slate-100 border-slate-800/90'
        }`}
      >
        <div className="max-w-[1536px] mx-auto px-3 sm:px-5 lg:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* ZONE 1: Navigation Toggle, Brand Wordmark & Active Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Desktop Sidebar Collapse Toggle */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
                title={isSidebarCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
                aria-label="Toggle Sidebar Navigation"
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Mark & Title */}
            <button
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0 group"
              title="Return to suomiGRC Obsidian Dashboard"
            >
              <SuomiGrcLogoMark size="sm" />
              <div className="flex items-center gap-1.5 hidden xs:flex">
                <span className="font-bold text-base tracking-tight text-white font-sans">
                  suomi
                </span>
                <span className="bg-gradient-to-r from-[#0052CC] to-[#00D2FF] text-slate-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded tracking-wider shadow-md">
                  GRC
                </span>
              </div>
            </button>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-slate-800 hidden md:block" />

            {/* Contextual Breadcrumb Path */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-mono">
              <span className="text-slate-400 font-medium truncate max-w-[110px] xl:max-w-none">
                {currentCategory ? currentCategory.shortTitle : 'Governance'}
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-300 font-semibold truncate max-w-[140px] xl:max-w-[200px] flex items-center gap-1.5">
                <ActiveIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{currentItem ? currentItem.shortLabel || currentItem.label : 'Overview'}</span>
              </span>
            </div>
          </div>

          {/* ZONE 2: Global Search & Modules Mega Launcher */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Global Search Command Palette */}
            <GlobalSearchBar
              controls={controls}
              risks={risks}
              vendors={vendors}
              policies={policies}
              tests={tests}
              onNavigateToEntity={onNavigateToEntity}
              triggerClassName="w-8 h-8 sm:w-36 md:w-48 lg:w-56 xl:w-64 px-0 sm:px-3 justify-center sm:justify-start bg-slate-900/80 border-slate-800 text-slate-300 hover:border-cyan-500/40"
              placeholder="Search controls, risks... (⌘K)"
            />

            {/* All Modules Mega Launcher Button & Safe Popover */}
            <div className="relative" ref={megaMenuRef}>
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`h-8 flex items-center gap-1.5 px-2.5 text-xs font-semibold rounded-lg transition-colors border shadow-xs ${
                  isMegaMenuOpen
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-cyan-500/40'
                }`}
                title="Launch all GRC modules"
              >
                <LayoutGrid
                  className={`w-3.5 h-3.5 ${
                    isMegaMenuOpen ? 'text-cyan-400' : 'text-cyan-400'
                  }`}
                />
                <span className="hidden sm:inline">Modules</span>
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
                    isMegaMenuOpen
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-slate-800 text-cyan-300 border border-slate-700'
                  }`}
                >
                  {ALL_NAV_ITEMS.length}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isMegaMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Mega Launcher Popover Window */}
              {isMegaMenuOpen && (
                <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-[760px] max-w-[calc(100vw-24px)] max-h-[85vh] overflow-y-auto z-50 obsidian-card p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-800/90 text-slate-100 shadow-2xl">
                  {/* Mega Menu Header & In-Menu Filter */}
                  <div className="pb-3 border-b border-slate-800 mb-3 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <SuomiGrcLogoMark size="sm" />
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>suomiGRC Module Directory</span>
                            <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800 font-semibold">
                              {ALL_NAV_ITEMS.length} Modules
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Search and navigate continuous security controls, governance, and audit portals
                          </p>
                        </div>
                      </div>

                      <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={megaMenuFilter}
                          onChange={(e) => setMegaMenuFilter(e.target.value)}
                          placeholder="Filter modules by name... (⌘K)"
                          className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          autoFocus
                        />
                        {megaMenuFilter && (
                          <button
                            onClick={() => setMegaMenuFilter('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
                      <button
                        onClick={() => setMegaMenuCategory('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                          megaMenuCategory === 'all'
                            ? 'bg-gradient-to-r from-[#0052CC] to-[#00D2FF] text-slate-950 font-bold shadow-xs'
                            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                        }`}
                      >
                        All Categories ({ALL_NAV_ITEMS.length})
                      </button>
                      {NAV_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setMegaMenuCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                            megaMenuCategory === cat.id
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-xs'
                              : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                          }`}
                        >
                          <span>{cat.shortTitle}</span>
                          <span
                            className={`text-[9px] font-mono px-1 rounded ${
                              megaMenuCategory === cat.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
                            }`}
                          >
                            {cat.items.length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categorized Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMegaCategories.map((cat) => (
                      <div key={cat.id} className="space-y-1.5">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 font-mono">
                          {cat.shortTitle}
                        </h4>
                        <div className="space-y-1">
                          {cat.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isCurrent = activeTab === item.id;
                            const isAllowed = canAccessTab(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  onSelectTab(item.id);
                                  setIsMegaMenuOpen(false);
                                }}
                                className={`w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all group ${
                                  isCurrent
                                    ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 shadow-sm font-medium'
                                    : !isAllowed
                                    ? 'hover:bg-slate-900/50 text-slate-500 opacity-60 border border-transparent'
                                    : 'hover:bg-slate-900/80 text-slate-300 hover:text-white border border-transparent hover:border-slate-800'
                                }`}
                              >
                                <ItemIcon
                                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                                    isCurrent
                                      ? 'text-cyan-400'
                                      : !isAllowed
                                      ? 'text-slate-600'
                                      : 'text-slate-400 group-hover:text-cyan-400'
                                  }`}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold flex items-center justify-between gap-1">
                                    <span className="truncate">{item.label}</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {!isAllowed && (
                                        <span
                                          className="text-[9px] font-mono px-1 py-0.2 rounded font-semibold flex items-center gap-0.5 bg-amber-950/70 text-amber-400 border border-amber-800"
                                          title={`Restricted for current role: ${currentUser.title}`}
                                        >
                                          <Lock className="w-2.5 h-2.5" />
                                          <span>Locked</span>
                                        </span>
                                      )}
                                      {item.isNew && (
                                        <span
                                          className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold shrink-0 ${
                                            isCurrent
                                              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                                              : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                          }`}
                                        >
                                          3.0
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p
                                    className={`text-[10px] line-clamp-1 ${
                                      isCurrent
                                        ? 'text-cyan-200/80'
                                        : !isAllowed
                                        ? 'text-slate-600'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {item.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mega Menu Footer Shortcuts */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="text-[11px]">
                      SHA-256 Continuous Proof Synced
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          onSelectTab('auditor');
                          setIsMegaMenuOpen(false);
                        }}
                        className="font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-sans"
                      >
                        <span>Auditor Portal</span>
                        <span>→</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectTab('trust-center');
                          setIsMegaMenuOpen(false);
                        }}
                        className="font-semibold text-slate-300 hover:text-white flex items-center gap-1 font-sans"
                      >
                        <span>Trust Center</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ZONE 3: Role Switcher, Framework Scope Pill, Evidence Export, Alerts & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Enterprise RBAC Role Switcher */}
            <RoleSwitcher onOpenRoleMatrix={() => setIsRoleMatrixOpen(true)} />

            {/* Custom Compliance Framework Dropdown Selector */}
            <div className="relative" ref={frameworkRef}>
              <button
                onClick={() => setIsFrameworkDropdownOpen(!isFrameworkDropdownOpen)}
                className="h-8 flex items-center gap-1.5 px-2.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-lg shadow-xs transition-colors"
                title="Filter compliance scope by framework"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold max-w-[80px] sm:max-w-none truncate font-sans">
                  {currentFrameworkDef.shortLabel}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                    isFrameworkDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {isFrameworkDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 z-50 obsidian-card border border-slate-800 shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 duration-150 text-slate-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 font-mono">
                    Compliance Scope
                  </div>
                  <div className="py-1">
                    {FRAMEWORK_OPTIONS.map((fw) => {
                      const isSelected = selectedFramework === fw.id;
                      return (
                        <button
                          key={fw.id}
                          onClick={() => {
                            onSelectFramework(fw.id);
                            setIsFrameworkDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-start justify-between hover:bg-slate-900/90 transition-colors ${
                            isSelected
                              ? 'bg-cyan-950/70 text-cyan-300 font-semibold'
                              : 'text-slate-300'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-xs text-white">
                                {fw.label}
                              </span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                {fw.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {fw.desc}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action: Export Audit Package */}
            <button
              onClick={() => setIsAuditPackModalOpen(true)}
              className="h-8 hidden sm:flex items-center gap-1.5 px-2.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-lg transition-colors shadow-xs shrink-0"
              title="Export complete evidence package for CPA auditor review"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Export</span>
              <span>Pack</span>
            </button>

            {/* Accessibility Theme Switcher: Obsidian Dark vs Light High-Contrast Auditor Mode */}
            <ThemeToggle className="hidden xs:inline-flex shrink-0" />

            {/* Webhook Notifications Trigger & Popover */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`h-8 w-8 relative flex items-center justify-center rounded-lg border transition-colors ${
                  isNotificationsOpen
                    ? 'bg-slate-800 text-white border-cyan-500/50'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xs'
                }`}
                title="Continuous alerts & webhooks"
              >
                <Bell className="w-3.5 h-3.5 text-cyan-400" />
                {failingTestsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 max-w-[calc(100vw-1.5rem)] z-50 obsidian-card border border-slate-800 shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
                  <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-white">
                        Security Telemetry Alerts
                      </span>
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-400 live-radar-dot"
                        title="Live stream active"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setNotifications([]);
                        setIsNotificationsOpen(false);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-200"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            onSelectTab(notif.targetTab);
                            setIsNotificationsOpen(false);
                          }}
                          className="w-full text-left p-3 hover:bg-slate-900/80 transition-colors block"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                            {notif.desc}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        All systems normal. No active alerts.
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-800 bg-slate-950/50">
                    <button
                      onClick={() => {
                        onSelectTab('webhooks');
                        setIsNotificationsOpen(false);
                      }}
                      className="w-full py-1 text-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-sans"
                    >
                      Configure Webhooks & Alerts →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Corporate User Account Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-8 flex items-center gap-1.5 p-1 pl-1.5 sm:pr-2 rounded-lg hover:bg-slate-800/80 transition-colors"
                title={`Signed in as ${currentUser.name} (${currentUser.title})`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ring-1 ${
                    currentRole === 'ciso'
                      ? 'bg-purple-900 text-purple-200 ring-purple-500/40'
                      : currentRole === 'compliance_analyst'
                      ? 'bg-cyan-900 text-cyan-200 ring-cyan-500/40'
                      : 'bg-amber-900 text-amber-200 ring-amber-500/40'
                  }`}
                >
                  {currentUser.avatarInitials}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-white leading-none">
                    {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1]?.[0]}.
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none mt-0.5 font-mono">
                    {currentRole === 'ciso'
                      ? 'CISO'
                      : currentRole === 'compliance_analyst'
                      ? 'Analyst'
                      : 'Auditor'}
                  </div>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 hidden sm:block transition-transform duration-150 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] z-50 obsidian-card border border-slate-800 shadow-2xl py-2 text-xs animate-in fade-in zoom-in-95 duration-150 text-slate-100">
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <div className="font-semibold text-white">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {currentUser.email}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                          currentRole === 'ciso'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : currentRole === 'compliance_analyst'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {currentUser.badgeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Quick Role Persona Switcher inside user menu */}
                  <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between font-mono">
                      <span>Switch Active Persona</span>
                      <button
                        onClick={() => {
                          setIsRoleMatrixOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="text-cyan-400 hover:underline normal-case font-medium text-[10px]"
                      >
                        View Matrix
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {allRoles.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setRole(r.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`py-1 px-1 rounded text-[11px] font-medium text-center border transition-all ${
                            r.id === currentRole
                              ? 'bg-cyan-950 text-cyan-300 font-bold border-cyan-500/50 shadow-xs'
                              : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border-slate-800'
                          }`}
                        >
                          {r.shortTitle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Theme Preference */}
                  <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Theme Mode</span>
                    <ThemeToggle showLabel />
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onSelectTab('auditor');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left text-slate-200 hover:bg-slate-900/90 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>Auditor Workspace Mode</span>
                      </div>
                      {currentRole === 'auditor' && (
                        <span className="text-[9px] bg-amber-950 text-amber-300 px-1 rounded font-bold border border-amber-800">
                          Active
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('trust-center');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-left text-slate-200 hover:bg-slate-900/90 flex items-center gap-2"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Public Trust Center</span>
                    </button>

                    {canAccessTab('webhooks') ? (
                      <button
                        onClick={() => {
                          onSelectTab('webhooks');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-1.5 text-left text-slate-200 hover:bg-slate-900/90 flex items-center gap-2"
                      >
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        <span>Alerts & SIEM Integration</span>
                      </button>
                    ) : (
                      <div className="px-3.5 py-1.5 text-slate-500 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-2">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>SIEM Integration</span>
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">CISO Only</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-2 mt-1 px-3.5 py-1 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>Tenant #9841</span>
                    <span className="text-emerald-400 font-medium">SOC 2 Synced</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Responsive Clean Obsidian Tactical Menu) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="relative w-80 max-w-full bg-[#0A0F1D] text-slate-100 border-r border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <SuomiGrcLogoMark size="sm" />
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-bold text-white text-sm font-sans">suomi</span>
                    <span className="bg-gradient-to-r from-[#0052CC] to-[#00D2FF] text-slate-950 font-mono font-black text-[10px] px-1 py-0.2 rounded">GRC</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Continuous Compliance</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Scope & Search in Drawer */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/50 space-y-2.5">
              {/* Drawer Mode Segmented Control */}
              <div className="flex items-center p-0.5 bg-slate-900 rounded-lg text-xs border border-slate-800">
                <button
                  onClick={() => setMobileNavMode('focused')}
                  className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
                    mobileNavMode === 'focused'
                      ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Essentials
                </button>
                <button
                  onClick={() => setMobileNavMode('all')}
                  className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
                    mobileNavMode === 'all'
                      ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({ALL_NAV_ITEMS.length})
                </button>
              </div>

              {/* Drawer Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={mobileQuery}
                  onChange={(e) => setMobileQuery(e.target.value)}
                  placeholder="Filter modules..."
                  className="w-full pl-8 pr-7 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                {mobileQuery && (
                  <button
                    onClick={() => setMobileQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                  Active Persona (RBAC)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {allRoles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`py-1 px-1 rounded text-[11px] font-medium text-center border transition-all ${
                        r.id === currentRole
                          ? 'bg-cyan-950 text-cyan-300 font-bold border-cyan-500/50 shadow-xs'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      {r.shortTitle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="drawer-framework-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                  Framework Scope
                </label>
                <select
                  id="drawer-framework-select"
                  value={selectedFramework}
                  onChange={(e) => onSelectFramework(e.target.value as any)}
                  className="w-full text-xs bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-slate-200 font-medium"
                >
                  {FRAMEWORK_OPTIONS.map((fw) => (
                    <option key={fw.id} value={fw.id}>
                      {fw.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                  Display Mode & Contrast
                </label>
                <ThemeToggle className="w-full" showLabel />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {filteredMobileCategories.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 font-mono">
                    {cat.shortTitle}
                  </h4>
                  <div className="space-y-0.5">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const isAllowed = canAccessTab(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectTab(item.id);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-500/40'
                              : !isAllowed
                              ? 'text-slate-600 hover:bg-slate-900/50'
                              : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive
                                  ? 'text-cyan-400'
                                  : !isAllowed
                                  ? 'text-slate-600'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!isAllowed && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredMobileCategories.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  No modules match &quot;{mobileQuery}&quot;
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Acme Corp</div>
                <div className="text-[11px] text-slate-400 font-mono">Alexander L. • CISO</div>
              </div>
              <button
                onClick={() => {
                  setIsAuditPackModalOpen(true);
                  setIsMobileDrawerOpen(false);
                }}
                className="p-1.5 text-cyan-400 hover:bg-slate-800 rounded-md"
                title="Export Evidence Pack"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Audit Package Modal */}
      {isAuditPackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="obsidian-card max-w-lg w-full border border-slate-800 shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-display">
                    Export CPA Auditor Evidence Package
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Cryptographically signed ZIP package of continuous evidence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditPackModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Selected Scope</span>
                  <span className="text-cyan-400">
                    {currentFrameworkDef.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Technical Controls Included</span>
                  <span className="text-slate-200">{controls.length} Controls</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Automated Evidence Tests</span>
                  <span className="text-slate-200">{tests.length} Verified Tests</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Format</span>
                  <span className="text-slate-200">AuditArchive (JSON + PDF + CSV)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>SHA-256 integrity hash is embedded in the digital audit manifest.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAuditPackModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                disabled={isExportingPack}
              >
                Cancel
              </button>
              <button
                onClick={handleExportAuditPack}
                disabled={isExportingPack || exportComplete}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#0052CC] to-[#00D2FF] hover:brightness-110 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/50 disabled:opacity-75"
              >
                {isExportingPack ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Bundling Evidence...</span>
                  </>
                ) : exportComplete ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Evidence Package Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-950" />
                    <span>Download Audit ZIP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role-Based Access Control (RBAC) Permissions Matrix Modal */}
      <RoleMatrixModal
        isOpen={isRoleMatrixOpen}
        onClose={() => setIsRoleMatrixOpen(false)}
      />
    </>
  );
};

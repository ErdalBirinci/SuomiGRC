import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Control,
  RiskItem,
  Vendor,
  Policy,
  AutomatedTest,
} from '../types/grc';
import {
  Search,
  X,
  Command,
  CornerDownLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Building2,
  FileText,
  Zap,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  Layers,
  History,
  TrendingUp,
} from 'lucide-react';
import { PlatformLogo } from './PlatformLogo';
import {
  searchEntitiesFuzzy,
  SearchableEntity,
  ScoredSearchResult,
} from '../utils/fuzzySearch';

export type SearchCategory = 'all' | 'controls' | 'risks' | 'vendors' | 'policies' | 'tests';

interface GlobalSearchBarProps {
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
  isOpenControlled?: boolean;
  onOpenControlledChange?: (open: boolean) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  controls,
  risks,
  vendors,
  policies,
  tests = [],
  onNavigateToEntity,
  isOpenControlled,
  onOpenControlledChange,
  triggerClassName,
  placeholder,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof isOpenControlled === 'boolean';
  const isOpen = isControlled ? isOpenControlled : internalIsOpen;

  const setIsOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isOpen) : val;
    if (isControlled) {
      onOpenControlledChange?.(nextVal);
    } else {
      setInternalIsOpen(nextVal);
    }
  };

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'CC6.1',
    'MFA',
    'AWS Encryption',
    'Vendor Risk',
    'SOC 2',
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const isMac = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || '');
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // "/" key when not focused on an input/textarea
      if (
        e.key === '/' &&
        !isOpen &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Escape key to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Transform entities into searchable uniform items
  const allSearchableEntities: SearchableEntity[] = useMemo(() => {
    const items: SearchableEntity[] = [];

    // 1. Controls
    controls.forEach((c) => {
      const frameworkCodes = c.frameworkMappings.map((m) => m.requirementCode).join(' ');
      items.push({
        id: `ctrl-${c.id}`,
        category: 'control',
        title: c.name,
        codeOrSubtitle: `${c.code} · ${c.domain}`,
        description: c.description,
        statusBadge:
          c.status === 'automated_passing'
            ? 'Automated Passing'
            : c.status === 'automated_failing'
            ? 'Action Required'
            : 'In Progress',
        statusColor:
          c.status === 'automated_passing'
            ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
            : c.status === 'automated_failing'
            ? 'text-rose-400 bg-rose-950/80 border-rose-800'
            : 'text-amber-400 bg-amber-950/80 border-amber-800',
        secondaryMeta: `Owner: ${c.owner} · Mappings: ${frameworkCodes}`,
        tags: [c.code, c.domain, c.owner, ...c.frameworkMappings.map((m) => m.requirementCode)],
        originalItem: c,
      });
    });

    // 2. Risks
    risks.forEach((r) => {
      const isHighRisk = r.residualImpact * r.residualLikelihood >= 12;
      items.push({
        id: `risk-${r.id}`,
        category: 'risk',
        title: r.title,
        codeOrSubtitle: `${r.id} · ${r.category}`,
        description: r.treatmentDetails,
        statusBadge: `${r.treatment} (Score: ${r.residualLikelihood * r.residualImpact})`,
        statusColor: isHighRisk
          ? 'text-rose-400 bg-rose-950/80 border-rose-800'
          : 'text-amber-400 bg-amber-950/80 border-amber-800',
        secondaryMeta: `Owner: ${r.owner} · Status: ${r.status}`,
        tags: [r.id, r.category, r.owner, r.treatment, r.status],
        originalItem: r,
      });
    });

    // 3. Vendors
    vendors.forEach((v) => {
      items.push({
        id: `vend-${v.id}`,
        category: 'vendor',
        title: v.name,
        codeOrSubtitle: `Tier ${v.tier} · ${v.category}`,
        description: `Access: ${v.dataAccess} · SOC 2: ${v.soc2ReportStatus}`,
        statusBadge: `Score: ${v.questionnaireScore}/100`,
        statusColor:
          v.riskRating === 'Low'
            ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
            : v.riskRating === 'Medium'
            ? 'text-amber-400 bg-amber-950/80 border-amber-800'
            : 'text-rose-400 bg-rose-950/80 border-rose-800',
        secondaryMeta: `Owner: ${v.owner} · Review: ${v.nextReviewDate}`,
        tags: [v.name, v.category, `Tier ${v.tier}`, v.owner, v.riskRating],
        originalItem: v,
      });
    });

    // 4. Policies
    policies.forEach((p) => {
      items.push({
        id: `pol-${p.id}`,
        category: 'policy',
        title: p.title,
        codeOrSubtitle: `${p.code} · v${p.version}`,
        description: `Employees signed: ${p.employeeAcksCount}/${p.totalEmployeesCount} · ${p.content.substring(0, 110)}...`,
        statusBadge: p.status,
        statusColor:
          p.status === 'Published'
            ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
            : 'text-amber-400 bg-amber-950/80 border-amber-800',
        secondaryMeta: `Owner: ${p.owner} · Due: ${p.nextReviewDue}`,
        tags: [p.code, p.title, p.owner, p.status],
        originalItem: p,
      });
    });

    // 5. Automated Tests
    tests.forEach((t) => {
      items.push({
        id: `test-${t.id}`,
        category: 'test',
        title: t.title,
        codeOrSubtitle: `${t.id} · ${t.integrationName}`,
        description: t.description,
        statusBadge: t.status === 'passing' ? 'Passing' : `Failing (${t.severity})`,
        statusColor:
          t.status === 'passing'
            ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
            : 'text-rose-400 bg-rose-950/80 border-rose-800',
        secondaryMeta: `Mapped: ${t.satisfiedControls.join(', ')} · ${t.frequency}`,
        tags: [t.id, t.integrationName, t.title, ...t.satisfiedControls],
        originalItem: t,
      });
    });

    return items;
  }, [controls, risks, vendors, policies, tests]);

  // Execute fuzzy search across all entities with category filtering
  const scoredResults: ScoredSearchResult[] = useMemo(() => {
    const catMap: Record<SearchCategory, string> = {
      all: 'all',
      controls: 'control',
      risks: 'risk',
      vendors: 'vendor',
      policies: 'policy',
      tests: 'test',
    };

    return searchEntitiesFuzzy(
      query,
      allSearchableEntities,
      catMap[selectedCategory]
    ).slice(0, 30);
  }, [query, allSearchableEntities, selectedCategory]);

  // Category counts based on query
  const categoryCounts = useMemo(() => {
    const allResults = searchEntitiesFuzzy(query, allSearchableEntities, 'all');
    const counts = {
      all: allResults.length,
      controls: 0,
      risks: 0,
      vendors: 0,
      policies: 0,
      tests: 0,
    };

    allResults.forEach((r) => {
      if (r.entity.category === 'control') counts.controls++;
      else if (r.entity.category === 'risk') counts.risks++;
      else if (r.entity.category === 'vendor') counts.vendors++;
      else if (r.entity.category === 'policy') counts.policies++;
      else if (r.entity.category === 'test') counts.tests++;
    });

    return counts;
  }, [query, allSearchableEntities]);

  // Reset selection index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Key navigation within results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < scoredResults.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : scoredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = scoredResults[selectedIndex];
      if (current) {
        handleSelectItem(current.entity);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const categories: SearchCategory[] = ['all', 'controls', 'risks', 'vendors', 'policies', 'tests'];
      const curIdx = categories.indexOf(selectedCategory);
      const nextIdx = e.shiftKey
        ? (curIdx - 1 + categories.length) % categories.length
        : (curIdx + 1) % categories.length;
      setSelectedCategory(categories[nextIdx]);
    }
  };

  const handleSelectItem = (entity: SearchableEntity) => {
    // Record into recent searches
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
    }

    setIsOpen(false);

    if (entity.category === 'control') {
      const ctrl = entity.originalItem as Control;
      onNavigateToEntity('controls', ctrl.code, { subTab: 'controls', entityId: ctrl.id });
    } else if (entity.category === 'risk') {
      const risk = entity.originalItem as RiskItem;
      onNavigateToEntity('risks', risk.title, { entityId: risk.id });
    } else if (entity.category === 'vendor') {
      const vendor = entity.originalItem as Vendor;
      onNavigateToEntity('vendors', vendor.name, { entityId: vendor.id });
    } else if (entity.category === 'policy') {
      const policy = entity.originalItem as Policy;
      onNavigateToEntity('policies', policy.title, { entityId: policy.id });
    } else if (entity.category === 'test') {
      const test = entity.originalItem as AutomatedTest;
      onNavigateToEntity('controls', test.title, {
        subTab: 'tests',
        entityId: test.id,
        testItem: test,
      });
    }
  };

  // Helper icon for entity category
  const renderCategoryIcon = (category: SearchableEntity['category']) => {
    switch (category) {
      case 'control':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'vendor':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'policy':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'test':
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  const renderCategoryPill = (category: SearchableEntity['category']) => {
    switch (category) {
      case 'control':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
            Control
          </span>
        );
      case 'risk':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800 font-mono">
            Risk
          </span>
        );
      case 'vendor':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-800 font-mono">
            Vendor
          </span>
        );
      case 'policy':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono">
            Policy
          </span>
        );
      case 'test':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
            Test
          </span>
        );
    }
  };

  const renderMatchTypeBadge = (matchType: ScoredSearchResult['matchType'], score: number) => {
    if (!query.trim()) return null;
    switch (matchType) {
      case 'exact':
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Exact Match
          </span>
        );
      case 'prefix':
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            Prefix
          </span>
        );
      case 'acronym':
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
            Acronym
          </span>
        );
      case 'typo':
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
            Typo Tolerant
          </span>
        );
      case 'fuzzy':
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-700">
            Fuzzy ({score}%)
          </span>
        );
      default:
        return null;
    }
  };

  /**
   * Highlights matching character indices within text
   */
  const renderHighlightedText = (text: string, matchedIndices: number[]) => {
    if (!matchedIndices || matchedIndices.length === 0) {
      return <span>{text}</span>;
    }

    const indexSet = new Set(matchedIndices);
    const chars = text.split('');

    return (
      <span>
        {chars.map((char, i) =>
          indexSet.has(i) ? (
            <span
              key={i}
              className="text-cyan-300 font-bold bg-cyan-950/80 border-b border-cyan-400"
            >
              {char}
            </span>
          ) : (
            <span key={i}>{char}</span>
          )
        )}
      </span>
    );
  };

  return (
    <>
      {/* Search Input Trigger in the Top Navigation Bar */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 text-xs rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-cyan-400 group shadow-xs ${
            triggerClassName || 'w-32 xs:w-44 sm:w-56 md:w-64 bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-white'
          }`}
          title="Fuzzy Search controls, risks, vendors, policies (⌘K or /)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 shrink-0 transition-colors" />
          <span className="truncate text-left flex-1 font-normal text-slate-400 group-hover:text-slate-200 hidden sm:inline font-sans">
            {placeholder || 'Fuzzy Search GRC... (⌘K)'}
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300 bg-slate-950 border border-slate-800 rounded shadow-xs">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>
      </div>

      {/* Global Fuzzy Search Command Center Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-3 pb-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          {/* Backdrop click dismiss */}
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          <div
            ref={dropdownRef}
            className="relative z-10 w-full max-w-2xl obsidian-card shadow-2xl border border-slate-800/90 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 text-slate-100"
          >
            {/* Header: Search Input with Fuzzy Engine Indicator */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/95">
              <Search className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Fuzzy search across controls, risks, vendors, policies... (e.g. 'mfa', 'tprm', 'cc6.1')"
                  className="w-full text-sm sm:text-base text-white placeholder-slate-500 bg-transparent focus:outline-none font-sans"
                />
              </div>

              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                  title="Clear query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80 hidden xs:flex">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Fuzzy Engine</span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 text-xs font-mono text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white rounded border border-slate-700 transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Category Filter Tabs with dynamic result counts */}
            <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/70 border-b border-slate-800 overflow-x-auto text-xs font-semibold scrollbar-none">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mr-1 shrink-0 font-mono">
                Scope:
              </span>

              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-[#0052CC] to-[#00D2FF] text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>All</span>
                <span className="opacity-80 font-mono text-[10px]">{categoryCounts.all}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('controls')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'controls'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Controls</span>
                <span className="opacity-80 font-mono text-[10px]">{categoryCounts.controls}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('risks')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'risks'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Risks</span>
                <span className="opacity-80 font-mono text-[10px]">{categoryCounts.risks}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('vendors')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'vendors'
                    ? 'bg-blue-950 text-blue-300 border border-blue-500/50 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Vendors</span>
                <span className="opacity-80 font-mono text-[10px]">{categoryCounts.vendors}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('policies')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'policies'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/50 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Policies</span>
                <span className="opacity-80 font-mono text-[10px]">{categoryCounts.policies}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('tests')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'tests'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Tests</span>
                <span className="opacity-80 font-mono text-[10px]">{categoryCounts.tests}</span>
              </button>
            </div>

            {/* Results List */}
            <div
              ref={resultsContainerRef}
              className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2 text-xs dark-scroll max-h-[55vh]"
            >
              {scoredResults.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Search className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-semibold text-white text-sm">No matching GRC entities found</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching by fuzzy keywords, acronyms (e.g. &quot;MFA&quot;, &quot;TPRM&quot;), or control codes (e.g. &quot;CC6.1&quot;).
                  </p>
                </div>
              ) : (
                scoredResults.map((result, idx) => {
                  const { entity, totalScore, titleHighlights, codeHighlights, matchType } = result;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={entity.id}
                      data-index={idx}
                      onClick={() => handleSelectItem(entity)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-500/50 shadow-md ring-1 ring-cyan-400/20'
                          : 'hover:bg-slate-900/80 text-slate-300 border border-transparent'
                      }`}
                    >
                      {/* Left: Icon & Content */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 border shadow-xs flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-slate-900 border-cyan-500 text-cyan-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-400'
                          }`}
                        >
                          {entity.category === 'test' ? (
                            <PlatformLogo
                              platformId={(entity.originalItem as AutomatedTest).integrationId}
                              name={(entity.originalItem as AutomatedTest).integrationName}
                              size="xs"
                            />
                          ) : (
                            renderCategoryIcon(entity.category)
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {renderCategoryPill(entity.category)}
                            {renderMatchTypeBadge(matchType, totalScore)}

                            <span className="font-bold text-white text-sm truncate">
                              {renderHighlightedText(entity.title, titleHighlights)}
                            </span>

                            {entity.statusBadge && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border font-mono ${
                                  entity.statusColor || 'text-slate-400 bg-slate-900 border-slate-800'
                                }`}
                              >
                                {entity.statusBadge}
                              </span>
                            )}
                          </div>

                          {entity.codeOrSubtitle && (
                            <div className="text-[11px] font-medium text-slate-400 truncate font-mono flex items-center gap-1.5">
                              <span>{renderHighlightedText(entity.codeOrSubtitle, codeHighlights)}</span>
                            </div>
                          )}

                          {entity.description && (
                            <p className="text-slate-400 text-[11px] line-clamp-1">
                              {entity.description}
                            </p>
                          )}

                          {entity.secondaryMeta && (
                            <div className="text-[10px] text-slate-500 truncate font-mono">
                              {entity.secondaryMeta}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Action arrow */}
                      <div className="flex items-center gap-2 shrink-0 self-center">
                        <span
                          className={`text-[11px] font-semibold flex items-center gap-1 transition-opacity ${
                            isSelected ? 'text-cyan-400 opacity-100' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <span className="hidden sm:inline">Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Suggestions & Keyboard Footer */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-300 font-mono text-[10px]">Fuzzy Presets:</span>
                {['MFA', 'CC6.1', 'Ransomware', 'AWS S3', 'TPRM', 'Encryption'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setQuery(preset);
                      inputRef.current?.focus();
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-cyan-300 border border-slate-800 font-mono text-[10px] text-slate-300 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500 shrink-0">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">Tab</kbd> Scope
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">ESC</kbd> Close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

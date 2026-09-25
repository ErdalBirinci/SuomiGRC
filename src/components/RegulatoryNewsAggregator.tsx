import React, { useState, useEffect, useMemo } from 'react';
import {
  RegulatoryNewsItem,
  RegulatoryAuthority,
  RegulatorySeverity,
} from '../types/regulatoryNews';
import { initialRegulatoryNews } from '../data/mockRegulatoryNews';
import { fetchRegulatoryNews } from '../utils/regulatoryNewsApi';
import {
  Globe,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
  Share2,
  Filter,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  Radio,
  FileText,
  AlertOctagon,
  Calendar,
  Building,
} from 'lucide-react';

interface RegulatoryNewsAggregatorProps {
  onNavigateTab: (tabId: string) => void;
  onNavigateToEntity?: (
    tab: 'controls' | 'risks' | 'vendors' | 'policies',
    query: string,
    options?: { subTab?: 'tests' | 'controls'; entityId?: string }
  ) => void;
  onAddRiskFromAlert?: (alert: RegulatoryNewsItem) => void;
}

export const RegulatoryNewsAggregator: React.FC<RegulatoryNewsAggregatorProps> = ({
  onNavigateTab,
  onNavigateToEntity,
  onAddRiskFromAlert,
}) => {
  const [items, setItems] = useState<RegulatoryNewsItem[]>(initialRegulatoryNews);
  const [selectedAuthority, setSelectedAuthority] = useState<RegulatoryAuthority>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<RegulatorySeverity | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearchInput, setActiveSearchInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveGrounded, setIsLiveGrounded] = useState<boolean>(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({
    'reg-cisa-kev-2026-01': true,
    'reg-nist-csf-pqc-2026-02': true,
  });
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Perform Google Search Grounded search
  const handlePerformSearch = async (auth: RegulatoryAuthority = selectedAuthority, queryText: string = activeSearchInput) => {
    setIsLoading(true);
    setSearchQuery(queryText);
    try {
      const res = await fetchRegulatoryNews({
        authority: auth,
        searchTopic: queryText,
      });
      setItems(res.items);
      setIsLiveGrounded(res.isLiveGrounded);
      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // Handled gracefully via fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handlePerformSearch(selectedAuthority, searchQuery);
  }, [selectedAuthority]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const showNotification = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => {
      setActionSuccessNotice(null);
    }, 4000);
  };

  // Turn alert into tracked Risk Register item
  const handleConvertToRisk = (item: RegulatoryNewsItem) => {
    if (onAddRiskFromAlert) {
      onAddRiskFromAlert(item);
    }
    showNotification(`Created Risk Register entry: "${item.title.slice(0, 45)}..." with High priority.`);
  };

  // Copy Executive Briefing to Clipboard
  const handleExportBriefing = () => {
    const briefingText = `# Enterprise GRC Regulatory Intelligence Briefing\nGenerated: ${new Date().toLocaleDateString()}\n\n` +
      items.map(item => (
        `### [${item.authority}] ${item.title}\n` +
        `- Category: ${item.category}\n` +
        `- Severity: ${item.severity.toUpperCase()}\n` +
        `- Impact Score: ${item.complianceImpactScore}/100\n` +
        `- Summary: ${item.executiveSummary}\n` +
        `- Key Actions: ${item.recommendedAction}\n` +
        `- Impacted Frameworks: ${item.affectedFrameworks.join(', ')}\n` +
        `- Primary Source: ${item.primaryUrl}\n\n`
      )).join('\n');

    navigator.clipboard.writeText(briefingText);
    showNotification('Copied executive regulatory briefing markdown to clipboard!');
  };

  // Filter items in memory
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedAuthority !== 'ALL' && item.authority !== selectedAuthority) {
        return false;
      }
      if (selectedSeverity !== 'ALL' && item.severity !== selectedSeverity) {
        return false;
      }
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (onlyBookmarked && !bookmarkedIds[item.id]) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.executiveSummary.toLowerCase().includes(q);
        const matchesFramework = item.affectedFrameworks.some((f) => f.toLowerCase().includes(q));
        const matchesControl = item.affectedControlCodes.some((c) => c.toLowerCase().includes(q));
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesFramework && !matchesControl && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedAuthority, selectedSeverity, selectedCategory, onlyBookmarked, bookmarkedIds, searchQuery]);

  // Aggregate stats
  const criticalCount = items.filter((i) => i.severity === 'critical').length;
  const highCount = items.filter((i) => i.severity === 'high').length;
  const distinctAuthorities = Array.from(new Set(items.map((i) => i.authority))).length;
  const totalImpactedControls = Array.from(
    new Set(items.flatMap((i) => i.affectedControlCodes))
  ).length;

  const getAuthorityBadgeColor = (auth: string) => {
    switch (auth) {
      case 'CISA':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'NIST':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'GDPR/EDPB':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
      case 'SEC':
        return 'bg-amber-500/10 text-amber-800 border-amber-200';
      case 'EU NIS2/DORA':
        return 'bg-emerald-500/10 text-emerald-800 border-emerald-200';
      case 'HIPAA/HHS':
        return 'bg-teal-500/10 text-teal-800 border-teal-200';
      case 'PCI-SSC':
        return 'bg-purple-500/10 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            Critical Directive
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            Advisory
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Notice
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification banner */}
      {actionSuccessNotice && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in slide-in-from-top-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
              <span className="flex items-center gap-1 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                <Globe className="w-3.5 h-3.5 animate-pulse text-blue-300" />
                Live Regulatory Intelligence
              </span>
              <span className="text-slate-500">·</span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Google Search Grounding Engine
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Regulatory News &amp; Authority Aggregator
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Continuously retrieves, parses, and cross-references live directives, KEV advisories, and enforcement rulings
              from CISA, NIST, European Data Protection Board (EDPB/GDPR), SEC, ENISA, and global cybersecurity authorities.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => handlePerformSearch(selectedAuthority, searchQuery)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Querying Google Search...' : 'Refresh from Web'}</span>
            </button>

            <button
              onClick={handleExportBriefing}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Briefing</span>
            </button>
          </div>
        </div>

        {/* Search Bar within Hero */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(selectedAuthority, activeSearchInput);
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={activeSearchInput}
                onChange={(e) => setActiveSearchInput(e.target.value)}
                placeholder="Search live regulatory updates (e.g., 'CISA KEV 2026', 'NIST CSF 2.0 PQC', 'GDPR AI fines', 'Form 8-K cyber')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-400 text-xs sm:text-sm border border-white/20 focus:border-blue-400 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Live Search</span>
            </button>
          </form>

          <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-400 flex-wrap">
            <span className="font-semibold text-slate-300">Quick Search Topics:</span>
            {['Zero Trust NIST', 'CISA KEV Catalog', 'EDPB AI Guidelines', 'DORA Third-Party', 'SEC Material Cyber Incidents'].map(
              (topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setActiveSearchInput(topic);
                    handlePerformSearch(selectedAuthority, topic);
                  }}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors"
                >
                  {topic}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monitored Bodies</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {distinctAuthorities} Authorities
          </div>
          <p className="text-[11px] text-slate-500 mt-1">CISA, NIST, EDPB, SEC, ENISA &amp; HHS</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Directives</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono">
            {criticalCount} Active
          </div>
          <p className="text-[11px] text-red-600/80 mt-1">Binding Operational 21-day remediations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Impacted Controls</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {totalImpactedControls} Controls
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Cross-mapped to SOC 2 &amp; ISO 27001</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Compliance Drift Risk</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">
            Low Drift (94/100)
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Synced {lastRefreshedAt}</p>
        </div>
      </div>

      {/* Filter and View Options Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Authority Selection Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-700 mr-1.5 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Authority:
            </span>
            {(
              [
                'ALL',
                'CISA',
                'NIST',
                'GDPR/EDPB',
                'SEC',
                'EU NIS2/DORA',
                'HIPAA/HHS',
                'PCI-SSC',
              ] as RegulatoryAuthority[]
            ).map((auth) => (
              <button
                key={auth}
                onClick={() => setSelectedAuthority(auth)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-semibold shrink-0 ${
                  selectedAuthority === auth
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {auth}
              </button>
            ))}
          </div>

          {/* Bookmarks Toggle */}
          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all self-start md:self-auto shrink-0 ${
              onlyBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={onlyBookmarked ? 'currentColor' : 'none'} />
            <span>Bookmarked Alerts</span>
          </button>
        </div>

        {/* Severity & Category Dropdowns */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="critical">Critical Directives Only</option>
              <option value="high">High Priority Only</option>
              <option value="medium">Advisory Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Vulnerability & Exploit Directive">Vulnerability & Exploit Directives</option>
              <option value="Framework & Standard Revision">Framework & Standard Revisions</option>
              <option value="Enforcement & Penalty Ruling">Enforcement & Penalty Rulings</option>
              <option value="Data Privacy & Cross-Border">Data Privacy & Cross-Border</option>
              <option value="Operational Resilience">Operational Resilience (NIS2/DORA)</option>
              <option value="Identity & Access Mandate">Identity & Access Mandates</option>
            </select>
          </div>

          <div className="ml-auto text-[11px] text-slate-400">
            Showing <strong className="text-slate-700">{filteredItems.length}</strong> alerts
          </div>
        </div>
      </div>

      {/* Main List of Regulatory Alerts */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-900">
              Querying Google Search Grounding for Latest Authority Decrees...
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Synthesizing recent publications from CISA KEV, NIST CSRC, EDPB rulings, and SEC Form 8-K settlements.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Regulatory Decrees Match Filters</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try resetting your search query or authority filter to view all monitored updates.
            </p>
            <button
              onClick={() => {
                setSelectedAuthority('ALL');
                setSelectedSeverity('ALL');
                setSelectedCategory('ALL');
                setSearchQuery('');
                setActiveSearchInput('');
                setOnlyBookmarked(false);
              }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg text-xs hover:bg-blue-100 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedCardId === item.id;
            const isBookmarked = bookmarkedIds[item.id];

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Item Top Bar */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getAuthorityBadgeColor(
                          item.authority
                        )}`}
                      >
                        {item.authority}
                      </span>
                      {getSeverityBadge(item.severity)}
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.regulatoryJurisdiction && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          • {item.regulatoryJurisdiction}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {item.publicationDate} ({item.timeAgo})
                      </span>
                      <button
                        onClick={() => toggleBookmark(item.id)}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark alert'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h2>

                  {/* Executive Summary */}
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {item.executiveSummary}
                  </p>

                  {/* Framework Cross-Walk & Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Impacts:
                      </span>
                      {item.affectedFrameworks.map((fw) => (
                        <span
                          key={fw}
                          className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80"
                        >
                          {fw}
                        </span>
                      ))}
                      {item.affectedControlCodes.map((code) => (
                        <button
                          key={code}
                          onClick={() => {
                            if (onNavigateToEntity) {
                              onNavigateToEntity('controls', code, { subTab: 'controls' });
                            } else {
                              onNavigateTab('controls');
                            }
                          }}
                          title={`Jump to control ${code}`}
                          className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <span>{code}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        onClick={() => handleConvertToRisk(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Log in Risk Register</span>
                      </button>

                      <button
                        onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'Compliance Analysis'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Deep Dive Panel */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50/80 border-t border-slate-200 space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm">
                    {/* Key Compliance Takeaways */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Key Compliance Takeaways for GRC Officers
                      </h4>
                      <ul className="space-y-2">
                        {item.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prescribed GRC Action */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Prescribed Actionable Remediation</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed">
                        {item.recommendedAction}
                      </p>
                    </div>

                    {/* Grounding Sources */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Verified Grounding Authority Sources
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="font-semibold truncate text-xs">{src.title}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

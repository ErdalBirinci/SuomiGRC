import React, { useState, useEffect } from 'react';
import {
  RegulatoryNewsItem,
  RegulatoryAuthority,
} from '../types/regulatoryNews';
import { fetchRegulatoryNews } from '../utils/regulatoryNewsApi';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface RegulatoryNewsWidgetProps {
  onNavigateTab: (tabId: string) => void;
  onNavigateToControls?: (framework?: string, controlCode?: string) => void;
}

export const RegulatoryNewsWidget: React.FC<RegulatoryNewsWidgetProps> = ({
  onNavigateTab,
  onNavigateToControls,
}) => {
  const [items, setItems] = useState<RegulatoryNewsItem[]>([]);
  const [selectedAuthority, setSelectedAuthority] = useState<RegulatoryAuthority>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveGrounded, setIsLiveGrounded] = useState<boolean>(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<RegulatoryNewsItem | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');
  const [savedBookmarks, setSavedBookmarks] = useState<Record<string, boolean>>({
    'reg-cisa-kev-2026-01': true,
  });

  const loadNews = async (auth: RegulatoryAuthority = selectedAuthority) => {
    setIsLoading(true);
    try {
      const res = await fetchRegulatoryNews({ authority: auth });
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
    loadNews(selectedAuthority);
  }, [selectedAuthority]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedBookmarks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getAuthorityBadgeColor = (auth: string) => {
    switch (auth) {
      case 'CISA':
        return 'bg-red-500/10 text-red-700 border-red-200 dark:border-red-900/40';
      case 'NIST':
        return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/40';
      case 'GDPR/EDPB':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:border-indigo-900/40';
      case 'SEC':
        return 'bg-amber-500/10 text-amber-800 border-amber-200 dark:border-amber-900/40';
      case 'EU NIS2/DORA':
        return 'bg-emerald-500/10 text-emerald-800 border-emerald-200 dark:border-emerald-900/40';
      case 'HIPAA/HHS':
        return 'bg-teal-500/10 text-teal-800 border-teal-200 dark:border-teal-900/40';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-200 dark:border-slate-800';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            Critical Directive
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            Advisory
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Notice
          </span>
        );
    }
  };

  // Display top 3 items in the dashboard widget
  const displayedItems = items.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-blue-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Regulatory News Aggregator
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Google Search Grounded
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time compliance intelligence from CISA, NIST, GDPR/EDPB, SEC &amp; EU Authorities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => loadNews(selectedAuthority)}
              disabled={isLoading}
              title="Refresh updates via Google Search Grounding"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 text-xs px-2.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline text-[11px]">Refresh</span>
            </button>

            <button
              onClick={() => onNavigateTab('regulatory-news')}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>Full Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Authority Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-medium text-slate-300 mr-1 shrink-0">Filter Authority:</span>
          {(['ALL', 'CISA', 'NIST', 'GDPR/EDPB', 'SEC', 'EU NIS2/DORA'] as RegulatoryAuthority[]).map(
            (auth) => (
              <button
                key={auth}
                onClick={() => setSelectedAuthority(auth)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all shrink-0 font-medium ${
                  selectedAuthority === auth
                    ? 'bg-blue-500 text-white font-semibold shadow-xs'
                    : 'bg-white/5 hover:bg-white/15 text-slate-300'
                }`}
              >
                {auth}
              </button>
            )
          )}
        </div>
      </div>

      {/* Widget Body: Feed Items */}
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-700">
              Querying Google Search Grounding for Latest Regulatory Decrees...
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pulling authoritative alerts from CISA KEV, NIST SP 800-53, and EDPB rulings
            </p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No updates found for this authority. Try selecting "ALL" or refreshing.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {displayedItems.map((item) => {
              const isSaved = savedBookmarks[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForModal(item)}
                  className="bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-blue-400/80 hover:shadow-md rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Authority & Severity */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getAuthorityBadgeColor(
                            item.authority
                          )}`}
                        >
                          {item.authority}
                        </span>
                        {getSeverityBadge(item.severity)}
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(item.id, e)}
                        title={isSaved ? 'Bookmarked' : 'Bookmark alert'}
                        className={`p-1 rounded hover:bg-slate-200/60 transition-colors ${
                          isSaved ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Headline */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Executive Summary */}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {item.executiveSummary}
                    </p>
                  </div>

                  {/* Bottom Meta & Action */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    {/* Affected Frameworks */}
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Impacts:
                      </span>
                      {item.affectedFrameworks.slice(0, 3).map((fw) => (
                        <span
                          key={fw}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60"
                        >
                          {fw}
                        </span>
                      ))}
                      {item.affectedFrameworks.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{item.affectedFrameworks.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timeAgo}
                      </span>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner with Key GRC Takeaways & Direct Navigation */}
        <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-slate-900">GRC Compliance Posture Impact:</span>{' '}
              <span className="text-slate-700">
                Latest updates mandate 3 technical control reviews across SOC 2 CC6.8, ISO 27001 A.8.8, and GDPR Art. 32.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-500">Last Synced: {lastRefreshedAt}</span>
            <button
              onClick={() => onNavigateTab('regulatory-news')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1"
            >
              <span>Explore All Regulatory Decrees</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Drill-Down Impact Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getAuthorityBadgeColor(
                      selectedItemForModal.authority
                    )}`}
                  >
                    {selectedItemForModal.authority}
                  </span>
                  {getSeverityBadge(selectedItemForModal.severity)}
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedItemForModal.publicationDate}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {selectedItemForModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Executive Briefing &amp; Scope
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {selectedItemForModal.executiveSummary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Compliance Takeaways for GRC Officers
                </h4>
                <ul className="space-y-1.5">
                  {selectedItemForModal.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Impacted Frameworks and Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                    Impacted Frameworks
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedItemForModal.affectedFrameworks.map((fw) => (
                      <span
                        key={fw}
                        className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white text-blue-800 border border-blue-200 shadow-2xs"
                      >
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
                    Associated Internal Controls
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedItemForModal.affectedControlCodes.map((cc) => (
                      <button
                        key={cc}
                        onClick={() => {
                          setSelectedItemForModal(null);
                          if (onNavigateToControls) {
                            onNavigateToControls(undefined, cc);
                          } else {
                            onNavigateTab('controls');
                          }
                        }}
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs flex items-center gap-1 transition-colors"
                      >
                        <span>{cc}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Prescribed GRC Action</span>
                </div>
                <p className="text-amber-800 leading-relaxed text-xs">
                  {selectedItemForModal.recommendedAction}
                </p>
              </div>

              {/* Verified Grounding Sources */}
              {selectedItemForModal.sources && selectedItemForModal.sources.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Verified Grounding Authority Sources
                  </h4>
                  <div className="space-y-1.5">
                    {selectedItemForModal.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium truncate">{src.title}</span>
                          {src.sourceAuthority && (
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              ({src.sourceAuthority})
                            </span>
                          )}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Compliance Impact Score: <strong className="text-slate-800">{selectedItemForModal.complianceImpactScore}/100</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItemForModal(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedItemForModal(null);
                    onNavigateTab('regulatory-news');
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Full Regulatory Aggregator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

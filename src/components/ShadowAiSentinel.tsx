import React, { useState } from 'react';
import { ShadowAiTool, ShadowAiDlpEvent } from '../types/grc';
import { initialShadowAiTools, initialShadowAiDlpEvents } from '../data/mockInnovativeData';
import {
  Bot,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Ban,
  FileCheck2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const ShadowAiSentinel: React.FC = () => {
  const [tools, setTools] = useState<ShadowAiTool[]>(initialShadowAiTools);
  const [dlpEvents, setDlpEvents] = useState<ShadowAiDlpEvent[]>(initialShadowAiDlpEvents);
  const [selectedToolId, setSelectedToolId] = useState<string>(initialShadowAiTools[0].id);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sanctioned' | 'quarantined' | 'under_review' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTool = tools.find((t) => t.id === selectedToolId) || tools[0];

  const filteredTools = tools.filter((t) => {
    if (statusFilter !== 'all' && t.governanceStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleQuarantine = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, governanceStatus: 'quarantined' } : t))
    );
  };

  const handleSanction = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, governanceStatus: 'sanctioned' } : t))
    );
  };

  const handleBlock = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, governanceStatus: 'blocked' } : t))
    );
  };

  const totalDlpIncidents = dlpEvents.length;
  const sanctionedCount = tools.filter((t) => t.governanceStatus === 'sanctioned').length;
  const quarantinedCount = tools.filter((t) => t.governanceStatus === 'quarantined' || t.governanceStatus === 'blocked').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-900/60 rounded-2xl p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5 text-rose-400" />
              <span>Next-Gen Generative AI Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Shadow-AI &amp; SaaS Data Exfiltration Sentinel
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Detect unauthorized LLM wrappers, ChatGPT extensions, and Copilots. Enforces
              <strong> Zero Data-Retention</strong>, inspects model training agreements, and intercepts confidential
              PII / API keys before they leak to public AI training datasets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs text-center min-w-[90px]">
              <div className="text-2xl font-bold font-mono text-emerald-400">{sanctionedCount}</div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Sanctioned</div>
            </div>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs text-center min-w-[90px]">
              <div className="text-2xl font-bold font-mono text-rose-400">{quarantinedCount}</div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Quarantined</div>
            </div>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs text-center min-w-[90px]">
              <div className="text-2xl font-bold font-mono text-amber-400">{totalDlpIncidents}</div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Blocked DLPs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Discovered AI Tools (5 cols), Right Tool Deep Dive & DLP Log (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Discovered Tools List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI agents, Copilots, models..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 flex-wrap text-xs">
              {(['all', 'sanctioned', 'quarantined', 'under_review', 'blocked'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize text-xs transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Tools List */}
          <div className="space-y-2.5">
            {filteredTools.map((tool) => {
              const isSelected = tool.id === selectedTool?.id;
              return (
                <div
                  key={tool.id}
                  onClick={() => setSelectedToolId(tool.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-50/60 border-rose-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {tool.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tool.governanceStatus === 'sanctioned'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tool.governanceStatus === 'quarantined'
                          ? 'bg-rose-100 text-rose-800'
                          : tool.governanceStatus === 'blocked'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tool.governanceStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-900">{tool.name}</h3>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tool.discoveredUsersCount} active users</span>
                    </span>
                    <span
                      className={`font-semibold ${
                        tool.dataRetentionPolicy === 'zero_retention_enterprise'
                          ? 'text-emerald-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {tool.dataRetentionPolicy === 'zero_retention_enterprise'
                        ? 'Zero-Retention'
                        : 'Trains on Prompts'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tool Inspector & DLP Log (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedTool && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-0">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {selectedTool.category}
                    </span>
                    <span className="text-xs text-slate-500">First seen {selectedTool.firstDetectedAt}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedTool.name}</h2>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedTool.governanceStatus !== 'sanctioned' && (
                    <button
                      onClick={() => handleSanction(selectedTool.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Sanction
                    </button>
                  )}
                  {selectedTool.governanceStatus !== 'quarantined' && (
                    <button
                      onClick={() => handleQuarantine(selectedTool.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Quarantine
                    </button>
                  )}
                  {selectedTool.governanceStatus !== 'blocked' && (
                    <button
                      onClick={() => handleBlock(selectedTool.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Block EDR
                    </button>
                  )}
                </div>
              </div>

              {/* Inspector Body */}
              <div className="p-5 space-y-4">
                {/* Risk Callout */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">Governance &amp; Privacy Posture:</div>
                  <p className="text-slate-600 leading-relaxed">{selectedTool.topRiskDescription}</p>
                </div>

                {/* Compliance Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">SOC 2 Type II</div>
                    <div
                      className={`font-bold mt-0.5 ${
                        selectedTool.compliancePosture.hasSoc2 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {selectedTool.compliancePosture.hasSoc2 ? 'Verified' : 'None'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">GDPR DPA</div>
                    <div
                      className={`font-bold mt-0.5 ${
                        selectedTool.compliancePosture.hasGdprDpa ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {selectedTool.compliancePosture.hasGdprDpa ? 'Executed' : 'Missing'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">HIPAA BAA</div>
                    <div
                      className={`font-bold mt-0.5 ${
                        selectedTool.compliancePosture.hasHipaaBaa ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {selectedTool.compliancePosture.hasHipaaBaa ? 'Signed' : 'Excluded'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Data Residency</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {selectedTool.compliancePosture.dataResidency}
                    </div>
                  </div>
                </div>

                {/* OAuth Token Scopes */}
                {selectedTool.oauthTokenScope && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <span className="font-semibold text-slate-700">Discovered OAuth Token Permissions:</span>
                    <div className="font-mono text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                      {selectedTool.oauthTokenScope}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Real-Time Prompt DLP Interception Log */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Real-Time AI Prompt DLP Violations Interceptor
                </h3>
                <p className="text-xs text-slate-500">
                  In-transit regex and entropy scanning blocked these outbound secret leaks.
                </p>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                {dlpEvents.length} Exfiltration Attempts Blocked
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {dlpEvents.map((evt) => (
                <div key={evt.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px]">
                        {evt.violationType}
                      </span>
                      <span className="font-semibold text-slate-900">{evt.toolName}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{evt.detectedAt}</span>
                  </div>

                  <div className="font-mono text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 truncate">
                    {evt.redactedSnippet}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>User: {evt.userEmail}</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{evt.actionTaken.replace('_', ' ').toUpperCase()}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

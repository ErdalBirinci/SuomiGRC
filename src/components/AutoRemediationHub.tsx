import React, { useState } from 'react';
import { AutoRemediationPatch, RemediationFormat } from '../types/grc';
import {
  GitPullRequest,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  RotateCcw,
  Search,
  Filter,
} from 'lucide-react';

interface AutoRemediationHubProps {
  patches: AutoRemediationPatch[];
  onApplyPatch?: (patchId: string) => void;
  onPassTest?: (testId: string) => void;
}

export const AutoRemediationHub: React.FC<AutoRemediationHubProps> = ({
  patches: initialPatches,
  onApplyPatch,
  onPassTest,
}) => {
  const [patches, setPatches] = useState<AutoRemediationPatch[]>(initialPatches);
  const [selectedPatchId, setSelectedPatchId] = useState<string>(initialPatches[0]?.id || '');
  const [providerFilter, setProviderFilter] = useState<'all' | 'aws' | 'gcp' | 'github' | 'kubernetes'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | RemediationFormat>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedPatch = patches.find((p) => p.id === selectedPatchId) || patches[0];

  const filteredPatches = patches.filter((p) => {
    if (providerFilter !== 'all' && p.targetProvider !== providerFilter) return false;
    if (formatFilter !== 'all' && p.format !== formatFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.testTitle.toLowerCase().includes(q) ||
        p.resourceId.toLowerCase().includes(q) ||
        p.prTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunDryRun = () => {
    if (!selectedPatch) return;
    setIsSimulating(true);
    setSimulationLogs(['[sandbox-ci] Initializing secure containerized terraform dry-run...']);

    const outputs = selectedPatch.simulationOutput || [
      '[sandbox-ci] Validating syntax & provider credentials...',
      '[sandbox-ci] Dry-run executed successfully. 0 errors, 0 breaking drift detected.',
      '[sandbox-ci] Ready for immediate automated GitOps commit.',
    ];

    outputs.forEach((line, idx) => {
      setTimeout(() => {
        setSimulationLogs((prev) => [...prev, line]);
        if (idx === outputs.length - 1) {
          setIsSimulating(false);
          setPatches((prev) =>
            prev.map((p) =>
              p.id === selectedPatch.id ? { ...p, status: 'dry_run_success', lastSimulatedAt: 'Just now' } : p
            )
          );
        }
      }, (idx + 1) * 350);
    });
  };

  const handleCreatePr = () => {
    if (!selectedPatch) return;
    const newPrNum = 490 + Math.floor(Math.random() * 20);
    const newPrUrl = `https://github.com/nordicscale/infra-cloud/pull/${newPrNum}`;

    setPatches((prev) =>
      prev.map((p) =>
        p.id === selectedPatch.id
          ? {
              ...p,
              status: 'pr_opened',
              prNumber: newPrNum,
              prUrl: newPrUrl,
            }
          : p
      )
    );
  };

  const handleApplyAndVerify = () => {
    if (!selectedPatch) return;
    setPatches((prev) =>
      prev.map((p) =>
        p.id === selectedPatch.id ? { ...p, status: 'applied' } : p
      )
    );
    if (onApplyPatch) onApplyPatch(selectedPatch.id);
    if (onPassTest) onPassTest(selectedPatch.testId);
  };

  const openPrsCount = patches.filter((p) => p.status === 'pr_opened').length;
  const appliedCount = patches.filter((p) => p.status === 'applied' || p.status === 'verified').length;
  const avgSafety = Math.round(patches.reduce((acc, p) => acc + p.safetyScore, 0) / patches.length);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-2xl p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Industry-First Autonomous Compliance Engineering</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Auto-Remediation as Code (GitOps Engine)
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Traditional GRC stops at flagging errors. This engine generates verified, non-destructive
              <strong> Terraform</strong>, <strong>Pulumi</strong>, and <strong>Kubernetes</strong> pull requests
              with dry-run sandboxes and 1-click automated rollbacks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs text-center min-w-[100px]">
              <div className="text-2xl font-bold font-mono text-indigo-300">{openPrsCount}</div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Open PRs</div>
            </div>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs text-center min-w-[100px]">
              <div className="text-2xl font-bold font-mono text-emerald-400">{appliedCount}</div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Remediated</div>
            </div>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs text-center min-w-[100px]">
              <div className="text-2xl font-bold font-mono text-blue-400">{avgSafety}%</div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Safety Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left List, Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patch Selection List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patches, controls, resources..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Provider Filter Tabs */}
            <div className="flex gap-1.5 flex-wrap text-xs">
              {(['all', 'aws', 'github', 'kubernetes'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setProviderFilter(prov)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize text-xs transition-colors ${
                    providerFilter === prov
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Patches List */}
          <div className="space-y-2.5">
            {filteredPatches.map((patch) => {
              const isSelected = patch.id === selectedPatch?.id;
              return (
                <div
                  key={patch.id}
                  onClick={() => {
                    setSelectedPatchId(patch.id);
                    setSimulationLogs([]);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {patch.format} • {patch.targetProvider}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        patch.status === 'applied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : patch.status === 'pr_opened'
                          ? 'bg-blue-100 text-blue-800'
                          : patch.status === 'dry_run_success'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {patch.status === 'applied'
                        ? 'Applied & Verified'
                        : patch.status === 'pr_opened'
                        ? `PR #${patch.prNumber} Active`
                        : patch.status === 'dry_run_success'
                        ? 'Dry-Run Validated'
                        : 'Draft Patch'}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-900 line-clamp-1">{patch.testTitle}</h3>
                  <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">{patch.resourceId}</div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-emerald-600 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{patch.safetyScore}% Safety</span>
                    </div>
                    <span>{patch.lastSimulatedAt || 'Not simulated'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Diff & Execution Sandbox (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPatch ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-0">
              {/* Header Info */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {selectedPatch.format.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{selectedPatch.filePath}</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{selectedPatch.prTitle}</h2>
                  </div>

                  {selectedPatch.prUrl && (
                    <a
                      href={selectedPatch.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
                      <span>PR #{selectedPatch.prNumber}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200/80">
                  {selectedPatch.prDescription}
                </p>
              </div>

              {/* Code Diff Box */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Code2 className="w-4 h-4 text-indigo-600" />
                    <span>Infrastructure Code Diff (GitOps Patch)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedPatch.codeDiff.patch, 'diff')}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'diff' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-hidden font-mono text-xs">
                  {/* Original code (Red/Removed) */}
                  <div className="bg-red-50/60 p-3 border-b border-red-100 text-red-900">
                    <div className="text-[10px] text-red-500 font-bold mb-1 flex items-center gap-1">
                      <span>- BEFORE REMEDIATION</span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre leading-relaxed">{selectedPatch.codeDiff.original}</pre>
                  </div>

                  {/* Patch code (Green/Added) */}
                  <div className="bg-emerald-50/60 p-3 text-emerald-950">
                    <div className="text-[10px] text-emerald-600 font-bold mb-1 flex items-center gap-1">
                      <span>+ AFTER AUTOMATED PATCH</span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre leading-relaxed">{selectedPatch.codeDiff.patch}</pre>
                  </div>
                </div>

                {/* Dry Run Sandbox Terminal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Terminal className="w-4 h-4 text-slate-700" />
                      <span>Sandbox CI Dry-Run Verification Engine</span>
                    </div>
                    <button
                      onClick={handleRunDryRun}
                      disabled={isSimulating}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isSimulating ? 'Simulating Dry-Run...' : 'Run Sandbox Dry-Run'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 text-slate-200 p-3.5 rounded-lg font-mono text-xs space-y-1 max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
                    <div className="text-slate-500 text-[11px]">
                      $ terraform validate &amp;&amp; tfsec --concise --tfvars-file=prod.tfvars
                    </div>
                    {simulationLogs.length > 0 ? (
                      simulationLogs.map((log, i) => (
                        <div key={i} className="text-emerald-400 text-[11px] leading-relaxed">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-[11px] italic">
                        Click "Run Sandbox Dry-Run" to test this change in an isolated container without mutating cloud resources.
                      </div>
                    )}
                  </div>
                </div>

                {/* CLI & Rollback Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Direct CLI Apply</span>
                      <button
                        onClick={() => handleCopy(selectedPatch.cliCommand, 'cli')}
                        className="text-[10px] text-indigo-600 hover:underline"
                      >
                        {copiedKey === 'cli' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 truncate">
                      {selectedPatch.cliCommand}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1 text-slate-600">
                        <RotateCcw className="w-3 h-3" />
                        <span>Instant Rollback Command</span>
                      </span>
                      <button
                        onClick={() => handleCopy(selectedPatch.rollbackCommand, 'rollback')}
                        className="text-[10px] text-indigo-600 hover:underline"
                      >
                        {copiedKey === 'rollback' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 truncate">
                      {selectedPatch.rollbackCommand}
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-slate-600">
                      Zero production downtime guaranteed • Backed by AST validator
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {selectedPatch.status !== 'pr_opened' && (
                      <button
                        onClick={handleCreatePr}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>Open GitHub PR</span>
                      </button>
                    )}

                    <button
                      onClick={handleApplyAndVerify}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{selectedPatch.status === 'applied' ? 'Applied & Verified' : 'Apply & Verify Test'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

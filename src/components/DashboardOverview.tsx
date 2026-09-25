import React, { useState, useMemo } from 'react';
import {
  Framework,
  Integration,
  AutomatedTest,
  Control,
  RiskItem,
  Vendor,
  FrameworkId,
} from '../types/grc';
import {
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Server,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  Zap,
  ExternalLink,
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
  FileCheck2,
  Lock,
  Eye,
  RefreshCw,
  Download,
  Terminal,
  ChevronRight,
  CheckCircle,
  XCircle,
  Activity,
  FolderLock,
  Bug,
  Award,
  Gauge,
  Info,
  SlidersHorizontal,
  Target,
  Check,
  Radio,
  Network,
  Cpu,
} from 'lucide-react';
import { PlatformLogo, SuomiGrcLogoMark } from './PlatformLogo';
import { ComplianceReadinessHeatmap } from './ComplianceReadinessHeatmap';
import { ComplianceReadinessTrendChart } from './ComplianceReadinessTrendChart';
import { RegulatoryNewsWidget } from './RegulatoryNewsWidget';
import { useRBAC } from '../context/RbacContext';

interface DashboardOverviewProps {
  frameworks: Framework[];
  integrations: Integration[];
  tests: AutomatedTest[];
  controls: Control[];
  risks: RiskItem[];
  vendors: Vendor[];
  onNavigateTab: (tabId: string) => void;
  onSelectTest: (test: AutomatedTest) => void;
  selectedFramework: FrameworkId | 'all';
  onSelectFramework?: (fw: FrameworkId | 'all') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  frameworks,
  integrations,
  tests,
  controls,
  risks,
  vendors,
  onNavigateTab,
  onSelectTest,
  selectedFramework,
  onSelectFramework,
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testRunMessage, setTestRunMessage] = useState<string | null>(null);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isMaturityModalOpen, setIsMaturityModalOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Aggregate calculations
  const totalTests = tests.length;
  const passingTests = tests.filter((t) => t.status === 'passing').length;
  const failingTests = tests.filter((t) => t.status === 'failing');
  const passingRate = Math.round((passingTests / totalTests) * 100);

  const activeIntegrationsCount = integrations.filter((i) => i.status === 'connected').length;
  const totalMonitoredResources = integrations.reduce((acc, curr) => acc + curr.monitoredResourcesCount, 0);

  const averageReadiness = Math.round(
    frameworks.reduce((acc, curr) => acc + curr.readinessPercentage, 0) / frameworks.length
  );

  // Weighted Compliance Maturity Score Computation
  const maturityMetrics = useMemo(() => {
    // Controls in scope
    const scopedControls = selectedFramework === 'all'
      ? controls
      : controls.filter((c) => c.frameworkMappings.some((m) => m.frameworkId === selectedFramework));
    const totalScopedControls = Math.max(1, scopedControls.length);

    // 1. Control Implementation (Weight: 35%)
    const implementedControls = scopedControls.filter(
      (c) => c.status === 'automated_passing' || c.status === 'manual_verified' || c.lifecycleStatus === 'Monitoring'
    ).length;
    const controlImplementationRate = Math.round((implementedControls / totalScopedControls) * 100);

    // 2. Evidence Coverage (Weight: 35%)
    const controlsWithEvidence = scopedControls.filter((c) => (c.evidenceCount || 0) > 0).length;
    const evidenceCoverageRate = Math.round((controlsWithEvidence / totalScopedControls) * 100);

    // 3. Continuous Test Pass Rate (Weight: 30%)
    const scopedTests = selectedFramework === 'all'
      ? tests
      : tests.filter((t) =>
          t.satisfiedControls.some((cid) =>
            scopedControls.some((sc) => sc.id === cid || sc.code === cid)
          ) || t.satisfiedControls.length === 0
        );
    const totalScopedTests = Math.max(1, scopedTests.length);
    const passingScopedTests = scopedTests.filter((t) => t.status === 'passing').length;
    const testPassRate = Math.round((passingScopedTests / totalScopedTests) * 100);

    // Weighted Score
    const weightedScore = Math.min(100, Math.max(0, Math.round(
      controlImplementationRate * 0.35 +
      evidenceCoverageRate * 0.35 +
      testPassRate * 0.30
    )));

    // Maturity Level
    let level = 1;
    let levelName = 'Initial';
    let levelDescription = 'Baseline ad-hoc controls with emerging evidence tracking.';
    let levelColor = 'text-rose-400 bg-rose-950/70 border-rose-800';
    let badgeBg = 'bg-rose-500';

    if (weightedScore >= 95) {
      level = 5;
      levelName = 'Optimized';
      levelDescription = 'Autonomous continuous self-healing, complete evidence automation & zero-drift posture.';
      levelColor = 'text-emerald-400 bg-emerald-950/70 border-emerald-800';
      badgeBg = 'bg-emerald-400';
    } else if (weightedScore >= 85) {
      level = 4;
      levelName = 'Continuous';
      levelDescription = 'Continuous automated evidence synchronization across all cloud connectors.';
      levelColor = 'text-cyan-300 bg-cyan-950/70 border-cyan-800';
      badgeBg = 'bg-cyan-400';
    } else if (weightedScore >= 70) {
      level = 3;
      levelName = 'Defined';
      levelDescription = 'Standardized technical controls and active evidence collection cadence.';
      levelColor = 'text-blue-300 bg-blue-950/70 border-blue-800';
      badgeBg = 'bg-blue-500';
    } else if (weightedScore >= 50) {
      level = 2;
      levelName = 'Repeatable';
      levelDescription = 'Documented controls with partial automated monitoring and manual verification.';
      levelColor = 'text-amber-300 bg-amber-950/70 border-amber-800';
      badgeBg = 'bg-amber-400';
    }

    // Cross-Framework Maturity Breakdown
    const frameworkBreakdown = frameworks.map((fw) => {
      const fwControls = controls.filter((c) => c.frameworkMappings.some((m) => m.frameworkId === fw.id));
      const fwTotal = Math.max(1, fwControls.length);
      const fwImpl = Math.round((fwControls.filter((c) => c.status === 'automated_passing' || c.status === 'manual_verified' || c.lifecycleStatus === 'Monitoring').length / fwTotal) * 100);
      const fwEv = Math.round((fwControls.filter((c) => (c.evidenceCount || 0) > 0).length / fwTotal) * 100);
      const fwScore = Math.round(fwImpl * 0.35 + fwEv * 0.35 + testPassRate * 0.30);
      return {
        id: fw.id,
        name: fw.name,
        code: fw.code,
        score: fwScore,
        implRate: fwImpl,
        evRate: fwEv,
        controlsCount: fwControls.length,
      };
    });

    return {
      weightedScore,
      level,
      levelName,
      levelDescription,
      levelColor,
      badgeBg,
      controlImplementationRate,
      implementedControls,
      totalScopedControls,
      evidenceCoverageRate,
      controlsWithEvidence,
      testPassRate,
      passingScopedTests,
      totalScopedTests,
      frameworkBreakdown,
    };
  }, [controls, tests, frameworks, selectedFramework]);

  const { currentRole, currentUser } = useRBAC();

  const handleRunAllTests = () => {
    setIsRunningTests(true);
    setTestRunMessage('Running automated evidence collectors across 12 cloud connectors...');
    setTimeout(() => {
      setIsRunningTests(false);
      setTestRunMessage('Continuous telemetry verified: 38/42 passing (4 failing controls flagged).');
      setTimeout(() => setTestRunMessage(null), 4000);
    }, 1500);
  };

  const handleDownloadCsvReport = () => {
    setIsExportingCsv(true);

    try {
      const escapeCsv = (val: string | number | boolean | undefined | null): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

      const csvRows: string[][] = [
        ['SUOMIGRC ENTERPRISE CONTINUOUS ASSURANCE REPORT'],
        ['Generated At (UTC)', formattedDate],
        ['Generated By', `${currentUser.name} (${currentUser.title})`],
        ['Active Role Persona', currentRole.toUpperCase()],
        ['Tenant Entity', 'Acme Technologies Inc. (Tenant #9841)'],
        ['Selected Framework Scope', selectedFramework === 'all' ? 'All Frameworks (Global Unified View)' : selectedFramework.toUpperCase()],
        ['Overall Compliance Maturity Score', `${maturityMetrics.weightedScore}%`],
        ['Maturity Rating Tier', `Level ${maturityMetrics.level} - ${maturityMetrics.levelName}`],
        ['Continuous Tests Pass Rate', `${passingRate}% (${passingTests} / ${totalTests} passing)`],
        ['Failing Automated Tests Count', String(failingTests.length)],
        ['Control Implementation Rate', `${maturityMetrics.controlImplementationRate}% (${maturityMetrics.implementedControls} / ${maturityMetrics.totalScopedControls} implemented)`],
        ['Evidence Coverage Rate', `${maturityMetrics.evidenceCoverageRate}% (${maturityMetrics.controlsWithEvidence} / ${maturityMetrics.totalScopedControls} verified)`],
        ['Active Cloud Connectors', `${activeIntegrationsCount} live integrations`],
        ['Monitored Infrastructure Assets', `${totalMonitoredResources} assets`],
        ['Total Risk Register Items', String(risks.length)],
        ['Monitored Supply Chain Vendors', String(vendors.length)],
        [],
        ['--- 1. FRAMEWORK COMPLIANCE POSTURE & READINESS BREAKDOWN ---'],
        ['Framework Code', 'Framework Name', 'Readiness Score', 'Maturity Score', 'Control Implementation %', 'Evidence Coverage %', 'Mapped Controls', 'Compliance Status'],
        ...maturityMetrics.frameworkBreakdown.map((fw) => [
          fw.code,
          fw.name,
          `${fw.score}%`,
          `${fw.score}/100`,
          `${fw.implRate}%`,
          `${fw.evRate}%`,
          String(fw.controlsCount),
          fw.score >= 80 ? 'Compliant' : fw.score >= 60 ? 'In Progress' : 'Action Required',
        ]),
        [],
        ['--- 2. AUTOMATED CONTINUOUS TEST STATUS INVENTORY ---'],
        ['Test ID', 'Test Title', 'Category', 'Evaluation Status', 'Severity', 'Satisfied Controls', 'Failing Resources Count', 'Failing Asset Details', 'Execution Cadence', 'Last Evaluated'],
        ...tests.map((t) => [
          t.id,
          t.title,
          t.category,
          t.status.toUpperCase(),
          t.severity.toUpperCase(),
          t.satisfiedControls.join('; ') || 'N/A',
          String(t.failingResources?.length || 0),
          t.failingResources?.map((r) => `${r.name} (${r.arnOrPath})`).join('; ') || 'All Resources Compliant',
          t.frequency || 'Continuous (Hourly)',
          t.lastRunAt || 'Just now',
        ]),
        [],
        ['--- 3. ENTERPRISE CONTROLS POSTURE INVENTORY ---'],
        ['Control ID', 'Control Code', 'Control Name', 'Domain', 'Evaluation Status', 'Lifecycle Status', 'Evidence Count', 'Primary Owner', 'Mapped Frameworks'],
        ...controls.map((c) => [
          c.id,
          c.code,
          c.name,
          c.domain,
          c.status,
          c.lifecycleStatus || 'Monitoring',
          String(c.evidenceCount || 0),
          c.owner || 'SecOps / Compliance Lead',
          c.frameworkMappings.map((m) => m.frameworkId.toUpperCase()).join('; '),
        ]),
        [],
        ['--- 4. ENTERPRISE RISK REGISTER OVERVIEW ---'],
        ['Risk ID', 'Risk Title', 'Category', 'Severity Level', 'Inherent Impact (1-5)', 'Residual Impact (1-5)', 'Treatment Strategy', 'Treatment Owner', 'Status'],
        ...risks.map((r) => [
          r.id,
          r.title,
          r.category,
          r.inherentImpact >= 4 ? 'High / Critical' : r.inherentImpact >= 3 ? 'Medium' : 'Low',
          String(r.inherentImpact),
          String(r.residualImpact),
          r.treatment,
          r.owner,
          r.status,
        ]),
        [],
        ['--- 5. THIRD-PARTY VENDOR ECOSYSTEM RISK POSTURE ---'],
        ['Vendor ID', 'Vendor Name', 'Category', 'Risk Tier', 'Risk Rating', 'SOC 2 Status', 'Next Review Due', 'Owner'],
        ...vendors.map((v) => [
          v.id,
          v.name,
          v.category,
          v.tier,
          v.riskRating,
          v.soc2ReportStatus,
          v.nextReviewDate,
          v.owner,
        ]),
      ];

      // Convert rows to CSV string with RFC-4180 escaping
      const csvContent = csvRows
        .map((row) => row.map(escapeCsv).join(','))
        .join('\r\n');

      // Prepend UTF-8 BOM so Excel/Numbers opens cleanly
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = `suomiGRC_Compliance_Report_${selectedFramework}_${timestamp}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTestRunMessage(`Compliance & Test Status Report exported as "${filename}".`);
      setTimeout(() => setTestRunMessage(null), 5000);
    } catch (err) {
      console.error('Error generating CSV report:', err);
    } finally {
      setTimeout(() => setIsExportingCsv(false), 500);
    }
  };

  return (
    <div className="space-y-6 max-w-[1536px] mx-auto pb-12 text-slate-100">
      {/* ========================================================================= */}
      {/* 1. OBSIDIAN SHIELD HOLOGRAPHIC HERO COMMAND CENTER                         */}
      {/* ========================================================================= */}
      <div className="obsidian-card p-6 sm:p-7 relative overflow-hidden text-white hud-grid-pattern border border-slate-800/90 shadow-2xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0052CC]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 min-w-0 max-w-3xl">
            {/* Top Tactical Status Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <button
                onClick={() => setIsOrgModalOpen(true)}
                className="font-bold text-white hover:text-cyan-300 transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/60 font-mono text-[11px]"
                title="View Organization Profile"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Acme Technologies</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
              
              <span className="text-slate-600">/</span>
              
              <button
                onClick={() => onNavigateTab('cloud-discovery')}
                className="text-slate-300 hover:text-white transition-colors px-2 py-0.5 rounded-md bg-slate-900/60 border border-slate-800 text-[11px] font-mono flex items-center gap-1"
                title="Inspect Cloud Assets"
              >
                <span>EU-Central-1</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
              </button>

              <span className="text-slate-600">/</span>

              <button
                onClick={() => onNavigateTab('activity-log')}
                className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 bg-emerald-950/70 hover:bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-800/80 font-mono text-[11px] transition-colors"
                title="Open Live Audit Log"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-radar-dot" />
                <span>Continuous Radar Active</span>
              </button>

              <button
                onClick={() => onNavigateTab('auditor')}
                className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 px-2 py-0.5 rounded-md border border-amber-800/80 font-mono text-[11px] transition-colors"
                title="Open CPA Auditor Portal"
              >
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>SOC 2 Window: Day 48 of 90</span>
              </button>
            </div>

            {/* Title & Role Statement */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-3">
                <span>
                  {currentRole === 'auditor'
                    ? 'Auditor Independent Assurance & Evidence Stream'
                    : currentRole === 'compliance_analyst'
                    ? 'Compliance Operations & Remediation Control Center'
                    : 'suomiGRC Enterprise Continuous Assurance Hub'}
                </span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-sans">
                {currentRole === 'auditor'
                  ? 'Cryptographic Provided-By-Client (PBC) sampling, immutable Merkle root proof ledger, and observation window controls.'
                  : currentRole === 'compliance_analyst'
                  ? 'Real-time telemetry across 8 compliance frameworks, automated GitOps fixes, and continuous evidence validation.'
                  : 'Multi-cloud automated controls monitoring across AWS, GCP, Azure, GitHub, and Okta with 1,840 verified infrastructure assets.'}
              </p>
            </div>

            {/* Multi-Cloud Telemetry Connectors Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                Live Mesh:
              </span>
              {[
                { name: 'AWS Prod', icon: 'aws', status: 'connected' },
                { name: 'GCP Analytics', icon: 'gcp', status: 'connected' },
                { name: 'Okta Identity', icon: 'okta', status: 'connected' },
                { name: 'GitHub Enterprise', icon: 'github', status: 'connected' },
                { name: 'Cloudflare Edge', icon: 'cloudflare', status: 'connected' },
              ].map((conn) => (
                <div
                  key={conn.name}
                  onClick={() => onNavigateTab('integrations')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-[11px] font-mono text-slate-200 cursor-pointer transition-all"
                  title={`Inspect ${conn.name}`}
                >
                  <PlatformLogo platformId={conn.icon} size="xs" />
                  <span>{conn.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Command Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('action-items')}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#0052CC] to-[#00D2FF] text-slate-950 hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/50 font-sans"
              title="Open prioritized action queue"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>My Action Items</span>
            </button>

            <button
              onClick={handleDownloadCsvReport}
              disabled={isExportingCsv}
              className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              title="Export complete compliance posture, framework scores, and automated test statuses to CSV"
              aria-label="Download Compliance Report CSV"
            >
              <Download className={`w-3.5 h-3.5 text-cyan-400 ${isExportingCsv ? 'animate-bounce' : ''}`} />
              <span>{isExportingCsv ? 'Generating...' : 'Download Report'}</span>
            </button>

            <button
              onClick={handleRunAllTests}
              disabled={isRunningTests}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              title="Trigger instant continuous test sweep"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Evaluating Sweep...' : 'Run Test Sweep'}</span>
            </button>

            <button
              onClick={() => setShowHeatmap((prev) => !prev)}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                showHeatmap
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
              }`}
              title="Toggle Readiness Heatmap"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showHeatmap ? 'Hide Heatmap' : 'Heatmap'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Sweep Notification Banner */}
        {testRunMessage && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150 shadow-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{testRunMessage}</span>
            </div>
            <span className="text-[10px] text-slate-400">SHA-256 Provenance Logged</span>
          </div>
        )}
      </div>

      {/* Organizational Maturity Heatmap (Expandable) */}
      {showHeatmap && (
        <div className="obsidian-card p-5 sm:p-6 animate-in fade-in slide-in-from-top-3 duration-200 border border-slate-800 text-slate-100 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span>Organizational Compliance Maturity &amp; Departmental Heatmap</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Interactive
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Departmental control coverage and technical readiness scores across engineering and business units.
              </p>
            </div>
            <button
              onClick={() => setShowHeatmap(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <ComplianceReadinessHeatmap onNavigateTab={onNavigateTab} selectedFramework={selectedFramework} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COMPLIANCE MATURITY SCORE WEIGHTED ENGINE BAR                          */}
      {/* ========================================================================= */}
      <div className="executive-card p-5 sm:p-6 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left: Overall Maturity Score Dial & Level Badging */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            {/* Circular Maturity Score Dial */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="transition-all duration-1000 ease-out"
                  strokeDasharray={`${maturityMetrics.weightedScore}, 100`}
                  strokeWidth="3.2"
                  stroke={maturityMetrics.level >= 4 ? '#00D2FF' : maturityMetrics.level === 3 ? '#0052CC' : '#F59E0B'}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white leading-none tabular-nums">
                  {maturityMetrics.weightedScore}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">/100</span>
              </div>
            </div>

            {/* Title & Level Badge */}
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Continuous Maturity Index
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${maturityMetrics.levelColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${maturityMetrics.badgeBg}`} />
                  <span>Level {maturityMetrics.level}: {maturityMetrics.levelName}</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Weighted Enterprise Maturity Score</span>
                <button
                  onClick={() => setIsMaturityModalOpen(true)}
                  className="text-slate-400 hover:text-cyan-400 p-0.5 rounded transition-colors"
                  title="View Weighted Calculation Formula"
                >
                  <Info className="w-4 h-4" />
                </button>
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                {maturityMetrics.levelDescription}
              </p>
            </div>
          </div>

          {/* Center-Right: 3 Weighted Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 xl:max-w-xl">
            {/* Dimension 1: Control Implementation (35%) */}
            <div
              onClick={() => onNavigateTab('controls')}
              className="p-3 bg-slate-900/80 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                  Control Impl.
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">35% wt</span>
              </div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {maturityMetrics.controlImplementationRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {maturityMetrics.implementedControls}/{maturityMetrics.totalScopedControls}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0052CC] h-full rounded-full transition-all duration-500"
                  style={{ width: `${maturityMetrics.controlImplementationRate}%` }}
                />
              </div>
            </div>

            {/* Dimension 2: Evidence Coverage (35%) */}
            <div
              onClick={() => onNavigateTab('evidence-vault')}
              className="p-3 bg-slate-900/80 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-200 truncate group-hover:text-emerald-300">
                  Evidence Vault
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">35% wt</span>
              </div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {maturityMetrics.evidenceCoverageRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {maturityMetrics.controlsWithEvidence}/{maturityMetrics.totalScopedControls}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${maturityMetrics.evidenceCoverageRate}%` }}
                />
              </div>
            </div>

            {/* Dimension 3: Test Pass Rate (30%) */}
            <div
              onClick={() => onNavigateTab('controls')}
              className="p-3 bg-slate-900/80 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                  Continuous Tests
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">30% wt</span>
              </div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {maturityMetrics.testPassRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {maturityMetrics.passingScopedTests}/{maturityMetrics.totalScopedTests}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${maturityMetrics.testPassRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2 self-end xl:self-center shrink-0">
            <button
              onClick={() => setIsMaturityModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Maturity Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FOUR GLASS KPI COMMAND TILES WITH SPARKLINES                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Unified Framework Readiness */}
        <div
          onClick={() => onNavigateTab('frameworks')}
          className="executive-card p-5 cursor-pointer group relative overflow-hidden border border-slate-800"
          title="Click to view all framework cross-mappings"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] group-hover:text-cyan-300 transition-colors font-mono">
              Unified Readiness
            </span>
            <span className="text-emerald-400 font-mono font-semibold text-[11px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+4.2% MoM</span>
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {averageReadiness}%
            </div>
            {/* Embedded Sparkline SVG */}
            <svg className="w-20 h-7 shrink-0 text-emerald-400" viewBox="0 0 80 28" fill="none">
              <path
                d="M2 24 L16 20 L30 22 L44 14 L58 10 L78 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="78" cy="4" r="2.5" fill="currentColor" />
            </svg>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-[#0052CC] to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${averageReadiness}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFramework?.('soc2');
                onNavigateTab('controls');
              }}
              className="hover:text-cyan-300 hover:underline transition-colors"
            >
              SOC 2: 92%
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFramework?.('iso27001');
                onNavigateTab('controls');
              }}
              className="hover:text-cyan-300 hover:underline transition-colors"
            >
              ISO 27001: 88%
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFramework?.('hipaa');
                onNavigateTab('controls');
              }}
              className="hover:text-cyan-300 hover:underline transition-colors"
            >
              HIPAA: 95%
            </button>
          </div>
        </div>

        {/* KPI 2: Continuous Automated Tests */}
        <div
          onClick={() => onNavigateTab('controls')}
          className="executive-card p-5 cursor-pointer group relative overflow-hidden border border-slate-800"
          title="Click to view all automated evidence tests"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] group-hover:text-cyan-300 transition-colors font-mono">
              Continuous Tests
            </span>
            <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {passingTests}{' '}
              <span className="text-base font-normal text-slate-400">/ {totalTests}</span>
            </div>
            {/* Sparkline for tests */}
            <svg className="w-20 h-7 shrink-0 text-cyan-400" viewBox="0 0 80 28" fill="none">
              <path
                d="M2 18 L18 16 L34 10 L50 14 L66 8 L78 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="78" cy="6" r="2.5" fill="currentColor" />
            </svg>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${passingRate}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('cloud-discovery');
              }}
              className="text-slate-400 hover:text-cyan-300 hover:underline transition-colors font-mono"
            >
              12 Connectors →
            </button>
            {failingTests.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('controls');
                }}
                className="text-rose-400 hover:text-rose-300 font-semibold font-mono flex items-center gap-1 hover:underline"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                {failingTests.length} failing
              </button>
            ) : (
              <span className="text-emerald-400 font-semibold font-mono">All Passing</span>
            )}
          </div>
        </div>

        {/* KPI 3: Monitored Assets & Connectors */}
        <div
          onClick={() => onNavigateTab('integrations')}
          className="executive-card p-5 cursor-pointer group relative overflow-hidden border border-slate-800"
          title="Click to view all connected cloud platforms"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] group-hover:text-cyan-300 transition-colors font-mono">
              Monitored Assets
            </span>
            <Server className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {totalMonitoredResources.toLocaleString()}
            </div>
            {/* Sparkline for assets */}
            <svg className="w-20 h-7 shrink-0 text-blue-400" viewBox="0 0 80 28" fill="none">
              <path
                d="M2 20 L20 18 L38 12 L56 8 L78 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="78" cy="4" r="2.5" fill="currentColor" />
            </svg>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-[#0052CC] h-full rounded-full"
              style={{ width: `${(activeIntegrationsCount / integrations.length) * 100}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate max-w-[130px]">
              AWS · GCP · GitHub
            </span>
            <span className="text-emerald-400 font-semibold">
              100% Synced
            </span>
          </div>
        </div>

        {/* KPI 4: Enterprise Risk Index */}
        <div
          onClick={() => onNavigateTab('risks')}
          className="executive-card p-5 cursor-pointer group relative overflow-hidden border border-slate-800"
          title="Click to open Enterprise Risk Register"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] group-hover:text-cyan-300 transition-colors font-mono">
              Enterprise Risk Index
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {risks.filter((r) => r.status === 'Mitigated').length}{' '}
              <span className="text-base font-normal text-slate-400">/ {risks.length}</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              -64% Exposure
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '64%' }} />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('risks');
              }}
              className="hover:text-amber-300 hover:underline"
            >
              0 Critical · 2 High
            </button>
            <span className="text-emerald-400 font-semibold">
              SLA Met
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3.5 HISTORICAL 6-MONTH COMPLIANCE READINESS TREND (RECHARTS LINE GRAPH)    */}
      {/* ========================================================================= */}
      <ComplianceReadinessTrendChart
        selectedFramework={selectedFramework}
        onNavigateTab={onNavigateTab}
      />

      {/* ========================================================================= */}
      {/* 4. MAIN COMMAND CENTER: 2-COLUMN TACTICAL VIEW                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Real-Time Telemetry & Core Compliance (Width 8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Continuous Evidence Test Telemetry Stream */}
          <div className="executive-card p-5 sm:p-6 space-y-4 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-display">
                    Continuous Test Telemetry &amp; Evidence Stream
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 live-radar-dot" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated checks running continuously against AWS, GCP, GitHub, and Okta infrastructure.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={handleDownloadCsvReport}
                  disabled={isExportingCsv}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5 shadow-xs"
                  title="Export tests and metrics to CSV"
                >
                  <Download className={`w-3 h-3 text-cyan-400 ${isExportingCsv ? 'animate-bounce' : ''}`} />
                  <span>CSV</span>
                </button>

                <button
                  onClick={() => onNavigateTab('controls')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-sans"
                >
                  <span>View all 42 tests</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Test Items Table / List */}
            <div className="divide-y divide-slate-800/80">
              {tests.slice(0, 6).map((test) => {
                const isPassing = test.status === 'passing';
                return (
                  <div
                    key={test.id}
                    onClick={() => onSelectTest(test)}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-900/80 px-2.5 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isPassing ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                            {test.title}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                            {test.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {test.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                        Checked {test.lastRunAt}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isPassing
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {isPassing ? 'PASSING' : 'FAILING'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary Strip */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-mono text-[11px]">
                Cryptographic Signature: SHA-256 Validated
              </span>
              <button
                onClick={() => onNavigateTab('remediation-code')}
                className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 text-[11px] font-sans"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Auto-generate GitOps Terraform Fixes →</span>
              </button>
            </div>
          </div>

          {/* Multi-Framework Compliance Readiness Matrix */}
          <div className="executive-card p-5 sm:p-6 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white font-display">
                  Multi-Framework Compliance Posture
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuous controls mapped across AICPA SOC 2, ISO 27001, HIPAA, GDPR, and PCI DSS.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('frameworks')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-sans"
              >
                <span>Full Cross-Walk Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {frameworks.map((fw) => {
                const isPassing = fw.readinessPercentage >= 85;
                return (
                  <div
                    key={fw.id}
                    onClick={() => {
                      onSelectFramework?.(fw.id);
                      onNavigateTab('controls');
                    }}
                    className="p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer group"
                    title={`Filter controls to ${fw.name}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          {fw.name}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {fw.version}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white tabular-nums">
                        {fw.readinessPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${
                          isPassing ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${fw.readinessPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{fw.passingControls} / {fw.totalControls} Controls</span>
                      <span className="text-emerald-400 font-medium">
                        {fw.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Autonomous GRC 3.0 & GitOps Strip */}
          <div className="obsidian-card p-5 sm:p-6 space-y-3.5 text-white border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white font-display">
                  Autonomous GRC 3.0 &amp; GitOps Infrastructure
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800">
                6 Active Engines
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => onNavigateTab('remediation-code')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors group"
              >
                <div className="text-cyan-400 mb-1.5">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Auto-Remediation
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  GitOps Terraform PRs
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('predictive-audit')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors group"
              >
                <div className="text-emerald-400 mb-1.5">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Audit Simulator
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Monte Carlo PBC Test
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('zk-sandbox')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-colors group"
              >
                <div className="text-amber-400 mb-1.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                  ZK Proofs
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Zero-Knowledge Proof
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('shadow-ai')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left transition-colors group"
              >
                <div className="text-purple-400 mb-1.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Shadow-AI &amp; DLP
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  LLM Prompt Governance
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('vulnerabilities')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 text-left transition-colors group"
              >
                <div className="text-rose-400 mb-1.5">
                  <Bug className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors">
                  CVE Triage Hub
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Snyk &amp; Wiz Sync
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('auditor-marketplace')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-left transition-colors group"
              >
                <div className="text-blue-400 mb-1.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Auditor Network
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Schellman, A-LIGN
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Executive Assurance & WORM Vault (Width 4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* CPA Auditor Observation Card */}
          <div className="executive-card p-5 space-y-3.5 bg-amber-950/30 border-amber-800/60 text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>CPA Auditor Live Portal</span>
              </span>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-800">
                Schellman &amp; Co.
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-white">
                SOC 2 Type II Observation Period
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Lead Auditor Marcus Vance has requested 18 PBC control evidence samples.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sample Request Fulfillment</span>
                <span className="font-mono font-bold text-white">14 / 18 Delivered</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('auditor')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md font-sans"
            >
              <span>Manage Auditor PBC Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Third-Party Vendor Risk Radar */}
          <div className="executive-card p-5 space-y-3.5 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Vendor Risk (TPRM)</span>
              </h3>
              <button
                onClick={() => onNavigateTab('vendors')}
                className="text-[11px] font-semibold text-cyan-400 hover:underline font-sans"
              >
                View all ({vendors.length})
              </button>
            </div>

            <div className="space-y-2">
              {vendors.slice(0, 3).map((v) => (
                <div
                  key={v.id}
                  onClick={() => onNavigateTab('vendors')}
                  className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs text-white truncate">
                      {v.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">
                      {v.category} · Tier {v.tier}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                      v.riskRating === 'Low'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : v.riskRating === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {v.riskRating} Risk
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('questionnaires')}
              className="w-full py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-center gap-1 font-sans"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Questionnaire Responder (2 Pending)</span>
            </button>
          </div>

          {/* Real-time Regulatory News Widget */}
          <div className="executive-card p-5 space-y-3 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                Regulatory Radar &amp; Compliance News
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 live-radar-dot" title="Live Google Grounded Feed" />
            </div>

            <RegulatoryNewsWidget onNavigateTab={onNavigateTab} />
          </div>

          {/* Cryptographic Proof & WORM Vault Seal */}
          <div
            onClick={() => setIsProofModalOpen(true)}
            className="obsidian-card p-4 text-white hover:border-cyan-400/50 transition-all cursor-pointer space-y-2 text-xs group border border-slate-800"
            title="Inspect Cryptographic Proofs & SHA-256 Hashes"
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <FolderLock className="w-3.5 h-3.5" />
                <span>WORM Evidence Vault</span>
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 text-[10px]">
                LOCKED &amp; VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All 142 continuous test results and auditor signoffs are cryptographically anchored into immutable storage.
            </p>
            <div className="font-mono text-[10px] text-slate-400 truncate pt-1 border-t border-slate-800 flex items-center justify-between">
              <span className="truncate">HASH: e3b0c44298fc1c...</span>
              <span className="text-cyan-400 group-hover:underline shrink-0 ml-2 font-sans font-semibold text-[11px] flex items-center gap-1">
                <span>Verify</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Modal */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="obsidian-card max-w-xl w-full border border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-slate-100">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052CC] to-[#00D2FF] text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
                  AC
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-display">Acme Technologies Corp</h3>
                  <p className="text-xs text-slate-400 font-mono">Production Tenant #9841 · AWS Org master-8920194821</p>
                </div>
              </div>
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1 font-mono">Legal Jurisdiction</span>
                <span className="font-semibold text-white">Acme Technologies Finland Oy</span>
                <span className="text-[11px] text-slate-400 block">Helsinki, Finland (EU)</span>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1 font-mono">CPA Auditor Firm</span>
                <span className="font-semibold text-white">Schellman &amp; Co. LLC</span>
                <span className="text-[11px] text-slate-400 block">Partner: Bradley Campbell, CPA</span>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1 font-mono">Primary Cloud Region</span>
                <span className="font-semibold text-white">eu-central-1 (Frankfurt)</span>
                <span className="text-[11px] text-emerald-400 font-mono block">1,840 Assets Monitored</span>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1 font-mono">Observation Window</span>
                <span className="font-semibold text-white">SOC 2 Type II (Day 48 of 90)</span>
                <span className="text-[11px] text-amber-400 block font-mono">Closing in 42 days</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">Tenant UUID: 7810e-9912a-44021</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsOrgModalOpen(false);
                    onNavigateTab('cloud-discovery');
                  }}
                  className="px-3 py-1.5 rounded-lg text-cyan-300 bg-cyan-950/80 border border-cyan-800 hover:bg-cyan-900 font-semibold transition-colors"
                >
                  Cloud Discovery →
                </button>
                <button
                  onClick={() => {
                    setIsOrgModalOpen(false);
                    onNavigateTab('integrations');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                >
                  Integrations Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic WORM Proof Modal */}
      {isProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="obsidian-card max-w-xl w-full border border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 text-slate-100">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
                  <FolderLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-display">Cryptographic WORM Proof Ledger</h3>
                  <p className="text-xs text-slate-400 font-mono">Immutable Continuous Compliance Audit Chain</p>
                </div>
              </div>
              <button
                onClick={() => setIsProofModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-900 text-white rounded-xl font-mono space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Merkle Root Digest:</span>
                  <span className="text-emerald-400 font-bold">VERIFIED (142 Evidence Hashes)</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-emerald-300 break-all select-all flex items-center justify-between">
                  <span>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
                      setCopiedHash(true);
                      setTimeout(() => setCopiedHash(false), 2000);
                    }}
                    className="ml-2 text-slate-400 hover:text-white p-1"
                    title="Copy Root Hash"
                  >
                    {copiedHash ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Ledger Height: #49,120</span>
                  <span>Timestamp: {new Date().toISOString()}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800 text-emerald-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SEC Rule 17a-4 &amp; SOC 2 Type II Compliant</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                  Evidence captured from AWS, GCP, GitHub, and Okta is stored in Write-Once-Read-Many (WORM) storage. Evidence cannot be overwritten, modified, or backdated.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => {
                  setIsProofModalOpen(false);
                  onNavigateTab('zk-sandbox');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 font-sans"
              >
                <span>Zero-Knowledge Sandbox</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsProofModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsProofModalOpen(false);
                    onNavigateTab('evidence-vault');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm font-sans"
                >
                  <FolderLock className="w-3.5 h-3.5" />
                  <span>Open Evidence Vault</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maturity Modal */}
      {isMaturityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="obsidian-card max-w-2xl w-full border border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-display">
                    Compliance Maturity Score &amp; Weighted Formula
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Continuous cross-framework maturity index algorithm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMaturityModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold font-mono text-white leading-none">
                    {maturityMetrics.weightedScore}
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono">Score</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">
                      Level {maturityMetrics.level}: {maturityMetrics.levelName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-400/30">
                      Tier {maturityMetrics.level}/5
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {maturityMetrics.levelDescription}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Scope</span>
                <span className="text-xs font-semibold text-cyan-300 font-mono">
                  {selectedFramework === 'all' ? 'Unified (8 Frameworks)' : selectedFramework.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Weighted Calculation Engine
              </h4>
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="font-mono text-[11px] text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-bold text-cyan-400">Maturity Score = </span>
                  <span>(Control Impl × 0.35) + (Evidence Coverage × 0.35) + (Test Pass Rate × 0.30)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">1. Control Impl.</span>
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">35%</span>
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {maturityMetrics.controlImplementationRate}%
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {maturityMetrics.implementedControls} of {maturityMetrics.totalScopedControls} controls active.
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">2. Evidence Vault</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">35%</span>
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {maturityMetrics.evidenceCoverageRate}%
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {maturityMetrics.controlsWithEvidence} of {maturityMetrics.totalScopedControls} controls backed by verified files.
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">3. Test Pass Rate</span>
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">30%</span>
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {maturityMetrics.testPassRate}%
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {maturityMetrics.passingScopedTests} of {maturityMetrics.totalScopedTests} continuous checks passing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target: Level 5 (+{(95 - maturityMetrics.weightedScore > 0 ? 95 - maturityMetrics.weightedScore : 0)} pts needed)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaturityModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsMaturityModalOpen(false);
                    onNavigateTab('controls');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#0052CC] to-[#00D2FF] text-slate-950 font-bold flex items-center gap-1.5 shadow-sm font-sans"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                  <span>Optimize Controls</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

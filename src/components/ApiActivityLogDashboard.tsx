import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ApiActivityLog,
  ApiActivityMetrics,
  ApiLogCategory,
  ApiLogStatus,
  ApiServiceProvider,
  HttpMethod,
} from '../types/apiActivity';
import {
  initialApiActivityLogs,
  initialApiActivityMetrics,
  PROBE_TEMPLATES,
} from '../data/mockApiActivityData';
import { useRBAC } from '../context/RbacContext';
import {
  Activity,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
  Code2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  Lock,
  RefreshCw,
  Zap,
  FileText,
  FileCheck2,
  Sparkles,
  X,
  Radio,
  SlidersHorizontal,
  Key,
  Database,
  ArrowUpRight,
  Send,
  Laptop,
} from 'lucide-react';

interface ApiActivityLogDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const ApiActivityLogDashboard: React.FC<ApiActivityLogDashboardProps> = ({
  onNavigateTab,
}) => {
  const { currentRole, currentUser, canPerformAction } = useRBAC();

  const [logs, setLogs] = useState<ApiActivityLog[]>(initialApiActivityLogs);
  const [metrics, setMetrics] = useState<ApiActivityMetrics>(initialApiActivityMetrics);

  // Live polling stream state
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ApiActivityLog | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ApiLogCategory>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | ApiServiceProvider>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ApiLogStatus>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | HttpMethod>('all');
  const [timeWindow, setTimeWindow] = useState<'1h' | '24h' | '7d' | 'audit_window'>('24h');

  // Copy indicator state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Verification modal / toast state
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityVerifiedToast, setIntegrityVerifiedToast] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Simulated live probe trigger state
  const [isProbeMenuOpen, setIsProbeMenuOpen] = useState(false);
  const probeMenuRef = useRef<HTMLDivElement>(null);

  // Outside click for probe menu
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (probeMenuRef.current && !probeMenuRef.current.contains(e.target as Node)) {
        setIsProbeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Simulate automated compliance collector telemetry streaming
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const template = PROBE_TEMPLATES[Math.floor(Math.random() * (PROBE_TEMPLATES.length - 1))];
      const now = new Date();
      const newLogId = `log-api-${Math.floor(100000 + Math.random() * 900000)}`;
      const randomDuration = Math.floor(25 + Math.random() * 95);

      const newEntry: ApiActivityLog = {
        id: newLogId,
        timestamp: now.toISOString(),
        relativeTime: 'Just now',
        category: 'external_request',
        service: template.service,
        action: template.action,
        method: template.method,
        endpoint: template.endpoint,
        statusCode: template.statusCode,
        status: template.status,
        durationMs: randomDuration,
        payloadSizeBytes: template.payloadSizeBytes + Math.floor(Math.random() * 100),
        actor: {
          name: 'SuomiGRC Continuous Collector',
          email: 'collector-eu-west1@suomigrc.internal',
          role: 'system_daemon',
          ipAddress: '194.136.12.8',
          userAgent: 'SuomiGRC-Agent/3.4 (Cloud-Probe)',
          isSystemDaemon: true,
        },
        requestHeaders: {
          'Host': template.endpoint.split('/')[2] || 'api.cloud.internal',
          'Authorization': 'Bearer [REDACTED_EPHEMERAL_TOKEN]',
          'X-Correlation-ID': `corr-${Math.random().toString(36).substring(2, 9)}`,
          'X-Audit-Purpose': 'Continuous_Controls_Monitoring',
        },
        requestBody: null,
        responseBody: template.responseBody,
        complianceControls: template.complianceControls,
        sha256Hash: Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        previousHash: logs[0]?.sha256Hash || '0000000000000000000000000000000000000000000000000000000000000000',
        correlationId: `corr-${Math.random().toString(36).substring(2, 9)}`,
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
      setMetrics((prev) => ({
        ...prev,
        totalRequests24h: prev.totalRequests24h + 1,
      }));
    }, 9000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, logs]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTriggerProbe = (template: (typeof PROBE_TEMPLATES)[0]) => {
    setIsProbeMenuOpen(false);
    const now = new Date();
    const newLogId = `log-api-${Math.floor(100000 + Math.random() * 900000)}`;

    const newEntry: ApiActivityLog = {
      id: newLogId,
      timestamp: now.toISOString(),
      relativeTime: 'Just now',
      category: template.status === 'error' ? 'external_request' : 'internal_action',
      service: template.service,
      action: template.action,
      method: template.method,
      endpoint: template.endpoint,
      statusCode: template.statusCode,
      status: template.status,
      durationMs: template.durationMs,
      payloadSizeBytes: template.payloadSizeBytes,
      actor: {
        name: currentUser.name,
        email: currentUser.email,
        role: currentRole,
        ipAddress: '194.136.12.44',
        userAgent: navigator.userAgent || 'Mozilla/5.0 (Client)',
        isSystemDaemon: false,
      },
      requestHeaders: {
        'Host': template.endpoint.split('/')[2] || 'api.cloud.internal',
        'Authorization': 'Bearer [USER_AUTHENTICATED_SESSION]',
        'X-RBAC-Role': currentRole,
        'X-Correlation-ID': `corr-${Math.random().toString(36).substring(2, 9)}`,
      },
      requestBody: {
        probeTriggeredBy: currentUser.email,
        probeTitle: template.title,
        timestamp: now.toISOString(),
      },
      responseBody: template.responseBody,
      complianceControls: template.complianceControls,
      sha256Hash: Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      previousHash: logs[0]?.sha256Hash || '0000000000000000000000000000000000000000000000000000000000000000',
      correlationId: `corr-${Math.random().toString(36).substring(2, 9)}`,
    };

    setLogs((prev) => [newEntry, ...prev]);
    setSelectedLog(newEntry);
  };

  const handleVerifyLedger = () => {
    setIsVerifyingIntegrity(true);
    setTimeout(() => {
      setIsVerifyingIntegrity(false);
      setIntegrityVerifiedToast(true);
      setTimeout(() => setIntegrityVerifiedToast(false), 4000);
    }, 1200);
  };

  const handleExportAuditLogs = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 1500);
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
      if (serviceFilter !== 'all' && log.service !== serviceFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      if (methodFilter !== 'all' && log.method !== methodFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          log.id.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.endpoint.toLowerCase().includes(q) ||
          log.service.toLowerCase().includes(q) ||
          log.actor.name.toLowerCase().includes(q) ||
          log.actor.email.toLowerCase().includes(q) ||
          log.actor.ipAddress.toLowerCase().includes(q) ||
          log.correlationId.toLowerCase().includes(q) ||
          log.complianceControls.some((c) => c.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      return true;
    });
  }, [logs, categoryFilter, serviceFilter, statusFilter, methodFilter, searchQuery]);

  const getServiceBadge = (service: ApiServiceProvider) => {
    switch (service) {
      case 'AWS':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Google Cloud':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Okta':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'GitHub':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'CrowdStrike':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Datadog':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Slack':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Internal GRC':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (statusCode: number, status: ApiLogStatus) => {
    if (status === 'rate_limited' || statusCode === 429) {
      return {
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        label: `${statusCode} Rate Limited`,
      };
    }
    if (statusCode >= 200 && statusCode < 300) {
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        label: `${statusCode} OK`,
      };
    }
    if (statusCode >= 400 && statusCode < 500) {
      return {
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        label: `${statusCode} Client Err`,
      };
    }
    return {
      bg: 'bg-red-100 text-red-900 border-red-300',
      label: `${statusCode} Server Err`,
    };
  };

  const getCategoryLabel = (cat: ApiLogCategory) => {
    switch (cat) {
      case 'external_request':
        return { label: 'External Probe', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'internal_action':
        return { label: 'User Admin Action', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'webhook_delivery':
        return { label: 'Webhook Alert', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'system_cron':
        return { label: 'System Cron', color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Audit Assurance & Forensic Ledger</span>
            <span aria-hidden="true">·</span>
            <span className="text-blue-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              SOC 2 CC6.8 & CC7.2 Non-Repudiation Verified
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>API Activity Log & Audit Trail</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              RFC 3161 Timestamped
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Immutable, cryptographically chained activity ledger recording all internal administrative actions,
            continuous automated evidence collector probes, and third-party webhook dispatches.
          </p>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Live Polling Stream Toggle */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs ${
              isLiveStreaming
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle simulated real-time compliance telemetry stream"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isLiveStreaming ? 'Live Stream Active' : 'Stream Paused'}</span>
          </button>

          {/* Trigger Live Compliance Probe Popover */}
          <div className="relative" ref={probeMenuRef}>
            <button
              onClick={() => setIsProbeMenuOpen(!isProbeMenuOpen)}
              className="h-9 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Live Probe</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isProbeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-white rounded-xl border border-slate-200 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 text-xs">
                <div className="px-2.5 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100">
                  Execute On-Demand Compliance Probes
                </div>
                <div className="py-1 space-y-1">
                  {PROBE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriggerProbe(tmpl)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2 group"
                    >
                      <Play className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600">
                          {tmpl.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[220px]">
                          {tmpl.action}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Audit Log Package */}
          <button
            onClick={handleExportAuditLogs}
            disabled={isExporting}
            className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Download complete tamper-evident audit package (JSON + CSV + Signatures)"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                <span>Signing Logs...</span>
              </>
            ) : exportComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exported (ZIP)!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Package</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Toast Alert */}
      {integrityVerifiedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Cryptographic Audit Ledger Validated:</strong> All {metrics.totalRequests24h.toLocaleString()} transaction hashes match the SHA-256 Merkle root. Zero tampering or sequence drift detected.
            </span>
          </div>
          <button
            onClick={() => setIntegrityVerifiedToast(false)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards: Audit Ledger Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 24h Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">24h Total Ingest</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {metrics.totalRequests24h.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>28 Active Collector Pipelines</span>
            <span className="text-emerald-600 font-semibold font-mono">100% Ingested</span>
          </div>
        </div>

        {/* Card 2: Success Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">API Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {metrics.successRate}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>{metrics.errorCount24h} Non-200 Events</span>
            <span className="text-slate-400 font-mono">p99: {metrics.p99DurationMs}ms</span>
          </div>
        </div>

        {/* Card 3: Average Latency */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Avg Response Time</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {metrics.avgDurationMs} <span className="text-sm font-sans font-medium text-slate-500">ms</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Payload: ~3.4 MB/min</span>
            <span className="text-blue-600 font-medium">Fast Sync</span>
          </div>
        </div>

        {/* Card 4: Cryptographic Immutability */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-300">
              Audit Chain Integrity
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
            <span>Verified (0 Drift)</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-white/10">
            <span className="truncate">SHA-256 Merkle Anchor</span>
            <button
              onClick={handleVerifyLedger}
              disabled={isVerifyingIntegrity}
              className="text-indigo-300 hover:text-white underline font-semibold shrink-0"
            >
              {isVerifyingIntegrity ? 'Verifying...' : 'Re-verify'}
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Main Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions (e.g. s3.get_bucket_encryption), actors, endpoints, IP, or controls..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear All Filters */}
          {(categoryFilter !== 'all' ||
            serviceFilter !== 'all' ||
            statusFilter !== 'all' ||
            methodFilter !== 'all' ||
            searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setServiceFilter('all');
                setStatusFilter('all');
                setMethodFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 shrink-0 self-center"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="external_request">External Probes (AWS/Okta/GCP)</option>
              <option value="internal_action">Internal User Admin Actions</option>
              <option value="webhook_delivery">Webhook Alert Deliveries</option>
              <option value="system_cron">System Ledger Crons</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service:</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Services</option>
              <option value="AWS">AWS</option>
              <option value="Google Cloud">Google Cloud</option>
              <option value="Okta">Okta</option>
              <option value="GitHub">GitHub</option>
              <option value="CrowdStrike">CrowdStrike</option>
              <option value="Datadog">Datadog</option>
              <option value="Slack">Slack</option>
              <option value="Internal GRC">Internal GRC Platform</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">2xx Success (200, 201)</option>
              <option value="error">4xx/5xx Errors</option>
              <option value="rate_limited">429 Rate Limited</option>
            </select>
          </div>

          {/* Method Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="RPC">RPC</option>
            </select>
          </div>

          {/* Count Badge */}
          <div className="ml-auto text-[11px] text-slate-500 font-mono">
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> entries
          </div>
        </div>
      </div>

      {/* Main Activity Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3">Method & Action</th>
                <th className="py-3 px-3">Actor / Identity</th>
                <th className="py-3 px-3 text-right">Latency</th>
                <th className="py-3 px-3">Controls</th>
                <th className="py-3 px-3.5 text-right">Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const statusBadge = getStatusBadge(log.statusCode, log.status);
                const categoryBadge = getCategoryLabel(log.category);
                const isSelected = selectedLog?.id === log.id;

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-300'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.relativeTime}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" title={log.timestamp}>
                        {log.timestamp.split('T')[1]?.replace('Z', '')}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${statusBadge.bg}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Service Provider */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getServiceBadge(
                          log.service
                        )}`}
                      >
                        {log.service}
                      </span>
                    </td>

                    {/* Method & Action */}
                    <td className="py-3 px-3 min-w-[260px] max-w-[380px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                          {log.method}
                        </span>
                        <span className="font-bold text-slate-900 truncate" title={log.action}>
                          {log.action}
                        </span>
                      </div>
                      <div
                        className="text-[10px] text-slate-500 font-mono truncate mt-0.5"
                        title={log.endpoint}
                      >
                        {log.endpoint}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-3 min-w-[170px] max-w-[220px]">
                      <div className="font-semibold text-slate-900 truncate">
                        {log.actor.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {log.actor.ipAddress} · {log.actor.role}
                      </div>
                    </td>

                    {/* Latency */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900">
                        {log.durationMs}ms
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {(log.payloadSizeBytes / 1024).toFixed(1)} KB
                      </div>
                    </td>

                    {/* Mapped Compliance Controls */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
                        {log.complianceControls.slice(0, 2).map((ctrl, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {ctrl}
                          </span>
                        ))}
                        {log.complianceControls.length > 2 && (
                          <span className="text-[9px] text-slate-400 font-mono">
                            +{log.complianceControls.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Signature Hash */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-600 group-hover:underline">
                        {log.sha256Hash.substring(0, 8)}...
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Activity className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-xs">No activity logs match the selected filters.</p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setServiceFilter('all');
                setStatusFilter('all');
                setMethodFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Deep-Dive Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                    selectedLog.statusCode >= 200 && selectedLog.statusCode < 300
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {selectedLog.statusCode}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-slate-900 text-white">
                      {selectedLog.method}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.2 rounded border ${getServiceBadge(
                        selectedLog.service
                      )}`}
                    >
                      {selectedLog.service}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {selectedLog.id}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1 truncate max-w-xl">
                    {selectedLog.action}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
                    {selectedLog.endpoint}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Core Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Execution Actor
                  </span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {selectedLog.actor.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    {selectedLog.actor.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Source Network / IP
                  </span>
                  <span className="font-mono text-slate-900 font-semibold block mt-0.5">
                    {selectedLog.actor.ipAddress}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    Role: {selectedLog.actor.role}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Latency & Payload Size
                  </span>
                  <span className="font-mono text-slate-900 font-semibold block mt-0.5">
                    {selectedLog.durationMs} ms
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    {selectedLog.payloadSizeBytes} bytes
                  </span>
                </div>
              </div>

              {/* Compliance Controls Mapped */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mapped Compliance Controls</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLog.complianceControls.map((ctrl, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-mono font-medium"
                    >
                      {ctrl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Request Headers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Request Headers
                  </h4>
                  <button
                    onClick={() =>
                      handleCopy(JSON.stringify(selectedLog.requestHeaders, null, 2), 'headers')
                    }
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    {copiedKey === 'headers' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Headers</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36">
                  {Object.entries(selectedLog.requestHeaders).map(([key, val]) => (
                    <div key={key} className="py-0.5">
                      <span className="text-indigo-400">{key}:</span>{' '}
                      <span className="text-slate-300">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Body Payload (if any) */}
              {selectedLog.requestBody && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Request Payload (JSON)
                    </h4>
                    <button
                      onClick={() =>
                        handleCopy(JSON.stringify(selectedLog.requestBody, null, 2), 'req-body')
                      }
                      className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                    >
                      {copiedKey === 'req-body' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-44">
                    {JSON.stringify(selectedLog.requestBody, null, 2)}
                  </pre>
                </div>
              )}

              {/* Response Body Payload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Response Body / Evidence Snapshot
                  </h4>
                  <button
                    onClick={() =>
                      handleCopy(JSON.stringify(selectedLog.responseBody, null, 2), 'res-body')
                    }
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    {copiedKey === 'res-body' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Response</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900 text-blue-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.responseBody, null, 2)}
                </pre>
              </div>

              {/* Cryptographic Ledger Chain Information */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cryptographic Tamper-Proof Audit Signature</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    Chain Verified (SHA-256)
                  </span>
                </div>
                <div className="space-y-1 text-[10px] font-mono text-slate-600">
                  <div className="truncate">
                    <span className="text-slate-400">Current Hash:</span>{' '}
                    <strong className="text-slate-800">{selectedLog.sha256Hash}</strong>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400">Previous Hash:</span>{' '}
                    <span>{selectedLog.previousHash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400">Correlation ID:</span>{' '}
                    <span className="text-blue-700">{selectedLog.correlationId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Timestamp: {selectedLog.timestamp}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

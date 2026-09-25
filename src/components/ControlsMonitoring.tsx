import React, { useState, useEffect, useMemo } from 'react';
import { AutomatedTest, Control, FrameworkId, ControlLifecycleStatus, ControlLifecycleTransition } from '../types/grc';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  Code2,
  AlertTriangle,
  RefreshCw,
  FileCheck2,
  ChevronRight,
  CheckCircle2,
  Bell,
  Send,
  FileEdit,
  Wrench,
  Archive,
  Sliders,
  History,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { RemediationModal } from './RemediationModal';
import { PlatformLogo } from './PlatformLogo';
import { CustomRuleBuilderModal } from './CustomRuleBuilderModal';
import { CustomTestRule } from '../types/grc';
import { Plus, Lock } from 'lucide-react';
import { useRBAC } from '../context/RbacContext';

interface ControlsMonitoringProps {
  tests: AutomatedTest[];
  controls: Control[];
  onUpdateTests: (updatedTests: AutomatedTest[]) => void;
  onUpdateControls: (updatedControls: Control[]) => void;
  selectedFramework: FrameworkId | 'all';
  onNavigateTab?: (tab: string) => void;
  onNavigateToEvidenceVault?: (controlId: string) => void;
  onTriggerWebhookAlert?: (test: AutomatedTest) => void;
  initialSubTab?: 'tests' | 'controls';
  initialSearchQuery?: string;
  initialSelectedTest?: AutomatedTest | null;
}

export const ControlsMonitoring: React.FC<ControlsMonitoringProps> = ({
  tests,
  controls,
  onUpdateTests,
  onUpdateControls,
  selectedFramework,
  onNavigateTab,
  onNavigateToEvidenceVault,
  onTriggerWebhookAlert,
  initialSubTab = 'tests',
  initialSearchQuery = '',
  initialSelectedTest = null,
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'controls'>(initialSubTab);
  const [statusFilter, setStatusFilter] = useState<'all' | 'failing' | 'passing'>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<'all' | ControlLifecycleStatus>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedTest, setSelectedTest] = useState<AutomatedTest | null>(initialSelectedTest);
  const [isBulkTesting, setIsBulkTesting] = useState(false);
  const [isCustomRuleModalOpen, setIsCustomRuleModalOpen] = useState(false);

  // Control Lifecycle State
  const [selectedControlForLifecycle, setSelectedControlForLifecycle] = useState<Control | null>(null);
  const [newLifecycleTarget, setNewLifecycleTarget] = useState<ControlLifecycleStatus>('Monitoring');
  const [newLifecycleReason, setNewLifecycleReason] = useState<string>('');
  const [lifecycleToast, setLifecycleToast] = useState<string | null>(null);

  // RBAC permissions checks
  const { canPerformAction, currentRole, currentUser, isAuditor } = useRBAC();
  const canCreateTest = canPerformAction('action:create_test');
  const canRunTest = canPerformAction('action:run_test');
  const canRemediate = canPerformAction('action:remediate');

  const handleSaveCustomRule = (_newRule: CustomTestRule, generatedTest: AutomatedTest) => {
    onUpdateTests([generatedTest, ...tests]);
  };

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialSelectedTest !== undefined) setSelectedTest(initialSelectedTest);
  }, [initialSelectedTest]);

  // Filter tests
  const filteredTests = tests.filter((t) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'failing' && t.status === 'failing') ||
      (statusFilter === 'passing' && t.status === 'passing');

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.integrationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.satisfiedControls.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFramework =
      selectedFramework === 'all' ||
      controls.some(
        (ctrl) =>
          t.satisfiedControls.includes(ctrl.id) &&
          ctrl.frameworkMappings.some((m) => m.frameworkId === selectedFramework)
      );

    return matchesStatus && matchesSearch && matchesFramework;
  });

  // Lifecycle Counts
  const lifecycleCounts = useMemo(() => {
    return {
      all: controls.length,
      Monitoring: controls.filter((c) => (c.lifecycleStatus || 'Monitoring') === 'Monitoring').length,
      Implementation: controls.filter((c) => (c.lifecycleStatus || 'Monitoring') === 'Implementation').length,
      Draft: controls.filter((c) => (c.lifecycleStatus || 'Monitoring') === 'Draft').length,
      Retired: controls.filter((c) => (c.lifecycleStatus || 'Monitoring') === 'Retired').length,
    };
  }, [controls]);

  // Filter controls
  const filteredControls = controls.filter((c) => {
    const currentLifecycle = c.lifecycleStatus || 'Monitoring';
    const matchesLifecycle =
      lifecycleFilter === 'all' || currentLifecycle === lifecycleFilter;

    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currentLifecycle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lifecycleNotes && c.lifecycleNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFramework =
      selectedFramework === 'all' ||
      c.frameworkMappings.some((m) => m.frameworkId === selectedFramework);

    return matchesLifecycle && matchesSearch && matchesFramework;
  });

  // Handle Control Lifecycle State Transition
  const handleTransitionControlLifecycle = (
    controlId: string,
    targetStatus: ControlLifecycleStatus,
    reason?: string
  ) => {
    const actorName = `${currentUser.name} (${currentUser.title || currentRole})`;
    const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

    const updatedControls = controls.map((c) => {
      if (c.id === controlId) {
        const fromStatus = c.lifecycleStatus || 'Monitoring';
        const newTransition: ControlLifecycleTransition = {
          from: fromStatus,
          to: targetStatus,
          timestamp: nowTimestamp,
          changedBy: actorName,
          reason: reason ? reason.trim() : `Transitioned control stage from ${fromStatus} to ${targetStatus}`,
        };

        const updatedHistory = [...(c.lifecycleHistory || []), newTransition];

        return {
          ...c,
          lifecycleStatus: targetStatus,
          lifecycleNotes: reason && reason.trim() ? reason.trim() : c.lifecycleNotes,
          lifecycleHistory: updatedHistory,
        };
      }
      return c;
    });

    onUpdateControls(updatedControls);

    if (selectedControlForLifecycle && selectedControlForLifecycle.id === controlId) {
      const updatedItem = updatedControls.find((c) => c.id === controlId);
      if (updatedItem) setSelectedControlForLifecycle(updatedItem);
    }

    setLifecycleToast(`✓ Control ${controlId} lifecycle updated: Moved to "${targetStatus}".`);
    setTimeout(() => setLifecycleToast(null), 3500);
  };

  // Visual Lifecycle Badge Indicator Component
  const renderLifecycleBadge = (
    status?: ControlLifecycleStatus,
    isInteractive = false,
    onClick?: () => void
  ) => {
    const currentStatus = status || 'Monitoring';

    let badgeClass = '';
    let dotClass = '';
    let icon = null;
    let label = currentStatus;

    switch (currentStatus) {
      case 'Draft':
        badgeClass = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
        dotClass = 'bg-amber-500';
        icon = <FileEdit className="w-3 h-3 text-amber-600" />;
        break;
      case 'Implementation':
        badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
        dotClass = 'bg-indigo-500 animate-pulse';
        icon = <Wrench className="w-3 h-3 text-indigo-600" />;
        break;
      case 'Monitoring':
        badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
        dotClass = 'bg-emerald-500';
        icon = <ShieldCheck className="w-3 h-3 text-emerald-600" />;
        break;
      case 'Retired':
        badgeClass = 'bg-zinc-100 text-zinc-600 border-zinc-300 hover:bg-zinc-200';
        dotClass = 'bg-zinc-400';
        icon = <Archive className="w-3 h-3 text-zinc-500" />;
        break;
    }

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!isInteractive}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold border transition-all text-left ${badgeClass} ${
          isInteractive ? 'cursor-pointer hover:shadow-2xs active:scale-95' : 'cursor-default'
        }`}
        title={`Control Lifecycle Status: ${currentStatus}. Click to inspect or transition stage.`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  // Single test remediation / pass
  const handlePassSingleTest = (testId: string) => {
    const updatedTests = tests.map((t) =>
      t.id === testId
        ? {
            ...t,
            status: 'passing' as const,
            failingResources: [],
            lastRunAt: 'Just now',
          }
        : t
    );
    onUpdateTests(updatedTests);

    // Update corresponding control status
    const updatedControls = controls.map((c) => {
      if (c.automatedTestIds.includes(testId)) {
        const otherTestsForControl = updatedTests.filter((t) => c.automatedTestIds.includes(t.id));
        const allPass = otherTestsForControl.every((t) => t.status === 'passing');
        return {
          ...c,
          status: allPass ? ('automated_passing' as const) : ('automated_failing' as const),
          lastAudited: 'Just now',
        };
      }
      return c;
    });
    onUpdateControls(updatedControls);
  };

  // Bulk run all tests
  const handleRunAllTests = () => {
    setIsBulkTesting(true);
    setTimeout(() => {
      const updatedTests = tests.map((t) => ({
        ...t,
        lastRunAt: 'Just now',
      }));
      onUpdateTests(updatedTests);
      setIsBulkTesting(false);
    }, 1500);
  };

  const failingCount = tests.filter((t) => t.status === 'failing').length;
  const passingCount = tests.filter((t) => t.status === 'passing').length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Continuous Controls Assurance</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Multi-Cloud Validation</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Controls & Automated Tests</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            SuomiGRC tests technical configurations every 5 minutes across connected APIs to keep your audits continuously clean.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('webhooks')}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              title="Configure Slack & Microsoft Teams Webhooks"
            >
              <Bell className="w-3.5 h-3.5 text-[#5B45E0]" />
              <span className="hidden sm:inline">Webhooks:</span>
              <span>Slack & Teams</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          {canCreateTest ? (
            <button
              onClick={() => setIsCustomRuleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#5B45E0]" />
              <span>Create Custom Test</span>
            </button>
          ) : (
            <button
              disabled
              title="Restricted: Requires CISO or Compliance Analyst role"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed opacity-60"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Create Custom Test</span>
            </button>
          )}

          {canRunTest ? (
            <button
              onClick={handleRunAllTests}
              disabled={isBulkTesting}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${isBulkTesting ? 'animate-spin' : ''}`} />
              <span>{isBulkTesting ? 'Scanning Telemetry...' : 'Trigger Full Re-Scan'}</span>
            </button>
          ) : (
            <button
              disabled
              title="Restricted: Auditor role is read-only"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed opacity-60"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Scanning (Locked)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Switch between Tests and Unified Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'tests'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Automated Tests ({tests.length})
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'controls'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unified Controls Catalog ({controls.length})
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'tests' ? (
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All ({tests.length})
              </button>
              <button
                onClick={() => setStatusFilter('failing')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'failing'
                    ? 'bg-red-600 text-white'
                    : 'text-red-700 hover:bg-red-50'
                }`}
              >
                Failing ({failingCount})
              </button>
              <button
                onClick={() => setStatusFilter('passing')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'passing'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Passing ({passingCount})
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 mr-0.5 uppercase tracking-wider hidden sm:inline">
                Lifecycle:
              </span>
              <button
                onClick={() => setLifecycleFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  lifecycleFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All ({controls.length})
              </button>
              <button
                onClick={() => setLifecycleFilter('Monitoring')}
                className={`px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                  lifecycleFilter === 'Monitoring'
                    ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Monitoring ({lifecycleCounts.Monitoring})</span>
              </button>
              <button
                onClick={() => setLifecycleFilter('Implementation')}
                className={`px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                  lifecycleFilter === 'Implementation'
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Implementation ({lifecycleCounts.Implementation})</span>
              </button>
              <button
                onClick={() => setLifecycleFilter('Draft')}
                className={`px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                  lifecycleFilter === 'Draft'
                    ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Draft ({lifecycleCounts.Draft})</span>
              </button>
              <button
                onClick={() => setLifecycleFilter('Retired')}
                className={`px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                  lifecycleFilter === 'Retired'
                    ? 'bg-zinc-700 text-white shadow-2xs font-semibold'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span>Retired ({lifecycleCounts.Retired})</span>
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'tests' ? 'Search tests, resources...' : 'Search control codes...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Automated Tests Table */}
      {activeTab === 'tests' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Status & Severity</th>
                  <th className="py-3 px-4">Automated Test Name</th>
                  <th className="py-3 px-4">Integration Source</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Failing Assets</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => {
                  const isFailing = test.status === 'failing';
                  return (
                    <tr
                      key={test.id}
                      onClick={() => setSelectedTest(test)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Status & Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isFailing ? (
                            <span className="flex items-center gap-1 font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              Failing
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Passing
                            </span>
                          )}
                          <span
                            className={`uppercase text-[10px] font-mono font-semibold ${
                              test.severity === 'critical'
                                ? 'text-red-700'
                                : test.severity === 'high'
                                ? 'text-amber-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {test.severity}
                          </span>
                        </div>
                      </td>

                      {/* Test Title & Description */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 group-hover:text-[#5B45E0] transition-colors">
                          {test.title}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate mt-0.5">
                          {test.description}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {test.satisfiedControls.map((c) => (
                            <span
                              key={c}
                              className="font-mono text-[10px] text-[#5B45E0] bg-indigo-50/80 px-1.5 py-0.2 rounded border border-indigo-100 font-semibold"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Integration Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-0.5 bg-slate-50 border border-slate-200/80 rounded-md shrink-0">
                            <PlatformLogo platformId={test.integrationId} name={test.integrationName} size="xs" />
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 block">{test.integrationName}</span>
                            <span className="text-[11px] text-slate-400 block">{test.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Frequency & Last run */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        <div>{test.frequency}</div>
                        <div className="text-slate-400 text-[10px]">{test.lastRunAt}</div>
                      </td>

                      {/* Failing Assets */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {test.failingResources.length > 0 ? (
                          <span className="font-semibold text-red-600 font-mono tabular-nums bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                            {test.failingResources.length} non-compliant
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-mono text-[11px]">0 failing</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isFailing && onTriggerWebhookAlert && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTriggerWebhookAlert(test);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                              title="Send real-time alert to Slack & Microsoft Teams"
                            >
                              <Bell className="w-3 h-3 text-rose-600" />
                              <span className="hidden sm:inline">Alert Webhooks</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTest(test);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#5B45E0] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
                          >
                            {isFailing ? 'Remediate' : 'View Code'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Control Lifecycle Tracking Overview Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Sliders className="w-3.5 h-3.5" />
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 font-display">
                    Control Lifecycle &amp; Governance Progression
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    Continuous Audit Pipeline
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl">
                  Controls transition across four standardized lifecycle phases from initial regulatory scoping to active automated telemetry and eventual retirement.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Total Governed: {controls.length} Controls</span>
              </div>
            </div>

            {/* 4 Pipeline Stage Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
              {/* Draft */}
              <div
                onClick={() => setLifecycleFilter(lifecycleFilter === 'Draft' ? 'all' : 'Draft')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  lifecycleFilter === 'Draft'
                    ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileEdit className="w-3.5 h-3.5 text-amber-600" />
                    <span>1. Draft</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-800">
                    {lifecycleCounts.Draft}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Initial scoping, threat modeling, and control wording definition.
                </p>
              </div>

              {/* Implementation */}
              <div
                onClick={() => setLifecycleFilter(lifecycleFilter === 'Implementation' ? 'all' : 'Implementation')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  lifecycleFilter === 'Implementation'
                    ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                    <span>2. Implementation</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-indigo-800">
                    {lifecycleCounts.Implementation}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Engineering rollout, policy enforcement, and infrastructure setup.
                </p>
              </div>

              {/* Monitoring */}
              <div
                onClick={() => setLifecycleFilter(lifecycleFilter === 'Monitoring' ? 'all' : 'Monitoring')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  lifecycleFilter === 'Monitoring'
                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. Monitoring</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-800">
                    {lifecycleCounts.Monitoring}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  In production with live automated telemetry and continuous testing.
                </p>
              </div>

              {/* Retired */}
              <div
                onClick={() => setLifecycleFilter(lifecycleFilter === 'Retired' ? 'all' : 'Retired')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  lifecycleFilter === 'Retired'
                    ? 'bg-zinc-100 border-zinc-300 ring-1 ring-zinc-400 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Archive className="w-3.5 h-3.5 text-zinc-500" />
                    <span>4. Retired</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-zinc-700">
                    {lifecycleCounts.Retired}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Decommissioned or superseded by modernized cloud architecture.
                </p>
              </div>
            </div>
          </div>

          {/* Unified Controls Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Control Code</th>
                    <th className="py-3 px-4">Control Name &amp; Domain</th>
                    <th className="py-3 px-4">Lifecycle Stage</th>
                    <th className="py-3 px-4">Automated Status</th>
                    <th className="py-3 px-4">Cross-Framework Deduplication</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4 text-right">Evidence Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredControls.map((ctrl) => {
                    const isPassing = ctrl.status === 'automated_passing';
                    return (
                      <tr key={ctrl.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Control Code */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {ctrl.code}
                          </span>
                        </td>

                        {/* Control Name & Domain */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900">{ctrl.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ctrl.description}</div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase font-medium tracking-wider">
                            Domain: {ctrl.domain}
                          </div>
                        </td>

                        {/* Lifecycle Stage with Visual Badge Indicator */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            {renderLifecycleBadge(ctrl.lifecycleStatus, true, () => {
                              setSelectedControlForLifecycle(ctrl);
                              setNewLifecycleTarget(ctrl.lifecycleStatus || 'Monitoring');
                              setNewLifecycleReason('');
                            })}
                            {ctrl.lifecycleNotes && (
                              <span
                                className="text-[10px] text-slate-500 max-w-[200px] truncate"
                                title={ctrl.lifecycleNotes}
                              >
                                {ctrl.lifecycleNotes}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setSelectedControlForLifecycle(ctrl);
                                setNewLifecycleTarget(ctrl.lifecycleStatus || 'Monitoring');
                                setNewLifecycleReason('');
                              }}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                            >
                              <Sliders className="w-2.5 h-2.5" />
                              <span>Transition Stage</span>
                            </button>
                          </div>
                        </td>

                        {/* Automated Verification Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {ctrl.lifecycleStatus === 'Draft' ? (
                            <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] w-fit">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Pre-Implementation Scoping
                            </span>
                          ) : ctrl.lifecycleStatus === 'Retired' ? (
                            <span className="flex items-center gap-1 font-semibold text-zinc-600 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded-full text-[11px] w-fit">
                              <Archive className="w-3.5 h-3.5 text-zinc-500" />
                              Archived (Inactive)
                            </span>
                          ) : isPassing ? (
                            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Continuously Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[11px] w-fit">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              Remediation Needed
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Audited: {ctrl.lastAudited}
                          </span>
                        </td>

                        {/* Framework Mappings */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {ctrl.frameworkMappings.map((m, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200"
                                title={`${m.requirementCode}: ${m.requirementTitle}`}
                              >
                                <span className="font-semibold uppercase text-slate-900">{m.frameworkId}</span>: {m.requirementCode}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                          {ctrl.owner}
                        </td>

                        {/* Evidence */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (onNavigateToEvidenceVault) {
                                onNavigateToEvidenceVault(ctrl.id);
                              } else if (onNavigateTab) {
                                onNavigateTab('evidence-vault');
                              }
                            }}
                            className="font-mono tabular-nums font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded text-[11px] transition-colors inline-flex items-center gap-1 group/btn"
                            title={`View ${ctrl.evidenceCount} evidence artifacts for ${ctrl.code} in Evidence Vault`}
                          >
                            <span>{ctrl.evidenceCount} artifacts</span>
                            <ChevronRight className="w-3 h-3 text-blue-500 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Control Lifecycle Transition & Audit History Modal */}
      {selectedControlForLifecycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {selectedControlForLifecycle.code}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 font-display">
                    Control Lifecycle &amp; Governance Pipeline
                  </h3>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedControlForLifecycle.name}
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Domain: {selectedControlForLifecycle.domain} · Owner: {selectedControlForLifecycle.owner}
                </div>
              </div>

              <button
                onClick={() => setSelectedControlForLifecycle(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual 4-Stage Stepper Pipeline */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Current Lifecycle Progression</span>
                </span>
                <div>{renderLifecycleBadge(selectedControlForLifecycle.lifecycleStatus)}</div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
                {(['Draft', 'Implementation', 'Monitoring', 'Retired'] as ControlLifecycleStatus[]).map((stage, idx) => {
                  const current = selectedControlForLifecycle.lifecycleStatus || 'Monitoring';
                  const stages: ControlLifecycleStatus[] = ['Draft', 'Implementation', 'Monitoring', 'Retired'];
                  const currentIndex = stages.indexOf(current);
                  const isCurrent = current === stage;
                  const isPast = currentIndex > idx && current !== 'Retired';

                  return (
                    <div
                      key={stage}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                        isCurrent
                          ? stage === 'Draft'
                            ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-300'
                            : stage === 'Implementation'
                            ? 'bg-indigo-100/80 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-300'
                            : stage === 'Monitoring'
                            ? 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-300'
                            : 'bg-zinc-200 border-zinc-400 text-zinc-900 font-bold ring-2 ring-zinc-300'
                          : isPast
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Step {idx + 1}
                      </span>
                      <span className="text-xs font-bold">{stage}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/80 font-bold mt-0.5">
                          Active Stage
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          Done
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Transition Control Form */}
            <div className="space-y-3 p-4 bg-purple-50/50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Transition Stage</span>
                </span>
                {isAuditor && (
                  <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                    Read-only (Auditor Role)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Draft', 'Implementation', 'Monitoring', 'Retired'] as ControlLifecycleStatus[]).map((stage) => {
                  const isSelected = newLifecycleTarget === stage;
                  return (
                    <button
                      key={stage}
                      type="button"
                      disabled={isAuditor}
                      onClick={() => setNewLifecycleTarget(stage)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs ring-2 ring-purple-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      } ${isAuditor ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {stage}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Transition Justification &amp; Audit Notes:
                </label>
                <textarea
                  value={newLifecycleReason}
                  onChange={(e) => setNewLifecycleReason(e.target.value)}
                  disabled={isAuditor}
                  rows={2}
                  placeholder="Provide audit rationale (e.g. Branch protection rules verified on 48 GitHub repos; promoting to Monitoring)..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isAuditor || newLifecycleTarget === selectedControlForLifecycle.lifecycleStatus}
                  onClick={() => {
                    handleTransitionControlLifecycle(
                      selectedControlForLifecycle.id,
                      newLifecycleTarget,
                      newLifecycleReason
                    );
                  }}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Transition to {newLifecycleTarget}</span>
                </button>
              </div>
            </div>

            {/* Historical Audit Trail / Transition Log */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Lifecycle Audit Trail ({selectedControlForLifecycle.lifecycleHistory?.length || 0} transitions)</span>
              </span>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedControlForLifecycle.lifecycleHistory && selectedControlForLifecycle.lifecycleHistory.length > 0 ? (
                  selectedControlForLifecycle.lifecycleHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">
                            {item.from}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                            {item.to}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-semibold text-slate-800 text-[11px]">{item.changedBy}</span>
                        </div>
                        {item.reason && (
                          <p className="text-[11px] text-slate-600 italic">"{item.reason}"</p>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0 self-start sm:self-center">
                        {item.timestamp}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-400 text-xs italic text-center">
                    Initial control record created in production monitoring state.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                SuomiGRC Control Lifecycle Engine · ISO 27001 &amp; SOC 2 CC2.1
              </span>
              <button
                onClick={() => setSelectedControlForLifecycle(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Lifecycle Toast Notification */}
      {lifecycleToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium">{lifecycleToast}</span>
          <button onClick={() => setLifecycleToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Remediation Modal */}
      {selectedTest && (
        <RemediationModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
          onRunTest={handlePassSingleTest}
        />
      )}

      {/* Custom Test Rule Builder Modal */}
      {isCustomRuleModalOpen && (
        <CustomRuleBuilderModal
          controls={controls}
          onSaveRule={handleSaveCustomRule}
          onClose={() => setIsCustomRuleModalOpen(false)}
        />
      )}
    </div>
  );
};

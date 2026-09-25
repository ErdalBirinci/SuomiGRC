import React, { useState } from 'react';
import { Integration, IntegrationCategory, FrameworkId } from '../types/grc';
import { PlatformLogo } from './PlatformLogo';
import {
  Search,
  RefreshCw,
  Plus,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  ArrowRight,
  X,
} from 'lucide-react';

interface IntegrationsHubProps {
  integrations: Integration[];
  onUpdateIntegrations: (newIntegrations: Integration[]) => void;
  selectedFramework: FrameworkId | 'all';
}

const categoryLabels: Record<IntegrationCategory, string> = {
  cloud: 'Cloud Infrastructure',
  idp: 'Identity & Access (IdP)',
  vcs: 'Version Control (VCS)',
  mdm: 'Endpoint & MDM',
  security: 'Security & SIEM',
  ticketing: 'Ticketing & Workplace',
};

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  integrations,
  onUpdateIntegrations,
  selectedFramework,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connectModalIntegration, setConnectModalIntegration] = useState<Integration | null>(null);

  // Form states for connect modal
  const [authStep, setAuthStep] = useState<1 | 2 | 3>(1);
  const [credentialInput, setCredentialInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Filter integrations
  const filteredIntegrations = integrations.filter((integ) => {
    const matchesCategory = selectedCategory === 'all' || integ.category === selectedCategory;
    const matchesSearch =
      integ.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integ.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integ.accountScope.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFramework =
      selectedFramework === 'all' || integ.supportedFrameworks.includes(selectedFramework);
    return matchesCategory && matchesSearch && matchesFramework;
  });

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      onUpdateIntegrations(
        integrations.map((item) =>
          item.id === id
            ? {
                ...item,
                lastSyncedAt: 'Just now',
                passingTestsCount: item.totalTestsCount, // simulates resolving tests
                status: 'connected',
              }
            : item
        )
      );
      setSyncingId(null);
    }, 1500);
  };

  const handleOpenConnect = (integ: Integration) => {
    setConnectModalIntegration(integ);
    setAuthStep(1);
    setCredentialInput(
      integ.authType === 'IAM Role'
        ? 'arn:aws:iam::8920194821:role/SuomiGRCAuditRole'
        : integ.authType === 'API Token'
        ? 'suomi_sec_live_99a8b8120e...'
        : 'https://auth.provider.com/oauth/authorize'
    );
  };

  const handleCompleteConnection = () => {
    if (!connectModalIntegration) return;
    setIsVerifying(true);
    setTimeout(() => {
      onUpdateIntegrations(
        integrations.map((item) =>
          item.id === connectModalIntegration.id
            ? {
                ...item,
                status: 'connected',
                lastSyncedAt: 'Just now',
                passingTestsCount: item.totalTestsCount,
                accountScope: credentialInput || 'Verified Enterprise Production Scope',
              }
            : item
        )
      );
      setIsVerifying(false);
      setAuthStep(3);
      setTimeout(() => {
        setConnectModalIntegration(null);
      }, 1200);
    }, 1800);
  };

  const handleDisconnect = (id: string) => {
    onUpdateIntegrations(
      integrations.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'disconnected',
              lastSyncedAt: 'Disconnected',
              passingTestsCount: 0,
            }
          : item
      )
    );
    setConnectModalIntegration(null);
  };

  // Connected stats
  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const actionRequiredCount = integrations.filter((i) => i.status === 'action_required').length;
  const totalMonitoredResources = integrations.reduce((acc, curr) => acc + curr.monitoredResourcesCount, 0);

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Platform Connectivity Hub</span>
            <span aria-hidden="true">·</span>
            <span>Continuous API & Agent Telemetry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Connected Platforms & Scanners</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            SuomiGRC integrates natively with your cloud, identity, code, and device fleets to stream automated evidence 24/7.
          </p>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-2xs">
            <span className="text-slate-500 block">Connected Platforms</span>
            <span className="font-semibold text-slate-900 text-sm font-mono tabular-nums">
              {connectedCount} <span className="text-xs text-slate-400 font-normal">/ {integrations.length}</span>
            </span>
          </div>
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-2xs">
            <span className="text-slate-500 block">Monitored Cloud Assets</span>
            <span className="font-semibold text-slate-900 text-sm font-mono tabular-nums">
              {totalMonitoredResources.toLocaleString()}
            </span>
          </div>
          {actionRequiredCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-lg">
              <span className="text-amber-700 block">Action Needed</span>
              <span className="font-semibold text-amber-900 text-sm font-mono tabular-nums">
                {actionRequiredCount} platforms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Platforms ({integrations.length})
          </button>
          {Object.entries(categoryLabels).map(([catKey, label]) => {
            const count = integrations.filter((i) => i.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === catKey
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter integrations, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integ) => {
          const isSyncing = syncingId === integ.id;
          const passingRate =
            integ.totalTestsCount > 0
              ? Math.round((integ.passingTestsCount / integ.totalTestsCount) * 100)
              : 0;

          return (
            <div
              key={integ.id}
              className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between p-5 hover:shadow-md ${
                integ.status === 'action_required'
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : integ.status === 'connected'
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-dashed border-slate-300 bg-slate-50/50'
              }`}
            >
              <div>
                {/* Card Top: Icon & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-1 bg-white border border-slate-200/90 rounded-xl shadow-2xs shrink-0 flex items-center justify-center">
                    <PlatformLogo platformId={integ.id} name={integ.name} size="md" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {integ.status === 'connected' && (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                    )}
                    {integ.status === 'action_required' && (
                      <span className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Action Needed
                      </span>
                    )}
                    {integ.status === 'disconnected' && (
                      <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                        Not Connected
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & Description */}
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{integ.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {integ.description}
                </p>

                {/* Account Scope */}
                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] font-mono text-slate-600 truncate">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">Scope</span>
                  {integ.accountScope}
                </div>

                {/* Test Passing Bar (if connected) */}
                {integ.status !== 'disconnected' && (
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Passing Automated Tests</span>
                      <span className="font-semibold text-slate-800 font-mono tabular-nums">
                        {integ.passingTestsCount} / {integ.totalTestsCount} ({passingRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          passingRate === 100
                            ? 'bg-emerald-500'
                            : passingRate >= 70
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${passingRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Sync & Connect actions */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-400 text-[11px]">
                  {integ.status !== 'disconnected' ? `Synced ${integ.lastSyncedAt}` : 'Ready to connect'}
                </div>

                <div className="flex items-center gap-2">
                  {integ.status !== 'disconnected' ? (
                    <>
                      <button
                        onClick={() => handleSync(integ.id)}
                        disabled={isSyncing}
                        title="Trigger immediate re-scan"
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleOpenConnect(integ)}
                        className="px-2.5 py-1 text-slate-700 hover:text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                      >
                        Manage
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenConnect(integ)}
                      className="flex items-center gap-1 px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-md shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {connectModalIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white border border-slate-200 rounded-xl shadow-2xs shrink-0 flex items-center justify-center">
                  <PlatformLogo platformId={connectModalIntegration.id} name={connectModalIntegration.name} size="md" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Connect {connectModalIntegration.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Auth Method: {connectModalIntegration.authType} · Continuous Security Scanning
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConnectModalIntegration(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-sm text-slate-700">
              {authStep === 1 && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      Read-Only Audit Credentials Policy
                    </p>
                    SuomiGRC requires strictly read-only metadata permissions to inspect cloud configurations and evidence logs. We never inspect customer database contents or private keys.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      {connectModalIntegration.authType === 'IAM Role'
                        ? 'AWS IAM Role ARN (with External ID)'
                        : connectModalIntegration.authType === 'API Token'
                        ? 'Read-Only Scoped API Token'
                        : 'OAuth 2.0 Organization Identifier'}
                    </label>
                    <input
                      type="text"
                      value={credentialInput}
                      onChange={(e) => setCredentialInput(e.target.value)}
                      placeholder="e.g. arn:aws:iam::123456789012:role/SuomiGRCAuditRole"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Must have permissions to inspect IAM, security groups, audit logs, and compliance telemetry.
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-700">Automated Tests Provided Upon Connection:</div>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Infrastructure encryption and access control verification
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Audit log retention and continuous change monitoring
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Cross-mapped to SOC 2, ISO 27001, and HIPAA criteria
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {authStep === 2 && (
                <div className="text-center py-8 space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <h3 className="font-semibold text-slate-900">Validating API Handshake & Scopes</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Contacting {connectModalIntegration.name} endpoint, verifying cryptographic signatures, and discovering cloud resources...
                  </p>
                </div>
              )}

              {authStep === 3 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Connection Successful!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {connectModalIntegration.name} is now actively linked. Automated tests have initialized and evidence is flowing.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {connectModalIntegration.status === 'connected' ? (
                <button
                  onClick={() => handleDisconnect(connectModalIntegration.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Disconnect Platform
                </button>
              ) : (
                <span className="text-xs text-slate-400">Step {authStep} of 2</span>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setConnectModalIntegration(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                {authStep === 1 && (
                  <button
                    onClick={handleCompleteConnection}
                    disabled={isVerifying || !credentialInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <span>Authorize & Link Platform</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

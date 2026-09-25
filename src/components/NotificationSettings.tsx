import React, { useState } from 'react';
import {
  WebhookConfig,
  WebhookDeliveryLog,
  AutomatedTest,
  WebhookPlatform,
  WebhookSeverityFilter,
} from '../types/grc';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Play,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  Code2,
  RefreshCw,
  Zap,
  Sliders,
  Send,
  Eye,
  EyeOff,
  Check,
  Shield,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  buildSlackPayload,
  buildTeamsPayload,
  buildGenericPayload,
} from '../utils/webhookDispatcher';

interface NotificationSettingsProps {
  webhooks: WebhookConfig[];
  deliveryLogs: WebhookDeliveryLog[];
  tests: AutomatedTest[];
  onUpdateWebhooks: (webhooks: WebhookConfig[]) => void;
  onUpdateDeliveryLogs: (logs: WebhookDeliveryLog[]) => void;
  onTriggerTestFailureNotification: (test: AutomatedTest, webhookId?: string) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  webhooks,
  deliveryLogs,
  tests,
  onUpdateWebhooks,
  onUpdateDeliveryLogs,
  onTriggerTestFailureNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'logs' | 'preview'>('endpoints');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<WebhookDeliveryLog | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [revealedUrlId, setRevealedUrlId] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<WebhookPlatform>('slack');
  const [previewTestId, setPreviewTestId] = useState<string>(tests[0]?.id || '');
  const [previewMode, setPreviewMode] = useState<'failed' | 'resolved'>('failed');
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);
  const [testDispatchSuccess, setTestDispatchSuccess] = useState<string | null>(null);

  // Form state for add/edit modal
  const [formName, setFormName] = useState('');
  const [formPlatform, setFormPlatform] = useState<WebhookPlatform>('slack');
  const [formUrl, setFormUrl] = useState('');
  const [formChannel, setFormChannel] = useState('');
  const [formSecret, setFormSecret] = useState('');
  const [formSeverity, setFormSeverity] = useState<WebhookSeverityFilter>('critical_high');
  const [formTriggerFailures, setFormTriggerFailures] = useState(true);
  const [formTriggerResolved, setFormTriggerResolved] = useState(true);
  const [formTriggerAudit, setFormTriggerAudit] = useState(false);
  const [formTriggerDigest, setFormTriggerDigest] = useState(false);

  const failingTests = tests.filter((t) => t.status === 'failing');
  const currentPreviewTest = tests.find((t) => t.id === previewTestId) || tests[0];

  const handleOpenAddModal = () => {
    setEditingWebhook(null);
    setFormName('');
    setFormPlatform('slack');
    setFormUrl('');
    setFormChannel('#security-alerts');
    setFormSecret(`whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 8)}`);
    setFormSeverity('critical_high');
    setFormTriggerFailures(true);
    setFormTriggerResolved(true);
    setFormTriggerAudit(false);
    setFormTriggerDigest(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (wh: WebhookConfig) => {
    setEditingWebhook(wh);
    setFormName(wh.name);
    setFormPlatform(wh.platform);
    setFormUrl(wh.webhookUrl);
    setFormChannel(wh.channel);
    setFormSecret(wh.signingSecret || '');
    setFormSeverity(wh.severityFilter);
    setFormTriggerFailures(wh.triggers.testFailures);
    setFormTriggerResolved(wh.triggers.testResolved);
    setFormTriggerAudit(wh.triggers.auditRequests);
    setFormTriggerDigest(wh.triggers.dailyDigest);
    setIsAddModalOpen(true);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) return;

    if (editingWebhook) {
      const updated = webhooks.map((w) =>
        w.id === editingWebhook.id
          ? {
              ...w,
              name: formName.trim(),
              platform: formPlatform,
              webhookUrl: formUrl.trim(),
              channel: formChannel.trim(),
              signingSecret: formSecret.trim() || undefined,
              severityFilter: formSeverity,
              triggers: {
                testFailures: formTriggerFailures,
                testResolved: formTriggerResolved,
                auditRequests: formTriggerAudit,
                dailyDigest: formTriggerDigest,
              },
            }
          : w
      );
      onUpdateWebhooks(updated);
    } else {
      const newWebhook: WebhookConfig = {
        id: `wh-${formPlatform}-${Date.now().toString().slice(-4)}`,
        name: formName.trim(),
        platform: formPlatform,
        webhookUrl: formUrl.trim(),
        channel: formChannel.trim() || (formPlatform === 'slack' ? '#compliance-alerts' : 'General Channel'),
        enabled: true,
        signingSecret: formSecret.trim() || undefined,
        severityFilter: formSeverity,
        triggers: {
          testFailures: formTriggerFailures,
          testResolved: formTriggerResolved,
          auditRequests: formTriggerAudit,
          dailyDigest: formTriggerDigest,
        },
        createdAt: 'Just now',
        lastStatus: 'Never Triggered',
        successfulDeliveries: 0,
        failedDeliveries: 0,
      };
      onUpdateWebhooks([...webhooks, newWebhook]);
    }

    setIsAddModalOpen(false);
  };

  const handleToggleWebhook = (id: string) => {
    onUpdateWebhooks(
      webhooks.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook destination?')) {
      onUpdateWebhooks(webhooks.filter((w) => w.id !== id));
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleSendTestPing = (wh: WebhookConfig) => {
    setIsSimulatingDispatch(true);
    setTimeout(() => {
      const testToUse = failingTests[0] || tests[0];
      const latency = Math.floor(Math.random() * 80) + 95;

      let payload: Record<string, any>;
      if (wh.platform === 'slack') {
        payload = buildSlackPayload(testToUse, false);
      } else if (wh.platform === 'teams') {
        payload = buildTeamsPayload(testToUse, false);
      } else {
        payload = buildGenericPayload(testToUse, false);
      }

      const newLog: WebhookDeliveryLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        webhookId: wh.id,
        webhookName: wh.name,
        platform: wh.platform,
        event: 'test.failed',
        timestamp: 'Just now',
        status: 'success',
        statusCode: 200,
        latencyMs: latency,
        payloadSummary: `Test verification dispatch: [${testToUse.severity.toUpperCase()}] ${testToUse.title}`,
        fullPayload: payload,
        testDetails: {
          testId: testToUse.id,
          testTitle: testToUse.title,
          severity: testToUse.severity,
          integrationName: testToUse.integrationName,
          failingCount: testToUse.failingResources.length,
        },
      };

      onUpdateDeliveryLogs([newLog, ...deliveryLogs]);
      onUpdateWebhooks(
        webhooks.map((w) =>
          w.id === wh.id
            ? {
                ...w,
                lastTriggeredAt: 'Just now',
                lastStatus: '200 OK' as const,
                successfulDeliveries: w.successfulDeliveries + 1,
              }
            : w
        )
      );

      setIsSimulatingDispatch(false);
      setTestDispatchSuccess(`Dispatched alert to ${wh.name} (${wh.channel}) in ${latency}ms`);
      setTimeout(() => setTestDispatchSuccess(null), 4000);
    }, 700);
  };

  const handleSimulateGlobalFailure = () => {
    const testToFail = failingTests[0] || tests[0];
    onTriggerTestFailureNotification(testToFail);
    setTestDispatchSuccess(`Simulated failure for "${testToFail.title}" sent to active webhooks!`);
    setTimeout(() => setTestDispatchSuccess(null), 4000);
  };

  // Build preview payload based on current preview selections
  const currentPreviewPayload = currentPreviewTest
    ? previewPlatform === 'slack'
      ? buildSlackPayload(currentPreviewTest, previewMode === 'resolved')
      : previewPlatform === 'teams'
      ? buildTeamsPayload(currentPreviewTest, previewMode === 'resolved')
      : buildGenericPayload(currentPreviewTest, previewMode === 'resolved')
    : {};

  const totalDeliveries = webhooks.reduce((acc, w) => acc + w.successfulDeliveries, 0);
  const activeCount = webhooks.filter((w) => w.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header and Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Incident Alerting & Real-time Webhooks</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Pipeline Active
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Webhook Notifications & Alerting</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Stream automated continuous test failures directly into your engineering chat channels. Send instant alerts to{' '}
            <strong className="text-slate-800 font-semibold">Slack</strong>,{' '}
            <strong className="text-slate-800 font-semibold">Microsoft Teams</strong>, or enterprise SIEM collectors before auditors discover non-compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSimulateGlobalFailure}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg shadow-2xs transition-colors"
            title="Simulate automated test failure and trigger active Slack / Teams webhooks"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>Simulate Test Failure Dispatch</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Webhook Channel</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {testDispatchSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-xs shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{testDispatchSuccess}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Status: 200 OK</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active Webhooks</span>
            <Bell className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeCount}</span>
            <span className="text-xs text-slate-500">of {webhooks.length} configured</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Slack & Teams connectors online</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Dispatches</span>
            <Send className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalDeliveries}</span>
            <span className="text-xs text-emerald-600 font-medium">99.8% Success Rate</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across continuous 5-min scan windows
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Median Latency</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">142ms</span>
            <span className="text-xs text-slate-500">HTTP POST</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Edge-routed payload delivery
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Failing Tests In Scope</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{failingTests.length}</span>
            <span className="text-xs text-slate-500">live failure alerts</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Immediate dispatch on status change
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'endpoints'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configured Endpoints ({webhooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Delivery Logs & Audit Trail ({deliveryLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Card Simulator</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Payload signatures verified via HMAC SHA-256</span>
        </div>
      </div>

      {/* TAB 1: Configured Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {webhooks.map((wh) => {
              const isSlack = wh.platform === 'slack';
              const isTeams = wh.platform === 'teams';
              const isRevealed = revealedUrlId === wh.id;
              const isCopied = copiedUrlId === wh.id;

              return (
                <div
                  key={wh.id}
                  className={`bg-white rounded-xl border p-5 transition-all shadow-2xs ${
                    wh.enabled ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 bg-slate-50/60 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Platform Icon and Name */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                          isSlack
                            ? 'bg-[#4A154B]/5 border-[#4A154B]/20 text-[#4A154B]'
                            : isTeams
                            ? 'bg-[#464EB8]/5 border-[#464EB8]/20 text-[#464EB8]'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {isSlack && (
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                          </svg>
                        )}
                        {isTeams && (
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M19.5 7.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5zm2.25 1.5h-4.5a1.5 1.5 0 0 0-1.5 1.5v5.25a.75.75 0 0 0 1.5 0v-4.5h3.75a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75zM12.75 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm3.75 2.25h-7.5a2.25 2.25 0 0 0-2.25 2.25v7.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-7.5a2.25 2.25 0 0 0-2.25-2.25z" />
                          </svg>
                        )}
                        {!isSlack && !isTeams && <Code2 className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{wh.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                              wh.enabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {wh.enabled ? 'Active' : 'Paused'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {isSlack ? 'Slack Incoming Webhook' : isTeams ? 'Microsoft Teams Connector' : 'Generic HTTP POST'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="font-semibold text-slate-800">
                            Target Channel:{' '}
                            <code className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">
                              {wh.channel}
                            </code>
                          </span>
                          <span>·</span>
                          <span>Created {wh.createdAt}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            Last triggered: <strong className="text-slate-700">{wh.lastTriggeredAt || 'Never'}</strong>
                          </span>
                        </div>

                        {/* Webhook URL obfuscation and copy */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">Endpoint:</span>
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs font-mono text-slate-700 max-w-md overflow-hidden text-ellipsis">
                            {isRevealed
                              ? wh.webhookUrl
                              : `${wh.webhookUrl.substring(0, 28)}••••••••••••••••••••••••`}
                          </div>
                          <button
                            onClick={() => setRevealedUrlId(isRevealed ? null : wh.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            title={isRevealed ? 'Hide URL' : 'Reveal URL'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopyUrl(wh.id, wh.webhookUrl)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Copy Webhook URL"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Triggers summary and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-end lg:self-center">
                      <div className="flex flex-wrap gap-1.5 lg:max-w-xs">
                        {wh.triggers.testFailures && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold rounded">
                            🚨 Test Failures ({wh.severityFilter === 'all' ? 'All' : wh.severityFilter === 'critical_high' ? 'Crit + High' : 'Crit Only'})
                          </span>
                        )}
                        {wh.triggers.testResolved && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold rounded">
                            ✅ Resolutions
                          </span>
                        )}
                        {wh.triggers.auditRequests && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold rounded">
                            📋 Auditor PBC Requests
                          </span>
                        )}
                        {wh.triggers.dailyDigest && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold rounded">
                            📊 Daily Digest
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                        <button
                          onClick={() => handleSendTestPing(wh)}
                          disabled={isSimulatingDispatch}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-2xs transition-colors"
                          title="Send a sample test payload to verify this webhook"
                        >
                          <Send className="w-3 h-3 text-blue-600" />
                          <span>Test Ping</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(wh)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Webhook Settings"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleWebhook(wh.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            wh.enabled
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {wh.enabled ? 'Pause' : 'Enable'}
                        </button>

                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Webhook"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Setup Guide Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              How SuomiGRC Real-Time Chat Notifications Work
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-1">1. Continuous Scan Loop</span>
                <span>
                  Our autonomous engine interrogates AWS, GCP, GitHub, Okta, and Jamf APIs every 5 minutes.
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-1">2. Zero Delay Event Broker</span>
                <span>
                  The moment an encryption rule drops or an MFA is bypassed, an asynchronous HTTP POST event is constructed.
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-800 block mb-1">3. Direct Slack & Teams Delivery</span>
                <span>
                  Formatted natively as Slack Block Kit messages and Microsoft Teams Adaptive Cards with one-click remediation links.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Delivery Logs & Audit Trail */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                Real-Time Webhook Dispatches ({deliveryLogs.length} Events)
              </span>
              <span className="text-xs text-slate-500 font-mono">Retention: 90 Days Audit Compliant</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-500 font-semibold">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Event Type</th>
                    <th className="py-2.5 px-4">Destination</th>
                    <th className="py-2.5 px-4">HTTP Status</th>
                    <th className="py-2.5 px-4">Latency</th>
                    <th className="py-2.5 px-4">Payload Summary</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                            log.event === 'test.failed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : log.event === 'test.resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {log.event}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.platform === 'slack'
                                ? 'bg-[#4A154B]'
                                : log.platform === 'teams'
                                ? 'bg-[#464EB8]'
                                : 'bg-emerald-600'
                            }`}
                          ></span>
                          <span>{log.webhookName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-mono text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{log.statusCode} OK</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {log.latencyMs}ms
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md truncate">
                        {log.payloadSummary}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLogForDetail(log)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        >
                          Inspect JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Interactive Card Simulator */}
      {activeTab === 'preview' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Interactive Message Card Preview</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  See exactly how automated alerts look in Slack channels and Microsoft Teams chats.
                </p>
              </div>

              {/* Selector controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Platform toggle */}
                <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setPreviewPlatform('slack')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewPlatform === 'slack'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Slack Block Kit
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('teams')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewPlatform === 'teams'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    MS Teams Adaptive Card
                  </button>
                </div>

                {/* Status state */}
                <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setPreviewMode('failed')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewMode === 'failed'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Test Failure
                  </button>
                  <button
                    onClick={() => setPreviewMode('resolved')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewMode === 'resolved'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Test Remediated
                  </button>
                </div>

                {/* Test selector */}
                <select
                  value={previewTestId}
                  onChange={(e) => setPreviewTestId(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.severity.toUpperCase()}] {t.title.substring(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visualizer Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Card visual rendering */}
              <div className="lg:col-span-7">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Client Viewport Preview ({previewPlatform === 'slack' ? 'Slack App' : 'Microsoft Teams'})
                </span>

                {/* Slack Mock Container */}
                {previewPlatform === 'slack' && (
                  <div className="bg-[#1A1D21] text-[#D1D2D3] rounded-xl p-4 font-sans text-sm shadow-md border border-slate-700">
                    <div className="flex items-center gap-2 border-b border-[#2C3136] pb-2 mb-3 text-xs text-[#ABABAD]">
                      <span className="font-bold text-[#E8E8E8]">#security-compliance-alerts</span>
                      <span>·</span>
                      <span>Channel members: 24</span>
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Bot Avatar */}
                      <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 text-xs shadow-xs">
                        SG
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-white text-sm">SuomiGRC Bot</span>
                          <span className="px-1 py-0.2 bg-[#2C3136] text-[10px] text-[#ABABAD] rounded">APP</span>
                          <span className="text-xs text-[#868686]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Slack message attachment block */}
                        <div
                          className={`border-l-4 pl-3.5 py-1 rounded-r space-y-2 bg-[#222529]/60 ${
                            previewMode === 'failed'
                              ? currentPreviewTest?.severity === 'critical'
                                ? 'border-rose-500'
                                : 'border-amber-500'
                              : 'border-emerald-500'
                          }`}
                        >
                          <div className="font-bold text-white text-base">
                            {previewMode === 'failed'
                              ? `🚨 [${currentPreviewTest?.severity.toUpperCase()} ALERT] ${currentPreviewTest?.title}`
                              : `✅ [RESOLVED] ${currentPreviewTest?.title}`}
                          </div>

                          <div className="text-xs text-[#D1D2D3] leading-relaxed">
                            {previewMode === 'failed' ? (
                              <>
                                <div><strong className="text-white">Integration:</strong> {currentPreviewTest?.integrationName}</div>
                                <div><strong className="text-white">Controls Violated:</strong> {currentPreviewTest?.satisfiedControls.join(', ')}</div>
                                <div className="mt-1 text-[#E0E0E0]">{currentPreviewTest?.description}</div>

                                {currentPreviewTest?.failingResources && currentPreviewTest.failingResources.length > 0 && (
                                  <div className="mt-2 bg-[#1A1D21] p-2.5 rounded border border-[#2C3136] text-[11px] font-mono">
                                    <div className="text-rose-400 font-semibold">Non-Compliant Resources:</div>
                                    {currentPreviewTest.failingResources.map((res, i) => (
                                      <div key={i} className="mt-1 text-[#ABABAD]">
                                        • {res.name} (<span className="text-[#89B4FA]">{res.arnOrPath}</span>)
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div><strong className="text-white">Status:</strong> 100% Automated Passing</div>
                                <div><strong className="text-white">Integration:</strong> {currentPreviewTest?.integrationName}</div>
                                <div className="mt-1 text-emerald-400">All failing resources have been remediated and verified compliant.</div>
                              </>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            <span className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer">
                              Inspect in SuomiGRC
                            </span>
                            <span className="px-3 py-1.5 bg-[#2C3136] hover:bg-[#383F45] text-white rounded text-xs font-semibold cursor-pointer">
                              View Remediation Script
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Teams Mock Container */}
                {previewPlatform === 'teams' && (
                  <div className="bg-[#F5F5F5] rounded-xl p-4 font-sans text-sm shadow-md border border-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3 text-xs text-slate-500">
                      <span className="font-bold text-slate-800">SRE Incident Response Channel</span>
                      <span>·</span>
                      <span>Microsoft Teams</span>
                    </div>

                    <div className="max-w-lg bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded bg-[#464EB8] text-white flex items-center justify-center font-bold text-[10px]">
                          T
                        </div>
                        <span className="font-bold text-slate-800">SuomiGRC Automated Alerts</span>
                        <span className="text-slate-400 text-[11px]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="border-t border-slate-100 pt-2">
                        <div
                          className={`text-base font-bold ${
                            previewMode === 'failed' ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {previewMode === 'failed'
                            ? `🚨 SuomiGRC: [${currentPreviewTest?.severity.toUpperCase()}] Test Failure`
                            : `✅ RESOLVED: ${currentPreviewTest?.title}`}
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {currentPreviewTest?.description}
                        </p>

                        <div className="mt-3 bg-slate-50 p-2.5 rounded border border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">Test ID</span>
                            <span className="font-bold text-slate-700">{currentPreviewTest?.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Severity</span>
                            <span className="font-bold text-rose-600">{currentPreviewTest?.severity.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Platform</span>
                            <span className="font-bold text-slate-700">{currentPreviewTest?.integrationName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Target Controls</span>
                            <span className="font-bold text-slate-700">{currentPreviewTest?.satisfiedControls.join(', ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                          <button className="px-3 py-1 bg-[#464EB8] text-white text-xs font-semibold rounded shadow-2xs hover:bg-[#3B429F]">
                            View In SuomiGRC
                          </button>
                          <button className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50">
                            Remediate Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Raw JSON Inspector */}
              <div className="lg:col-span-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Raw HTTP POST JSON Payload
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(currentPreviewPayload, null, 2));
                      alert('JSON payload copied to clipboard!');
                    }}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>

                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-[11px] overflow-auto max-h-[380px] border border-slate-800 leading-normal">
                  <pre>{JSON.stringify(currentPreviewPayload, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Webhook Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingWebhook ? 'Edit Webhook Destination' : 'Configure New Webhook Channel'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Stream continuous automated test results directly to your team
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveWebhook} className="p-6 space-y-4 overflow-y-auto">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Destination Platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormPlatform('slack');
                      if (!formChannel.startsWith('#')) setFormChannel('#' + (formChannel || 'security-alerts'));
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      formPlatform === 'slack'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-2xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="text-[#4A154B] font-bold text-sm mb-1">Slack</span>
                    <span className="text-[10px] text-slate-500 font-normal">Incoming Webhook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormPlatform('teams')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      formPlatform === 'teams'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-2xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="text-[#464EB8] font-bold text-sm mb-1">MS Teams</span>
                    <span className="text-[10px] text-slate-500 font-normal">Adaptive Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormPlatform('generic')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      formPlatform === 'generic'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-2xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="text-slate-800 font-bold text-sm mb-1">Custom HTTP</span>
                    <span className="text-[10px] text-slate-500 font-normal">Generic JSON POST</span>
                  </button>
                </div>
              </div>

              {/* Endpoint Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Label / Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SecOps Incident Alerts, DevOps Teams Channel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  required
                  placeholder={
                    formPlatform === 'slack'
                      ? 'https://hooks.slack.com/services/T000/B000/XXXXX'
                      : formPlatform === 'teams'
                      ? 'https://outlook.office.com/webhook/...'
                      : 'https://api.yourdomain.com/v1/grc-alerts'
                  }
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {formPlatform === 'slack' && 'Create this in Slack API: Custom Integrations → Incoming WebHooks.'}
                  {formPlatform === 'teams' && 'Create this in Teams: Channel → Connectors → Incoming Webhook.'}
                  {formPlatform === 'generic' && 'Accepts standard HTTP POST requests with JSON payload.'}
                </p>
              </div>

              {/* Channel / Room Identifier */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Channel / Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #security-alerts"
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severity Filter
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as WebhookSeverityFilter)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="all">All Failures (Critical, High, Med, Low)</option>
                    <option value="critical_high">Critical & High Only (Recommended)</option>
                    <option value="critical_only">Critical Only (Paging)</option>
                  </select>
                </div>
              </div>

              {/* HMAC Secret */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HMAC Signature Secret (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formSecret}
                    onChange={(e) => setFormSecret(e.target.value)}
                    placeholder="whsec_..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormSecret(
                        `whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 8)}`
                      )
                    }
                    className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg shrink-0"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Event Triggers */}
              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Event Triggers
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTriggerFailures}
                      onChange={(e) => setFormTriggerFailures(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">Automated Continuous Test Failures</span>
                    <span className="text-slate-400">(Dispatched immediately upon violation)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTriggerResolved}
                      onChange={(e) => setFormTriggerResolved(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">Automated Test Remediated / Resolved</span>
                    <span className="text-slate-400">(Notifies team when a broken control passes)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTriggerAudit}
                      onChange={(e) => setFormTriggerAudit(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">New Auditor PBC Evidence Requests</span>
                    <span className="text-slate-400">(Alerts compliance owners to auditor tasks)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTriggerDigest}
                      onChange={(e) => setFormTriggerDigest(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">Daily Compliance Health Digest</span>
                    <span className="text-slate-400">(Summary posted at 09:00 AM UTC)</span>
                  </label>
                </div>
              </div>

              {/* Modal footer */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                >
                  {editingWebhook ? 'Update Configuration' : 'Save & Activate Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Payload Inspector Modal */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Webhook Payload Details: {selectedLogForDetail.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Delivered to {selectedLogForDetail.webhookName} ({selectedLogForDetail.platform})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Type</span>
                  <span className="font-semibold text-slate-800">{selectedLogForDetail.event}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Status</span>
                  <span className="font-semibold text-emerald-600">200 OK ({selectedLogForDetail.latencyMs}ms)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Timestamp</span>
                  <span className="font-semibold text-slate-800">{selectedLogForDetail.timestamp}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Delivered JSON Body</span>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-auto max-h-72 border border-slate-800">
                  <pre>{JSON.stringify(selectedLogForDetail.fullPayload, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedLogForDetail.fullPayload, null, 2));
                  alert('Copied payload to clipboard!');
                }}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Payload</span>
              </button>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

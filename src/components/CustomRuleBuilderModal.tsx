import React, { useState } from 'react';
import { CustomTestRule, AutomatedTest, Control } from '../types/grc';
import {
  Code2,
  Play,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
  GitBranch,
  Globe,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface CustomRuleBuilderModalProps {
  controls: Control[];
  onSaveRule: (newRule: CustomTestRule, generatedTest: AutomatedTest) => void;
  onClose: () => void;
}

export const CustomRuleBuilderModal: React.FC<CustomRuleBuilderModalProps> = ({
  controls,
  onSaveRule,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [integrationId, setIntegrationId] = useState<'aws' | 'github' | 'datadog' | 'cloudflare'>('aws');
  const [queryType, setQueryType] = useState<'sql' | 'aws_cloudwatch' | 'rest_api' | 'github_check'>('aws_cloudwatch');
  const [queryPayload, setQueryPayload] = useState('aws rds describe-db-instances --query "DBInstances[?StorageEncrypted!=`true`].DBInstanceIdentifier"');
  const [expectedCondition, setExpectedCondition] = useState('Result length == 0');
  const [selectedControl, setSelectedControl] = useState(controls[0]?.code || 'CC6.1');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('high');

  // Dry-run simulation state
  const [isRunningDryRun, setIsRunningDryRun] = useState(false);
  const [dryRunOutput, setDryRunOutput] = useState<string | null>(null);
  const [dryRunSuccess, setDryRunSuccess] = useState<boolean | null>(null);

  const handleRunDryRun = () => {
    setIsRunningDryRun(true);
    setDryRunOutput(null);
    setDryRunSuccess(null);

    setTimeout(() => {
      setIsRunningDryRun(false);
      setDryRunSuccess(true);
      setDryRunOutput(`[DRY-RUN EXECUTOR v1.8]
Connecting to ${integrationId.toUpperCase()} API endpoint...
Executing query payload: ${queryPayload}
Received 200 OK (latency: 142ms)
Result Output: [] (0 non-compliant resources found)
Evaluation: Evaluated condition "${expectedCondition}" -> PASS
Rule syntax verified.`);
    }, 1200);
  };

  const handleSave = () => {
    if (!title || !queryPayload) return;

    const newRuleId = `custom-rule-${Date.now()}`;
    const newTestId = `test-custom-${Date.now()}`;

    const newRule: CustomTestRule = {
      id: newRuleId,
      title,
      description,
      integrationId,
      integrationName: integrationId === 'aws' ? 'Amazon Web Services' : integrationId === 'github' ? 'GitHub Enterprise' : 'Datadog SIEM',
      queryType,
      queryPayload,
      expectedCondition,
      mappedControls: [selectedControl],
      severity,
      status: 'passing',
      lastExecutedAt: 'Just now',
    };

    const newAutomatedTest: AutomatedTest = {
      id: newTestId,
      title: `[Custom] ${title}`,
      description,
      integrationId,
      integrationName: integrationId === 'aws' ? 'Amazon Web Services' : integrationId === 'github' ? 'GitHub Enterprise' : 'Datadog SIEM',
      category: 'Custom Rule Engine',
      status: 'passing',
      severity,
      frequency: 'Hourly',
      lastRunAt: 'Just now',
      failingResources: [],
      remediationCode: {
        language: 'bash',
        code: `# Custom automated remediation script\n${queryPayload}`,
      },
      satisfiedControls: [selectedControl],
    };

    onSaveRule(newRule, newAutomatedTest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Code2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Custom Test Rule Builder
              </h3>
              <p className="text-[11px] text-slate-500">
                Define specialized SQL, CloudWatch, or API rules to automate proprietary security checks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Connected Source Platform
              </label>
              <select
                value={integrationId}
                onChange={(e) => setIntegrationId(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              >
                <option value="aws">Amazon Web Services (AWS)</option>
                <option value="github">GitHub Enterprise</option>
                <option value="datadog">Datadog APM & Cloud SIEM</option>
                <option value="cloudflare">Cloudflare Zero Trust</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Query Execution Engine
              </label>
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              >
                <option value="aws_cloudwatch">AWS CLI / CloudWatch API</option>
                <option value="sql">PostgreSQL / SQL Database Query</option>
                <option value="rest_api">REST API Webhook Evaluator</option>
                <option value="github_check">GitHub GraphQL / REST Check</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Custom Rule Title
            </label>
            <input
              type="text"
              placeholder="e.g. Ensure All Production S3 Buckets Have Object Lock Enabled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rule Description
            </label>
            <input
              type="text"
              placeholder="Explain the security rationale and compliance intent..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Query Payload / CLI Expression
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Read-Only Scoped</span>
            </div>
            <textarea
              rows={3}
              value={queryPayload}
              onChange={(e) => setQueryPayload(e.target.value)}
              className="w-full p-2 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Passing Validation Condition
              </label>
              <input
                type="text"
                value={expectedCondition}
                onChange={(e) => setExpectedCondition(e.target.value)}
                placeholder="e.g. result.length == 0"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Map to Unified Framework Control
            </label>
            <select
              value={selectedControl}
              onChange={(e) => setSelectedControl(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg"
            >
              {controls.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} - {c.name} ({c.domain})
                </option>
              ))}
            </select>
          </div>

          {/* Dry Run Button & Console */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRunDryRun}
              disabled={isRunningDryRun || !queryPayload.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningDryRun ? 'animate-spin' : 'fill-current'}`} />
              <span>{isRunningDryRun ? 'Executing Query...' : 'Test Dry-Run Against Live API'}</span>
            </button>

            {dryRunOutput && (
              <pre className="mt-2 p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                {dryRunOutput}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !queryPayload.trim()}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs disabled:opacity-50"
          >
            Publish Custom Automated Test
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AutomatedTest } from '../types/grc';
import { PlatformLogo } from './PlatformLogo';
import { Check, Copy, Play, X, ShieldAlert, ArrowRight, ExternalLink, Lock } from 'lucide-react';
import { useRBAC } from '../context/RbacContext';

interface RemediationModalProps {
  test: AutomatedTest;
  onClose: () => void;
  onRunTest: (testId: string) => void;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  test,
  onClose,
  onRunTest,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { canPerformAction, currentRole } = useRBAC();
  const canRemediate = canPerformAction('action:remediate');

  const handleCopy = () => {
    navigator.clipboard.writeText(test.remediationCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      onRunTest(test.id);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${test.status === 'failing' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <PlatformLogo platformId={test.integrationId} name={test.integrationName} size="xs" />
                  {test.integrationName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="uppercase">{test.frequency}</span>
                <span aria-hidden="true">·</span>
                <span className={`font-semibold uppercase ${test.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                  {test.severity} severity
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-900 mt-0.5">{test.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Compliance Rationale</h3>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {test.description}
            </p>
          </div>

          {/* Satisfied Controls */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mapped Unified Controls</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {test.satisfiedControls.map((ctrl) => (
                <span key={ctrl} className="font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-100 font-medium">
                  {ctrl}
                </span>
              ))}
            </div>
          </div>

          {/* Failing Resources */}
          {test.failingResources.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  Non-Compliant Resources ({test.failingResources.length})
                </h3>
                <span className="text-xs text-slate-500">Continuous telemetry detection</span>
              </div>
              <div className="space-y-2.5">
                {test.failingResources.map((res) => (
                  <div key={res.id} className="p-3 bg-red-50/50 rounded-lg border border-red-200/80 space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-mono text-xs font-medium text-slate-900 break-all">
                        {res.name}
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{res.detectedAt}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>Owner:</span>
                      <span className="text-slate-700 font-medium">{res.owner}</span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1">
                      <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span>{res.remediationSuggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remediation Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Automated Remediation Script ({test.remediationCode.language.toUpperCase()})
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Snippet'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800 leading-normal">
              <code>{test.remediationCode.code}</code>
            </pre>
            <p className="text-xs text-slate-500 mt-2">
              Tip: Run this script via your CI/CD pipeline or cloud CLI. Once applied, SuomiGRC will verify compliance within 5 minutes or you can trigger an immediate re-test below.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Last checked: {test.lastRunAt}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Validating Live Telemetry...' : 'Simulate Fix & Re-Test Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

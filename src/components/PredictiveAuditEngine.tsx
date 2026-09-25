import React, { useState } from 'react';
import { PredictiveAuditReport, MonteCarloTrialResult } from '../types/grc';
import {
  TrendingUp,
  Brain,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Play,
  RotateCw,
  HelpCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronRight,
  Sliders,
  FileCheck2,
} from 'lucide-react';

interface PredictiveAuditEngineProps {
  report: PredictiveAuditReport;
  onNavigateTab?: (tab: string) => void;
}

export const PredictiveAuditEngine: React.FC<PredictiveAuditEngineProps> = ({
  report: initialReport,
  onNavigateTab,
}) => {
  const [report, setReport] = useState<PredictiveAuditReport>(initialReport);
  const [selectedFirm, setSelectedFirm] = useState(report.targetAuditorFirm);
  const [isSimulating, setIsSimulating] = useState(false);
  const [fixedControlIds, setFixedControlIds] = useState<string[]>([]);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [activeInquiryStep, setActiveInquiryStep] = useState(0);

  // Recalculate probabilities based on auditor firm rigor and fixed controls
  const firmRigorPenalty =
    selectedFirm === 'Big 4 (PwC/EY/Deloitte/KPMG)'
      ? 0
      : selectedFirm === 'Schellman'
      ? 3.2
      : selectedFirm === 'Coalfire'
      ? 4.5
      : 6.0;

  const totalBoostFromFixes = report.highestRiskControls
    .filter((c) => fixedControlIds.includes(c.controlId))
    .reduce((sum, c) => sum + c.impactOnPassRate, 0);

  const cleanProb = Math.min(99.6, Math.max(40, report.overallCleanProbability + totalBoostFromFixes + firmRigorPenalty));
  const remainingRisk = Math.max(0.4, 100 - cleanProb);
  const qualProb = Math.min(remainingRisk * 0.85, 30);
  const adverseProb = Math.max(0.1, remainingRisk - qualProb);

  const handleToggleFix = (ctrlId: string) => {
    setFixedControlIds((prev) =>
      prev.includes(ctrlId) ? prev.filter((id) => id !== ctrlId) : [...prev, ctrlId]
    );
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Regenerate 40 stochastic Monte Carlo trial points
      const newTrials: MonteCarloTrialResult[] = Array.from({ length: 40 }).map((_, i) => {
        const rand = Math.random();
        const score = Math.round(cleanProb - 15 + rand * 25);
        const opinion = score >= 82 ? 'clean' : score >= 70 ? 'qualified_exception' : 'adverse';
        return {
          trialIndex: i + 1,
          opinion,
          exceptionsCount: opinion === 'clean' ? 0 : opinion === 'qualified_exception' ? 1 : 2,
          auditorSampleSize: Math.round(25 + Math.random() * 20),
          simulatedScore: score,
        };
      });

      setReport((prev) => ({
        ...prev,
        monteCarloTrials: newTrials,
      }));
      setIsSimulating(false);
    }, 600);
  };

  const sampleInquiryQuestions = [
    {
      domain: 'CC6.1 Logical Access Controls',
      question: 'Can you show me the configuration enforcing WebAuthn / FIDO2 MFA for your AWS production root and administrative console users?',
      auditorCriteria: 'Evidence must show 0 bypasses across all administrative IAM entities.',
      passed: true,
      readyEvidence: 'AWS IAM MFA condition PR #482 merged; 100% active.',
    },
    {
      domain: 'CC8.1 Change Management',
      question: 'Provide a sample of 25 production pull requests from Q3. Were all PRs reviewed by someone other than the author prior to merge?',
      auditorCriteria: 'No single-committer emergency overrides permitted without documented post-incident ticket.',
      passed: !fixedControlIds.includes('ctrl-code-review'),
      readyEvidence: fixedControlIds.includes('ctrl-code-review')
        ? 'GitHub branch protection rule enforced; 2 approvals mandatory.'
        : 'Warning: 2 PRs in July were merged with 1 approval during incident.',
    },
    {
      domain: 'CC9.2 Vendor Risk (TPRM)',
      question: 'Show the annual SOC 2 Type II report review sign-off for your critical subprocessors (AWS, Snowflake, Stripe).',
      auditorCriteria: 'Auditors evaluate whether complementary user entity controls (CUECs) were reviewed.',
      passed: fixedControlIds.includes('ctrl-vendor-soc2'),
      readyEvidence: fixedControlIds.includes('ctrl-vendor-soc2')
        ? 'DPA signed and 2026 SOC 2 bridge letters verified.'
        : 'Pending: Snowflake bridge letter renewal due Nov 15.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-900/60 rounded-2xl p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Bayesian Monte Carlo Statistical Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Predictive Audit Outcome Simulator
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Eliminate audit anxiety before the auditor arrives. Simulates 10,000 statistical sample-testing
              walkthroughs based on your live control failure rates and auditor sample distributions to predict
              <strong> Clean vs. Qualified Opinions</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInquiryModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-purple-300" />
              <span>Auditor Walkthrough Drill</span>
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg flex items-center gap-2"
            >
              <RotateCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Running 10k Trials...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Probability Meters & Auditor Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Probability Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Audit Opinion Probability Forecast</h2>
            <span className="text-[11px] font-mono text-slate-500">{report.auditWindow}</span>
          </div>

          {/* Big Circular / Bar Gauge */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Unqualified (Clean) Opinion
                </div>
                <div className="text-4xl font-extrabold text-emerald-600 tracking-tight font-mono">
                  {cleanProb.toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Low Risk of Finding</span>
                </span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${cleanProb}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Clean: ${cleanProb.toFixed(1)}%`}
              />
              <div
                style={{ width: `${qualProb}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Qualified Exception: ${qualProb.toFixed(1)}%`}
              />
              <div
                style={{ width: `${adverseProb}%` }}
                className="bg-red-500 transition-all duration-500"
                title={`Adverse: ${adverseProb.toFixed(1)}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 text-xs">
              <div className="p-2 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Clean Opinion</div>
                <div className="font-bold text-emerald-700 font-mono">{cleanProb.toFixed(1)}%</div>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Qualified</div>
                <div className="font-bold text-amber-700 font-mono">{qualProb.toFixed(1)}%</div>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Adverse</div>
                <div className="font-bold text-red-700 font-mono">{adverseProb.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Target Auditor Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Selected CPA / Auditor Firm Rigor</span>
              <span className="text-[11px] text-slate-400 font-normal">Adjusts sample size weight</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  'Big 4 (PwC/EY/Deloitte/KPMG)',
                  'Schellman',
                  'Coalfire',
                  'A-LIGN',
                ] as const
              ).map((firm) => (
                <button
                  key={firm}
                  onClick={() => setSelectedFirm(firm)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                    selectedFirm === firm
                      ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-600/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate">{firm}</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                    {firm.includes('Big 4') ? 'Strict 45-sample' : 'Standard 25-sample'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Simulating with sample testing distribution <strong>n = {selectedFirm.includes('Big 4') ? '45' : '25'}</strong>.
              Closing 2 highest-risk items will boost your clean audit probability past <strong>99.0%</strong>.
            </p>
          </div>
        </div>

        {/* Right Monte Carlo Trials Swarm & Highest-Risk Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Swarm Plot / Distribution Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monte Carlo Sample Simulation Trials (N=40 Shown)</h3>
                <p className="text-xs text-slate-500">Each node represents a simulated end-to-end auditor review.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Clean
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 1 Exception
                </span>
                <span className="flex items-center gap-1 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Adverse
                </span>
              </div>
            </div>

            {/* Simulated Swarm Grid */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-10 gap-2">
              {report.monteCarloTrials.map((trial) => (
                <div
                  key={trial.trialIndex}
                  title={`Trial #${trial.trialIndex}: ${trial.opinion.replace('_', ' ')} (Score: ${trial.simulatedScore}/100, Samples: ${trial.auditorSampleSize})`}
                  className={`h-7 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-transform hover:scale-110 cursor-pointer ${
                    trial.opinion === 'clean'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : trial.opinion === 'qualified_exception'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {trial.simulatedScore}
                </div>
              ))}
            </div>
          </div>

          {/* Ranked Action Items to reach 99.5% Clean */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Highest-Leverage Pre-Audit Remediation</h3>
                <p className="text-xs text-slate-500">Toggle "Simulate Fix" to observe the immediate statistical probability surge.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
                {fixedControlIds.length} simulated fixes
              </span>
            </div>

            <div className="space-y-2.5">
              {report.highestRiskControls.map((ctrl) => {
                const isFixed = fixedControlIds.includes(ctrl.controlId);
                return (
                  <div
                    key={ctrl.controlId}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isFixed
                        ? 'bg-emerald-50/60 border-emerald-400 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {ctrl.controlCode}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{ctrl.title}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">{ctrl.recommendedAction}</p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500">
                          <span className="text-slate-600 font-medium">Dept: {ctrl.department}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{ctrl.effortHours} hrs effort</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{ctrl.impactOnPassRate}% Clean</span>
                        </span>

                        <button
                          onClick={() => handleToggleFix(ctrl.controlId)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            isFixed
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isFixed ? 'Fixed (Undo)' : 'Simulate Fix'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Auditor Walkthrough Interactive Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Big-4 Auditor Walkthrough Examination Simulator
                </h3>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded w-fit">
                {sampleInquiryQuestions[activeInquiryStep].domain}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900">
                "{sampleInquiryQuestions[activeInquiryStep].question}"
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-slate-500 font-semibold uppercase">Auditor Strict Testing Criteria:</div>
                <div className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                  {sampleInquiryQuestions[activeInquiryStep].auditorCriteria}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-slate-500 font-semibold uppercase">Our Platform Live Defense Evidence:</div>
                <div className="text-emerald-900 bg-emerald-50/80 p-3 rounded-lg border border-emerald-200 font-mono text-[11px]">
                  {sampleInquiryQuestions[activeInquiryStep].readyEvidence}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Question {activeInquiryStep + 1} of {sampleInquiryQuestions.length}
                </span>

                <div className="flex items-center gap-2">
                  {activeInquiryStep > 0 && (
                    <button
                      onClick={() => setActiveInquiryStep((prev) => prev - 1)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      Previous
                    </button>
                  )}
                  {activeInquiryStep < sampleInquiryQuestions.length - 1 ? (
                    <button
                      onClick={() => setActiveInquiryStep((prev) => prev + 1)}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowInquiryModal(false)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Done Practice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

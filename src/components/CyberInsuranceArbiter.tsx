import React, { useState } from 'react';
import { CyberInsuranceCarrierScore } from '../types/grc';
import { initialCyberInsuranceCarriers } from '../data/mockInnovativeData';
import {
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  FileCheck2,
  AlertTriangle,
  Building,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Download,
  Info,
  Sliders,
} from 'lucide-react';

export const CyberInsuranceArbiter: React.FC = () => {
  const [carriers, setCarriers] = useState<CyberInsuranceCarrierScore[]>(initialCyberInsuranceCarriers);
  const [selectedCarrierName, setSelectedCarrierName] = useState(initialCyberInsuranceCarriers[0].carrierName);
  const [coverageLimitMillions, setCoverageLimitMillions] = useState(5);
  const [showUnderwriterModal, setShowUnderwriterModal] = useState(false);

  const selectedCarrier = carriers.find((c) => c.carrierName === selectedCarrierName) || carriers[0];

  // Scale base & savings with policy coverage limit slider
  const limitMultiplier = coverageLimitMillions / 5;
  const effectiveBase = Math.round(selectedCarrier.baseAnnualPremium * limitMultiplier);
  const effectiveDiscounted = Math.round(selectedCarrier.discountedAnnualPremium * limitMultiplier);
  const effectiveSavings = effectiveBase - effectiveDiscounted;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-900/60 rounded-2xl p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Actuarial Telemetry Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Cyber Insurance Arbiter &amp; Underwriter Hub
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Translate real-time GRC telemetry directly into carrier actuarial models
              (<strong>Chubb, Travelers, Coalition</strong>). Eliminate disqualifier clauses and unlock up to
              <strong> 46% annual premium discounts</strong> with certified evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUnderwriterModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Export ACORD 842 Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Insurability Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            {selectedCarrier.insurabilityIndex}/100
          </div>
          <div className="text-xs text-slate-500">Tier 1 Preferred Underwriting Class</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Annual Premium Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            ${effectiveSavings.toLocaleString()}/yr
          </div>
          <div className="text-xs text-slate-500">
            Based on ${coverageLimitMillions}M aggregate limit
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Disqualifier Breaches</span>
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            0 Fatal Breaches
          </div>
          <div className="text-xs text-slate-500">100% carrier warranty criteria satisfied</div>
        </div>
      </div>

      {/* Main Grid: Carrier Select & Policy Limits (4 cols) + Underwriter Checklist (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Carrier Selector & Policy Limits (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Cyber Carrier Algorithm
            </h2>
            <div className="space-y-2">
              {carriers.map((c) => (
                <button
                  key={c.carrierName}
                  onClick={() => setSelectedCarrierName(c.carrierName)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    selectedCarrierName === c.carrierName
                      ? 'border-amber-500 bg-amber-50/60 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{c.carrierName}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {c.underwritingEligibility}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Index: {c.insurabilityIndex}/100</span>
                    <span className="text-emerald-600 font-bold">
                      -${c.annualSavings.toLocaleString()}/yr
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Coverage Limit Slider */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Coverage Policy Limit:</span>
                <span className="font-mono text-amber-700">${coverageLimitMillions} Million</span>
              </div>
              <input
                type="range"
                min={2}
                max={15}
                step={1}
                value={coverageLimitMillions}
                onChange={(e) => setCoverageLimitMillions(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$2M</span>
                <span>$5M (Typical)</span>
                <span>$10M</span>
                <span>$15M</span>
              </div>
            </div>

            {/* Premium Comparison Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Unverified Base Premium:</span>
                <span className="line-through">${effectiveBase.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Autonomous GRC Discounted:</span>
                <span className="text-emerald-700">${effectiveDiscounted.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold pt-1 border-t border-slate-200">
                <span>Net Direct Cash Savings:</span>
                <span>-${effectiveSavings.toLocaleString()}/yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Underwriting Warranty Checklist (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {selectedCarrier.carrierName} Underwriting Warranty Audit
              </h2>
              <p className="text-xs text-slate-500">
                Carriers reject claims if these conditions are violated during a ransomware event.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              4 of 4 Verified
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {selectedCarrier.warrantyChecklist.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.severity === 'fatal_disqualifier'
                            ? 'bg-red-100 text-red-800'
                            : item.severity === 'rate_modifier'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.severity === 'fatal_disqualifier'
                          ? 'FATAL DISQUALIFIER'
                          : item.severity === 'rate_modifier'
                          ? 'RATE MODIFIER'
                          : 'RECOMMENDED'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.currentStatus === 'compliant'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.currentStatus === 'compliant' ? '100% Compliant' : 'Partial Review'}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900">{item.requirement}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-emerald-600">
                      {item.premiumImpactUsd < 0 ? `-${Math.abs(item.premiumImpactUsd).toLocaleString()}` : ''} USD
                    </div>
                    <div className="text-[10px] text-slate-400">Discount Factor</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Telemetry Anchor: {item.telemetrySource}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Underwriter Modal */}
      {showUnderwriterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Carrier Underwriter Dossier (ACORD 842 Compatible)
                </h3>
              </div>
              <button
                onClick={() => setShowUnderwriterModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This package exports certified digital evidence satisfying warranty clauses for{' '}
              <strong>{selectedCarrier.carrierName}</strong>. Includes machine-verified MFA logs, immutable backup
              retention certificates, and continuous vulnerability scans ready for your insurance broker.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold">NordicScale Tech</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved Premium:</span>
                <span className="font-bold text-emerald-700">${effectiveDiscounted.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Underwriting Class:</span>
                <span className="font-bold text-amber-700">Tier 1 Preferred</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUnderwriterModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => setShowUnderwriterModal(false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ACORD 842 PDF &amp; Telemetry ZIP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

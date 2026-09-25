import React, { useState } from 'react';
import { FrameworkDeltaComparison } from '../types/grc';
import { mockFrameworkDeltas } from '../data/mockInnovativeData';
import {
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  Sparkles,
  Link,
  ChevronRight,
  Filter,
  FileCheck,
} from 'lucide-react';

export const CrossFrameworkDeltaHub: React.FC = () => {
  const [selectedPairKey, setSelectedPairKey] = useState<string>('soc2-to-iso27001');
  const [statusFilter, setStatusFilter] = useState<'all' | 'identical' | 'partial_gap' | 'complete_gap'>('all');
  const [harmonizedIds, setHarmonizedIds] = useState<string[]>([]);

  const delta = mockFrameworkDeltas[selectedPairKey] || mockFrameworkDeltas['soc2-to-iso27001'];

  const filteredMappings = delta.controlMappings.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.matchStatus === statusFilter;
  });

  const handleHarmonize = (mappingId: string) => {
    setHarmonizedIds((prev) =>
      prev.includes(mappingId) ? prev : [...prev, mappingId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-900/60 rounded-2xl p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Redundancy Evidence Harmonization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Cross-Framework Delta &amp; ROI Engine
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Never re-collect evidence twice. Instantly map your existing <strong>SOC 2 Type II</strong> tests
              against <strong>ISO 27001:2022</strong>, <strong>EU NIS2</strong>, and <strong>FedRAMP</strong> to
              uncover exact gap deltas and engineering ROI.
            </p>
          </div>

          {/* Framework Pair Selector */}
          <div className="flex flex-col gap-2 shrink-0">
            <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              Select Framework Pair
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPairKey('soc2-to-iso27001')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedPairKey === 'soc2-to-iso27001'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>SOC 2 ➔ ISO 27001</span>
              </button>
              <button
                onClick={() => setSelectedPairKey('soc2-to-nis2')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedPairKey === 'soc2-to-nis2'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>SOC 2 ➔ EU NIS2</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row: Overlap %, Hours Saved, Dollar Savings, Weeks Compressed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Evidence Overlap</span>
            <ArrowRightLeft className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {delta.overlapPercentage}%
          </div>
          <div className="text-xs text-slate-500">
            {delta.inheritedControlsCount} of {delta.totalTargetControls} controls 100% satisfied
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Engineering Hours Saved</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            {delta.estimatedEngineeringHoursSaved} hrs
          </div>
          <div className="text-xs text-slate-500">Zero duplicate screenshot gathering</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Estimated Budget Saved</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 font-mono">
            ${delta.estimatedDollarSavings.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Eliminated consultant duplication</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Time-to-Audit Compressed</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-mono">
            -{delta.timeToAuditWeeksCompressed} wks
          </div>
          <div className="text-xs text-slate-500">Ready for auditor onboarding today</div>
        </div>
      </div>

      {/* Control Harmonization Mappings Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {delta.sourceFrameworkName} ➔ {delta.targetFrameworkName} Harmonization Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Direct evidence links recycled from SOC 2 to satisfy target framework clauses.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {(
              [
                { id: 'all', label: 'All Controls' },
                { id: 'identical', label: '100% Satisfied' },
                { id: 'partial_gap', label: 'Minor Gap' },
                { id: 'complete_gap', label: 'New Gap' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                  statusFilter === filter.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100">
          {filteredMappings.map((mapping) => {
            const isHarmonized = harmonizedIds.includes(mapping.id) || mapping.matchStatus === 'identical';
            return (
              <div key={mapping.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Target control title & status */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {mapping.targetControlId}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-500">{mapping.targetDomain}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          mapping.matchStatus === 'identical'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mapping.matchStatus === 'partial_gap'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {mapping.matchStatus === 'identical'
                          ? '100% Inherited'
                          : mapping.matchStatus === 'partial_gap'
                          ? 'Partial Gap (Minor Doc)'
                          : 'Complete Gap'}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900">{mapping.targetControlTitle}</h3>

                    {/* Source recycled evidence */}
                    {mapping.inheritedEvidenceTitle && (
                      <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2">
                        <Link className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-emerald-800">Recycled from {mapping.inheritedSourceControlId}:</span>{' '}
                          {mapping.inheritedEvidenceTitle}
                        </div>
                      </div>
                    )}

                    {/* Additional requirements if any */}
                    {mapping.additionalRequirement && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                        <div className="font-semibold text-slate-800">Target Specific Requirement:</div>
                        <p className="text-[11px] leading-relaxed text-slate-600">{mapping.additionalRequirement}</p>
                        {mapping.recommendedQuickFix && (
                          <div className="text-[11px] text-cyan-700 font-medium">
                            💡 Quick fix: {mapping.recommendedQuickFix}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Harmonize Button */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleHarmonize(mapping.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isHarmonized
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isHarmonized ? 'Harmonized & Bound' : '1-Click Bind Evidence'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Framework, Control, FrameworkId } from '../types/grc';
import {
  ShieldCheck,
  Check,
  Layers,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Calendar,
  Building2,
  Sparkles,
  Info,
} from 'lucide-react';

interface FrameworkMatrixProps {
  frameworks: Framework[];
  controls: Control[];
  onSelectFramework: (id: FrameworkId) => void;
}

export const FrameworkMatrix: React.FC<FrameworkMatrixProps> = ({
  frameworks,
  controls,
  onSelectFramework,
}) => {
  const [selectedCellControl, setSelectedCellControl] = useState<Control | null>(null);

  // Framework readiness cards
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Unified Control Framework (UCF)</span>
          <span aria-hidden="true">·</span>
          <span>Zero-Duplication Cross-Mapping</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cross-Framework Deduplication Matrix</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Collect evidence once, satisfy all standards. SuomiGRC cross-maps your technical controls across global compliance frameworks automatically.
        </p>
      </div>

      {/* Framework Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map((fw) => (
          <div
            key={fw.id}
            onClick={() => onSelectFramework(fw.id)}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {fw.code}
                </span>
                <h3 className="font-semibold text-slate-900 text-sm mt-1.5 group-hover:text-blue-600 transition-colors">
                  {fw.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {fw.readinessPercentage}%
                </span>
                <span className="block text-[10px] text-slate-400">Readiness</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
              {fw.description}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${fw.readinessPercentage}%` }}
              />
            </div>

            {/* Metadata Footer */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {fw.auditTargetDate}
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Building2 className="w-3 h-3 text-slate-400" />
                {fw.auditorPartner}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Mapping Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Unified Control Cross-Reference Matrix</h2>
            <p className="text-xs text-slate-500">
              See how each SuomiGRC baseline control maps directly to respective statutory criteria.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Satisfied & Validated</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4 min-w-[240px]">SuomiGRC Unified Control</th>
                <th className="py-3 px-3 text-center min-w-[110px]">SOC 2 (TSC)</th>
                <th className="py-3 px-3 text-center min-w-[110px]">ISO 27001</th>
                <th className="py-3 px-3 text-center min-w-[110px]">HIPAA</th>
                <th className="py-3 px-3 text-center min-w-[110px]">GDPR</th>
                <th className="py-3 px-3 text-center min-w-[110px]">PCI DSS 4.0</th>
                <th className="py-3 px-3 text-center min-w-[110px]">NIST CSF 2.0</th>
                <th className="py-3 px-3 text-center min-w-[110px]">EU DORA</th>
                <th className="py-3 px-3 text-center min-w-[110px]">EU NIS2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {controls.map((ctrl) => {
                const getMapping = (fwId: FrameworkId) =>
                  ctrl.frameworkMappings.find((m) => m.frameworkId === fwId);

                return (
                  <tr
                    key={ctrl.id}
                    onClick={() => setSelectedCellControl(ctrl)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {/* Control Identity */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-900 flex items-center gap-2">
                        <span>{ctrl.code}</span>
                        {ctrl.status === 'automated_passing' ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Automated Passing" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Action Needed" />
                        )}
                      </div>
                      <div className="text-slate-600 text-xs mt-0.5 line-clamp-1">{ctrl.name}</div>
                    </td>

                    {/* SOC 2 */}
                    <td className="py-3 px-3 text-center">
                      {getMapping('soc2') ? (
                        <div className="inline-block p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono text-[11px] font-medium">
                          {getMapping('soc2')?.requirementCode}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* ISO 27001 */}
                    <td className="py-3 px-3 text-center">
                      {getMapping('iso27001') ? (
                        <div className="inline-block p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono text-[11px] font-medium">
                          {getMapping('iso27001')?.requirementCode}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* HIPAA */}
                    <td className="py-3 px-3 text-center">
                      {getMapping('hipaa') ? (
                        <div className="inline-block p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono text-[11px] font-medium">
                          {getMapping('hipaa')?.requirementCode}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* GDPR */}
                    <td className="py-3 px-3 text-center">
                      {getMapping('gdpr') ? (
                        <div className="inline-block p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono text-[11px] font-medium">
                          {getMapping('gdpr')?.requirementCode}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* PCI DSS */}
                    <td className="py-3 px-3 text-center">
                      {getMapping('pci_dss') ? (
                        <div className="inline-block p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono text-[11px] font-medium">
                          {getMapping('pci_dss')?.requirementCode}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* NIST CSF */}
                    <td className="py-3 px-3 text-center">
                      {getMapping('nist_csf') ? (
                        <div className="inline-block p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono text-[11px] font-medium">
                          {getMapping('nist_csf')?.requirementCode}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* EU DORA */}
                    <td className="py-3 px-3 text-center">
                      {getMapping('dora') ? (
                        <div className="inline-block p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono text-[11px] font-medium">
                          {getMapping('dora')?.requirementCode}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">Art. 9/11</span>
                      )}
                    </td>

                    {/* EU NIS2 */}
                    <td className="py-3 px-3 text-center">
                      {getMapping('nis2') ? (
                        <div className="inline-block p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono text-[11px] font-medium">
                          {getMapping('nis2')?.requirementCode}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">Art. 21</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control Detail Inspector Modal */}
      {selectedCellControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {selectedCellControl.code}
                  </span>
                  {selectedCellControl.lifecycleStatus && (
                    <span
                      className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        selectedCellControl.lifecycleStatus === 'Draft'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : selectedCellControl.lifecycleStatus === 'Implementation'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : selectedCellControl.lifecycleStatus === 'Retired'
                          ? 'bg-zinc-100 text-zinc-600 border-zinc-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      Stage: {selectedCellControl.lifecycleStatus}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-1">{selectedCellControl.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCellControl(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Control Specification</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedCellControl.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Mapped Statutory Criteria ({selectedCellControl.frameworkMappings.length})
                </h4>
                <div className="space-y-2">
                  {selectedCellControl.frameworkMappings.map((m, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-3">
                      <span className="uppercase font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {m.frameworkId}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 font-mono">{m.requirementCode}</div>
                        <div className="text-slate-500 mt-0.5">{m.requirementTitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedCellControl(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

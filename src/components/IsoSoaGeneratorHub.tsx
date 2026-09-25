import React, { useState, useMemo } from 'react';
import {
  IsoSoaControlItem,
  IsoTheme,
  IsoApplicability,
  IsoImplementationState,
} from '../types/isoSoa';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Building,
  Users,
  Lock,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  X,
  Plus,
} from 'lucide-react';
import { useRBAC } from '../context/RbacContext';

interface IsoSoaGeneratorHubProps {
  soaControls: IsoSoaControlItem[];
  onUpdateControls: (updated: IsoSoaControlItem[]) => void;
  onNavigateToEvidenceVault?: (controlId: string) => void;
  onNavigateToControls?: (controlId: string) => void;
}

export const IsoSoaGeneratorHub: React.FC<IsoSoaGeneratorHubProps> = ({
  soaControls,
  onUpdateControls,
  onNavigateToEvidenceVault,
  onNavigateToControls,
}) => {
  const { currentRole, currentUser } = useRBAC();
  const [selectedTheme, setSelectedTheme] = useState<IsoTheme | 'all'>('all');
  const [applicabilityFilter, setApplicabilityFilter] = useState<IsoApplicability | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedControlForEdit, setSelectedControlForEdit] = useState<IsoSoaControlItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState(false);

  // Edit Justification Modal state
  const [editApplicability, setEditApplicability] = useState<IsoApplicability>('Applicable');
  const [editJustification, setEditJustification] = useState('');
  const [editImplementationState, setEditImplementationState] = useState<IsoImplementationState>('Implemented');

  // Stats
  const stats = useMemo(() => {
    const total = soaControls.length;
    const applicable = soaControls.filter((c) => c.applicability === 'Applicable').length;
    const excluded = soaControls.filter((c) => c.applicability === 'Excluded').length;
    const implemented = soaControls.filter((c) => c.implementationState === 'Implemented').length;
    const inProgress = soaControls.filter((c) => c.implementationState === 'In Progress').length;
    const overallRate = total > 0 ? Math.round((implemented / total) * 100) : 0;

    return {
      total,
      applicable,
      excluded,
      implemented,
      inProgress,
      overallRate,
    };
  }, [soaControls]);

  // Filtered controls
  const filtered = useMemo(() => {
    return soaControls.filter((item) => {
      if (selectedTheme !== 'all' && item.theme !== selectedTheme) return false;
      if (applicabilityFilter !== 'all' && item.applicability !== applicabilityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesJust = item.justification.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesJust) return false;
      }
      return true;
    });
  }, [soaControls, selectedTheme, applicabilityFilter, searchQuery]);

  const handleOpenEdit = (control: IsoSoaControlItem) => {
    setSelectedControlForEdit(control);
    setEditApplicability(control.applicability);
    setEditJustification(control.justification);
    setEditImplementationState(control.implementationState);
  };

  const handleSaveControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedControlForEdit) return;

    const updated = soaControls.map((c) => {
      if (c.id === selectedControlForEdit.id) {
        return {
          ...c,
          applicability: editApplicability,
          justification: editJustification.trim(),
          implementationState: editImplementationState,
          lastReviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
      }
      return c;
    });

    onUpdateControls(updated);
    setSelectedControlForEdit(null);
  };

  const handleExportSoa = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportToast(true);

      const exportDoc = {
        title: 'ISO/IEC 27001:2022 Statement of Applicability (SoA)',
        version: 'v4.2 - Certified Audit Version',
        organization: 'Acme Corp (Production ISMS)',
        exportDate: new Date().toISOString(),
        auditingBody: 'BSI Group / Schellman & Company LLC',
        summary: stats,
        annexAControls: soaControls.map((c) => ({
          controlId: c.id,
          theme: c.theme,
          title: c.title,
          description: c.description,
          applicability: c.applicability,
          formalJustification: c.justification,
          implementationStatus: c.implementationState,
          owner: c.owner,
          lastReviewDate: c.lastReviewDate,
          linkedTelemetryTestIds: c.linkedTechnicalTestIds,
          linkedEvidenceVaultIds: c.linkedEvidenceVaultIds,
        })),
      };

      const blob = new Blob([JSON.stringify(exportDoc, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ISO27001_Statement_of_Applicability_SoA_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => setExportToast(false), 3500);
    }, 1200);
  };

  const getThemeIcon = (theme: IsoTheme) => {
    switch (theme) {
      case 'Organizational':
        return <Building className="w-3.5 h-3.5 text-blue-600" />;
      case 'People':
        return <Users className="w-3.5 h-3.5 text-purple-600" />;
      case 'Physical':
        return <Lock className="w-3.5 h-3.5 text-amber-600" />;
      case 'Technological':
        return <Cpu className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1536px] mx-auto pb-12">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">ISO 27001 SoA Manifest Exported</div>
            <div className="text-[11px] text-slate-300">
              Audit-ready Statement of Applicability downloaded.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>ISO/IEC 27001:2022 ISMS</span>
            <span aria-hidden="true">·</span>
            <span>Annex A Clause Governance</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Stage 2 Audit Ready</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#5B45E0]" />
            <span>Statement of Applicability (SoA) Generator</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Official ISO 27001:2022 Statement of Applicability covering all Annex A controls across Organizational, People, Physical, and Technological themes with formal justification tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportSoa}
            disabled={isExporting}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            {isExporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export Official SoA Document</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Annex A Controls</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ISO/IEC 27001:2022 Standard
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Applicable Scope</div>
          <div className="text-2xl font-bold text-[#5B45E0] mt-1 font-mono tabular-nums">
            {stats.applicable}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.excluded} Justified Exclusions
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Implementation Rate</span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">{stats.overallRate}%</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            {stats.implemented}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.overallRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Lead Auditor Sign-off</div>
          <div className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Stage 2 Observation Window Open</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Partner: BSI Group / Schellman
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Theme Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['all', 'Organizational', 'People', 'Physical', 'Technological'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedTheme === theme
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {theme === 'all' ? 'All 4 Themes' : theme}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setApplicabilityFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                applicabilityFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              All ({soaControls.length})
            </button>
            <button
              onClick={() => setApplicabilityFilter('Applicable')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                applicabilityFilter === 'Applicable' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Applicable ({stats.applicable})
            </button>
            <button
              onClick={() => setApplicabilityFilter('Excluded')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                applicabilityFilter === 'Excluded' ? 'bg-amber-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Excluded ({stats.excluded})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative pt-2 border-t border-slate-100">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Annex A control code, title, justification, or owner..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5B45E0]"
          />
        </div>
      </div>

      {/* SoA Controls Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Annex A Clause</th>
                <th className="py-3 px-4">Control Title & Standard Description</th>
                <th className="py-3 px-4">Applicability & Formal Justification</th>
                <th className="py-3 px-4">Status & Evidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((control) => {
                const isExcluded = control.applicability === 'Excluded';

                return (
                  <tr
                    key={control.id}
                    onClick={() => handleOpenEdit(control)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Clause Code & Theme */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-[#5B45E0] transition-colors">
                          {control.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-medium">
                        {getThemeIcon(control.theme)}
                        <span>{control.theme}</span>
                      </div>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {control.title}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {control.description}
                      </p>
                    </td>

                    {/* Applicability & Justification */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded border ${
                            isExcluded
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {control.applicability}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 line-clamp-2 leading-tight">
                        {control.justification}
                      </p>
                    </td>

                    {/* Status & Evidence Links */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">{control.implementationState}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Owner: <strong className="text-slate-600">{control.owner}</strong>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(control);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#5B45E0] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
                      >
                        Edit Justification
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Justification Modal */}
      {selectedControlForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-[#5B45E0] font-bold uppercase">
                  Clause {selectedControlForEdit.id} · {selectedControlForEdit.theme}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedControlForEdit.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedControlForEdit(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveControl} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Applicability Determination <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditApplicability('Applicable')}
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      editApplicability === 'Applicable'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Applicable (In Scope)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditApplicability('Excluded')}
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      editApplicability === 'Excluded'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Excluded (Justified Waiver)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Formal Audit Justification Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={editJustification}
                  onChange={(e) => setEditJustification(e.target.value)}
                  rows={4}
                  required
                  placeholder="Provide detailed justification explaining why this clause is applicable and how it is enforced, or the specific exclusion rationale..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#5B45E0] focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This text is directly evaluated by the ISO Lead Auditor during Stage 2 certification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Implementation State
                </label>
                <select
                  value={editImplementationState}
                  onChange={(e) => setEditImplementationState(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Implemented">Implemented & Verified by Telemetry</option>
                  <option value="In Progress">In Progress (Sprint Underway)</option>
                  <option value="Planned">Planned (Future Roadmap)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedControlForEdit(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg transition-colors shadow-sm"
                >
                  Save SoA Justification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

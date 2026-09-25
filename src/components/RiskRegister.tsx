import React, { useState, useEffect } from 'react';
import { RiskItem, RiskLevel, TreatmentStrategy } from '../types/grc';
import {
  AlertTriangle,
  Shield,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  CheckCircle,
  X,
} from 'lucide-react';

interface RiskRegisterProps {
  risks: RiskItem[];
  onUpdateRisks: (risks: RiskItem[]) => void;
  initialSearchQuery?: string;
  initialSelectedRiskId?: string;
  onNavigateToControl?: (controlCode: string) => void;
}

export const RiskRegister: React.FC<RiskRegisterProps> = ({
  risks,
  onUpdateRisks,
  initialSearchQuery = '',
  initialSelectedRiskId,
  onNavigateToControl,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Mitigated' | 'Under Review' | 'Accepted'>('all');
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ l: number; i: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialSelectedRiskId) {
      const found = risks.find((r) => r.id === initialSelectedRiskId);
      if (found) setSelectedRisk(found);
    }
  }, [initialSelectedRiskId, risks]);

  // Form states for new risk
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RiskItem['category']>('Infrastructure & Cloud');
  const [newInherentL, setNewInherentL] = useState<RiskLevel>(4);
  const [newInherentI, setNewInherentI] = useState<RiskLevel>(4);
  const [newResidualL, setNewResidualL] = useState<RiskLevel>(1);
  const [newResidualI, setNewResidualI] = useState<RiskLevel>(2);
  const [newTreatment, setNewTreatment] = useState<TreatmentStrategy>('Mitigate');
  const [newTreatmentDetails, setNewTreatmentDetails] = useState('');
  const [newOwner, setNewOwner] = useState('');

  const filteredRisks = risks.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.treatmentDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mitigatingControlIds.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === 'all' || r.category === filterCategory;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesHeatmap =
      !selectedHeatmapCell ||
      (r.inherentLikelihood === selectedHeatmapCell.l && r.inherentImpact === selectedHeatmapCell.i);
    return matchesSearch && matchesCat && matchesStatus && matchesHeatmap;
  });

  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRisk: RiskItem = {
      id: `RSK-00${risks.length + 1}`,
      title: newTitle,
      category: newCategory,
      inherentLikelihood: newInherentL,
      inherentImpact: newInherentI,
      residualLikelihood: newResidualL,
      residualImpact: newResidualI,
      treatment: newTreatment,
      treatmentDetails: newTreatmentDetails || 'Continuous monitoring and automated controls enforce compliance.',
      owner: newOwner || 'CISO Office',
      mitigatingControlIds: ['CTL-SEC-01'],
      lastReviewedDate: 'Just now',
      status: 'Under Review',
    };

    onUpdateRisks([newRisk, ...risks]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewTreatmentDetails('');
    setNewOwner('');
  };

  // 5x5 heatmap cell color
  const getScoreColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 16) return 'bg-red-500 text-white';
    if (score >= 10) return 'bg-amber-500 text-white';
    if (score >= 5) return 'bg-yellow-400 text-slate-900';
    return 'bg-emerald-500 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>FAIR & ISO 27005 Quantitative Analysis</span>
            <span aria-hidden="true">·</span>
            <span>Enterprise Threat Catalog</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Risk Register & 5x5 Heatmap</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Identify, assess, and treat enterprise cybersecurity and operational risks with direct linkage to mitigating technical controls.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Risk</span>
        </button>
      </div>

      {/* 5x5 Heatmap Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        {/* Visual Heatmap */}
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Inherent Risk Heatmap
            </h3>
            {selectedHeatmapCell ? (
              <button
                onClick={() => setSelectedHeatmapCell(null)}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Clear Cell Filter
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">Likelihood × Impact</span>
            )}
          </div>

          <div className="relative pt-6 pl-6">
            {/* Y axis label */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Likelihood
            </div>

            <div className="grid grid-cols-5 gap-1.5 aspect-square max-w-[280px]">
              {[5, 4, 3, 2, 1].map((l) =>
                [1, 2, 3, 4, 5].map((i) => {
                  const matchingRisks = risks.filter(
                    (r) => r.inherentLikelihood === l && r.inherentImpact === i
                  );
                  const isSelected = selectedHeatmapCell?.l === l && selectedHeatmapCell?.i === i;
                  return (
                    <button
                      key={`${l}-${i}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedHeatmapCell(null);
                        } else {
                          setSelectedHeatmapCell({ l, i });
                        }
                      }}
                      className={`rounded flex items-center justify-center font-mono text-[11px] font-bold transition-all relative ${getScoreColor(
                        l,
                        i
                      )} ${
                        isSelected
                          ? 'ring-3 ring-indigo-600 shadow-md scale-105 z-10'
                          : matchingRisks.length > 0
                          ? 'ring-1 ring-slate-900/60 shadow-2xs hover:scale-105 cursor-pointer'
                          : 'opacity-80 hover:opacity-100 cursor-pointer'
                      }`}
                      title={`Likelihood ${l}, Impact ${i}: ${matchingRisks.length} risks. Click to filter.`}
                    >
                      {matchingRisks.length > 0 ? matchingRisks.length : ''}
                    </button>
                  );
                })
              )}
            </div>

            {/* X axis label */}
            <div className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-2">
              Impact (1 to 5)
            </div>
          </div>
        </div>

        {/* Risk Mitigation Performance Summary */}
        <div className="lg:col-span-2 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Risk Treatment Posture &amp; Reduction
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Continuous controls monitoring across AWS, Okta, and GitHub actively reduces inherent threat severity to an acceptable residual threshold.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSelectedHeatmapCell(null);
                  setFilterCategory('all');
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  statusFilter === 'all' && !selectedHeatmapCell
                    ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400/20 shadow-xs'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                }`}
                title="Reset all risk filters"
              >
                <span className="text-[11px] text-slate-500 block">Total Identified Risks</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {risks.length}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Show All</span>
              </button>

              <button
                onClick={() => setStatusFilter((prev) => (prev === 'Mitigated' ? 'all' : 'Mitigated'))}
                className={`p-3 rounded-lg border text-left transition-all ${
                  statusFilter === 'Mitigated'
                    ? 'bg-emerald-100/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-emerald-50/60 border-emerald-100 hover:bg-emerald-100/50'
                }`}
                title="Filter to Mitigated Risks"
              >
                <span className="text-[11px] text-emerald-700 block">Mitigated to Tolerable</span>
                <span className="text-lg font-bold font-mono text-emerald-800 tabular-nums">
                  {risks.filter((r) => r.status === 'Mitigated').length}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  {statusFilter === 'Mitigated' ? 'Filtered: Mitigated' : 'Click to Filter'}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter((prev) => (prev === 'Under Review' ? 'all' : 'Under Review'))}
                className={`p-3 rounded-lg border text-left transition-all ${
                  statusFilter === 'Under Review'
                    ? 'bg-amber-100/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-amber-50/60 border-amber-100 hover:bg-amber-100/50'
                }`}
                title="Filter to Under Review Risks"
              >
                <span className="text-[11px] text-amber-700 block">Under Review / Open</span>
                <span className="text-lg font-bold font-mono text-amber-800 tabular-nums flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  {risks.filter((r) => r.status === 'Under Review').length}
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Active Exposure</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Next Executive Risk Review: Oct 15, 2026</span>
            <span className="font-medium text-slate-700">Methodology: NIST SP 800-30 Rev 1</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Categories ({risks.length})
          </button>
          {['Infrastructure & Cloud', 'Access & Identity', 'Third-Party & Vendor', 'Data Privacy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search risks, owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Risks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Risk ID</th>
                <th className="py-3 px-4">Threat Description</th>
                <th className="py-3 px-3 text-center">Inherent Score</th>
                <th className="py-3 px-3 text-center">Residual Score</th>
                <th className="py-3 px-4">Treatment Plan</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.map((risk) => {
                const inherentScore = risk.inherentLikelihood * risk.inherentImpact;
                const residualScore = risk.residualLikelihood * risk.residualImpact;

                return (
                  <tr
                    key={risk.id}
                    onClick={() => setSelectedRisk(risk)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-900">
                      {risk.id}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900">{risk.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{risk.treatmentDetails}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-medium">{risk.category}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        {risk.mitigatingControlIds.map((c) => (
                          <button
                            key={c}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToControl?.(c);
                            }}
                            className="font-mono text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200 transition-colors flex items-center gap-1"
                            title={`Inspect ${c} controls and continuous evidence`}
                          >
                            <span>{c}</span>
                            <span>→</span>
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Inherent Score */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${getScoreColor(risk.inherentLikelihood, risk.inherentImpact)}`}>
                        {inherentScore} ({risk.inherentLikelihood}x{risk.inherentImpact})
                      </span>
                    </td>

                    {/* Residual Score */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${getScoreColor(risk.residualLikelihood, risk.residualImpact)}`}>
                        {residualScore} ({risk.residualLikelihood}x{risk.residualImpact})
                      </span>
                    </td>

                    {/* Treatment Strategy */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {risk.treatment}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {risk.owner}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px] ${
                        risk.status === 'Mitigated'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {risk.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Risk Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-900">Add Enterprise Risk Item</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRisk} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Risk Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthenticated API access leading to sensitive customer data leak"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Infrastructure & Cloud">Infrastructure & Cloud</option>
                    <option value="Access & Identity">Access & Identity</option>
                    <option value="Third-Party & Vendor">Third-Party & Vendor</option>
                    <option value="Data Privacy">Data Privacy</option>
                    <option value="Operational & Human">Operational & Human</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Treatment Strategy</label>
                  <select
                    value={newTreatment}
                    onChange={(e) => setNewTreatment(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Mitigate">Mitigate (Implement Technical Controls)</option>
                    <option value="Accept">Accept (Document Business Justification)</option>
                    <option value="Transfer">Transfer (Insurance / Subcontract)</option>
                    <option value="Avoid">Avoid (Terminate Risky Activity)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inherent Likelihood (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newInherentL}
                    onChange={(e) => setNewInherentL(Number(e.target.value) as RiskLevel)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 (Rare)</span>
                    <span className="font-bold text-slate-900">{newInherentL}</span>
                    <span>5 (Certain)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inherent Impact (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newInherentI}
                    onChange={(e) => setNewInherentI(Number(e.target.value) as RiskLevel)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 (Low)</span>
                    <span className="font-bold text-slate-900">{newInherentI}</span>
                    <span>5 (Catastrophic)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Treatment Details & Controls</label>
                <textarea
                  rows={2}
                  placeholder="Describe technical safeguards, monitoring configurations, or policies mitigating this threat..."
                  value={newTreatmentDetails}
                  onChange={(e) => setNewTreatmentDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Risk Owner</label>
                <input
                  type="text"
                  placeholder="e.g. Mikko Hakala (CISO)"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-2xs"
                >
                  Save to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                  {selectedRisk.id}
                </span>
                <h3 className="font-semibold text-slate-900 text-base mt-1">{selectedRisk.title}</h3>
              </div>
              <button onClick={() => setSelectedRisk(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                  <span className="text-[10px] uppercase font-semibold text-red-700 block">Inherent Risk Score</span>
                  <span className="text-xl font-bold font-mono text-red-900">
                    {selectedRisk.inherentLikelihood * selectedRisk.inherentImpact}
                  </span>
                  <span className="text-[10px] text-red-600 block mt-0.5">
                    Likelihood {selectedRisk.inherentLikelihood} · Impact {selectedRisk.inherentImpact}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] uppercase font-semibold text-emerald-700 block">Residual Risk Score</span>
                  <span className="text-xl font-bold font-mono text-emerald-900">
                    {selectedRisk.residualLikelihood * selectedRisk.residualImpact}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">
                    Likelihood {selectedRisk.residualLikelihood} · Impact {selectedRisk.residualImpact}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Treatment Strategy</h4>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedRisk.treatmentDetails}
                </p>
              </div>

              {selectedRisk.mitigatingControlIds.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Mitigating Technical Controls
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRisk.mitigatingControlIds.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setSelectedRisk(null);
                          onNavigateToControl?.(c);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono font-semibold rounded-lg border border-blue-200 text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span>{c}</span>
                        <ArrowRight className="w-3 h-3 text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Owner: <strong className="text-slate-800">{selectedRisk.owner}</strong></span>
                <span>Last reviewed: {selectedRisk.lastReviewedDate}</span>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedRisk(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800"
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

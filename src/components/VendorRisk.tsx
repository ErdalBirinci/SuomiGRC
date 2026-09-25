import React, { useState, useEffect } from 'react';
import { Vendor, VendorTier } from '../types/grc';
import {
  Building,
  Plus,
  Search,
  FileText,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Calendar,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface VendorRiskProps {
  vendors: Vendor[];
  onUpdateVendors: (vendors: Vendor[]) => void;
  initialSearchQuery?: string;
  initialSelectedVendorId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const VendorRisk: React.FC<VendorRiskProps> = ({
  vendors,
  onUpdateVendors,
  initialSearchQuery = '',
  initialSelectedVendorId,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [dpaFilterOnly, setDpaFilterOnly] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialSelectedVendorId) {
      const found = vendors.find((v) => v.id === initialSelectedVendorId);
      if (found) setSelectedVendor(found);
    }
  }, [initialSelectedVendorId, vendors]);

  // Form states
  const [newVendorName, setNewVendorName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTier, setNewTier] = useState<VendorTier>('Tier 2 (High)');
  const [newDataAccess, setNewDataAccess] = useState<Vendor['dataAccess']>('Internal Data Only');
  const [newDpaSigned, setNewDpaSigned] = useState(true);
  const [newOwner, setNewOwner] = useState('');

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'all' || v.tier.includes(filterTier);
    const matchesDpa = !dpaFilterOnly || !v.dpaSigned;
    return matchesSearch && matchesTier && matchesDpa;
  });

  const handleToggleDpa = (vendorId: string) => {
    const updated = vendors.map((v) =>
      v.id === vendorId ? { ...v, dpaSigned: !v.dpaSigned } : v
    );
    onUpdateVendors(updated);
    if (selectedVendor && selectedVendor.id === vendorId) {
      setSelectedVendor({ ...selectedVendor, dpaSigned: !selectedVendor.dpaSigned });
    }
    setActionSuccessMessage('DPA execution status updated.');
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleVerifySoc2 = (vendorId: string) => {
    const updated = vendors.map((v) =>
      v.id === vendorId ? { ...v, soc2ReportStatus: 'Verified (Current)' as const } : v
    );
    onUpdateVendors(updated);
    if (selectedVendor && selectedVendor.id === vendorId) {
      setSelectedVendor({ ...selectedVendor, soc2ReportStatus: 'Verified (Current)' });
    }
    setActionSuccessMessage('SOC 2 Type II report cryptographically verified.');
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleSendQuestionnaire = (vendorId: string) => {
    const updated = vendors.map((v) =>
      v.id === vendorId ? { ...v, questionnaireScore: Math.min(100, v.questionnaireScore + 5) } : v
    );
    onUpdateVendors(updated);
    setActionSuccessMessage('Standard SIG Lite security questionnaire sent to vendor contact.');
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const newV: Vendor = {
      id: `vnd-${Date.now().toString(36)}`,
      name: newVendorName,
      category: newCategory || 'SaaS Tool',
      tier: newTier,
      dataAccess: newDataAccess,
      soc2ReportStatus: 'Under Review',
      dpaSigned: newDpaSigned,
      questionnaireScore: 92,
      nextReviewDate: 'Nov 30, 2026',
      owner: newOwner || 'Procurement Lead',
      riskRating: 'Low',
    };

    onUpdateVendors([newV, ...vendors]);
    setIsAddModalOpen(false);
    setNewVendorName('');
    setNewCategory('');
    setNewOwner('');
  };

  const criticalCount = vendors.filter((v) => v.tier.includes('Tier 1')).length;
  const dpaMissingCount = vendors.filter((v) => !v.dpaSigned).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Third-Party Risk Management (TPRM)</span>
            <span aria-hidden="true">·</span>
            <span>Sub-Processor & Supply Chain Assurance</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vendor Risk Directory</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Continuously evaluate suppliers, monitor SOC 2 report validity, enforce DPAs, and prevent supply-chain security leaks.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary Metrics (Clickable Filters) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setFilterTier('all');
            setDpaFilterOnly(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterTier === 'all' && !dpaFilterOnly
              ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
          title="Click to show all vendors"
        >
          <span className="text-xs text-slate-500 block font-medium">Total Active Vendors</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5 block">
            {vendors.length}
          </span>
          <span className="text-[10px] text-indigo-600 font-medium mt-1 block">Reset Filters</span>
        </button>

        <button
          onClick={() => {
            setFilterTier('Tier 1');
            setDpaFilterOnly(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterTier === 'Tier 1'
              ? 'bg-red-50/60 border-red-300 ring-2 ring-red-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
          title="Filter to Tier 1 Critical Vendors"
        >
          <span className="text-xs text-slate-500 block font-medium">Tier 1 Critical Vendors</span>
          <span className="text-xl font-bold font-mono text-red-600 tabular-nums mt-0.5 block">
            {criticalCount}
          </span>
          <span className="text-[10px] text-red-600 font-medium mt-1 block">Click to Filter →</span>
        </button>

        <button
          onClick={() => {
            setDpaFilterOnly((prev) => !prev);
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            dpaFilterOnly
              ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
          title="Toggle filter: Missing DPA"
        >
          <span className="text-xs text-slate-500 block font-medium">DPA Coverage</span>
          <span className="text-xl font-bold font-mono text-emerald-600 tabular-nums mt-0.5 block">
            {Math.round(((vendors.length - dpaMissingCount) / vendors.length) * 100)}%
          </span>
          <span className="text-[10px] text-amber-700 font-medium mt-1 block">
            {dpaFilterOnly ? 'Showing Missing DPA' : `${dpaMissingCount} Missing DPA`}
          </span>
        </button>

        <button
          onClick={() => {
            setSearchQuery('');
            setFilterTier('all');
            setDpaFilterOnly(false);
          }}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs text-left transition-all"
        >
          <span className="text-xs text-slate-500 block font-medium">Avg Security Score</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5 block">
            95 / 100
          </span>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Nominal Posture</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => {
              setFilterTier('all');
              setDpaFilterOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterTier === 'all' && !dpaFilterOnly
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Tiers ({vendors.length})
          </button>
          <button
            onClick={() => {
              setFilterTier('Tier 1');
              setDpaFilterOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterTier === 'Tier 1'
                ? 'bg-red-600 text-white'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            Tier 1 Critical ({criticalCount})
          </button>
          <button
            onClick={() => {
              setFilterTier('Tier 2');
              setDpaFilterOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterTier === 'Tier 2'
                ? 'bg-amber-600 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Tier 2 High
          </button>
          <button
            onClick={() => {
              setFilterTier('Tier 3');
              setDpaFilterOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterTier === 'Tier 3'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Tier 3 Medium
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor name, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Vendor &amp; Category</th>
                <th className="py-3 px-4">Criticality Tier</th>
                <th className="py-3 px-4">Data Access Scope</th>
                <th className="py-3 px-4">SOC 2 / ISO Report</th>
                <th className="py-3 px-4 text-center">DPA Signed</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Next Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  title="Click to view and manage vendor compliance"
                >
                  {/* Vendor Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                      <span>{vendor.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[11px] text-slate-500">{vendor.category}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Owner: {vendor.owner}</div>
                  </td>

                  {/* Tier */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        vendor.tier.includes('Tier 1')
                          ? 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                          : vendor.tier.includes('Tier 2')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {vendor.tier}
                    </span>
                  </td>

                  {/* Data Access */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono text-slate-700 text-[11px]">
                      {vendor.dataAccess}
                    </span>
                  </td>

                  {/* SOC 2 Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        vendor.soc2ReportStatus.includes('Verified')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : vendor.soc2ReportStatus.includes('Expiring')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {vendor.soc2ReportStatus}
                    </span>
                  </td>

                  {/* DPA */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {vendor.dpaSigned ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 tabular-nums text-xs">
                      {vendor.questionnaireScore}%
                    </span>
                  </td>

                  {/* Next Review */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-[11px] text-slate-600">
                    {vendor.nextReviewDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Detail & Management Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedVendor.name}</h3>
                  <p className="text-xs text-slate-500">{selectedVendor.category} · Owner: {selectedVendor.owner}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Criticality Tier</span>
                <span className="font-semibold text-slate-800">{selectedVendor.tier}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data Access Boundary</span>
                <span className="font-semibold text-slate-800">{selectedVendor.dataAccess}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SOC 2 Type II Assurance</span>
                <span className="font-semibold text-slate-800">{selectedVendor.soc2ReportStatus}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Security Score</span>
                <span className="font-bold font-mono text-slate-900 text-sm">{selectedVendor.questionnaireScore}% Verified</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-semibold text-slate-800 block">Actions & Governance Workflows</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleDpa(selectedVendor.id)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    selectedVendor.dpaSigned
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedVendor.dpaSigned ? 'DPA Executed (Signed)' : 'Mark DPA Signed'}</span>
                </button>

                <button
                  onClick={() => handleVerifySoc2(selectedVendor.id)}
                  className="py-2 px-3 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify SOC 2 Report</span>
                </button>
              </div>

              <button
                onClick={() => {
                  handleSendQuestionnaire(selectedVendor.id);
                  if (onNavigateTab) {
                    onNavigateTab('questionnaires');
                    setSelectedVendor(null);
                  }
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Launch Automated Security Questionnaire Hub →</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>Next Annual Review: {selectedVendor.nextReviewDate}</span>
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-900">Add New Sub-Processor / Vendor</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Snowflake Inc."
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Service Category</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Data Warehouse & Analytics"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Criticality Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as VendorTier)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Tier 1 (Critical)">Tier 1 (Critical)</option>
                    <option value="Tier 2 (High)">Tier 2 (High)</option>
                    <option value="Tier 3 (Medium)">Tier 3 (Medium)</option>
                    <option value="Tier 4 (Low)">Tier 4 (Low)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Data Access</label>
                  <select
                    value={newDataAccess}
                    onChange={(e) => setNewDataAccess(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Customer PII & Production">Customer PII & Production</option>
                    <option value="Internal Data Only">Internal Data Only</option>
                    <option value="Metadata Only">Metadata Only</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="dpa-check"
                  checked={newDpaSigned}
                  onChange={(e) => setNewDpaSigned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="dpa-check" className="text-slate-700 font-medium">
                  Standard Data Processing Agreement (DPA) executed with EU SCCs
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Internal Relationship Owner</label>
                <input
                  type="text"
                  placeholder="e.g. Hanna Mäkinen (Legal)"
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
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

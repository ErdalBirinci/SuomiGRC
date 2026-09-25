import React, { useState, useMemo } from 'react';
import { AuditorFirm, AuditEngagementBooking } from '../types/auditorMarketplace';
import { FrameworkId } from '../types/grc';
import {
  Building2,
  Star,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Calendar,
  DollarSign,
  FileCheck,
  Plus,
  X,
  Sparkles,
  Award,
  Globe2,
  Check,
} from 'lucide-react';
import { useRBAC } from '../context/RbacContext';

interface AuditorMarketplaceHubProps {
  firms: AuditorFirm[];
  bookings: AuditEngagementBooking[];
  onAddBooking: (booking: AuditEngagementBooking) => void;
  onNavigateToAuditorWorkspace?: () => void;
}

export const AuditorMarketplaceHub: React.FC<AuditorMarketplaceHubProps> = ({
  firms,
  bookings,
  onAddBooking,
  onNavigateToAuditorWorkspace,
}) => {
  const { currentRole, currentUser } = useRBAC();
  const [selectedFramework, setSelectedFramework] = useState<FrameworkId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFirmForRfp, setSelectedFirmForRfp] = useState<AuditorFirm | null>(null);
  const [isRfpModalOpen, setIsRfpModalOpen] = useState(false);
  const [rfpSuccessToast, setRfpSuccessToast] = useState<string | null>(null);

  // RFP Estimator State
  const [rfpFrameworks, setRfpFrameworks] = useState<FrameworkId[]>(['soc2', 'iso27001']);
  const [teamSize, setTeamSize] = useState(45);
  const [cloudAccountCount, setCloudAccountCount] = useState(3);
  const [targetStartDate, setTargetStartDate] = useState('2026-11-01');
  const [signedNda, setSignedNda] = useState(true);

  // Estimate price dynamically based on scope
  const calculatedEstimate = useMemo(() => {
    let base = 9000;
    if (rfpFrameworks.includes('soc2')) base += 4500;
    if (rfpFrameworks.includes('iso27001')) base += 5500;
    if (rfpFrameworks.includes('hipaa')) base += 3500;
    if (rfpFrameworks.includes('pci_dss')) base += 4000;
    if (rfpFrameworks.includes('gdpr')) base += 2500;
    if (teamSize > 100) base += 3000;
    return `$${(base - 1000).toLocaleString()} – $${(base + 3000).toLocaleString()}`;
  }, [rfpFrameworks, teamSize]);

  // Filtered firms
  const filteredFirms = useMemo(() => {
    return firms.filter((firm) => {
      if (selectedFramework !== 'all' && !firm.supportedFrameworks.includes(selectedFramework)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = firm.name.toLowerCase().includes(q);
        const matchesSpec = firm.specializations.some((s) => s.toLowerCase().includes(q));
        const matchesDesc = firm.description.toLowerCase().includes(q);
        if (!matchesName && !matchesSpec && !matchesDesc) return false;
      }
      return true;
    });
  }, [firms, selectedFramework, searchQuery]);

  const handleOpenRfp = (firm: AuditorFirm) => {
    setSelectedFirmForRfp(firm);
    setIsRfpModalOpen(true);
  };

  const handleToggleFramework = (fw: FrameworkId) => {
    if (rfpFrameworks.includes(fw)) {
      if (rfpFrameworks.length > 1) {
        setRfpFrameworks(rfpFrameworks.filter((f) => f !== fw));
      }
    } else {
      setRfpFrameworks([...rfpFrameworks, fw]);
    }
  };

  const handleSubmitRfp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFirmForRfp) return;

    const newBooking: AuditEngagementBooking = {
      id: `book-${Date.now().toString(36)}`,
      firmId: selectedFirmForRfp.id,
      firmName: selectedFirmForRfp.name,
      frameworks: rfpFrameworks,
      targetObservationStart: targetStartDate,
      targetObservationEnd: '2026-12-15',
      status: 'proposal_received',
      estimatedCost: calculatedEstimate,
      leadAuditor: selectedFirmForRfp.leadPartners[0]?.name || 'Engagement Lead',
      signedNda: signedNda,
      pbcFulfillmentRate: 0,
    };

    onAddBooking(newBooking);
    setIsRfpModalOpen(false);
    setRfpSuccessToast(`RFP Proposal submitted to ${selectedFirmForRfp.name}! Audit portal synced.`);
    setTimeout(() => setRfpSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-[1536px] mx-auto pb-12">
      {/* Toast Notification */}
      {rfpSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-semibold">{rfpSuccessToast}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Accredited Auditor Network</span>
            <span aria-hidden="true">·</span>
            <span>Independent CPA & ISO Registrars</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Pre-Integrated API Sync</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#5B45E0]" />
            <span>Auditor Directory & RFP Matchmaker</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Directly connect with top-tier AICPA certified CPA firms and ISO registrars. Request instant audit proposals with automated scope calculations.
          </p>
        </div>

        {onNavigateToAuditorWorkspace && (
          <button
            onClick={onNavigateToAuditorWorkspace}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-[#5B45E0]" />
            <span>Active Auditor Workspace ({bookings.length})</span>
          </button>
        )}
      </div>

      {/* Active Audit Engagements Banner */}
      {bookings.length > 0 && (
        <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active CPA Engagement in Progress
              </span>
            </div>
            <span className="text-xs font-mono text-[#5B45E0] font-bold">
              {bookings[0].firmName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Framework Scope</span>
              <span className="font-semibold text-slate-800 uppercase font-mono mt-0.5 block">
                {bookings[0].frameworks.join(' · ')}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Auditor</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {bookings[0].leadAuditor}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Fee</span>
              <span className="font-semibold text-emerald-700 font-mono mt-0.5 block">
                {bookings[0].estimatedCost}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Observation Window</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{bookings[0].targetObservationStart}</span>
              </div>
              <button
                onClick={onNavigateToAuditorWorkspace}
                className="text-xs font-semibold text-[#5B45E0] hover:underline"
              >
                Open →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Framework Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['all', 'soc2', 'iso27001', 'hipaa', 'pci_dss', 'gdpr'] as const).map((fw) => (
              <button
                key={fw}
                onClick={() => setSelectedFramework(fw)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap uppercase ${
                  selectedFramework === fw
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fw === 'all' ? 'All Frameworks' : fw.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search firm, specialization, partner..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5B45E0]"
            />
          </div>
        </div>
      </div>

      {/* Auditor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFirms.map((firm) => (
          <div
            key={firm.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-[#5B45E0] hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-2xs"
                    style={{ backgroundColor: firm.accentColor }}
                  >
                    {firm.logoInitial}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {firm.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span className="font-semibold text-amber-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {firm.rating}
                      </span>
                      <span>({firm.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-[#5B45E0] font-bold border border-indigo-200 shrink-0">
                  {firm.vantaPartnerTier}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                {firm.description}
              </p>

              {/* Supported Frameworks */}
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Audit Attestations
                </span>
                <div className="flex flex-wrap gap-1">
                  {firm.supportedFrameworks.map((fw) => (
                    <span
                      key={fw}
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {fw.toUpperCase().replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing & Turnaround */}
              <div className="grid grid-cols-2 gap-2 mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Typical Fee</span>
                  <span className="font-mono font-bold text-slate-900">{firm.basePriceEstimate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Observation Cycle</span>
                  <span className="font-semibold text-slate-800">{firm.turnaroundWeeks}</span>
                </div>
              </div>

              {/* Lead Partner */}
              <div className="text-[11px] text-slate-500 mt-3 flex items-center justify-between">
                <span>Lead Partner: <strong>{firm.leadPartners[0]?.name}</strong></span>
                <span className="font-mono text-[10px]">{firm.leadPartners[0]?.certifications.join(', ')}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenRfp(firm)}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>Request Audit Proposal (RFP)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* RFP Modal */}
      {isRfpModalOpen && selectedFirmForRfp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-[#5B45E0] font-bold uppercase">
                  Audit Scope Calculator & RFP
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Request Proposal from {selectedFirmForRfp.name}
                </h3>
              </div>
              <button
                onClick={() => setIsRfpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRfp} className="space-y-4 text-xs">
              {/* Select Frameworks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Audit Standards in Scope <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['soc2', 'iso27001', 'hipaa', 'pci_dss', 'gdpr'] as const).map((fw) => {
                    const isChecked = rfpFrameworks.includes(fw);
                    return (
                      <button
                        type="button"
                        key={fw}
                        onClick={() => handleToggleFramework(fw)}
                        className={`p-2 rounded-lg border text-left font-medium transition-all ${
                          isChecked
                            ? 'bg-indigo-50 border-[#5B45E0] text-[#5B45E0] font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="uppercase font-mono">{fw.replace('_', ' ')}</span>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Organization Size & Cloud footprint */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employee Headcount
                  </label>
                  <input
                    type="number"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    min={1}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Observation Start
                  </label>
                  <input
                    type="date"
                    value={targetStartDate}
                    onChange={(e) => setTargetStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Dynamic Instant Scope Estimate Box */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Estimated Engagement Fee</span>
                  <span className="font-mono text-base text-[#5B45E0]">{calculatedEstimate}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Continuous evidence collection via SuomiGRC saves an estimated 65 hours of CPA fieldwork.
                </p>
              </div>

              {/* NDA Checkbox */}
              <label className="flex items-start gap-2 text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={signedNda}
                  onChange={(e) => setSignedNda(e.target.checked)}
                  className="mt-0.5 rounded text-[#5B45E0] focus:ring-[#5B45E0]"
                />
                <span className="text-[11px]">
                  Enforce Mutual Non-Disclosure Agreement (MNDA) for all PBC evidence samples shared during engagement.
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRfpModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit RFP & Book Kickoff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  SecurityIncident,
  IncidentSeverity,
  IncidentStatus,
  IncidentCategory,
  IncidentTimelineEvent,
} from '../types/incidentResponse';
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileCheck2,
  Download,
  Plus,
  Send,
  Building,
  Check,
  X,
  Search,
  Users,
  ChevronRight,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface IncidentResponseHubProps {
  incidents: SecurityIncident[];
  onUpdateIncidents: (incidents: SecurityIncident[]) => void;
  onNavigateTab?: (tab: string) => void;
}

export const IncidentResponseHub: React.FC<IncidentResponseHubProps> = ({
  incidents,
  onUpdateIncidents,
  onNavigateTab,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDpaModalOpen, setIsDpaModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // New incident state
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('P2_HIGH');
  const [newCategory, setNewCategory] = useState<IncidentCategory>('unauthorized_access');
  const [newContainsPii, setNewContainsPii] = useState(false);
  const [newAffectedSystems, setNewAffectedSystems] = useState('AWS Staging, Vault');

  // DPA notification draft state
  const [dpaNoticeText, setDpaNoticeText] = useState('');
  const [dpaSubmitted, setDpaSubmitted] = useState(false);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const p1Count = incidents.filter((i) => i.severity === 'P1_CRITICAL').length;
  const p2Count = incidents.filter((i) => i.severity === 'P2_HIGH').length;
  const activeCount = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;
  const piiIncidentsCount = incidents.filter((i) => i.containsPII).length;

  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.incidentNumber.toLowerCase().includes(q) ||
        inc.summary.toLowerCase().includes(q) ||
        inc.incidentCommander.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleUpdateStatus = (incidentId: string, nextStatus: IncidentStatus) => {
    const updated = incidents.map((inc) => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: nextStatus,
          containedAt: nextStatus === 'contained' ? 'Just now' : inc.containedAt,
          resolvedAt: nextStatus === 'resolved' ? 'Just now' : inc.resolvedAt,
          timeline: [
            ...inc.timeline,
            {
              id: `evt-${Date.now()}`,
              timestamp: 'Just now',
              actor: 'Incident Commander',
              action: `Incident status transitioned to ${nextStatus.toUpperCase()}.`,
              phase: (nextStatus === 'contained' ? 'containment' : nextStatus === 'resolved' ? 'recovery' : 'eradication') as IncidentTimelineEvent['phase'],
            },
          ],
        };
      }
      return inc;
    });
    onUpdateIncidents(updated);
    showNotification(`Incident status updated to ${nextStatus.toUpperCase()}`);
  };

  const handleSealPostMortem = (incidentId: string) => {
    const updated = incidents.map((inc) => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          postMortemReportSealed: true,
          cryptographicSignature: `WORM-POSTMORTEM-0x${Math.random().toString(16).substring(2, 18)}`,
        };
      }
      return inc;
    });
    onUpdateIncidents(updated);
    showNotification('Post-mortem report sealed with immutable cryptographic timestamp for auditors.');
  };

  const handleOpenDpaModal = (inc: SecurityIncident) => {
    setDpaNoticeText(
      `GDPR ARTICLE 33 NOTIFICATION OF PERSONAL DATA BREACH\nTo: ${inc.dpaAuthorityName || 'Supervisory Data Protection Authority'}\nFrom: CISO / Data Protection Officer, Acme Technologies Corp\nDate: ${new Date().toISOString()}\n\n1. Nature of the Personal Data Breach:\nIncident ${inc.incidentNumber}: ${inc.title}.\nCategory: ${inc.category}. Systems affected: ${inc.affectedSystems.join(', ')}.\n\n2. Likely Consequences:\nApproximately ${inc.affectedRecordsCount} records impacted. Access was contained within ${inc.containedAt || 'active window'}.\n\n3. Measures Taken or Proposed to Address the Breach:\n${inc.preventativeMeasures?.join('\n') || 'Containment active.'}`
    );
    setDpaSubmitted(false);
    setIsDpaModalOpen(true);
  };

  const handleSendDpaNotification = () => {
    if (!selectedIncident) return;
    const updated = incidents.map((inc) => {
      if (inc.id === selectedIncident.id) {
        return {
          ...inc,
          gdprNotificationStatus: 'notified_dpa' as const,
          timeline: [
            ...inc.timeline,
            {
              id: `evt-${Date.now()}`,
              timestamp: 'Just now',
              actor: 'Data Protection Officer',
              action: 'Formal GDPR Article 33 notice transmitted to Supervisory Authority.',
              phase: 'recovery' as const,
            },
          ],
        };
      }
      return inc;
    });
    onUpdateIncidents(updated);
    setDpaSubmitted(true);
    setTimeout(() => {
      setIsDpaModalOpen(false);
      showNotification('GDPR DPA Article 33 notification sent and logged into WORM Evidence Vault!');
    }, 1500);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newInc: SecurityIncident = {
      id: `inc-${Date.now()}`,
      incidentNumber: `INC-2026-${Math.floor(Math.random() * 900 + 100)}`,
      title: newTitle.trim(),
      summary: newSummary.trim() || 'Active security investigation initiated by SecOps triage.',
      severity: newSeverity,
      status: 'investigating',
      category: newCategory,
      detectedAt: new Date().toISOString(),
      incidentCommander: 'Mikko Korhonen (CISO)',
      affectedSystems: newAffectedSystems.split(',').map((s) => s.trim()),
      affectedRecordsCount: newContainsPii ? 120 : 0,
      containsPII: newContainsPii,
      gdpr72hDeadline: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      gdprRemainingHours: newContainsPii ? 72 : 0,
      gdprNotificationStatus: newContainsPii ? 'evaluating' : 'not_required',
      dpaAuthorityName: 'EU Supervisory Data Protection Authority',
      rootCauseAnalysis: 'Preliminary investigation ongoing. Log forensics dispatched.',
      preventativeMeasures: ['Network isolation implemented', 'Credential rotation underway'],
      timeline: [
        {
          id: `evt-1`,
          timestamp: 'Just now',
          actor: 'Security Operations Center',
          action: 'Incident ticket opened. Incident bridge established.',
          phase: 'detection',
        },
      ],
      postMortemReportSealed: false,
    };

    onUpdateIncidents([newInc, ...incidents]);
    setSelectedIncidentId(newInc.id);
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewSummary('');
    showNotification(`Incident ${newInc.incidentNumber} declared. Timers started.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
              <Flame className="w-5 h-5 text-rose-600" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              SOC 2 CC7.3 · ISO 27001 A.16 · GDPR Art. 33
            </span>
            <span className="text-xs text-slate-500 font-mono">Incident Commander Portal</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Incident Response & 72-Hour Breach Notification Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Audit-ready security incident tracking, root-cause post-mortems, and mandatory regulatory notification countdowns (EU GDPR 72h DPA deadline & SEC 4-day material incident rule).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Declare Security Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setSeverityFilter('all')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            severityFilter === 'all'
              ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Active Incidents</span>
            <span className="p-1 rounded-md bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-2">{activeCount}</div>
          <div className="text-[10px] text-blue-700 font-medium mt-1">Under active triage / containment</div>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === 'P1_CRITICAL' ? 'all' : 'P1_CRITICAL')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            severityFilter === 'P1_CRITICAL'
              ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">P1 Critical Severity</span>
            <span className="p-1 rounded-md bg-rose-50 text-rose-700">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-2">{p1Count}</div>
          <div className="text-[10px] text-rose-700 font-medium mt-1">Requires 15m bridge response</div>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === 'P2_HIGH' ? 'all' : 'P2_HIGH')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            severityFilter === 'P2_HIGH'
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">P2 High Severity</span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-2">{p2Count}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-1">Containment target: &lt;2 hours</div>
        </button>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">GDPR / PII Scope</span>
            <span className="p-1 rounded-md bg-purple-50 text-purple-700">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-2">{piiIncidentsCount}</div>
          <div className="text-[10px] text-purple-700 font-medium mt-1">72-Hour DPA clock active</div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Incidents List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search incident number, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {severityFilter !== 'all' && (
              <button
                onClick={() => setSeverityFilter('all')}
                className="text-[11px] text-blue-600 font-medium hover:underline whitespace-nowrap"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {filteredIncidents.map((inc) => {
              const isSelected = inc.id === (selectedIncident?.id || '');

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-1 ring-slate-900'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className={isSelected ? 'text-slate-300 font-bold' : 'text-slate-500 font-bold'}>
                          {inc.incidentNumber}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            inc.severity === 'P1_CRITICAL'
                              ? 'bg-rose-500 text-white'
                              : inc.severity === 'P2_HIGH'
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {inc.severity.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs mt-1 line-clamp-1">{inc.title}</h4>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inc.status === 'contained'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <p className={`text-[11px] mt-2 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {inc.summary}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/40">
                    <span className={isSelected ? 'text-slate-400 text-[10px]' : 'text-slate-400 text-[10px]'}>
                      Commander: {inc.incidentCommander}
                    </span>
                    {inc.containsPII && (
                      <span className="text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                        <span>GDPR 72h:</span>
                        <span className="font-mono">{inc.gdprRemainingHours}h left</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedIncident && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{selectedIncident.incidentNumber}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      selectedIncident.severity === 'P1_CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedIncident.severity === 'P2_HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedIncident.severity.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">{selectedIncident.title}</h2>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2">
                {selectedIncident.status === 'investigating' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'contained')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Mark Contained
                  </button>
                )}
                {selectedIncident.status === 'contained' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'resolved')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* GDPR 72-Hour Notification Box (If PII involved) */}
            {selectedIncident.containsPII && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-700 animate-pulse" />
                    <span className="font-bold text-xs uppercase tracking-wider text-purple-900">
                      GDPR Article 33: 72-Hour DPA Notification Deadline
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-purple-900 bg-purple-200/70 px-2 py-0.5 rounded">
                    {selectedIncident.gdprNotificationStatus === 'notified_dpa'
                      ? 'DPA Notified (Compliant)'
                      : `${selectedIncident.gdprRemainingHours} Hours Remaining`}
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Regulation (EU) 2016/679 mandates that unless the personal data breach is unlikely to result in a risk to rights and freedoms of natural persons, notification to the supervisory authority must be made without undue delay and within 72 hours of becoming aware.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-purple-700 font-medium">
                    Authority: {selectedIncident.dpaAuthorityName || 'Supervisory Authority'}
                  </span>
                  <button
                    onClick={() => handleOpenDpaModal(selectedIncident)}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>
                      {selectedIncident.gdprNotificationStatus === 'notified_dpa'
                        ? 'View Sent DPA Notice'
                        : 'Draft Article 33 Notice'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Systems & Scope Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Incident Commander</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedIncident.incidentCommander}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Affected Systems</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {selectedIncident.affectedSystems.join(', ')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Records Impacted</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {selectedIncident.affectedRecordsCount} records
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Incident Response Timeline (Detection → Recovery)
              </h3>
              <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-1">
                {selectedIncident.timeline.map((evt) => (
                  <div key={evt.id} className="relative group text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 group-hover:bg-blue-600 transition-colors" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{evt.timestamp}</span>
                      <span className="font-semibold text-slate-800">{evt.actor}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-medium bg-slate-100 text-slate-600">
                        {evt.phase}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{evt.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Root Cause & Preventative Actions */}
            {selectedIncident.rootCauseAnalysis && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Root Cause Analysis (RCA)
                </h4>
                <p className="text-slate-700 leading-relaxed">{selectedIncident.rootCauseAnalysis}</p>
                {selectedIncident.preventativeMeasures && selectedIncident.preventativeMeasures.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 mt-2">
                    <span className="font-semibold text-slate-700 block mb-1 text-[11px]">
                      Permanent Corrective Measures Enforced:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                      {selectedIncident.preventativeMeasures.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Post-Mortem Report Seal */}
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl text-xs">
              <div>
                <div className="font-semibold">Formal Post-Mortem & SOC 2 CC7.3 Audit Package</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {selectedIncident.postMortemReportSealed
                    ? `Cryptographically sealed: ${selectedIncident.cryptographicSignature}`
                    : 'Requires Incident Commander digital signature after remediation.'}
                </div>
              </div>

              {!selectedIncident.postMortemReportSealed ? (
                <button
                  onClick={() => handleSealPostMortem(selectedIncident.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  Seal Post-Mortem
                </button>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] rounded border border-emerald-500/30">
                  Auditor Sealed ✓
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DPA Notice Modal */}
      {isDpaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-purple-50">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-sm text-purple-950">GDPR Article 33 Breach Notification Transmission</h3>
              </div>
              <button onClick={() => setIsDpaModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                This document will be cryptographically timestamped and transmitted to the supervisory authority's secure reporting endpoint. A copy is permanently preserved in the WORM Evidence Vault for SOC 2 and GDPR audits.
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Breach Filing Content (Editable)</label>
                <textarea
                  rows={10}
                  value={dpaNoticeText}
                  onChange={(e) => setDpaNoticeText(e.target.value)}
                  className="w-full font-mono text-[11px] p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDpaModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendDpaNotification}
                  disabled={dpaSubmitted}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{dpaSubmitted ? 'Transmitting Notice...' : 'Transmit Official Notice to DPA'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Declare Incident Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">Declare Security Incident</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized S3 Bucket Object Read Anomaly"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Severity Tier</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  >
                    <option value="P1_CRITICAL">P1 - Critical (Active Outage/Breach)</option>
                    <option value="P2_HIGH">P2 - High (Elevated Risk)</option>
                    <option value="P3_MEDIUM">P3 - Medium (Contained Anomaly)</option>
                    <option value="P4_LOW">P4 - Low (Informational)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  >
                    <option value="unauthorized_access">Unauthorized Access</option>
                    <option value="data_exfiltration">Data Exfiltration</option>
                    <option value="ransomware">Ransomware</option>
                    <option value="credential_compromise">Credential Compromise</option>
                    <option value="ddos">DDoS</option>
                    <option value="phishing">Phishing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Affected Systems (comma separated)</label>
                <input
                  type="text"
                  value={newAffectedSystems}
                  onChange={(e) => setNewAffectedSystems(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Initial Summary & Observables</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe initial detection vectors, alerts triggered, and active triage..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkPii"
                  checked={newContainsPii}
                  onChange={(e) => setNewContainsPii(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="chkPii" className="text-purple-900 font-semibold cursor-pointer">
                  Contains Customer Personal Data (PII) · Triggers 72h GDPR DPA Clock
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Declare Incident & Notify On-Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

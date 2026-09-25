import React, { useState } from 'react';
import { AuditRequest, FrameworkId, ComplianceSnapshot, AuditException, AutomatedTest } from '../types/grc';
import { ComplianceDriftTimeline } from './ComplianceDriftTimeline';
import { AuditExceptionsHub } from './AuditExceptionsHub';
import {
  FileCheck2,
  Download,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  UserCheck,
  Search,
  ExternalLink,
  Shield,
  FileText,
  History,
  FileWarning,
} from 'lucide-react';

interface AuditorWorkspaceProps {
  auditRequests: AuditRequest[];
  onUpdateAuditRequests: (requests: AuditRequest[]) => void;
  selectedFramework: FrameworkId | 'all';
  snapshots?: ComplianceSnapshot[];
  exceptions?: AuditException[];
  tests?: AutomatedTest[];
  onUpdateExceptions?: (exceptions: AuditException[]) => void;
}

export const AuditorWorkspace: React.FC<AuditorWorkspaceProps> = ({
  auditRequests,
  onUpdateAuditRequests,
  selectedFramework,
  snapshots = [],
  exceptions = [],
  tests = [],
  onUpdateExceptions,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'drift' | 'exceptions'>('requests');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);

  const filteredRequests = auditRequests.filter(
    (r) => selectedFramework === 'all' || r.framework === selectedFramework
  );

  const handleExportBinder = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 2000);
  };

  const handleSimulateEvidenceUpload = (reqId: string) => {
    setUploadingRequestId(reqId);
    setTimeout(() => {
      onUpdateAuditRequests(
        auditRequests.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: 'In Review',
                evidenceItems: [
                  ...r.evidenceItems,
                  {
                    id: `ev-${Date.now()}`,
                    title: `Automated_SuomiGRC_Evidence_${r.controlCode}_Timestamped.pdf`,
                    source: 'SuomiGRC Automated Pipeline',
                    uploadedAt: 'Just now',
                  },
                ],
              }
            : r
        )
      );
      setUploadingRequestId(null);
    }, 1200);
  };

  const handleAuditorApprove = (reqId: string) => {
    onUpdateAuditRequests(
      auditRequests.map((r) => (r.id === reqId ? { ...r, status: 'Approved' } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Direct CPA & ISO Auditor Collaboration</span>
            <span aria-hidden="true">·</span>
            <span>Provided By Client (PBC) Queue</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Auditor Collaboration Workspace</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Grant external auditors read-only access to automated evidence binders, observation period drift, and formal risk acceptance waivers.
          </p>
        </div>

        <button
          onClick={handleExportBinder}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {isExporting
              ? 'Compiling Cryptographic Binder...'
              : exportComplete
              ? 'Binder Exported (ZIP)!'
              : 'Export Full Audit Binder'}
          </span>
        </button>
      </div>

      {/* Auditor Assigned Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            BC
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-900">Bradley Campbell, CPA, CISSP</span>
              <span aria-hidden="true">·</span>
              <span>Lead Engagement Partner</span>
            </div>
            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
              <span className="font-medium text-slate-700">Coalfire Systems & Schellman LLP</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-400">SOC 2 Type II & ISO 27001 Audit Window</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-medium">
            Auditor Portal Access: <strong>Active (Read-Only)</strong>
          </div>
        </div>
      </div>

      {/* Sub-Tabs for Auditor Workspace */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeSubTab === 'requests'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>PBC Requests ({filteredRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('drift')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeSubTab === 'drift'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Observation Drift Timeline</span>
        </button>
        <button
          onClick={() => setActiveSubTab('exceptions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeSubTab === 'exceptions'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" />
          <span>Auditor Waivers & SLAs ({exceptions.length})</span>
        </button>
      </div>

      {/* Sub-Tab 1: Requests Table */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Audit Evidence Sample Testing Queue ({filteredRequests.length})
              </h2>
              <p className="text-xs text-slate-500">
                Auditor-submitted sample requests for controls testing and continuous verification.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">PBC Item & Control</th>
                  <th className="py-3 px-4">Sample Request Details</th>
                  <th className="py-3 px-4">Attached Evidence</th>
                  <th className="py-3 px-4">Audit Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Control */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                        {req.id}
                      </span>
                      <span className="block font-mono text-slate-700 text-[11px] mt-1">
                        {req.controlCode}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {req.framework}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-medium text-slate-900">{req.requestTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Requested by {req.auditorName}</span>
                      </div>
                    </td>

                    {/* Evidence */}
                    <td className="py-3.5 px-4">
                      {req.evidenceItems.length > 0 ? (
                        <div className="space-y-1">
                          {req.evidenceItems.map((ev) => (
                            <div
                              key={ev.id}
                              className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 w-fit text-[11px]"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate max-w-[200px]">{ev.title}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No evidence uploaded</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {req.dueDate}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'In Review'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : req.status === 'Clarification Needed'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {req.status === 'In Review' && <Clock className="w-3 h-3 text-blue-600" />}
                        {req.status === 'Clarification Needed' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                        <span>{req.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSimulateEvidenceUpload(req.id)}
                          disabled={uploadingRequestId === req.id || req.status === 'Approved'}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {uploadingRequestId === req.id ? 'Attaching...' : 'Upload Evidence'}
                        </button>
                        {req.status !== 'Approved' && (
                          <button
                            onClick={() => handleAuditorApprove(req.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                          >
                            Sign Off
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Compliance Drift Timeline */}
      {activeSubTab === 'drift' && (
        <ComplianceDriftTimeline snapshots={snapshots} />
      )}

      {/* Sub-Tab 3: Auditor Exceptions & Waivers */}
      {activeSubTab === 'exceptions' && (
        <AuditExceptionsHub
          exceptions={exceptions}
          tests={tests}
          onUpdateExceptions={onUpdateExceptions || (() => {})}
        />
      )}
    </div>
  );
};

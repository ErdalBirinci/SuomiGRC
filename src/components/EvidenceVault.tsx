import React, { useState, useMemo } from 'react';
import {
  EvidenceItem,
  EvidenceStatus,
  EvidenceCollectionMethod,
  EvidenceFileType,
} from '../types/evidence';
import { Control, FrameworkId } from '../types/grc';
import { useRBAC } from '../context/RbacContext';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Shield,
  Eye,
  Check,
  X,
  Plus,
  RefreshCw,
  Layers,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  Lock,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  Sparkles,
  Database,
  Calendar,
  User,
  Hash,
  Copy,
  ArrowUpRight,
  AlertCircle,
  FileCode2,
  FileSpreadsheet,
  FileBadge,
} from 'lucide-react';

interface EvidenceVaultProps {
  evidenceList: EvidenceItem[];
  onUpdateEvidence: (updated: EvidenceItem[]) => void;
  controls: Control[];
  selectedFramework: FrameworkId | 'all';
  onNavigateToControl?: (controlId: string) => void;
  initialControlFilter?: string | null;
  onClearInitialControlFilter?: () => void;
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({
  evidenceList,
  onUpdateEvidence,
  controls,
  selectedFramework,
  onNavigateToControl,
  initialControlFilter,
  onClearInitialControlFilter,
}) => {
  const { currentRole, currentUser, canPerformAction } = useRBAC();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EvidenceStatus | 'all'>('all');
  const [controlFilter, setControlFilter] = useState<string>(initialControlFilter || 'all');
  const [methodFilter, setMethodFilter] = useState<EvidenceCollectionMethod | 'all'>('all');
  const [freshnessFilter, setFreshnessFilter] = useState<'all' | 'fresh' | 'expiring_soon' | 'stale'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEvidenceForDetail, setSelectedEvidenceForDetail] = useState<EvidenceItem | null>(null);
  const [isExportingBinder, setIsExportingBinder] = useState(false);
  const [exportCompleteToast, setExportCompleteToast] = useState(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [integrityVerifiedId, setIntegrityVerifiedId] = useState<string | null>(null);

  // Review Form in Detail Modal
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Upload Modal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newControlId, setNewControlId] = useState(controls[0]?.id || 'CTL-IAM-01');
  const [newFileType, setNewFileType] = useState<EvidenceFileType>('pdf');
  const [newFileName, setNewFileName] = useState('');
  const [newSource, setNewSource] = useState('Manual Upload');
  const [newCollectionMethod, setNewCollectionMethod] = useState<EvidenceCollectionMethod>('manual_upload');
  const [newTagsInput, setNewTagsInput] = useState('Audit-2026, Compliance');
  const [newValidMonths, setNewValidMonths] = useState(12);

  // Keep controlFilter synced with initialControlFilter prop if passed
  React.useEffect(() => {
    if (initialControlFilter) {
      setControlFilter(initialControlFilter);
    }
  }, [initialControlFilter]);

  // Derived Statistics
  const stats = useMemo(() => {
    const total = evidenceList.length;
    const approved = evidenceList.filter((e) => e.status === 'approved').length;
    const pending = evidenceList.filter((e) => e.status === 'pending').length;
    const rejected = evidenceList.filter((e) => e.status === 'rejected').length;
    const expiring = evidenceList.filter((e) => e.freshnessStatus === 'expiring_soon' || e.freshnessStatus === 'stale').length;

    // Controls covered calculation
    const coveredControlIds = new Set(evidenceList.map((e) => e.controlId));
    const totalControlsCount = controls.length;
    const coveragePercentage = totalControlsCount > 0 ? Math.round((coveredControlIds.size / totalControlsCount) * 100) : 0;
    const readinessRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return {
      total,
      approved,
      pending,
      rejected,
      expiring,
      coveredControlsCount: coveredControlIds.size,
      totalControlsCount,
      coveragePercentage,
      readinessRate,
    };
  }, [evidenceList, controls]);

  // Filtered Evidence Items
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      // Framework Filter
      if (selectedFramework !== 'all' && !item.frameworks.includes(selectedFramework)) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Control Filter
      if (controlFilter !== 'all' && item.controlId !== controlFilter && !item.secondaryControlIds?.includes(controlFilter)) {
        return false;
      }

      // Collection Method Filter
      if (methodFilter !== 'all' && item.collectionMethod !== methodFilter) {
        return false;
      }

      // Freshness Filter
      if (freshnessFilter !== 'all' && item.freshnessStatus !== freshnessFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesFilename = item.fileName.toLowerCase().includes(q);
        const matchesControl = item.controlCode.toLowerCase().includes(q) || item.controlName.toLowerCase().includes(q);
        const matchesUploader = item.uploadedBy.name.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesSource = item.source.toLowerCase().includes(q);
        if (!matchesTitle && !matchesFilename && !matchesControl && !matchesUploader && !matchesTags && !matchesSource) {
          return false;
        }
      }

      return true;
    });
  }, [evidenceList, selectedFramework, statusFilter, controlFilter, methodFilter, freshnessFilter, searchQuery]);

  // Handlers
  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleVerifyIntegrity = (id: string) => {
    setIntegrityVerifiedId(id);
    setTimeout(() => {
      setIntegrityVerifiedId(null);
    }, 2500);
  };

  const handleStatusChange = (itemId: string, newStatus: EvidenceStatus, note?: string, reason?: string) => {
    const updated: EvidenceItem[] = evidenceList.map((item) => {
      if (item.id === itemId) {
        const reviewerInfo = {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.title,
          reviewedAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' UTC',
          note: note || (newStatus === 'approved' ? 'Approved for audit observation window.' : reason || 'Rejected pending clarification.'),
        };

        const auditAction: 'approved' | 'rejected' | 'updated' = newStatus === 'approved' ? 'approved' : 'rejected';
        const newLog = {
          id: `log-${Date.now()}`,
          action: auditAction,
          performedBy: `${currentUser.name} (${currentUser.title})`,
          role: currentRole,
          timestamp: reviewerInfo.reviewedAt,
          note: reviewerInfo.note,
        };

        return {
          ...item,
          status: newStatus,
          statusReason: newStatus === 'approved' ? (note || 'Approved by audit authority') : (reason || 'Flagged during audit inspection'),
          reviewedBy: reviewerInfo,
          auditHistory: [newLog, ...(item.auditHistory || [])],
        };
      }
      return item;
    });

    onUpdateEvidence(updated);

    if (selectedEvidenceForDetail && selectedEvidenceForDetail.id === itemId) {
      const refreshedItem = updated.find((e) => e.id === itemId) || null;
      setSelectedEvidenceForDetail(refreshedItem);
    }

    setReviewAction(null);
    setReviewNote('');
    setRejectionReason('');
  };

  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFileName.trim()) return;

    const matchedControl = controls.find((c) => c.id === newControlId) || controls[0];
    const generatedHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + newValidMonths);

    const controlFrameworks: FrameworkId[] = matchedControl.frameworkMappings?.map((m) => m.frameworkId) || ['soc2', 'iso27001'];

    const newEvidence: EvidenceItem = {
      id: `ev-${Date.now().toString(36)}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Uploaded evidence document for continuous audit compliance.',
      fileName: newFileName.trim(),
      fileSize: `${(Math.random() * 2 + 0.4).toFixed(1)} MB`,
      fileType: newFileType,
      controlId: matchedControl.id,
      controlCode: matchedControl.code || matchedControl.id,
      controlName: matchedControl.name,
      frameworks: controlFrameworks,
      status: 'pending',
      statusReason: 'Newly uploaded artifact awaiting compliance lead or auditor sign-off.',
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' UTC',
      uploadedBy: {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.title,
        avatarInitials: currentUser.avatarInitials,
      },
      collectionMethod: newCollectionMethod,
      source: newSource.trim() || 'Manual Upload',
      validUntil: expiryDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      freshnessStatus: 'fresh',
      sha256Hash: generatedHash,
      tags: newTagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      previewContent: {
        type: newFileType === 'json' ? 'json' : newFileType === 'csv' ? 'table' : 'markdown',
        data: newFileType === 'csv' ? { headers: ['Item', 'Status'], rows: [['Entry 1', 'Valid']] } : {},
        rawText: `# Evidence Documentation: ${newTitle}\n**Control:** ${matchedControl.code || matchedControl.id} - ${matchedControl.name}\n**Timestamp:** ${new Date().toISOString()}\n**Uploaded By:** ${currentUser.name}\n\nEvidence artifact uploaded and registered in SuomiGRC tamper-evident vault.`,
      },
      auditHistory: [
        {
          id: `log-${Date.now()}`,
          action: 'uploaded',
          performedBy: `${currentUser.name} (${currentUser.title})`,
          role: currentRole,
          timestamp: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' UTC',
          note: `Evidence created and mapped to ${matchedControl.code || matchedControl.id}.`,
        },
      ],
    };

    onUpdateEvidence([newEvidence, ...evidenceList]);
    setIsUploadModalOpen(false);

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewFileName('');
    setNewTagsInput('Audit-2026, Compliance');
  };

  const handleExportEvidencePackage = () => {
    setIsExportingBinder(true);
    setTimeout(() => {
      setIsExportingBinder(false);
      setExportCompleteToast(true);

      // Create downloadable JSON manifest
      const exportManifest = {
        exportTitle: 'SuomiGRC Certified Compliance Evidence Package',
        exportDate: new Date().toISOString(),
        tenant: 'NordicScale Technologies Inc.',
        cpaFirmScope: 'SOC 2 Type II / ISO 27001 / HIPAA Audit Observation Window',
        totalArtifacts: filteredEvidence.length,
        approvedArtifacts: filteredEvidence.filter((e) => e.status === 'approved').length,
        evidenceRecords: filteredEvidence.map((e) => ({
          id: e.id,
          title: e.title,
          fileName: e.fileName,
          controlCode: e.controlCode,
          controlName: e.controlName,
          frameworks: e.frameworks,
          status: e.status,
          sha256Hash: e.sha256Hash,
          source: e.source,
          validUntil: e.validUntil,
          reviewedBy: e.reviewedBy,
        })),
      };

      const blob = new Blob([JSON.stringify(exportManifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SuomiGRC_Evidence_Vault_Package_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => setExportCompleteToast(false), 4000);
    }, 1200);
  };

  const getFileIcon = (fileType: EvidenceFileType) => {
    switch (fileType) {
      case 'json':
      case 'log':
        return <FileCode2 className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'pdf':
        return <FileBadge className="w-4 h-4 text-blue-600 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600 shrink-0" />;
    }
  };

  const canApprove = currentRole === 'ciso' || currentRole === 'auditor';
  const canUpload = currentRole === 'ciso' || currentRole === 'compliance_analyst';

  return (
    <div className="space-y-6 max-w-[1536px] mx-auto pb-12">
      {/* Toast Notification */}
      {exportCompleteToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">Evidence Binder Exported</div>
            <div className="text-[11px] text-slate-300">
              Cryptographically signed manifest downloaded successfully.
            </div>
          </div>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Audit Assurance</span>
            <span aria-hidden="true">·</span>
            <span>Cryptographic Proof Vault</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Continuous Sync Active</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#5B45E0]" />
            <span>Evidence Vault & Control Artifacts</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Central repository for associating verified documentation, configuration dumps, automated telemetry, and third-party reports with security controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportEvidencePackage}
            disabled={isExportingBinder}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs flex items-center gap-2 disabled:opacity-60"
            title="Download complete evidence binder manifest with SHA-256 checksums"
          >
            {isExportingBinder ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5B45E0]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Export Audit Binder</span>
          </button>

          {canUpload ? (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg transition-colors shadow-2xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Associate Evidence</span>
            </button>
          ) : (
            <div
              className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5"
              title="Auditor role is read-only for uploads. You can review and approve evidence."
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Upload Restricted</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Deep Link Banner if initialControlFilter is active */}
      {controlFilter !== 'all' && (
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Filtering by Control:</span>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
              {controlFilter}
            </span>
            <span className="text-blue-700 truncate">
              {controls.find((c) => c.id === controlFilter)?.name || ''}
            </span>
          </div>
          <button
            onClick={() => {
              setControlFilter('all');
              if (onClearInitialControlFilter) onClearInitialControlFilter();
            }}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
          >
            <span>Show all controls</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Audit Readiness & KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Artifacts</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-400" />
            <span>{stats.coveredControlsCount} of {stats.totalControlsCount} controls covered</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Approved & Ready</span>
            <span className="text-[11px] font-bold text-emerald-700 font-mono">{stats.readinessRate}%</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums flex items-baseline gap-2">
            <span>{stats.approved}</span>
            <span className="text-xs font-normal text-slate-400">audit ready</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.readinessRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Pending Review</div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-mono tabular-nums flex items-baseline gap-2">
            <span>{stats.pending}</span>
            <span className="text-xs font-normal text-slate-400">awaiting sign-off</span>
          </div>
          <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Requires evaluation</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Rejected / Action Needed</div>
          <div className="text-2xl font-bold text-rose-700 mt-1 font-mono tabular-nums flex items-baseline gap-2">
            <span>{stats.rejected}</span>
            <span className="text-xs font-normal text-slate-400">needs remediation</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Auditor feedback logged</span>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Control Coverage</div>
          <div className="text-2xl font-bold text-blue-700 mt-1 font-mono tabular-nums">
            {stats.coveragePercentage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {stats.coveredControlsCount}/{stats.totalControlsCount} unified controls
          </div>
        </div>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Artifacts ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved ({stats.approved})</span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-white text-amber-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Review ({stats.pending})</span>
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'rejected'
                  ? 'bg-white text-rose-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Rejected ({stats.rejected})</span>
            </button>
          </div>

          {/* View Switcher & Clear Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, filename, hash, tag..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Control Filter Dropdown */}
          <div>
            <select
              value={controlFilter}
              onChange={(e) => setControlFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Associated Controls ({controls.length})</option>
              {controls.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code || c.id} — {c.name.length > 32 ? c.name.substring(0, 32) + '...' : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collection Method Dropdown */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Ingestion Sources</option>
              <option value="automated_sync">Automated Cloud Sync (API)</option>
              <option value="manual_upload">Manual Document Upload</option>
              <option value="agent_telemetry">MDM / Endpoint Agent</option>
              <option value="api_crawler">Continuous Crawler</option>
            </select>
          </div>

          {/* Freshness Filter */}
          <div>
            <select
              value={freshnessFilter}
              onChange={(e) => setFreshnessFilter(e.target.value as any)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Validity Windows</option>
              <option value="fresh">Fresh & Current</option>
              <option value="expiring_soon">Expiring within 60 Days</option>
              <option value="stale">Stale / Renewal Needed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          <span>Showing </span>
          <span className="font-semibold text-slate-900 font-mono">{filteredEvidence.length}</span>
          <span> of </span>
          <span className="font-semibold text-slate-900 font-mono">{evidenceList.length}</span>
          <span> evidence artifacts</span>
        </div>
        {(statusFilter !== 'all' || controlFilter !== 'all' || methodFilter !== 'all' || freshnessFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setControlFilter('all');
              setMethodFilter('all');
              setFreshnessFilter('all');
              setSearchQuery('');
              if (onClearInitialControlFilter) onClearInitialControlFilter();
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Main Content: Table View or Grid View */}
      {filteredEvidence.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No evidence artifacts match your query</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Try adjusting your search terms, status filters, or framework scope, or upload a new compliance artifact.
          </p>
          {canUpload && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Upload First Evidence</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Enterprise Table View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Artifact / File Name</th>
                  <th className="py-3 px-3">Associated Control</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Source & Ingestion</th>
                  <th className="py-3 px-3">Uploaded / Reviewed</th>
                  <th className="py-3 px-3">Integrity Hash</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvidence.map((item) => {
                  const isVerified = integrityVerifiedId === item.id;
                  const isCopied = copiedHashId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedEvidenceForDetail(item)}
                    >
                      {/* Title & File Name */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          {getFileIcon(item.fileType)}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5 truncate">
                              <span>{item.fileName}</span>
                              <span aria-hidden="true">·</span>
                              <span>{item.fileSize}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Associated Control */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                            {item.controlCode}
                          </span>
                          <div className="text-[11px] text-slate-600 truncate max-w-[180px]">
                            {item.controlName}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            item.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : item.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {item.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {item.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          {item.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>

                      {/* Source & Method */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium truncate max-w-[160px]">
                          {item.source}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {item.collectionMethod.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Uploaded / Reviewed by */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700 font-medium text-[11px]">
                          {item.uploadedBy.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.uploadedAt.split(' at ')[0]}
                        </div>
                      </td>

                      {/* SHA-256 Hash */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.sha256Hash.substring(0, 10)}...
                          </span>
                          <button
                            onClick={() => handleCopyHash(item.sha256Hash, item.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="Copy full SHA-256 Hash"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedEvidenceForDetail(item)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Artifact Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((item) => {
            const isVerified = integrityVerifiedId === item.id;
            const isCopied = copiedHashId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedEvidenceForDetail(item)}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all hover:border-slate-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top Bar: Icon + Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                        {getFileIcon(item.fileType)}
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {item.controlCode}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.status === 'pending'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {item.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {item.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                      {item.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">File & Size:</span>
                      <span className="font-mono text-slate-700 font-medium truncate max-w-[170px]">
                        {item.fileName} ({item.fileSize})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Source:</span>
                      <span className="text-slate-700 font-medium">{item.source}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Valid Until:</span>
                      <span className={`font-medium ${item.freshnessStatus === 'expiring_soon' ? 'text-amber-700' : 'text-slate-700'}`}>
                        {item.validUntil}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Hash & Quick Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>{item.sha256Hash.substring(0, 8)}...</span>
                  </div>

                  <button
                    onClick={() => setSelectedEvidenceForDetail(item)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                  >
                    <span>View Artifact</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evidence Detail, Inspector & Review Modal */}
      {selectedEvidenceForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-2xs text-blue-600 shrink-0 mt-0.5">
                  {getFileIcon(selectedEvidenceForDetail.fileType)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedEvidenceForDetail.controlCode}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        selectedEvidenceForDetail.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : selectedEvidenceForDetail.status === 'pending'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {selectedEvidenceForDetail.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {selectedEvidenceForDetail.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {selectedEvidenceForDetail.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      <span className="capitalize">{selectedEvidenceForDetail.status}</span>
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {selectedEvidenceForDetail.controlName}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedEvidenceForDetail.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedEvidenceForDetail(null);
                  setReviewAction(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Description & Overview */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Artifact Overview
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedEvidenceForDetail.description}
                </p>
              </div>

              {/* SHA-256 Cryptographic Verification Banner */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic SHA-256 Fingerprint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyHash(selectedEvidenceForDetail.sha256Hash, selectedEvidenceForDetail.id)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100 flex items-center gap-1"
                    >
                      {copiedHashId === selectedEvidenceForDetail.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleVerifyIntegrity(selectedEvidenceForDetail.id)}
                      className="px-2 py-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 flex items-center gap-1"
                    >
                      {integrityVerifiedId === selectedEvidenceForDetail.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 animate-pulse" />
                          <span className="text-emerald-700 font-bold">Verified Valid</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3 text-blue-600" />
                          <span>Verify WORM Invariant</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="font-mono text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 break-all select-all">
                  {selectedEvidenceForDetail.sha256Hash}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-400">File Name & Size</div>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate" title={selectedEvidenceForDetail.fileName}>
                    {selectedEvidenceForDetail.fileName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{selectedEvidenceForDetail.fileSize}</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-400">Collection Source</div>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate">
                    {selectedEvidenceForDetail.source}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {selectedEvidenceForDetail.collectionMethod.replace('_', ' ')}
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-400">Uploaded By</div>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate">
                    {selectedEvidenceForDetail.uploadedBy.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {selectedEvidenceForDetail.uploadedAt}
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-400">Validity Window</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedEvidenceForDetail.validUntil}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium">Unexpired</div>
                </div>
              </div>

              {/* Document / Payload Content Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Evidence Payload Preview</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    Format: {selectedEvidenceForDetail.fileType}
                  </span>
                </div>

                {/* Formatted Content View */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-100 p-4 font-mono text-xs max-h-64 overflow-y-auto">
                  {selectedEvidenceForDetail.previewContent?.type === 'table' && selectedEvidenceForDetail.previewContent.data?.headers ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-700 text-slate-400 text-[11px]">
                            {selectedEvidenceForDetail.previewContent.data.headers.map((h: string, idx: number) => (
                              <th key={idx} className="py-1 px-2 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-200">
                          {selectedEvidenceForDetail.previewContent.data.rows.map((row: string[], rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-800/50">
                              {row.map((cell: string, cIdx: number) => (
                                <td key={cIdx} className="py-1 px-2 text-[11px]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : selectedEvidenceForDetail.previewContent?.type === 'json' ? (
                    <pre className="text-emerald-400 whitespace-pre-wrap">
                      {JSON.stringify(selectedEvidenceForDetail.previewContent.data, null, 2)}
                    </pre>
                  ) : selectedEvidenceForDetail.previewContent?.type === 'certificate' ? (
                    <div className="space-y-2 font-sans bg-slate-800 p-3 rounded-lg border border-slate-700 text-slate-200">
                      <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Certified Audit Attestation</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">ISSUER</span>
                          <span className="font-medium">{selectedEvidenceForDetail.previewContent.data.issuer || selectedEvidenceForDetail.previewContent.data.firm}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">VERDICT / STATUS</span>
                          <span className="font-semibold text-emerald-400">{selectedEvidenceForDetail.previewContent.data.executiveVerdict || selectedEvidenceForDetail.previewContent.data.retentionPeriod}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-slate-200 whitespace-pre-wrap font-sans text-xs">
                      {selectedEvidenceForDetail.previewContent?.rawText || 'Verified evidence content ingested.'}
                    </pre>
                  )}
                </div>
              </div>

              {/* Auditor Sign-off / Review Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span>Compliance & Audit Review Workflow</span>
                  </h4>
                  {selectedEvidenceForDetail.reviewedBy && (
                    <span className="text-[11px] text-slate-500">
                      Last reviewed by <strong className="text-slate-800">{selectedEvidenceForDetail.reviewedBy.name}</strong> on {selectedEvidenceForDetail.reviewedBy.reviewedAt}
                    </span>
                  )}
                </div>

                {selectedEvidenceForDetail.reviewedBy?.note && (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 italic">
                    &ldquo;{selectedEvidenceForDetail.reviewedBy.note}&rdquo;
                  </div>
                )}

                {/* Action Buttons for Lead Auditor or CISO */}
                {canApprove ? (
                  <div>
                    {!reviewAction ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReviewAction('approve')}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Artifact</span>
                        </button>
                        <button
                          onClick={() => setReviewAction('reject')}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject / Request Remediation</span>
                        </button>
                      </div>
                    ) : reviewAction === 'approve' ? (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                        <div className="text-xs font-semibold text-emerald-900">
                          Grant Formal Auditor Sign-off
                        </div>
                        <input
                          type="text"
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Optional audit sign-off note (e.g. Sample verified, satisfies SOC 2 CC6.1)..."
                          className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(selectedEvidenceForDetail.id, 'approved', reviewNote)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                          >
                            Confirm Approval
                          </button>
                          <button
                            onClick={() => setReviewAction(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                        <div className="text-xs font-semibold text-rose-900">
                          Log Rejection & Feedback
                        </div>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="State reason for rejection (e.g. Missing PR approval record, expired certificate)..."
                          className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(selectedEvidenceForDetail.id, 'rejected', undefined, rejectionReason)}
                            disabled={!rejectionReason.trim()}
                            className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md disabled:opacity-50"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() => setReviewAction(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    You are logged in as {currentUser.title}. Formal status sign-off requires CISO or Lead Auditor credentials.
                  </div>
                )}
              </div>

              {/* Audit Log History */}
              {selectedEvidenceForDetail.auditHistory && selectedEvidenceForDetail.auditHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Evidence Lifecycle & Audit Trail
                  </h4>
                  <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                    {selectedEvidenceForDetail.auditHistory.map((log) => (
                      <div key={log.id} className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 capitalize">{log.action}</span>
                          <span className="text-slate-400">by {log.performedBy}</span>
                          <span className="text-[10px] text-slate-400 font-mono">· {log.timestamp}</span>
                        </div>
                        {log.note && <p className="text-slate-600 text-[11px] mt-0.5">{log.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {onNavigateToControl && (
                <button
                  onClick={() => {
                    onNavigateToControl(selectedEvidenceForDetail.controlId);
                    setSelectedEvidenceForDetail(null);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>View Control in Monitoring ({selectedEvidenceForDetail.controlCode})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedEvidenceForDetail(null);
                  setReviewAction(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg ml-auto"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Associate Evidence Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Upload & Associate Evidence
                  </h3>
                  <p className="text-xs text-slate-500">
                    Associate compliance evidence artifacts directly with security controls.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvidence} className="p-5 space-y-4 overflow-y-auto">
              {/* Target Control Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Control Mapping <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newControlId}
                  onChange={(e) => setNewControlId(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B45E0] focus:bg-white"
                  required
                >
                  {controls.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code || c.id} — {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  This artifact will be registered in the tamper-proof vault and linked to this control.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Artifact Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AWS CloudTrail Log Ingestion Snapshot (Q3)"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5B45E0] focus:bg-white"
                  required
                />
              </div>

              {/* File Name & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    File Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. CloudTrail_Integrity_Report.pdf"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5B45E0] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    File Type Format
                  </label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#5B45E0]"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="json">JSON Telemetry Dump (.json)</option>
                    <option value="csv">CSV Spreadsheet (.csv)</option>
                    <option value="md">Markdown Report (.md)</option>
                    <option value="log">Raw System Log (.log)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Context
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe how this artifact proves compliance with the target control..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5B45E0] focus:bg-white"
                />
              </div>

              {/* Source & Validity Window */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Source Integration
                  </label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="e.g. AWS CloudWatch, Okta"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ingestion Method
                  </label>
                  <select
                    value={newCollectionMethod}
                    onChange={(e) => setNewCollectionMethod(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="manual_upload">Manual Upload</option>
                    <option value="automated_sync">Automated Sync (API)</option>
                    <option value="agent_telemetry">MDM / Agent</option>
                    <option value="api_crawler">Continuous Crawler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Validity Window
                  </label>
                  <select
                    value={newValidMonths}
                    onChange={(e) => setNewValidMonths(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value={3}>3 Months (Quarterly)</option>
                    <option value={6}>6 Months (Semi-annual)</option>
                    <option value={12}>12 Months (Annual)</option>
                    <option value={24}>24 Months (2-Year)</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTagsInput}
                  onChange={(e) => setNewTagsInput(e.target.value)}
                  placeholder="e.g. AWS, Security, Q3-Audit"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              {/* Form Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Register Artifact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

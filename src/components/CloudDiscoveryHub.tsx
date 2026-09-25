import React, { useState, useMemo } from 'react';
import {
  DiscoveredResource,
  CloudAccountConnector,
  CloudProvider,
  MappingStatus,
  MappedControlRule,
  SensitivityLevel,
  UsageClassification,
  SuggestedSecurityTag,
  TaggingEngineStats,
} from '../types/cloudDiscovery';
import {
  scanAndEnrichResourceWithTags,
  scanAllCloudResources,
  computeTaggingStats,
  applySuggestedTagsToResource,
  generateTerraformTagSnippet,
  generateCliTagCommand,
  generateTaggingAuditCsv,
  generateTaggingAuditJson,
} from '../utils/cloudTaggingEngine';
import { useRBAC } from '../context/RbacContext';
import {
  Server,
  Cloud,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowRight,
  Filter,
  Check,
  X,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Code2,
  ExternalLink,
  Plus,
  Sparkles,
  Download,
  Eye,
  ChevronRight,
  Database,
  Cpu,
  Lock,
  Tag,
  Radio,
  SlidersHorizontal,
  Copy,
  CheckSquare,
  FileCode,
  Terminal,
} from 'lucide-react';

interface CloudDiscoveryHubProps {
  resources: DiscoveredResource[];
  connectors: CloudAccountConnector[];
  onUpdateResources: (resources: DiscoveredResource[]) => void;
  onUpdateConnectors: (connectors: CloudAccountConnector[]) => void;
  onNavigateToControls?: (controlCode?: string) => void;
}

export const CloudDiscoveryHub: React.FC<CloudDiscoveryHubProps> = ({
  resources,
  connectors,
  onUpdateResources,
  onUpdateConnectors,
  onNavigateToControls,
}) => {
  const { currentRole, currentUser } = useRBAC();

  // Filter state
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MappingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');
  const [taggingStatusFilter, setTaggingStatusFilter] = useState<'all' | 'fully_tagged' | 'suggestions_pending' | 'untagged'>('all');
  const [sensitivityFilter, setSensitivityFilter] = useState<SensitivityLevel | 'all'>('all');

  // Interactive scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanToast, setScanToast] = useState<string | null>(null);
  const [scanProgressStep, setScanProgressStep] = useState<string | null>(null);

  // Automated Tagging Engine modal state
  const [isTaggingModalOpen, setIsTaggingModalOpen] = useState(false);
  const [isTaggingScanActive, setIsTaggingScanActive] = useState(false);
  const [copiedTerraformId, setCopiedTerraformId] = useState<string | null>(null);
  const [copiedCliId, setCopiedCliId] = useState<string | null>(null);
  const [taggingModalFilter, setTaggingModalFilter] = useState<'all' | 'pending' | 'applied'>('all');
  const [taggingModalSensitivity, setTaggingModalSensitivity] = useState<SensitivityLevel | 'all'>('all');
  const [taggingModalProvider, setTaggingModalProvider] = useState<CloudProvider | 'all'>('all');
  const [taggingModalUsage, setTaggingModalUsage] = useState<UsageClassification | 'all'>('all');
  const [taggingModalSearch, setTaggingModalSearch] = useState('');
  const [activeTaggingModalTab, setActiveTaggingModalTab] = useState<'review' | 'matrix' | 'iac'>('review');
  const [selectedTaggingResourceForIac, setSelectedTaggingResourceForIac] = useState<DiscoveredResource | null>(null);

  // Modal / Drawer state
  const [selectedResourceForDetail, setSelectedResourceForDetail] = useState<DiscoveredResource | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);

  // New Custom Rule Form State
  const [newRuleTagKey, setNewRuleTagKey] = useState('DataClassification');
  const [newRuleTagVal, setNewRuleTagVal] = useState('Confidential PII');
  const [newRuleControl, setNewRuleControl] = useState('SOC 2 CC6.1 - Logical Access & KMS Encryption');
  const [newRuleTest, setNewRuleTest] = useState('AWS S3 Default SSE-KMS & TLS 1.3 Verification');

  // Trigger brief alert toast
  const showToast = (msg: string) => {
    setScanToast(msg);
    setTimeout(() => {
      setScanToast(null);
    }, 4000);
  };

  // Tagging Engine Fleet Statistics
  const taggingStats: TaggingEngineStats = useMemo(() => {
    return computeTaggingStats(resources);
  }, [resources]);

  // Automated Tagging Engine: Full Inventory Deep Scan
  const handleRunAutomatedTaggingEngine = () => {
    setIsTaggingScanActive(true);
    setScanProgressStep('Analyzing resource types, operational usage patterns, and data sensitivity levels...');

    setTimeout(() => {
      setScanProgressStep('Generating SOC 2, ISO 27001, GDPR, and BCDR security control tag suggestions...');
      setTimeout(() => {
        setIsTaggingScanActive(false);
        setScanProgressStep(null);

        const { enrichedResources, stats } = scanAllCloudResources(resources);
        onUpdateResources(enrichedResources);

        // Also update selectedResourceForDetail if open
        if (selectedResourceForDetail) {
          const updatedSelected = enrichedResources.find((r) => r.id === selectedResourceForDetail.id);
          if (updatedSelected) setSelectedResourceForDetail(updatedSelected);
        }

        showToast(
          `✓ Automated Tagging Engine finished: Evaluated ${stats.totalResources} assets. Generated ${stats.totalSuggestedTagsCount} security control tags based on Resource Type, Usage, and Sensitivity!`
        );
      }, 1200);
    }, 1000);
  };

  // Apply all pending suggested tags across the fleet
  const handleApplyAllSuggestedTags = () => {
    const updated = resources.map((r) => applySuggestedTagsToResource(r));
    onUpdateResources(updated);
    if (selectedResourceForDetail) {
      const updatedSelected = updated.find((r) => r.id === selectedResourceForDetail.id);
      if (updatedSelected) setSelectedResourceForDetail(updatedSelected);
    }
    showToast(`✓ Applied all suggested security control tags across ${resources.length} cloud resources!`);
  };

  // Apply suggested tags for a single resource
  const handleApplyTagsForResource = (resourceId: string, tagKeys?: string[]) => {
    const updated = resources.map((r) => {
      if (r.id === resourceId) {
        return applySuggestedTagsToResource(r, tagKeys);
      }
      return r;
    });
    onUpdateResources(updated);

    if (selectedResourceForDetail && selectedResourceForDetail.id === resourceId) {
      const updatedSelected = updated.find((r) => r.id === resourceId);
      if (updatedSelected) setSelectedResourceForDetail(updatedSelected);
    }

    showToast(`✓ Applied security control tags to resource.`);
  };

  // Copy Terraform IaC Snippet
  const handleCopyTerraformSnippet = (resource: DiscoveredResource) => {
    const snippet = generateTerraformTagSnippet(resource);
    navigator.clipboard.writeText(snippet);
    setCopiedTerraformId(resource.id);
    setTimeout(() => setCopiedTerraformId(null), 2500);
    showToast(`✓ Copied Terraform / OpenTofu security tag block for "${resource.name}"!`);
  };

  // Copy CLI Snippet
  const handleCopyCliSnippet = (resource: DiscoveredResource) => {
    const cmd = generateCliTagCommand(resource);
    navigator.clipboard.writeText(cmd);
    setCopiedCliId(resource.id);
    setTimeout(() => setCopiedCliId(null), 2500);
    showToast(`✓ Copied CLI command to tag "${resource.name}"!`);
  };

  // Apply single tag to resource
  const handleApplySingleTag = (resourceId: string, tagKey: string) => {
    const updated = resources.map((r) => {
      if (r.id === resourceId) {
        return applySuggestedTagsToResource(r, [tagKey]);
      }
      return r;
    });
    onUpdateResources(updated);
    if (selectedResourceForDetail && selectedResourceForDetail.id === resourceId) {
      const updatedSelected = updated.find((r) => r.id === resourceId);
      if (updatedSelected) setSelectedResourceForDetail(updatedSelected);
    }
    showToast(`✓ Applied tag "${tagKey}" to resource.`);
  };

  // Export Tagging Matrix as CSV
  const handleExportTaggingCsv = () => {
    const csvContent = generateTaggingAuditCsv(resources);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AcmeCorp-Security-Control-Tags-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Exported security control tagging matrix as CSV.');
  };

  // Export Tagging Matrix as JSON
  const handleExportTaggingJson = () => {
    const jsonContent = generateTaggingAuditJson(resources);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AcmeCorp-Security-Control-Tags-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Exported security control tagging audit report as JSON.');
  };

  // Filtered resources specifically for the Automated Tagging Engine modal
  const filteredTaggingResources = useMemo(() => {
    return resources.filter((res) => {
      if (taggingModalProvider !== 'all' && res.cloudProvider !== taggingModalProvider) {
        return false;
      }
      if (taggingModalSensitivity !== 'all' && res.sensitivityLevel !== taggingModalSensitivity) {
        return false;
      }
      if (taggingModalUsage !== 'all' && res.usageClassification !== taggingModalUsage) {
        return false;
      }
      if (taggingModalFilter === 'pending') {
        const hasPending = res.suggestedTags?.some((t) => !t.isApplied);
        if (!hasPending) return false;
      } else if (taggingModalFilter === 'applied') {
        if (res.taggingStatus !== 'fully_tagged') return false;
      }
      if (taggingModalSearch.trim()) {
        const q = taggingModalSearch.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(q);
        const matchesArn = res.arnOrUri.toLowerCase().includes(q);
        const matchesType = res.resourceType.toLowerCase().includes(q);
        const matchesTags = Object.entries(res.tags || {}).some(
          ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );
        const matchesSuggested = res.suggestedTags?.some(
          (t) =>
            t.key.toLowerCase().includes(q) ||
            t.value.toLowerCase().includes(q) ||
            t.reason.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesArn && !matchesType && !matchesTags && !matchesSuggested) {
          return false;
        }
      }
      return true;
    });
  }, [
    resources,
    taggingModalProvider,
    taggingModalSensitivity,
    taggingModalUsage,
    taggingModalFilter,
    taggingModalSearch,
  ]);

  // Apply all suggestions across the currently filtered list
  const handleApplyFilteredSuggestedTags = () => {
    const targetIds = new Set(filteredTaggingResources.map((r) => r.id));
    const updated = resources.map((r) => {
      if (targetIds.has(r.id)) {
        return applySuggestedTagsToResource(r);
      }
      return r;
    });
    onUpdateResources(updated);
    if (selectedResourceForDetail && targetIds.has(selectedResourceForDetail.id)) {
      const updatedSelected = updated.find((r) => r.id === selectedResourceForDetail.id);
      if (updatedSelected) setSelectedResourceForDetail(updatedSelected);
    }
    showToast(`✓ Applied suggested tags across ${filteredTaggingResources.length} filtered resources!`);
  };

  // Run deep multi-cloud discovery sweep
  const handleTriggerDiscoverySweep = () => {
    setIsScanning(true);
    setScanProgressStep('Connecting to AWS CloudTrail, GCP Cloud Asset Inventory, and Azure Resource Graph...');

    setTimeout(() => {
      setScanProgressStep('Ingesting 1,840+ cloud resource descriptors and evaluating security control heuristics...');
      setTimeout(() => {
        setIsScanning(false);
        setScanProgressStep(null);

        // Inject simulated newly discovered cloud resources
        const newAwsLambda: DiscoveredResource = {
          id: `res-aws-lambda-${Date.now()}`,
          arnOrUri: 'arn:aws:lambda:eu-central-1:849204819482:function:acme-auth-mfa-authenticator',
          name: 'acme-auth-mfa-authenticator (Node.js 20.x)',
          cloudProvider: 'aws',
          resourceType: 'AWS Lambda Serverless',
          region: 'eu-central-1',
          accountName: 'Acme AWS Production',
          accountId: '8492-0481-9482',
          discoveredAt: 'Just now (Continuous Scan)',
          lastScannedAt: 'Just now',
          mappingStatus: 'auto_mapped',
          securityPosture: 'compliant',
          tags: {
            Environment: 'Production',
            Service: 'Identity & Auth',
            Runtime: 'NodeJS20',
          },
          mappedControls: [
            {
              controlId: 'CC6.2',
              controlCode: 'CC6.2',
              controlName: 'User Authentication & MFA Credential Enforcement',
              framework: 'SOC 2 CC6.2 & ISO 27001 A.9.4',
              confidenceScore: 98,
              mappingReason: 'Authentication serverless function automatically mapped to Okta/FIDO2 MFA token verification control.',
              appliedAutomatedTest: 'MFA & Session Token Verification Test',
              testId: 'test-auth-mfa',
            },
          ],
          isNewDiscovery: true,
        };

        const updatedConnectors = connectors.map((c) => ({
          ...c,
          lastScanTime: 'Just now',
          newResourcesCount: c.newResourcesCount + 1,
        }));

        onUpdateConnectors(updatedConnectors);
        onUpdateResources([newAwsLambda, ...resources]);
        showToast('✓ Multi-cloud scan completed: 1 new asset discovered & auto-mapped with 98% confidence score.');
      }, 1400);
    }, 1200);
  };

  // Batch approve all pending mappings
  const handleApproveAllPending = () => {
    const pendingCount = resources.filter((r) => r.mappingStatus === 'pending_approval').length;
    if (pendingCount === 0) return;

    const updated = resources.map((r) => {
      if (r.mappingStatus === 'pending_approval') {
        return {
          ...r,
          mappingStatus: 'auto_mapped' as MappingStatus,
        };
      }
      return r;
    });

    onUpdateResources(updated);
    showToast(`✓ Approved and locked security control mappings for ${pendingCount} cloud resources.`);
  };

  // Approve single resource mapping
  const handleApproveSingle = (resourceId: string, name: string) => {
    const updated = resources.map((r) => {
      if (r.id === resourceId) {
        return {
          ...r,
          mappingStatus: 'auto_mapped' as MappingStatus,
        };
      }
      return r;
    });
    onUpdateResources(updated);
    showToast(`✓ Control mapping approved for "${name}"`);
  };

  // Filtered resources calculation
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (selectedProvider !== 'all' && res.cloudProvider !== selectedProvider) return false;
      if (selectedStatus !== 'all' && res.mappingStatus !== selectedStatus) return false;
      if (selectedResourceType !== 'all' && res.resourceType !== selectedResourceType) return false;

      // Tagging status filter
      if (taggingStatusFilter !== 'all') {
        const status = res.taggingStatus || 'suggestions_pending';
        if (status !== taggingStatusFilter) return false;
      }

      // Sensitivity level filter
      if (sensitivityFilter !== 'all') {
        if (res.sensitivityLevel !== sensitivityFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(q);
        const matchesArn = res.arnOrUri.toLowerCase().includes(q);
        const matchesRegion = res.region.toLowerCase().includes(q);
        const matchesControls = res.mappedControls.some(
          (c) =>
            c.controlCode.toLowerCase().includes(q) ||
            c.controlName.toLowerCase().includes(q) ||
            c.framework.toLowerCase().includes(q)
        );
        const matchesTags = Object.entries(res.tags).some(
          ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesArn && !matchesRegion && !matchesControls && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [resources, selectedProvider, selectedStatus, selectedResourceType, searchQuery]);

  // Aggregate statistics
  const totalDiscovered = resources.length;
  const autoMappedCount = resources.filter((r) => r.mappingStatus === 'auto_mapped').length;
  const pendingApprovalCount = resources.filter((r) => r.mappingStatus === 'pending_approval').length;
  const driftDetectedCount = resources.filter((r) => r.securityPosture === 'drift_detected').length;

  const awsCount = resources.filter((r) => r.cloudProvider === 'aws').length;
  const gcpCount = resources.filter((r) => r.cloudProvider === 'gcp').length;
  const azureCount = resources.filter((r) => r.cloudProvider === 'azure').length;

  const autoMappingRate =
    totalDiscovered > 0 ? Math.round((autoMappedCount / totalDiscovered) * 100) : 100;

  // Extract unique resource types for dropdown filter
  const resourceTypesList = useMemo(() => {
    return Array.from(new Set(resources.map((r) => r.resourceType)));
  }, [resources]);

  // Export full inventory report for auditors
  const handleExportCloudInventory = () => {
    const lines = [
      `ACME CORP - CONTINUOUS MULTI-CLOUD INVENTORY & CONTROL MAPPING AUDIT REPORT`,
      `Generated by: SuomiGRC Autonomous Cloud Discovery Engine`,
      `Timestamp: ${new Date().toUTCString()}`,
      `Signed by CISO: Elena Rostova`,
      `--------------------------------------------------------------------------------`,
      `Total Cloud Resources: ${totalDiscovered} | Auto-Mapped: ${autoMappedCount} (${autoMappingRate}%)`,
      `AWS: ${awsCount} | GCP: ${gcpCount} | Azure: ${azureCount}`,
      `--------------------------------------------------------------------------------\n`,
    ];

    resources.forEach((r, idx) => {
      lines.push(`${idx + 1}. [${r.cloudProvider.toUpperCase()}] ${r.name}`);
      lines.push(`   ARN/URI: ${r.arnOrUri}`);
      lines.push(`   Type: ${r.resourceType} | Region: ${r.region} | Account: ${r.accountName} (${r.accountId})`);
      lines.push(`   Mapping Status: ${r.mappingStatus.toUpperCase()} | Posture: ${r.securityPosture.toUpperCase()}`);
      lines.push(`   Tags: ${JSON.stringify(r.tags)}`);
      lines.push(`   Mapped Security Controls:`);
      r.mappedControls.forEach((c) => {
        lines.push(`     - [${c.controlCode}] ${c.controlName} (${c.framework}) - Confidence: ${c.confidenceScore}%`);
        lines.push(`       Reason: ${c.mappingReason}`);
        lines.push(`       Automated Test: ${c.appliedAutomatedTest}`);
      });
      lines.push('\n');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AcmeCorp-Cloud-Discovery-Inventory-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Exported CPA-compliant multi-cloud inventory package.');
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRuleModalOpen(false);
    showToast(`✓ Created active mapping heuristic: [${newRuleTagKey}=${newRuleTagVal}] -> [${newRuleControl}]`);
  };

  return (
    <div className="space-y-6 max-w-[1536px] mx-auto pb-16">
      {/* Toast Notification */}
      {scanToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium">{scanToast}</span>
          <button onClick={() => setScanToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner: Cloud Discovery Command */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Autonomous Cloud Discovery
              </span>
              <span className="text-slate-300">/</span>
              <span>Multi-Cloud Control Mapping</span>
              <span className="text-slate-300">/</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-mono text-[11px]">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                AWS · GCP · Azure Live Sync
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Cloud Discovery &amp; Automated Control Mapping
            </h1>
            <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
              Periodically and event-driven sweeps continuously detect new infrastructure (S3 buckets, Kubernetes clusters, RDS databases, Key Vaults, and IAM roles) across AWS, Azure, and GCP accounts—automatically mapping them to SOC 2, ISO 27001, HIPAA, and PCI DSS controls with zero manual tagging friction.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunAutomatedTaggingEngine}
              disabled={isTaggingScanActive}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
              title="Scan cloud resources and suggest security tags based on type, usage, and sensitivity"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTaggingScanActive ? 'animate-spin text-purple-200' : 'text-purple-200'}`} />
              <span>{isTaggingScanActive ? 'Evaluating Tag Heuristics...' : 'Run Automated Tagging Engine'}</span>
            </button>

            <button
              onClick={handleTriggerDiscoverySweep}
              disabled={isScanning}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
              title="Query AWS EventBridge, GCP Asset Inventory & Azure Resource Graph"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isScanning ? 'Scanning Multi-Cloud...' : 'Trigger Discovery Sweep'}</span>
            </button>

            <button
              onClick={() => setIsRuleModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Mapping Heuristics</span>
            </button>

            <button
              onClick={handleExportCloudInventory}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs"
              title="Download CPA-formatted asset inventory"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Audit Inventory</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        {scanProgressStep && (
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-900 text-white text-xs font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>{scanProgressStep}</span>
            </div>
            <span className="text-[10px] text-indigo-300">Automated Tagging Engine Active</span>
          </div>
        )}

        {/* Automated Security Tagging Engine Fleet Banner */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-linear-to-r from-purple-900/90 via-slate-900 to-indigo-950 text-white border border-purple-500/30 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Tag className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Automated Security Control Tagging Engine
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Continuous Heuristics
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                Context-Aware Security Tagging: Resource Type · Operational Usage · Sensitivity Level
              </h2>
              <p className="text-xs text-purple-100/80 max-w-3xl leading-relaxed">
                Automatically scans cloud descriptors, infers data sensitivity (Restricted PII, Confidential, Internal), and attaches audit-ready control tags (<code className="text-purple-200 font-mono">sec:data-sensitivity</code>, <code className="text-purple-200 font-mono">sec:framework-scope</code>, <code className="text-purple-200 font-mono">sec:encryption-requirement</code>, and <code className="text-purple-200 font-mono">sec:backup-tier</code>) for zero-gap SOC 2 &amp; ISO 27001 enforcement.
              </p>
            </div>

            {/* Quick Metrics & Triggers */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-purple-200 block uppercase font-mono">Security Tag Coverage</span>
                <span className="text-lg font-bold font-mono text-white">{taggingStats.coveragePercentage}%</span>
                <span className="text-[10px] text-purple-300 block">{taggingStats.fullyTaggedCount}/{taggingStats.totalResources} Complete</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-purple-200 block uppercase font-mono">Pending Suggestions</span>
                <span className="text-lg font-bold font-mono text-amber-300">{taggingStats.totalSuggestedTagsCount}</span>
                <span className="text-[10px] text-amber-200 block">Control Tags Ready</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={handleApplyAllSuggestedTags}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  title="Approve and write all suggested tags to cloud resource metadata"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Apply All Suggestions</span>
                </button>

                <button
                  onClick={() => setIsTaggingModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                >
                  <Tag className="w-3.5 h-3.5 text-purple-300" />
                  <span>Tagging Workspace →</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sensitivity Distribution Breakdown Chips */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-purple-200 font-semibold">Inferred Sensitivity:</span>
              <button
                onClick={() => {
                  setSensitivityFilter(sensitivityFilter === 'Restricted PII' ? 'all' : 'Restricted PII');
                }}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-all cursor-pointer ${
                  sensitivityFilter === 'Restricted PII'
                    ? 'bg-rose-500 text-white font-bold ring-1 ring-white'
                    : 'bg-rose-500/20 text-rose-200 border border-rose-500/30 hover:bg-rose-500/30'
                }`}
              >
                Restricted PII ({resources.filter((r) => r.sensitivityLevel === 'Restricted PII').length})
              </button>
              <button
                onClick={() => {
                  setSensitivityFilter(sensitivityFilter === 'Confidential' ? 'all' : 'Confidential');
                }}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-all cursor-pointer ${
                  sensitivityFilter === 'Confidential'
                    ? 'bg-amber-500 text-white font-bold ring-1 ring-white'
                    : 'bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30'
                }`}
              >
                Confidential ({resources.filter((r) => r.sensitivityLevel === 'Confidential').length})
              </button>
              <button
                onClick={() => {
                  setSensitivityFilter(sensitivityFilter === 'Internal' ? 'all' : 'Internal');
                }}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-all cursor-pointer ${
                  sensitivityFilter === 'Internal'
                    ? 'bg-slate-400 text-slate-900 font-bold ring-1 ring-white'
                    : 'bg-white/10 text-slate-200 border border-white/20 hover:bg-white/20'
                }`}
              >
                Internal ({resources.filter((r) => r.sensitivityLevel === 'Internal').length})
              </button>
              <button
                onClick={() => {
                  setSensitivityFilter(sensitivityFilter === 'Public' ? 'all' : 'Public');
                }}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-all cursor-pointer ${
                  sensitivityFilter === 'Public'
                    ? 'bg-blue-400 text-blue-950 font-bold ring-1 ring-white'
                    : 'bg-blue-500/20 text-blue-200 border border-blue-500/30 hover:bg-blue-500/30'
                }`}
              >
                Public ({resources.filter((r) => r.sensitivityLevel === 'Public').length})
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-purple-200 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Tagging engine active across AWS, GCP &amp; Azure descriptors</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Hero KPI Summary Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Total Discovered Resources */}
        <div className="executive-card p-5 group">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Discovered Cloud Assets
            </span>
            <Cloud className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {totalDiscovered}{' '}
            <span className="text-sm font-normal text-slate-400">monitored</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>AWS: {awsCount}</span>
            <span>GCP: {gcpCount}</span>
            <span>Azure: {azureCount}</span>
          </div>
        </div>

        {/* Tile 2: Auto-Mapping Rate */}
        <div className="executive-card p-5 group">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Auto-Mapped Controls
            </span>
            <Zap className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums flex items-baseline gap-2">
            <span>{autoMappingRate}%</span>
            <span className="text-xs font-normal text-emerald-600 font-sans font-semibold">
              Zero Manual Setup
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${autoMappingRate}%` }}
            />
          </div>
        </div>

        {/* Tile 3: Pending Approval Queue */}
        <div
          onClick={() => setSelectedStatus('pending_approval')}
          className={`executive-card p-5 cursor-pointer group transition-all ${
            selectedStatus === 'pending_approval' ? 'ring-2 ring-amber-500/40 border-amber-300' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Pending Control Approvals
            </span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {pendingApprovalCount}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="text-slate-500">Suggested Mappings</span>
            {pendingApprovalCount > 0 ? (
              <span className="text-amber-800 font-mono font-bold text-[11px]">
                Review Needed
              </span>
            ) : (
              <span className="text-emerald-700 font-mono font-semibold text-[11px]">
                Queue Clear
              </span>
            )}
          </div>
        </div>

        {/* Tile 4: Posture & Drift Flagged */}
        <div
          onClick={() => setSelectedStatus('all')}
          className="executive-card p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Compliance Drift Radar
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {driftDetectedCount}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="text-slate-500">Drift Flagged Assets</span>
            <span className="text-rose-600 font-mono font-bold text-[11px]">
              GitOps PR Ready
            </span>
          </div>
        </div>
      </div>

      {/* Connected Cloud Accounts Multi-Provider Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Connected Cloud Accounts &amp; Continuous Asset Listeners
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            3 Active Cloud Tenants · AWS, Azure, GCP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {connectors.map((conn) => (
            <div
              key={conn.id}
              className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded uppercase ${
                      conn.provider === 'aws'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : conn.provider === 'gcp'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                    }`}
                  >
                    {conn.provider.toUpperCase()}
                  </span>
                  <div className="font-semibold text-xs text-slate-900 truncate">
                    {conn.accountName}
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active stream" />
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{conn.totalResourcesCount} assets</span>
                <span className="text-emerald-700 font-semibold">{conn.autoMappingAccuracy}% accuracy</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar: Search, Filters & Batch Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by resource name, ARN, tag, region, or control..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Cloud Provider Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setSelectedProvider('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedProvider === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                All Clouds ({resources.length})
              </button>
              <button
                onClick={() => setSelectedProvider('aws')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedProvider === 'aws'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                AWS ({awsCount})
              </button>
              <button
                onClick={() => setSelectedProvider('gcp')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedProvider === 'gcp'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                GCP ({gcpCount})
              </button>
              <button
                onClick={() => setSelectedProvider('azure')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedProvider === 'azure'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Azure ({azureCount})
              </button>
            </div>

            {/* Resource Type Filter */}
            <select
              value={selectedResourceType}
              onChange={(e) => setSelectedResourceType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Resource Types</option>
              {resourceTypesList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills & Batch Approval Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider">
              Status:
            </span>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              All Assets ({resources.length})
            </button>
            <button
              onClick={() => setSelectedStatus('auto_mapped')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedStatus === 'auto_mapped'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              Auto-Mapped ({autoMappedCount})
            </button>
            <button
              onClick={() => setSelectedStatus('pending_approval')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedStatus === 'pending_approval'
                  ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              Pending Approval ({pendingApprovalCount})
            </button>
          </div>

          {pendingApprovalCount > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve All Suggested Mappings ({pendingApprovalCount})</span>
            </button>
          )}
        </div>

        {/* Secondary Filter Row: Tagging Engine & Sensitivity */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-purple-600" />
              <span>Tag Status:</span>
            </span>
            <button
              onClick={() => setTaggingStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                taggingStatusFilter === 'all'
                  ? 'bg-purple-900 text-white shadow-2xs font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              All Tags
            </button>
            <button
              onClick={() => setTaggingStatusFilter('suggestions_pending')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                taggingStatusFilter === 'suggestions_pending'
                  ? 'bg-purple-600 text-white shadow-2xs font-semibold'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
              }`}
            >
              <span>Suggestions Ready</span>
              <span className="bg-purple-200/80 text-purple-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {taggingStats.suggestionsPendingCount}
              </span>
            </button>
            <button
              onClick={() => setTaggingStatusFilter('fully_tagged')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                taggingStatusFilter === 'fully_tagged'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              Fully Tagged ({taggingStats.fullyTaggedCount})
            </button>
            <button
              onClick={() => setTaggingStatusFilter('untagged')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                taggingStatusFilter === 'untagged'
                  ? 'bg-slate-700 text-white shadow-2xs font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              Untagged ({taggingStats.untaggedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Sensitivity:
            </span>
            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700"
            >
              <option value="all">All Sensitivities</option>
              <option value="Restricted PII">Restricted PII</option>
              <option value="Confidential">Confidential</option>
              <option value="Internal">Internal</option>
              <option value="Public">Public</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discovered Cloud Assets & Control Mappings Catalog */}
      <div className="space-y-3.5">
        {filteredResources.length > 0 ? (
          filteredResources.map((res) => {
            const isAutoMapped = res.mappingStatus === 'auto_mapped';
            const isPending = res.mappingStatus === 'pending_approval';

            return (
              <div
                key={res.id}
                className={`executive-card p-4 sm:p-5 transition-all ${
                  isPending ? 'border-amber-300 bg-amber-50/20' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Resource Details Header */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {/* Cloud Provider Badge */}
                      <span
                        className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                          res.cloudProvider === 'aws'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : res.cloudProvider === 'gcp'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                        }`}
                      >
                        {res.cloudProvider.toUpperCase()}
                      </span>

                      {/* Resource Type */}
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        <span>{res.resourceType}</span>
                      </span>

                      <span className="text-slate-300">·</span>

                      {/* Region & Account */}
                      <span className="font-mono text-[11px] text-slate-500">
                        {res.region} · {res.accountName}
                      </span>

                      {/* Sensitivity Badge */}
                      {res.sensitivityLevel && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span
                            className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                              res.sensitivityLevel === 'Restricted PII'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : res.sensitivityLevel === 'Confidential'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : res.sensitivityLevel === 'Public'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}
                          >
                            {res.sensitivityLevel}
                          </span>
                        </>
                      )}

                      {/* Usage Classification Chip */}
                      {res.usageClassification && (
                        <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {res.usageClassification}
                        </span>
                      )}

                      {res.isNewDiscovery && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                            NEW ASSET
                          </span>
                        </>
                      )}
                    </div>

                    {/* Name & ARN */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
                        <span>{res.name}</span>
                        {res.securityPosture === 'drift_detected' && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Drift Flagged</span>
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500 truncate max-w-3xl mt-0.5">
                        {res.arnOrUri}
                      </p>
                    </div>

                    {/* Cloud Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {Object.entries(res.tags).map(([k, v]) => (
                        <span
                          key={k}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            k.startsWith('sec:')
                              ? 'bg-purple-50 text-purple-800 border-purple-200 font-semibold'
                              : 'bg-slate-100 text-slate-600 border-slate-200/80'
                          }`}
                        >
                          <span className={k.startsWith('sec:') ? 'text-purple-500' : 'text-slate-400'}>{k}:</span> {v}
                        </span>
                      ))}
                    </div>

                    {/* Suggested Security Control Tags */}
                    {res.suggestedTags && res.suggestedTags.some((t) => !t.isApplied) && (
                      <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200 space-y-1.5 mt-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>
                              Suggested Security Control Tags ({res.suggestedTags.filter((t) => !t.isApplied).length} pending):
                            </span>
                          </span>

                          <button
                            onClick={() => handleApplyTagsForResource(res.id)}
                            className="px-2.5 py-0.5 text-[10px] font-semibold rounded bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Apply All Suggestions</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {res.suggestedTags.filter((t) => !t.isApplied).map((sug) => (
                            <span
                              key={sug.key}
                              title={`${sug.reason} (Confidence: ${sug.confidence}%)`}
                              className="text-[10px] font-mono bg-white text-purple-900 px-2 py-0.5 rounded border border-purple-300 flex items-center gap-1 shadow-3xs"
                            >
                              <span className="font-semibold text-purple-700">+{sug.key}:</span>
                              <span>{sug.value}</span>
                              <span className="text-[9px] text-emerald-700 font-bold ml-0.5">({sug.confidence}%)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mapped Controls List */}
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Auto-Mapped Compliance Controls &amp; Automated Tests:
                      </div>

                      <div className="space-y-1.5">
                        {res.mappedControls.map((ctrl) => (
                          <div
                            key={ctrl.controlId}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 text-[11px]">
                                  {ctrl.controlCode}
                                </span>
                                <span className="font-semibold text-slate-900">{ctrl.controlName}</span>
                                <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                                  ({ctrl.framework})
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">{ctrl.mappingReason}</p>
                              <div className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 pt-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Continuous Test: {ctrl.appliedAutomatedTest}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-start">
                              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {ctrl.confidenceScore}% Confidence
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Column */}
                  <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-start gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          isAutoMapped
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isAutoMapped ? '✓ Auto-Mapped' : 'Pending Approval'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Scanned {res.lastScannedAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedResourceForDetail(res)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap"
                        title="View & apply security control tags, or copy Terraform IaC"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Tags &amp; IaC</span>
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleApproveSingle(res.id, res.name)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedResourceForDetail(res)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="View complete cloud metadata"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              No Cloud Resources Match Filter
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your cloud provider, resource type, or text search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedProvider('all');
                setSelectedStatus('all');
                setSelectedResourceType('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Reset all filters →
            </button>
          </div>
        )}
      </div>

      {/* Modal: Resource Detailed Metadata & Control Linkage */}
      {selectedResourceForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-bold text-xs px-2 py-0.5 rounded uppercase ${
                    selectedResourceForDetail.cloudProvider === 'aws'
                      ? 'bg-amber-100 text-amber-900'
                      : selectedResourceForDetail.cloudProvider === 'gcp'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-cyan-100 text-cyan-900'
                  }`}
                >
                  {selectedResourceForDetail.cloudProvider.toUpperCase()}
                </span>
                <h3 className="font-bold text-sm text-slate-900 truncate font-display">
                  {selectedResourceForDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResourceForDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Cloud Resource Identifier (ARN / URI)
                </label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800 break-all select-all">
                  {selectedResourceForDetail.arnOrUri}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Cloud Account</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedResourceForDetail.accountName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {selectedResourceForDetail.accountId}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Region &amp; Type</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedResourceForDetail.resourceType}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {selectedResourceForDetail.region}
                  </div>
                </div>
              </div>

              {/* Inferred Sensitivity & Operational Usage Banner */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Automated Tagging Engine Classification</span>
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
                    v4.8 Heuristic Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-purple-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Inferred Sensitivity</div>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          selectedResourceForDetail.sensitivityLevel === 'Restricted PII'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : selectedResourceForDetail.sensitivityLevel === 'Confidential'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : selectedResourceForDetail.sensitivityLevel === 'Public'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {selectedResourceForDetail.sensitivityLevel || 'Internal'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-purple-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Operational Usage</div>
                    <div className="font-semibold text-purple-900 mt-0.5 truncate text-[11px]">
                      {selectedResourceForDetail.usageClassification || 'Production Core'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Security Control Tags */}
              {selectedResourceForDetail.suggestedTags && selectedResourceForDetail.suggestedTags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Suggested Security Control Tags ({selectedResourceForDetail.suggestedTags.filter(t => !t.isApplied).length} pending)
                    </label>
                    {selectedResourceForDetail.suggestedTags.some(t => !t.isApplied) && (
                      <button
                        onClick={() => handleApplyTagsForResource(selectedResourceForDetail.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1 shadow-2xs"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Apply All Suggested Tags</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {selectedResourceForDetail.suggestedTags.map((sug) => {
                      const isApplied = sug.isApplied;
                      return (
                        <div
                          key={sug.key}
                          className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all ${
                            isApplied
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-white border-purple-200 shadow-3xs'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono font-bold text-purple-900 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 text-[11px]">
                                {sug.key}
                              </span>
                              <span className="font-mono text-slate-700 text-[11px]">=</span>
                              <span className="font-mono font-semibold text-slate-900 text-[11px] bg-slate-100 px-1.5 py-0.2 rounded">
                                {sug.value}
                              </span>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {sug.category}
                              </span>
                              <span className="text-[9px] font-mono text-emerald-700 font-bold">
                                {sug.confidence}% Conf.
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">{sug.reason}</p>
                          </div>

                          <div className="shrink-0 self-start sm:self-center">
                            {isApplied ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                <Check className="w-3 h-3" />
                                <span>Applied</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApplySingleTag(selectedResourceForDetail.id, sug.key)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1 shadow-3xs"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Apply Tag</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Cloud Tag Hierarchy
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  {Object.entries(selectedResourceForDetail.tags).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-[11px] font-mono">
                      <span className={k.startsWith('sec:') ? 'text-purple-600 font-bold' : 'text-slate-500'}>
                        {k}:
                      </span>
                      <span className="font-semibold text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infrastructure as Code (Terraform) Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Terraform / OpenTofu IaC Tag Snippet
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyTerraformSnippet(selectedResourceForDetail)}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>{copiedTerraformId === selectedResourceForDetail.id ? 'Copied!' : 'Copy Terraform'}</span>
                    </button>
                    <button
                      onClick={() => handleCopyCliSnippet(selectedResourceForDetail)}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Terminal className="w-3 h-3 text-slate-500" />
                      <span>{copiedCliId === selectedResourceForDetail.id ? 'Copied!' : 'Copy CLI'}</span>
                    </button>
                  </div>
                </div>
                <pre className="p-2.5 bg-slate-900 text-slate-100 border border-slate-800 rounded-lg font-mono text-[10px] overflow-x-auto max-h-36">
                  {generateTerraformTagSnippet(selectedResourceForDetail)}
                </pre>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Security Controls &amp; Continuous Evidence Tests
                </label>
                <div className="space-y-2">
                  {selectedResourceForDetail.mappedControls.map((c) => (
                    <div key={c.controlId} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 font-mono">{c.controlCode} - {c.controlName}</span>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          {c.confidenceScore}% Confidence
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{c.mappingReason}</p>
                      <div className="text-[10px] font-mono text-slate-700 pt-1">
                        Automated Test: <strong className="text-slate-900">{c.appliedAutomatedTest}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedResourceForDetail(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mapping Heuristics Rule Engine */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 font-display">
                  Automated Mapping Heuristics
                </h3>
              </div>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Configure pattern-matching heuristics that bind discovered cloud resources to security controls based on tags, resource types, and VPC boundaries.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tag Key
                  </label>
                  <input
                    type="text"
                    required
                    value={newRuleTagKey}
                    onChange={(e) => setNewRuleTagKey(e.target.value)}
                    placeholder="e.g. DataClassification"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tag Value Pattern
                  </label>
                  <input
                    type="text"
                    required
                    value={newRuleTagVal}
                    onChange={(e) => setNewRuleTagVal(e.target.value)}
                    placeholder="e.g. Confidential PII"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bind Security Control
                </label>
                <input
                  type="text"
                  required
                  value={newRuleControl}
                  onChange={(e) => setNewRuleControl(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assign Continuous Test
                </label>
                <input
                  type="text"
                  required
                  value={newRuleTest}
                  onChange={(e) => setNewRuleTest(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  Save Mapping Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Automated Security Control Tagging Engine Workspace */}
      {isTaggingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-6xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
                    <Tag className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 font-display">
                    Automated Security Control Tagging Engine
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                    Continuous Context Engine
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  Evaluates cloud descriptors across AWS, Azure, and GCP. Automatically identifies data sensitivity (Restricted PII, Confidential, Internal, Public) and operational usage to suggest verified security control tags.
                </p>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleRunAutomatedTaggingEngine}
                  disabled={isTaggingScanActive}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isTaggingScanActive ? 'animate-spin text-purple-200' : 'text-purple-200'}`} />
                  <span>{isTaggingScanActive ? 'Scanning Heuristics...' : 'Run Heuristic Tag Scan'}</span>
                </button>

                <button
                  onClick={handleApplyFilteredSuggestedTags}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-2xs"
                  title="Apply suggested tags to all currently filtered resources"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Apply Filtered ({filteredTaggingResources.length})</span>
                </button>

                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <button
                    onClick={handleExportTaggingCsv}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 border-r border-slate-200"
                    title="Export as CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={handleExportTaggingJson}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="Export as JSON"
                  >
                    <span>JSON</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsTaggingModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Fleet Health Banner */}
            <div className="px-5 py-3 bg-linear-to-r from-purple-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-purple-300 block uppercase font-mono">Tag Coverage</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-base font-mono">{taggingStats.coveragePercentage}%</span>
                    <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${taggingStats.coveragePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-l border-white/10 pl-6">
                  <span className="text-[10px] text-purple-300 block uppercase font-mono">Pending Tags</span>
                  <span className="font-bold text-base font-mono text-amber-300 mt-0.5 block">
                    {taggingStats.totalSuggestedTagsCount} Tags
                  </span>
                </div>

                <div className="border-l border-white/10 pl-6">
                  <span className="text-[10px] text-purple-300 block uppercase font-mono">Restricted PII</span>
                  <span className="font-bold text-base font-mono text-rose-300 mt-0.5 block">
                    {resources.filter((r) => r.sensitivityLevel === 'Restricted PII').length} Assets
                  </span>
                </div>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15">
                <button
                  onClick={() => setActiveTaggingModalTab('review')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTaggingModalTab === 'review'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-200 hover:text-white'
                  }`}
                >
                  Review &amp; Approve ({filteredTaggingResources.length})
                </button>
                <button
                  onClick={() => setActiveTaggingModalTab('matrix')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTaggingModalTab === 'matrix'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-200 hover:text-white'
                  }`}
                >
                  Heuristic Rules Matrix
                </button>
                <button
                  onClick={() => setActiveTaggingModalTab('iac')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTaggingModalTab === 'iac'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-200 hover:text-white'
                  }`}
                >
                  IaC &amp; CI/CD Generator
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTaggingModalTab === 'review' && (
                <div className="space-y-4">
                  {/* Multi-Filter Bar */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Search box */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={taggingModalSearch}
                          onChange={(e) => setTaggingModalSearch(e.target.value)}
                          placeholder="Search resource name, ARN, tag key, or sensitivity..."
                          className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        />
                        {taggingModalSearch && (
                          <button
                            onClick={() => setTaggingModalSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Tag Status filter buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setTaggingModalFilter('all')}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            taggingModalFilter === 'all'
                              ? 'bg-purple-900 text-white shadow-2xs font-semibold'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          All ({resources.length})
                        </button>
                        <button
                          onClick={() => setTaggingModalFilter('pending')}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                            taggingModalFilter === 'pending'
                              ? 'bg-purple-600 text-white shadow-2xs font-semibold'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                          }`}
                        >
                          <span>Suggestions Ready</span>
                          <span className="bg-purple-200/80 text-purple-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                            {taggingStats.suggestionsPendingCount}
                          </span>
                        </button>
                        <button
                          onClick={() => setTaggingModalFilter('applied')}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            taggingModalFilter === 'applied'
                              ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          Fully Tagged ({taggingStats.fullyTaggedCount})
                        </button>
                      </div>
                    </div>

                    {/* Secondary Dropdown Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">Provider:</span>
                          <select
                            value={taggingModalProvider}
                            onChange={(e) => setTaggingModalProvider(e.target.value as any)}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium"
                          >
                            <option value="all">All Providers</option>
                            <option value="aws">AWS</option>
                            <option value="gcp">GCP</option>
                            <option value="azure">Azure</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">Sensitivity:</span>
                          <select
                            value={taggingModalSensitivity}
                            onChange={(e) => setTaggingModalSensitivity(e.target.value as any)}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium"
                          >
                            <option value="all">All Sensitivities</option>
                            <option value="Restricted PII">Restricted PII</option>
                            <option value="Confidential">Confidential</option>
                            <option value="Internal">Internal</option>
                            <option value="Public">Public</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">Usage:</span>
                          <select
                            value={taggingModalUsage}
                            onChange={(e) => setTaggingModalUsage(e.target.value as any)}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium max-w-[200px]"
                          >
                            <option value="all">All Usage Classifications</option>
                            <option value="Production Core">Production Core</option>
                            <option value="Data Analytics & Lakehouse">Data Analytics & Lakehouse</option>
                            <option value="Identity & Auth">Identity & Auth</option>
                            <option value="Payment & Financial">Payment & Financial</option>
                            <option value="Public Edge">Public Edge</option>
                            <option value="Internal Tooling">Internal Tooling</option>
                            <option value="Staging / QA">Staging / QA</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500">
                        Showing <strong>{filteredTaggingResources.length}</strong> of {resources.length} cloud assets
                      </div>
                    </div>
                  </div>

                  {/* Resource Cards List */}
                  {filteredTaggingResources.length > 0 ? (
                    <div className="space-y-3.5">
                      {filteredTaggingResources.map((res) => {
                        const pendingSuggestions = res.suggestedTags?.filter((t) => !t.isApplied) || [];
                        const appliedSuggestions = res.suggestedTags?.filter((t) => t.isApplied) || [];

                        return (
                          <div
                            key={res.id}
                            className={`p-4 rounded-xl border transition-all ${
                              pendingSuggestions.length > 0
                                ? 'bg-white border-purple-200 shadow-2xs hover:border-purple-300'
                                : 'bg-slate-50/50 border-slate-200'
                            }`}
                          >
                            {/* Card Top Row: Header & Badges */}
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                                      res.cloudProvider === 'aws'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : res.cloudProvider === 'gcp'
                                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                        : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                                    }`}
                                  >
                                    {res.cloudProvider.toUpperCase()}
                                  </span>

                                  <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                    {res.resourceType}
                                  </span>

                                  <span className="text-slate-300">·</span>

                                  <span className="font-mono text-[11px] text-slate-500">
                                    {res.region} · {res.accountName}
                                  </span>

                                  {/* Inferred Sensitivity Level */}
                                  <span
                                    className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase ml-auto lg:ml-0 ${
                                      res.sensitivityLevel === 'Restricted PII'
                                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                        : res.sensitivityLevel === 'Confidential'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : res.sensitivityLevel === 'Public'
                                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                                    }`}
                                  >
                                    Sensitivity: {res.sensitivityLevel || 'Internal'}
                                  </span>

                                  {/* Usage Classification */}
                                  {res.usageClassification && (
                                    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                      Usage: {res.usageClassification}
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 font-display tracking-tight mt-1 truncate">
                                  {res.name}
                                </h4>
                                <p className="text-[10px] font-mono text-slate-400 truncate max-w-2xl select-all">
                                  {res.arnOrUri}
                                </p>
                              </div>

                              {/* Card Action Header Buttons */}
                              <div className="flex items-center gap-1.5 shrink-0 self-start">
                                {pendingSuggestions.length > 0 && (
                                  <button
                                    onClick={() => handleApplyTagsForResource(res.id)}
                                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1.5 shadow-2xs"
                                  >
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                    <span>Apply All ({pendingSuggestions.length})</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleCopyTerraformSnippet(res)}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                                  title="Copy Terraform Tag Block"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{copiedTerraformId === res.id ? 'Copied!' : 'Terraform'}</span>
                                </button>

                                <button
                                  onClick={() => handleCopyCliSnippet(res)}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                                  title="Copy Cloud CLI Command"
                                >
                                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{copiedCliId === res.id ? 'Copied!' : 'CLI'}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedTaggingResourceForIac(res);
                                    setActiveTaggingModalTab('iac');
                                  }}
                                  className="p-1 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                                  title="Open in IaC Generator"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Card Body: Existing vs Suggested Tags */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-3 text-xs">
                              {/* Left: Existing Cloud Metadata Tags (4 cols) */}
                              <div className="lg:col-span-4 space-y-1.5 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Current Cloud Tags ({Object.keys(res.tags || {}).length})
                                </span>
                                <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                                  {Object.entries(res.tags || {}).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                        k.startsWith('sec:')
                                          ? 'bg-purple-50 text-purple-800 border-purple-200 font-semibold'
                                          : 'bg-white text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      <span className={k.startsWith('sec:') ? 'text-purple-500' : 'text-slate-400'}>
                                        {k}:
                                      </span>{' '}
                                      {v}
                                    </span>
                                  ))}
                                  {Object.keys(res.tags || {}).length === 0 && (
                                    <span className="text-[11px] text-slate-400 italic">No cloud tags found</span>
                                  )}
                                </div>
                              </div>

                              {/* Right: Suggested Security Control Tags (8 cols) */}
                              <div className="lg:col-span-8 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-purple-600" />
                                    <span>
                                      Suggested Security Control Tags ({res.suggestedTags?.length || 0})
                                    </span>
                                  </span>
                                  {res.taggingStatus === 'fully_tagged' && (
                                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded font-semibold border border-emerald-200">
                                      ✓ 100% Verified Compliant
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {res.suggestedTags?.map((sug) => {
                                    const isApplied = sug.isApplied;
                                    return (
                                      <div
                                        key={sug.key}
                                        className={`p-2 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                                          isApplied
                                            ? 'bg-emerald-50/40 border-emerald-200'
                                            : 'bg-purple-50/50 border-purple-200 hover:border-purple-300'
                                        }`}
                                      >
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between gap-1">
                                            <span className="font-mono font-bold text-purple-900 text-[11px] truncate">
                                              {sug.key}
                                            </span>
                                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase bg-white text-indigo-700 border border-indigo-200">
                                              {sug.category}
                                            </span>
                                          </div>

                                          <div className="p-1 bg-white rounded border border-purple-100 font-mono text-[10px] text-slate-800 break-all">
                                            = {sug.value}
                                          </div>

                                          <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                                            {sug.reason}
                                          </p>
                                        </div>

                                        <div className="pt-2 flex items-center justify-between mt-1 border-t border-purple-100/60">
                                          <span className="text-[9px] font-mono text-emerald-700 font-bold">
                                            {sug.confidence}% Conf.
                                          </span>

                                          {isApplied ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                              <Check className="w-3 h-3" />
                                              <span>Applied</span>
                                            </span>
                                          ) : (
                                            <button
                                              onClick={() => handleApplySingleTag(res.id, sug.key)}
                                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1 shadow-3xs"
                                            >
                                              <Plus className="w-3 h-3" />
                                              <span>Apply</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <Tag className="w-8 h-8 text-slate-400 mx-auto" />
                      <h4 className="font-bold text-slate-800 text-sm">No Cloud Resources Match Filter</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Try resetting your search query or sensitivity/provider filters.
                      </p>
                      <button
                        onClick={() => {
                          setTaggingModalSearch('');
                          setTaggingModalFilter('all');
                          setTaggingModalSensitivity('all');
                          setTaggingModalProvider('all');
                          setTaggingModalUsage('all');
                        }}
                        className="text-xs font-semibold text-purple-600 hover:underline pt-1 block mx-auto"
                      >
                        Reset tagging workspace filters →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Heuristic Rules Matrix Reference */}
              {activeTaggingModalTab === 'matrix' && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-sm text-purple-950 flex items-center gap-1.5 font-display">
                      <Sparkles className="w-4 h-4 text-purple-700" />
                      <span>Deterministic Tagging Rules Engine Matrix</span>
                    </h4>
                    <p className="text-xs text-purple-800/80 leading-relaxed">
                      How SuomiGRC maps cloud resource descriptors to statutory control tags for zero-touch compliance audits (SOC 2, ISO 27001, GDPR Art. 32, PCI-DSS v4.0.1, EU DORA).
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <th className="p-3">Resource Type &amp; Usage</th>
                          <th className="p-3">Inferred Sensitivity</th>
                          <th className="p-3">Mandatory Security Control Tags</th>
                          <th className="p-3">Regulatory Audit Basis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        <tr className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">
                            S3 Lakehouse / Cloud SQL / RDS Aurora
                            <span className="block text-[10px] text-purple-600 font-normal">
                              Usage: Data Analytics &amp; Lakehouse
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded text-[10px] uppercase">
                              Restricted PII
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5 text-slate-800">
                            <div><span className="text-purple-600 font-bold">sec:data-sensitivity</span>: restricted-pii</div>
                            <div><span className="text-purple-600 font-bold">sec:framework-scope</span>: soc2-cc6.1,iso27001-a.8.24,gdpr-art32</div>
                            <div><span className="text-purple-600 font-bold">sec:encryption-requirement</span>: sse-kms-cmk-strict-tls13</div>
                            <div><span className="text-purple-600 font-bold">sec:backup-tier</span>: tier-1-rpo-15m-worm-immutable</div>
                            <div><span className="text-purple-600 font-bold">sec:retention-schedule</span>: 7-years-regulatory-immutable</div>
                          </td>
                          <td className="p-3 text-[10px] font-sans text-slate-600">
                            GDPR Art. 32 (Security of Processing), SOC 2 CC6.1 &amp; CC6.7 (KMS Customer Managed Keys), ISO 27001 A.8.24 (Cryptography).
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">
                            Key Vault / AWS KMS CMK / HSM
                            <span className="block text-[10px] text-purple-600 font-normal">
                              Usage: Identity &amp; Auth
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase">
                              Confidential
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5 text-slate-800">
                            <div><span className="text-purple-600 font-bold">sec:data-sensitivity</span>: confidential-prod</div>
                            <div><span className="text-purple-600 font-bold">sec:framework-scope</span>: soc2-cc6.2,iso27001-a.9.4,nist-csf-pr.ac</div>
                            <div><span className="text-purple-600 font-bold">sec:encryption-requirement</span>: fips-140-3-hsm-purge-protected</div>
                            <div><span className="text-purple-600 font-bold">sec:access-policy</span>: strict-mfa-least-privilege-iam</div>
                          </td>
                          <td className="p-3 text-[10px] font-sans text-slate-600">
                            SOC 2 CC6.2 (Credential and Key Management), ISO 27001 A.9.4 (Secret Authentication Information).
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">
                            CloudFront CDN / Route53 / Ingress Gateway
                            <span className="block text-[10px] text-purple-600 font-normal">
                              Usage: Public Edge
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px] uppercase">
                              Public
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5 text-slate-800">
                            <div><span className="text-purple-600 font-bold">sec:data-sensitivity</span>: public-edge</div>
                            <div><span className="text-purple-600 font-bold">sec:access-policy</span>: public-waf-ddos-shielded</div>
                            <div><span className="text-purple-600 font-bold">sec:audit-logging</span>: edge-waf-flow-logs-active</div>
                          </td>
                          <td className="p-3 text-[10px] font-sans text-slate-600">
                            SOC 2 CC6.6 (Perimeter Boundary Protection), AWS Shield Standard, Cloudflare Edge WAF.
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">
                            Staging EKS / Preview Lambda / Sandbox RDS
                            <span className="block text-[10px] text-purple-600 font-normal">
                              Usage: Staging / QA
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase">
                              Internal
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5 text-slate-800">
                            <div><span className="text-purple-600 font-bold">sec:data-sensitivity</span>: internal</div>
                            <div><span className="text-purple-600 font-bold">sec:framework-scope</span>: soc2-cc8.1,iso27001-a.12.1</div>
                            <div><span className="text-purple-600 font-bold">sec:backup-tier</span>: tier-3-ephemeral-no-backup</div>
                            <div><span className="text-purple-600 font-bold">sec:retention-schedule</span>: 30-days-ephemeral</div>
                          </td>
                          <td className="p-3 text-[10px] font-sans text-slate-600">
                            SOC 2 CC8.1 (Change Management &amp; Environment Segregation: Staging vs Production boundary).
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: IaC & CI/CD Generator */}
              {activeTaggingModalTab === 'iac' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-800">Target Cloud Asset:</span>
                      <select
                        value={selectedTaggingResourceForIac?.id || (resources[0]?.id ?? '')}
                        onChange={(e) => {
                          const chosen = resources.find((r) => r.id === e.target.value);
                          if (chosen) setSelectedTaggingResourceForIac(chosen);
                        }}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium max-w-md"
                      >
                        {resources.map((r) => (
                          <option key={r.id} value={r.id}>
                            [{r.cloudProvider.toUpperCase()}] {r.name} ({r.resourceType})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const target = selectedTaggingResourceForIac || resources[0];
                          if (target) handleCopyTerraformSnippet(target);
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Terraform</span>
                      </button>

                      <button
                        onClick={() => {
                          const target = selectedTaggingResourceForIac || resources[0];
                          if (target) handleCopyCliSnippet(target);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Copy CLI</span>
                      </button>
                    </div>
                  </div>

                  {/* Terraform / OpenTofu Block */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 font-mono text-[11px] flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Terraform / OpenTofu Declarative HCL Tag Block</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(selectedTaggingResourceForIac || resources[0])?.name}
                      </span>
                    </div>

                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                      {generateTerraformTagSnippet(selectedTaggingResourceForIac || resources[0])}
                    </pre>
                  </div>

                  {/* Cloud CLI Command Block */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 font-mono text-[11px] flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Cloud CLI Direct Tagging Command</span>
                      </span>
                    </div>

                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                      {generateCliTagCommand(selectedTaggingResourceForIac || resources[0])}
                    </pre>
                  </div>

                  {/* CI/CD Policy Enforcer Snippet */}
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 font-display">
                        <ShieldCheck className="w-4 h-4 text-indigo-700" />
                        <span>Shift-Left CI/CD Tag Policy (OPA / Rego / tfsec)</span>
                      </span>
                      <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        Pull Request Guardrail
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900/80 leading-relaxed">
                      Embed this check in your GitHub Actions or GitLab CI pipeline to automatically fail pull requests if new cloud infrastructure lacks mandatory <code className="text-indigo-800 font-bold font-mono">sec:data-sensitivity</code> or <code className="text-indigo-800 font-bold font-mono">sec:framework-scope</code> tags.
                    </p>
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# Policy: enforce_suomigrc_security_tags.rego
package terraform.compliance

deny[msg] {
  resource := input.resource_changes[_]
  required_tags := ["sec:data-sensitivity", "sec:framework-scope", "sec:encryption-requirement"]
  missing := [tag | tag := required_tags[_]; not resource.change.after.tags[tag]]
  count(missing) > 0
  msg := sprintf("Resource '%v' rejected by SuomiGRC: missing security tags %v", [resource.address, missing])
}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 font-mono">
                SuomiGRC Automated Tagging Engine v4.8 · SOC 2 CC6.1 &amp; ISO 27001 A.8.24
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTaggingModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

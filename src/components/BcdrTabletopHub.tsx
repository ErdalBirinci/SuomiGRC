import React, { useState } from 'react';
import { BcdrSystemAsset, TabletopDrill } from '../types/bcdr';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Download,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
  X,
  FileCheck2,
  Globe2,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface BcdrTabletopHubProps {
  assets: BcdrSystemAsset[];
  drills: TabletopDrill[];
  onUpdateAssets: (assets: BcdrSystemAsset[]) => void;
  onUpdateDrills: (drills: TabletopDrill[]) => void;
  onNavigateTab?: (tab: string) => void;
}

export const BcdrTabletopHub: React.FC<BcdrTabletopHubProps> = ({
  assets,
  drills,
  onUpdateAssets,
  onUpdateDrills,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'systems' | 'drills'>('systems');
  const [selectedDrillId, setSelectedDrillId] = useState<string>(drills[0]?.id || '');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isSimulatingRestore, setIsSimulatingRestore] = useState(false);
  const [restoredAssetId, setRestoredAssetId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const selectedDrill = drills.find((d) => d.id === selectedDrillId) || drills[0];

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleSimulateSnapshotRestore = (assetId: string) => {
    setIsSimulatingRestore(true);
    setRestoredAssetId(assetId);
    setTimeout(() => {
      setIsSimulatingRestore(false);
      const updated = assets.map((a) =>
        a.id === assetId
          ? {
              ...a,
              lastDrillRTO: '29 Minutes (Verified Just Now)',
              lastDrillRPO: '2 Minutes',
              lastVerifiedSnapshot: 'Just now',
            }
          : a
      );
      onUpdateAssets(updated);
      showNotification('Snapshot restored to test VPC in 29m. Zero data corruption detected.');
    }, 1800);
  };

  const handleSelectDrillOption = (stepIdx: number, optionIdx: number) => {
    if (!selectedDrill) return;
    const updatedDrills = drills.map((d) => {
      if (d.id === selectedDrill.id) {
        const newSteps = [...d.steps];
        newSteps[stepIdx] = {
          ...newSteps[stepIdx],
          selectedOptionIndex: optionIdx,
        };
        return {
          ...d,
          steps: newSteps,
        };
      }
      return d;
    });
    onUpdateDrills(updatedDrills);
  };

  const handleCompleteDrill = (drillId: string) => {
    const updated = drills.map((d) =>
      d.id === drillId
        ? {
            ...d,
            status: 'completed' as const,
            conductedDate: 'Today',
            formalMinutesHash: `BCDR-MINUTES-SEALED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            auditorSignedOff: true,
          }
        : d
    );
    onUpdateDrills(updated);
    showNotification('Annual Tabletop Exercise completed! Formal audit minutes sealed.');
  };

  const handleExportMinutes = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showNotification('Formal Tabletop Exercise Minutes & Audit Evidence Package (ZIP) downloaded!');
    }, 1500);
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
            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
              <Database className="w-5 h-5 text-indigo-600" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              ISO 27001 A.17 · SOC 2 A1.2 · DORA Art. 11
            </span>
            <span className="text-xs text-slate-500 font-mono">Business Continuity & Disaster Recovery</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            BCDR, Multi-Region Replication & Tabletop Simulator
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Measures RTO/RPO recovery metrics across critical database clusters, verifies cross-region replication with WORM immutable object locks, and simulates mandatory annual tabletop ransomware drills.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportMinutes}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isExporting ? 'Generating Package...' : 'Export BCDR Audit Binder'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('systems')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'systems'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Critical Systems, RTO/RPO & Backups ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('drills')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'drills'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Tabletop Drill Simulator</span>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
            Annual Drill Done
          </span>
        </button>
      </div>

      {/* TAB 1: Systems & Backup Infrastructure */}
      {activeTab === 'systems' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-xs block">Overall Target RTO</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">&lt; 1 Hour</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">Average achieved: 38 min</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-xs block">Overall Target RPO</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">&lt; 15 Minutes</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">Average achieved: 3.5 min</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-xs block">Immutable WORM Backups</span>
              <div className="text-xl font-bold text-emerald-700 font-mono mt-1">100% Active</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">S3 Object Lock Compliance Mode</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-xs block">Cross-Region Failover</span>
              <div className="text-xl font-bold text-blue-700 font-mono mt-1">Stockholm → Frankfurt</div>
              <div className="text-[10px] text-blue-600 font-medium mt-1">Automated Route53 DNS health sync</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Mission-Critical Data Stores & RTO/RPO Telemetry
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Continuous CloudTrail & Snapshot Audit</span>
            </div>

            <div className="divide-y divide-slate-100">
              {assets.map((asset) => (
                <div key={asset.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{asset.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded">
                        {asset.tier}
                      </span>
                      {asset.backupStatus === 'immutable_locked' && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2 py-0.5 rounded flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>WORM Immutable</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{asset.service}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-3 pt-1">
                      <span>Primary: <strong>{asset.primaryRegion}</strong></span>
                      <span aria-hidden="true">→</span>
                      <span>Standby Replica: <strong>{asset.replicaRegion}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-xs">
                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center min-w-[110px]">
                      <span className="text-slate-400 text-[10px] block">Target RTO / RPO</span>
                      <span className="font-bold font-mono text-slate-800">{asset.targetRTO} / {asset.targetRPO}</span>
                    </div>

                    <div className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 text-center min-w-[130px]">
                      <span className="text-emerald-700 text-[10px] block font-semibold">Last Drill Actual</span>
                      <span className="font-bold font-mono text-emerald-900">{asset.lastDrillRTO}</span>
                    </div>

                    <button
                      onClick={() => handleSimulateSnapshotRestore(asset.id)}
                      disabled={isSimulatingRestore}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingRestore && restoredAssetId === asset.id ? 'animate-spin' : ''}`} />
                      <span>{isSimulatingRestore && restoredAssetId === asset.id ? 'Restoring Snapshot...' : 'Test Restore'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Tabletop Drill Simulator */}
      {activeTab === 'drills' && selectedDrill && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Annual Tabletop Exercise
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Clauses: {selectedDrill.complianceClauses.join(' · ')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedDrill.title}</h2>
              <div className="text-xs text-slate-600 mt-0.5">
                Conducted: <strong>{selectedDrill.conductedDate || 'Scheduled'}</strong> · Lead: {selectedDrill.drillLead}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedDrill.status === 'completed' ? (
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Auditor Signed Off (Seal: {selectedDrill.formalMinutesHash?.substring(0, 18)}...)</span>
                </div>
              ) : (
                <button
                  onClick={() => handleCompleteDrill(selectedDrill.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Complete Drill & Seal Minutes
                </button>
              )}
            </div>
          </div>

          {/* Drill Steps / Injects */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Interactive Tabletop Simulation Injects
            </h3>

            <div className="space-y-3">
              {selectedDrill.steps.map((st, stepIdx) => (
                <div key={st.stepNumber} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-900 uppercase tracking-wider">
                      {st.phase}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Inject #{st.stepNumber}</span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-slate-200">
                    {st.scenarioInject}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-600 block">Incident Commander Decision:</span>
                    <div className="space-y-1.5">
                      {st.options.map((opt, optIdx) => {
                        const isChosen = st.selectedOptionIndex === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectDrillOption(stepIdx, optIdx)}
                            className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                              isChosen
                                ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 ring-1 ring-indigo-400'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold">{opt.text}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Framework Alignment: {opt.frameworkAlignment}
                              </div>
                            </div>
                            <span className="font-mono text-[10px] font-bold shrink-0 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {opt.rtoImpact}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lessons Learned */}
          {selectedDrill.lessonsLearned.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Auditor-Recorded Post-Drill Observations & Improvements:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
                {selectedDrill.lessonsLearned.map((l, idx) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

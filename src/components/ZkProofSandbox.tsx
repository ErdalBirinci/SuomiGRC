import React, { useState } from 'react';
import { ZkVerificationProbe } from '../types/grc';
import { initialZkVerificationProbes } from '../data/mockInnovativeData';
import {
  ShieldCheck,
  Cpu,
  KeyRound,
  CheckCircle2,
  FileCheck2,
  Play,
  RotateCw,
  Hash,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
  Search,
} from 'lucide-react';

export const ZkProofSandbox: React.FC = () => {
  const [probes, setProbes] = useState<ZkVerificationProbe[]>(initialZkVerificationProbes);
  const [runningProbeId, setRunningProbeId] = useState<string | null>(null);
  const [selectedProbeId, setSelectedProbeId] = useState<string>(initialZkVerificationProbes[0].id);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const selectedProbe = probes.find((p) => p.id === selectedProbeId) || probes[0];

  const handleRunProbe = (probeId: string) => {
    setRunningProbeId(probeId);
    setTimeout(() => {
      setProbes((prev) =>
        prev.map((p) =>
          p.id === probeId
            ? {
                ...p,
                status: 'verified_clean',
                proofLatencyMs: Math.round(75 + Math.random() * 80),
                lastVerifiedAt: 'Just now',
                cryptographicProofHash: `zk-proof-sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
              }
            : p
        )
      );
      setRunningProbeId(null);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-900/60 rounded-2xl p-6 sm:p-7 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Knowledge Proof Attestation Sandbox</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Live Cryptographic Verification Sandbox
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Enable enterprise buyers and external auditors to mathematically verify your security controls
              <strong> without disclosing sensitive customer data, API keys, or infrastructure topology</strong>.
              Uses ZK-SNARKs and Merkle membership proofs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Generate Attestation Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Probes List, Right Cryptographic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Probes List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">Active Cryptographic Probes</span>
              <span className="text-[11px] font-mono text-emerald-600 font-bold">4 of 4 Verified</span>
            </div>
            <p className="text-xs text-slate-500">
              Select a probe to inspect mathematical circuit constraints and public inputs.
            </p>
          </div>

          {probes.map((probe) => {
            const isSelected = probe.id === selectedProbe?.id;
            const isRunning = runningProbeId === probe.id;
            return (
              <div
                key={probe.id}
                onClick={() => setSelectedProbeId(probe.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-50/60 border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {probe.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {probe.status === 'verified_clean' ? 'Verified Clean' : 'Pending Probe'}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-slate-900">{probe.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {probe.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono text-emerald-700">{probe.proofLatencyMs}ms proof</span>
                  <span>{probe.lastVerifiedAt || 'Never'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Cryptographic Proof Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedProbe && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-0">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {selectedProbe.zkCircuitType}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedProbe.title}</h2>
                </div>

                <button
                  onClick={() => handleRunProbe(selectedProbe.id)}
                  disabled={runningProbeId === selectedProbe.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs shrink-0"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${runningProbeId === selectedProbe.id ? 'animate-spin' : ''}`} />
                  <span>{runningProbeId === selectedProbe.id ? 'Generating Proof...' : 'Re-verify Proof'}</span>
                </button>
              </div>

              {/* Inspector Body */}
              <div className="p-5 space-y-4">
                {/* Proof Badge */}
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">{selectedProbe.proofBadgeLabel}</div>
                      <div className="text-[11px] text-emerald-700">
                        Cryptographic assurance level: 128-bit quantum-resistant curve
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-800">
                    {selectedProbe.proofLatencyMs}ms
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  <strong className="text-slate-900">Auditor Explanation:</strong> {selectedProbe.inspectorExplanation}
                </div>

                {/* Public Inputs Matrix */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-emerald-600" />
                    <span>Public Mathematical Inputs (Verifiable by Anyone)</span>
                  </div>
                  <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-xs space-y-1.5 border border-slate-800">
                    {Object.entries(selectedProbe.publicInputs).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-emerald-400">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Key Fingerprint */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-700">Verification Key Fingerprint:</span>
                  <div className="font-mono text-[11px] text-slate-600 bg-slate-100 p-2 rounded border border-slate-200 break-all">
                    {selectedProbe.verificationKeyFingerprint}
                  </div>
                </div>

                {/* Cryptographic Proof Hash */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-700">Live Snark Proof Payload Hash:</span>
                  <div className="font-mono text-[11px] text-emerald-700 bg-emerald-50/50 p-2 rounded border border-emerald-200 break-all font-semibold">
                    {selectedProbe.cryptographicProofHash}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attestation Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  NordicScale Cryptographic Attestation Dossier
                </h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Issuer:</span>
                <span className="font-bold text-slate-900">NordicScale Autonomous GRC 3.0</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Target Tenant:</span>
                <span className="font-bold text-slate-900">Tenant #9841 (NordicScale Tech)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Verified Probes:</span>
                <span className="font-bold text-emerald-600">4 of 4 Passed (Zero Knowledge)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Root Merkle Hash:</span>
                <span className="font-bold text-slate-700">0x884c7a6e190b...f291</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              This tamper-evident digital token can be shared with enterprise prospects, security teams, and procurement
              officers to satisfy vendor due diligence without executing formal non-disclosure agreements.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Signed Token (JSON-LD)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

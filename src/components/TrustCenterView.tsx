import React, { useState } from 'react';
import { Framework, Vendor, NdaRecord } from '../types/grc';
import { initialNdaRecords } from '../data/mockEnterpriseData';
import { TrustCenterNdaModal } from './TrustCenterNdaModal';
import {
  ShieldCheck,
  Lock,
  Download,
  FileCheck2,
  ExternalLink,
  CheckCircle2,
  Building,
  Server,
  KeyRound,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  FileLock,
  UserCheck,
  Globe2,
  Sliders,
  Eye,
  Copy,
  Check,
  X,
  FileCode,
  Shield,
} from 'lucide-react';

interface TrustCenterViewProps {
  frameworks: Framework[];
  vendors: Vendor[];
}

export const TrustCenterView: React.FC<TrustCenterViewProps> = ({ frameworks, vendors }) => {
  const [ndaRecords, setNdaRecords] = useState<NdaRecord[]>(initialNdaRecords);
  const [activeNdaDocument, setActiveNdaDocument] = useState<string | null>(null);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isWatermarkPreviewOpen, setIsWatermarkPreviewOpen] = useState(false);

  // Custom Domain & CNAME state
  const [customDomain, setCustomDomain] = useState('trust.acme.com');
  const [cnameRecordVerified, setCnameRecordVerified] = useState(true);
  const [sslStatus, setSslStatus] = useState<'active' | 'provisioning'>('active');
  const [copiedDns, setCopiedDns] = useState(false);

  // Watermark Settings state
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkAngle, setWatermarkAngle] = useState(-35);
  const [watermarkIncludeIp, setWatermarkIncludeIp] = useState(true);
  const [watermarkIncludeEmail, setWatermarkIncludeEmail] = useState(true);
  const [watermarkIncludeTimestamp, setWatermarkIncludeTimestamp] = useState(true);
  const [previewEmail, setPreviewEmail] = useState('prospect.ciso@enterprise-buyer.com');
  const [previewIp, setPreviewIp] = useState('198.51.100.42');

  const handleNdaSigned = (record: NdaRecord) => {
    setNdaRecords([record, ...ndaRecords]);
  };

  const handleCopyDns = () => {
    navigator.clipboard.writeText(`trust.acme.com CNAME trust.suomigrc.app`);
    setCopiedDns(true);
    setTimeout(() => setCopiedDns(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Trust Center Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Acme Corp · Live Trust Center (trust.suomigrc.app)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Security, Privacy & Trust Portal
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Real-time verification of security controls, SOC 2 Type II audit packages, ISO 27001 certifications, and subprocessor compliance with automated click-to-sign NDA watermarking.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setActiveNdaDocument('SOC 2 Type II Final Audit Report (2026)')}
              className="flex items-center gap-2 px-4 py-2 bg-[#5B45E0] hover:bg-[#4F38D3] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Request SOC 2 Report (Click-to-Sign NDA)</span>
            </button>

            <button
              onClick={() => setIsDomainModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#5B45E0]" />
              <span>Custom CNAME Domain ({customDomain})</span>
            </button>

            <button
              onClick={() => setIsWatermarkPreviewOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span>Dynamic Watermark Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Certifications Showcase */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
          Active Security Certifications & Frameworks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map((fw) => (
            <div key={fw.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-[#5B45E0] bg-indigo-50 px-2 py-0.5 rounded font-semibold border border-indigo-100">
                    {fw.code}
                  </span>
                  <h3 className="font-semibold text-slate-900 text-sm mt-1">{fw.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {fw.description}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Audited by: <strong className="text-slate-700">{fw.auditorPartner}</strong></span>
                <span className="font-mono">{fw.version}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Architecture Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="p-2 bg-indigo-50 text-[#5B45E0] rounded-lg w-fit mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">End-to-End Encryption</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            All customer data is encrypted in transit using TLS 1.3 with strict HSTS and at rest using AES-256 with KMS customer-managed keys.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="p-2 bg-indigo-50 text-[#5B45E0] rounded-lg w-fit mb-3">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">EU & US Regional Hosting</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Data sovereignty guaranteed: EU customer datastores remain resident in AWS Frankfurt / Stockholm with GDPR Article 28 compliance.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Continuous Vulnerability Scanning</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Continuous CVE scanning and annual external penetration testing executed by certified Coalfire & Schellman security consultants.
          </p>
        </div>
      </div>

      {/* Executed NDA Agreements & Dynamic Watermark Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#5B45E0]" />
              <span>Executed NDAs & Dynamic Watermarked Documents</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete audit log of external prospects who executed click-to-sign NDAs to access confidential audit reports with embedded tamper-proof viewer stamps.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-[#5B45E0] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {ndaRecords.length} Signed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Authorized Signer</th>
                <th className="py-2.5 px-3">Company / Client</th>
                <th className="py-2.5 px-3">Requested Document</th>
                <th className="py-2.5 px-3">Signed At & IP</th>
                <th className="py-2.5 px-3 text-right">Dynamic Watermark Stamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ndaRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{rec.signerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono block">{rec.signerEmail}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{rec.signerCompany}</td>
                  <td className="py-3 px-3 text-slate-800 font-semibold">{rec.documentTitle}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    <div>{rec.signedAt}</div>
                    <div className="text-[10px] text-slate-400">IP: {rec.ipAddress}</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded block truncate max-w-[260px] ml-auto">
                      {rec.watermarkText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approved Sub-processors Directory */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Approved Sub-Processor Directory</h3>
            <p className="text-xs text-slate-500">
              Transparent inventory of cloud providers and sub-processors holding active Data Processing Agreements (DPA).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Sub-Processor</th>
                <th className="py-2.5 px-3">Purpose / Activity</th>
                <th className="py-2.5 px-3">Data Location</th>
                <th className="py-2.5 px-3 text-right">DPA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.slice(0, 5).map((v) => (
                <tr key={v.id}>
                  <td className="py-3 px-3 font-semibold text-slate-900">{v.name}</td>
                  <td className="py-3 px-3 text-slate-600">{v.category}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">USA / EU Regions</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                      Standard Contractual Clauses (DPA)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom CNAME Domain Modal */}
      {isDomainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-[#5B45E0] font-bold uppercase">
                  Branding & CNAME Configuration
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Custom Trust Center Domain
                </h3>
              </div>
              <button onClick={() => setIsDomainModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Hostname
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SSL Active
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Required DNS Entry</div>
                <div className="flex items-center justify-between text-slate-800">
                  <span>Type: CNAME</span>
                  <span>Host: trust</span>
                </div>
                <div className="flex items-center justify-between text-slate-800">
                  <span>Value: vanta-trust.suomigrc.app</span>
                  <button
                    onClick={handleCopyDns}
                    className="text-[#5B45E0] hover:underline flex items-center gap-1 font-sans text-xs font-semibold"
                  >
                    {copiedDns ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDns ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Automated Let's Encrypt TLS:</span> Auto-provisions and auto-renews every 90 days with zero downtime.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDomainModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg transition-colors"
              >
                Save & Verify CNAME
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Watermark Configurator & Live Preview Simulator */}
      {isWatermarkPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-[#5B45E0] font-bold uppercase">
                  Document Security & Leak Prevention
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Dynamic Document Watermarking Engine
                </h3>
              </div>
              <button onClick={() => setIsWatermarkPreviewOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Controls */}
              <div className="space-y-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Simulate Viewer Email
                  </label>
                  <input
                    type="text"
                    value={previewEmail}
                    onChange={(e) => setPreviewEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Simulate Viewer IP Address
                  </label>
                  <input
                    type="text"
                    value={previewIp}
                    onChange={(e) => setPreviewIp(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watermarkIncludeEmail}
                      onChange={(e) => setWatermarkIncludeEmail(e.target.checked)}
                      className="rounded text-[#5B45E0]"
                    />
                    <span>Embed Prospect Email Address</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watermarkIncludeIp}
                      onChange={(e) => setWatermarkIncludeIp(e.target.checked)}
                      className="rounded text-[#5B45E0]"
                    />
                    <span>Embed Network IP Stamp</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watermarkIncludeTimestamp}
                      onChange={(e) => setWatermarkIncludeTimestamp(e.target.checked)}
                      className="rounded text-[#5B45E0]"
                    />
                    <span>Embed UTC Download Timestamp</span>
                  </label>
                </div>
              </div>

              {/* Live Preview Canvas Simulator */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Live Stamped PDF Output</span>
                  <span className="font-mono text-emerald-600 font-bold">256-Bit Cryptographic Stamp</span>
                </div>
                <div className="relative bg-slate-100 rounded-xl p-6 h-64 border border-slate-300 flex flex-col justify-between overflow-hidden shadow-inner select-none">
                  {/* Watermark Diagonal Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                    style={{ transform: `rotate(${watermarkAngle}deg)` }}
                  >
                    <div
                      className="text-center font-mono font-bold leading-relaxed text-red-600"
                      style={{ opacity: watermarkOpacity }}
                    >
                      <div className="text-sm uppercase tracking-widest">CONFIDENTIAL NDA PROTECTED</div>
                      {watermarkIncludeEmail && <div className="text-xs">{previewEmail}</div>}
                      {watermarkIncludeIp && <div className="text-[10px]">IP: {previewIp}</div>}
                      {watermarkIncludeTimestamp && (
                        <div className="text-[9px]">{new Date().toISOString()}</div>
                      )}
                      <div className="text-[8px] font-mono">UUID: 8f4b-91c2-3e4a-5b6d</div>
                    </div>
                  </div>

                  {/* Simulated PDF Header */}
                  <div className="relative z-0 opacity-40">
                    <div className="h-4 w-32 bg-slate-400 rounded mb-2" />
                    <div className="h-2.5 w-full bg-slate-300 rounded mb-1.5" />
                    <div className="h-2.5 w-4/5 bg-slate-300 rounded mb-1.5" />
                    <div className="h-2.5 w-3/4 bg-slate-300 rounded" />
                  </div>

                  <div className="relative z-0 opacity-40">
                    <div className="h-3 w-48 bg-slate-400 rounded mb-1" />
                    <div className="h-2 w-full bg-slate-300 rounded mb-1" />
                    <div className="h-2 w-2/3 bg-slate-300 rounded" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsWatermarkPreviewOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5B45E0] hover:bg-[#4F38D3] rounded-lg transition-colors"
              >
                Save Watermark Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-to-Sign NDA Modal */}
      {activeNdaDocument && (
        <TrustCenterNdaModal
          documentTitle={activeNdaDocument}
          onConfirmSigned={handleNdaSigned}
          onClose={() => setActiveNdaDocument(null)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { NdaRecord } from '../types/grc';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  X,
  Eye,
  Building2,
  Mail,
  User,
  Check,
} from 'lucide-react';

interface TrustCenterNdaModalProps {
  documentTitle: string;
  onConfirmSigned: (newRecord: NdaRecord) => void;
  onClose: () => void;
}

export const TrustCenterNdaModal: React.FC<TrustCenterNdaModalProps> = ({
  documentTitle,
  onConfirmSigned,
  onClose,
}) => {
  const [step, setStep] = useState<'sign' | 'preview'>('sign');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerCompany, setSignerCompany] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [signatureText, setSignatureText] = useState('');

  const watermarkText = `CONFIDENTIAL · LICENSED TO ${signerName.toUpperCase() || 'PROSPECT'} (${signerCompany.toUpperCase() || 'ENTERPRISE'}) · ${new Date().toISOString().split('T')[0]} · IP: 88.192.44.12`;

  const handleCompleteSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName || !signerEmail || !signerCompany || !agreedTerms) return;

    const record: NdaRecord = {
      id: `nda-${Date.now()}`,
      signerName,
      signerEmail,
      signerCompany,
      documentTitle,
      signedAt: new Date().toLocaleString(),
      ipAddress: '88.192.44.12',
      watermarkText,
      status: 'signed',
    };

    onConfirmSigned(record);
    setStep('preview');
  };

  const handleDownload = () => {
    alert(`Downloading ${documentTitle} dynamically watermarked for ${signerName} (${signerCompany}).`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Confidential Security Document Access
              </h3>
              <p className="text-[11px] text-slate-500">
                {documentTitle} · Non-Disclosure Agreement (NDA) Execution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {step === 'sign' ? (
            <form onSubmit={handleCompleteSign} className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 leading-relaxed">
                <span className="font-semibold">Confidentiality Requirement: </span>
                This audit report contains proprietary security architectures and penetration testing methodologies.
                Viewing requires signing our mutual click-to-sign NDA. A dynamic cryptographic watermark will be embedded across every page.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Rostova"
                      value={signerName}
                      onChange={(e) => {
                        setSignerName(e.target.value);
                        if (!signatureText) setSignatureText(e.target.value);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Business Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. elena@company.com"
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Global Bank AG"
                    value={signerCompany}
                    onChange={(e) => setSignerCompany(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Legal Text Scrollbox */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 max-h-24 overflow-y-auto leading-relaxed space-y-1">
                <p className="font-semibold text-slate-800">Standard Mutual Non-Disclosure Terms (SOC 2 Access)</p>
                <p>
                  Recipient agrees to protect the Confidential Information with the same degree of care it uses for its own confidential materials of like nature, but not less than reasonable care. Recipient shall not disclose, reproduce, or distribute the SOC 2 Type II or Penetration Test reports to third parties without prior written consent from NordicScale Technologies Oy.
                </p>
              </div>

              {/* Digital Signature */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Type Digital Signature to Execute
                </label>
                <input
                  type="text"
                  required
                  placeholder="Type your legal full name"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-serif italic text-sm text-blue-900"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 text-blue-600 rounded"
                />
                <span className="text-slate-600 text-[11px]">
                  I agree to the Non-Disclosure Terms and authorize dynamic watermarking on the downloaded documentation.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!signerName || !signerEmail || !signerCompany || !agreedTerms}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs disabled:opacity-50"
                >
                  Sign & View Watermarked Document
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  NDA Successfully Signed by {signerName} ({signerCompany})
                </span>
              </div>

              {/* Dynamic Watermark Preview Container */}
              <div className="relative border-2 border-slate-200 rounded-xl bg-white p-6 shadow-inner overflow-hidden select-none min-h-[220px]">
                {/* Diagonal Watermark Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-25deg] opacity-25">
                  <div className="text-center font-mono font-bold text-red-600 text-xs tracking-wider space-y-1">
                    <div>{watermarkText}</div>
                    <div>DO NOT COPY · DO NOT REDISTRIBUTE</div>
                  </div>
                </div>

                {/* Mock Report Header Content */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-900 text-sm">{documentTitle}</span>
                    <span className="font-mono text-[10px] text-slate-400">Page 1 of 48</span>
                  </div>

                  <div className="space-y-1.5 text-slate-600 text-xs">
                    <div className="font-semibold text-slate-800">
                      Independent Service Auditor’s Report on Controls Relevant to Security & Availability
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      To the Management of NordicScale Technologies Oy: We have examined the accompanying description of NordicScale's Cloud Platform System for the period April 1, 2026 to September 30, 2026...
                    </p>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-500">
                    Audit Opinion: UNQUALIFIED (Clean Opinion) · Issued by Coalfire Systems, LLP.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-mono">
                  SHA-256 Receipt: e3b0c442...991b7852
                </span>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Watermarked PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

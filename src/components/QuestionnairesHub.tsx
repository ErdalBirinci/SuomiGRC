import React, { useState } from 'react';
import {
  SecurityQuestionnaire,
  QuestionnaireItem,
  Policy,
  Control,
} from '../types/grc';
import {
  FileQuestion,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Search,
  ExternalLink,
  Edit3,
  ShieldCheck,
  Send,
  RefreshCw,
  Copy,
  Check,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface QuestionnairesHubProps {
  questionnaires: SecurityQuestionnaire[];
  items: QuestionnaireItem[];
  policies: Policy[];
  controls: Control[];
  onUpdateItems: (items: QuestionnaireItem[]) => void;
  onUpdateQuestionnaires: (questionnaires: SecurityQuestionnaire[]) => void;
}

export const QuestionnairesHub: React.FC<QuestionnairesHubProps> = ({
  questionnaires,
  items,
  policies,
  controls,
  onUpdateItems,
  onUpdateQuestionnaires,
}) => {
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>(
    questionnaires[0]?.id || 'quest-acme-sig'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedAnswer, setEditedAnswer] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Quick Ad-hoc AI query
  const [adHocPrompt, setAdHocPrompt] = useState('');
  const [adHocResponse, setAdHocResponse] = useState<string | null>(null);
  const [isAdHocLoading, setIsAdHocLoading] = useState(false);

  // Upload modal simulation
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newStandard, setNewStandard] = useState<'SIG Lite' | 'CAIQ v4' | 'Custom Enterprise'>('SIG Lite');

  const currentQuestionnaire =
    questionnaires.find((q) => q.id === selectedQuestionnaireId) || questionnaires[0];

  const currentItems = items.filter((item) => item.questionnaireId === selectedQuestionnaireId);

  const sections = Array.from(new Set(currentItems.map((i) => i.section)));

  const filteredItems = currentItems.filter((item) => {
    if (sectionFilter !== 'all' && item.section !== sectionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.questionText.toLowerCase().includes(q) ||
        item.suggestedAnswer.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        item.citedControlCodes.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const verifiedCount = currentItems.filter((i) => i.status === 'verified').length;
  const autoFilledCount = currentItems.filter((i) => i.status === 'auto_filled').length;
  const totalCount = currentItems.length;
  const completionPct = totalCount > 0 ? Math.round(((verifiedCount + autoFilledCount) / totalCount) * 100) : 0;

  const handleStartEdit = (item: QuestionnaireItem) => {
    setEditingItemId(item.id);
    setEditedAnswer(item.suggestedAnswer);
  };

  const handleSaveEdit = (itemId: string) => {
    const updated = items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            suggestedAnswer: editedAnswer,
            status: 'verified' as const,
          }
        : i
    );
    onUpdateItems(updated);
    setEditingItemId(null);
  };

  const handleMarkVerified = (itemId: string) => {
    const updated = items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            status: 'verified' as const,
          }
        : i
    );
    onUpdateItems(updated);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunAiFillAll = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      const updated = items.map((i) => {
        if (i.questionnaireId === selectedQuestionnaireId) {
          return {
            ...i,
            status: 'verified' as const,
            confidence: Math.min(99, i.confidence + 2),
          };
        }
        return i;
      });
      onUpdateItems(updated);
    }, 1200);
  };

  const handleAskAdHoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adHocPrompt.trim()) return;

    setIsAdHocLoading(true);
    setTimeout(() => {
      setIsAdHocLoading(false);
      const promptLower = adHocPrompt.toLowerCase();
      let answer = '';
      if (promptLower.includes('backup') || promptLower.includes('recovery')) {
        answer = 'NordicScale enforces continuous automated backups for production RDS instances with 35-day retention and cross-region replication to Stockholm (eu-north-1). RTO < 4h, RPO < 1h. Verified under SOC 2 CC7.3 & Policy POL-BCDR-01.';
      } else if (promptLower.includes('encryption') || promptLower.includes('tls') || promptLower.includes('key')) {
        answer = 'All customer data is encrypted in transit via TLS 1.3 with strict HSTS and at rest using AES-256 with KMS customer-managed keys rotated annually. Verified by continuous automated test test-aws-rds-encryption.';
      } else if (promptLower.includes('retention') || promptLower.includes('delete') || promptLower.includes('gdpr')) {
        answer = 'Customer data is retained only for the active subscription duration and securely deleted within 30 days of contract termination using crypto-erasure standards (NIST SP 800-88). Verified in GDPR Article 28 DPA.';
      } else {
        answer = `Based on your SOC 2 Type II controls and Policy Center documentation: NordicScale operates a Zero Trust architecture enforcing hardware MFA (FIDO2 WebAuthn), automated Jamf FileVault disk encryption on 100% of endpoints, and annual independent penetration tests (Coalfire, Q2 2026, 0 critical findings).`;
      }
      setAdHocResponse(answer);
    }, 900);
  };

  const handleCreateNewQuestionnaire = () => {
    if (!newClientName || !newTitle) return;
    const newId = `quest-${Date.now()}`;
    const newQ: SecurityQuestionnaire = {
      id: newId,
      clientName: newClientName,
      title: newTitle,
      standard: newStandard,
      status: 'in_progress',
      totalQuestions: 8,
      answeredQuestions: 8,
      averageConfidence: 97,
      uploadedAt: 'Today',
      lastGeneratedAt: 'Just now',
    };

    // Generate starter items from existing knowledge base
    const sampleItems: QuestionnaireItem[] = [
      {
        id: `q-${Date.now()}-1`,
        questionnaireId: newId,
        questionNumber: 1,
        section: '1. Access Control & IAM',
        questionText: 'Is Single Sign-On (SSO) and Multi-Factor Authentication (MFA) required for all employees?',
        suggestedAnswer: 'Yes. 100% of corporate identities require Okta SSO with mandatory FIDO2 WebAuthn or TOTP MFA.',
        confidence: 99,
        status: 'auto_filled',
        citedControlCodes: ['CC6.2', 'CTL-IAM-01'],
        citedPolicyIds: ['POL-IAM-01'],
        auditEvidenceNote: 'Automated test test-okta-mfa-enforced validates 142/142 active accounts.',
      },
      {
        id: `q-${Date.now()}-2`,
        questionnaireId: newId,
        questionNumber: 2,
        section: '2. Encryption Standards',
        questionText: 'Explain cryptographic protocols used for data stored in cloud object stores.',
        suggestedAnswer: 'All Amazon S3 buckets enforce server-side encryption with AWS KMS (SSE-KMS) using AES-256.',
        confidence: 98,
        status: 'auto_filled',
        citedControlCodes: ['CC6.1', 'CTL-DAT-03'],
        citedPolicyIds: ['POL-DATA-02'],
        auditEvidenceNote: 'Continuous test test-aws-s3-encryption is passing.',
      },
    ];

    onUpdateQuestionnaires([newQ, ...questionnaires]);
    onUpdateItems([...items, ...sampleItems]);
    setSelectedQuestionnaireId(newId);
    setShowUploadModal(false);
    setNewClientName('');
    setNewTitle('');
  };

  const exportQuestionnaireCsv = () => {
    const headers = ['#', 'Section', 'Security Question', 'Suggested Response', 'AI Confidence', 'Status', 'Cited Controls', 'Audit Evidence'];
    const rows = currentItems.map((i) => [
      `"${i.questionNumber}"`,
      `"${i.section}"`,
      `"${i.questionText.replace(/"/g, '""')}"`,
      `"${i.suggestedAnswer.replace(/"/g, '""')}"`,
      `"${i.confidence}%"`,
      `"${i.status.toUpperCase()}"`,
      `"${i.citedControlCodes.join(', ')}"`,
      `"${i.auditEvidenceNote.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentQuestionnaire.clientName.replace(/\s+/g, '_')}_Completed_Security_Questionnaire.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              AI Questionnaire Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">SIG Lite · CAIQ v4 · Custom RFPs</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Vendor Security Questionnaire Auto-Responder
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Eliminate weeks of manual RFP filling. Our AI engine scans your active SOC 2 controls, policy library,
            and continuous telemetry tests to instantly answer enterprise security assessments with precise proof citations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import RFP (Spreadsheet)</span>
          </button>

          <button
            onClick={handleRunAiFillAll}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Re-analyzing Telemetry...' : 'Re-Sync AI Evidence'}</span>
          </button>

          <button
            onClick={exportQuestionnaireCsv}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Answered CSV</span>
          </button>
        </div>
      </div>

      {/* Metric & Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Questionnaire Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Customer Assessment</span>
            <span className="font-semibold text-purple-700 font-mono text-[10px] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              {currentQuestionnaire.standard}
            </span>
          </div>
          <select
            value={selectedQuestionnaireId}
            onChange={(e) => setSelectedQuestionnaireId(e.target.value)}
            className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 mt-1 focus:ring-1 focus:ring-purple-500"
          >
            {questionnaires.map((q) => (
              <option key={q.id} value={q.id}>
                {q.clientName} - {q.standard}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-400 mt-2 truncate">
            {currentQuestionnaire.title}
          </div>
        </div>

        {/* Progress Metric */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Response Completion</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden my-2">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>{verifiedCount} verified</span>
            <span>{autoFilledCount} AI auto-drafted</span>
          </div>
        </div>

        {/* AI Confidence Metric */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {currentQuestionnaire.averageConfidence}%
            </div>
            <div className="text-xs text-slate-500">Average Confidence Score</div>
            <div className="text-[10px] text-emerald-600 font-medium">Backed by live telemetry</div>
          </div>
        </div>

        {/* Audit Citation Backlinks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono">100%</div>
            <div className="text-xs text-slate-500">Evidence Backlink Rate</div>
            <div className="text-[10px] text-slate-400">SOC 2 & ISO controls cited</div>
          </div>
        </div>
      </div>

      {/* Ad-Hoc AI Question Prompt Box */}
      <div className="bg-linear-to-r from-purple-50/70 via-indigo-50/50 to-blue-50/70 p-5 rounded-xl border border-purple-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-900">
              Ask AI Security Assistant (Custom Client Questions)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Grounded in your Policy Center & Live Telemetry
          </span>
        </div>

        <form onSubmit={handleAskAdHoc} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 'What is our exact disaster recovery RTO/RPO commitment and test frequency?'"
            value={adHocPrompt}
            onChange={(e) => setAdHocPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={isAdHocLoading || !adHocPrompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            {isAdHocLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Generate Answer</span>
          </button>
        </form>

        {adHocResponse && (
          <div className="p-3.5 bg-white border border-purple-200 rounded-lg text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                Grounded Compliance Response (Confidence: 99%)
              </span>
              <button
                onClick={() => handleCopy('adhoc', adHocResponse)}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1"
              >
                {copiedId === 'adhoc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === 'adhoc' ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
            <p className="text-slate-800 leading-relaxed font-sans">{adHocResponse}</p>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions, responses, or cited control codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Sections ({currentItems.length})</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Question Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isEditing = editingItemId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {item.questionNumber}
                  </span>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono block">
                      {item.section}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                      {item.questionText}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      item.confidence >= 95
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    AI Confidence: {item.confidence}%
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      item.status === 'verified'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {item.status === 'verified' ? 'Verified' : 'Auto-Drafted'}
                  </span>
                </div>
              </div>

              {/* Answer Content */}
              <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 text-xs">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editedAnswer}
                      onChange={(e) => setEditedAnswer(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-300 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Save & Mark Verified
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-800 leading-relaxed">{item.suggestedAnswer}</p>
                )}
              </div>

              {/* Citations & Evidence Footnote */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">
                    Citations:
                  </span>
                  {item.citedControlCodes.map((code) => (
                    <span
                      key={code}
                      className="font-mono text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                    >
                      {code}
                    </span>
                  ))}
                  {item.citedPolicyIds.map((pol) => (
                    <span
                      key={pol}
                      className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      {pol}
                    </span>
                  ))}
                  <span className="text-[11px] text-slate-500 italic ml-1 truncate max-w-xs">
                    {item.auditEvidenceNote}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, item.suggestedAnswer)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                    title="Copy Answer"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                    title="Edit Answer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {item.status !== 'verified' && (
                    <button
                      onClick={() => handleMarkVerified(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>Verify</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Questionnaire Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                  <Upload className="w-4 h-4" />
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Import Security Questionnaire (RFP)
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer / Enterprise Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Siemens AG, Spotify, or Stripe"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assessment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Cloud Vendor Security Risk Assessment"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Standard Questionnaire Format
                </label>
                <select
                  value={newStandard}
                  onChange={(e) => setNewStandard(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="SIG Lite">Standard Information Gathering (SIG Lite 2026)</option>
                  <option value="CAIQ v4">Cloud Security Alliance (CSA CAIQ v4)</option>
                  <option value="Custom Enterprise">Custom Enterprise Spreadsheet (.XLSX / .CSV)</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50 space-y-1">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="font-semibold text-slate-700">Drop your customer RFP file here</div>
                <div className="text-[11px] text-slate-400">Supports .XLSX, .CSV, .JSON (Auto-parsed by AI)</div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewQuestionnaire}
                disabled={!newClientName || !newTitle}
                className="px-4 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs disabled:opacity-50"
              >
                Auto-Parse & Generate Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

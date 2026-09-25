import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import {
  TrendingUp,
  Calendar,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { FrameworkId } from '../types/grc';

export interface HistoricalDataPoint {
  month: string;
  displayMonth: string;
  fullName: string;
  unifiedScore: number;
  soc2: number;
  iso27001: number;
  hipaa: number;
  gdpr: number;
  pci_dss: number;
  testsPassingRate: number;
  evidenceCoverageRate: number;
  failingTestsCount: number;
  milestone?: string;
  milestoneType?: 'major' | 'audit' | 'remediation';
}

const HISTORICAL_6_MONTHS_DATA: HistoricalDataPoint[] = [
  {
    month: 'Apr 2026',
    displayMonth: 'Apr',
    fullName: 'April 2026',
    unifiedScore: 68,
    soc2: 70,
    iso27001: 64,
    hipaa: 72,
    gdpr: 66,
    pci_dss: 60,
    testsPassingRate: 71,
    evidenceCoverageRate: 62,
    failingTestsCount: 14,
    milestone: 'Continuous Cloud Connectors Initiated (AWS + Okta)',
    milestoneType: 'major',
  },
  {
    month: 'May 2026',
    displayMonth: 'May',
    fullName: 'May 2026',
    unifiedScore: 75,
    soc2: 77,
    iso27001: 71,
    hipaa: 79,
    gdpr: 73,
    pci_dss: 68,
    testsPassingRate: 78,
    evidenceCoverageRate: 70,
    failingTestsCount: 10,
    milestone: 'Hardware MFA Enforcement & MDM Fleet Rollout',
    milestoneType: 'remediation',
  },
  {
    month: 'Jun 2026',
    displayMonth: 'Jun',
    fullName: 'June 2026',
    unifiedScore: 82,
    soc2: 84,
    iso27001: 79,
    hipaa: 85,
    gdpr: 80,
    pci_dss: 76,
    testsPassingRate: 85,
    evidenceCoverageRate: 79,
    failingTestsCount: 7,
    milestone: 'AWS RDS Multi-AZ & SSE-KMS Automated Encryption',
    milestoneType: 'remediation',
  },
  {
    month: 'Jul 2026',
    displayMonth: 'Jul',
    fullName: 'July 2026',
    unifiedScore: 87,
    soc2: 89,
    iso27001: 85,
    hipaa: 90,
    gdpr: 86,
    pci_dss: 82,
    testsPassingRate: 90,
    evidenceCoverageRate: 86,
    failingTestsCount: 5,
    milestone: 'Annual Gray-Box Pentest & ISO 27001 Gap Closure',
    milestoneType: 'major',
  },
  {
    month: 'Aug 2026',
    displayMonth: 'Aug',
    fullName: 'August 2026',
    unifiedScore: 91,
    soc2: 93,
    iso27001: 89,
    hipaa: 94,
    gdpr: 90,
    pci_dss: 87,
    testsPassingRate: 93,
    evidenceCoverageRate: 91,
    failingTestsCount: 3,
    milestone: 'CPA Auditor 90-Day Observation Window Opened',
    milestoneType: 'audit',
  },
  {
    month: 'Sep 2026',
    displayMonth: 'Sep (Current)',
    fullName: 'September 2026 (Live)',
    unifiedScore: 94,
    soc2: 96,
    iso27001: 93,
    hipaa: 96,
    gdpr: 94,
    pci_dss: 91,
    testsPassingRate: 95,
    evidenceCoverageRate: 93,
    failingTestsCount: 2,
    milestone: 'Zero-Drift Telemetry & Merkle Evidence Vault Verified',
    milestoneType: 'audit',
  },
];

type ViewMode = 'all' | 'unified' | 'soc2' | 'iso27001' | 'evidence';

interface ComplianceReadinessTrendChartProps {
  selectedFramework?: FrameworkId | 'all';
  onNavigateTab?: (tab: string) => void;
  className?: string;
}

export const ComplianceReadinessTrendChart: React.FC<ComplianceReadinessTrendChartProps> = ({
  selectedFramework = 'all',
  onNavigateTab,
  className = '',
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (selectedFramework === 'soc2') return 'soc2';
    if (selectedFramework === 'iso27001') return 'iso27001';
    return 'all';
  });

  const [hoveredData, setHoveredData] = useState<HistoricalDataPoint | null>(null);

  // Compute 6-month growth trajectory delta
  const initialScore = HISTORICAL_6_MONTHS_DATA[0].unifiedScore;
  const currentScore = HISTORICAL_6_MONTHS_DATA[HISTORICAL_6_MONTHS_DATA.length - 1].unifiedScore;
  const totalGain = currentScore - initialScore;

  // Custom Chart Tooltip for Auditor Detail
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: HistoricalDataPoint = payload[0].payload;
      return (
        <div
          className={`p-3.5 rounded-xl border shadow-2xl max-w-xs sm:max-w-sm backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${
            isLight
              ? 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/50'
              : 'bg-[#0B1120]/95 border-slate-700 text-slate-100 shadow-cyan-950/50'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50 mb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-xs font-sans">{data.fullName}</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {data.unifiedScore}% Readiness
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-mono my-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                SOC 2:
              </span>
              <span className="font-bold text-cyan-300">{data.soc2}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                ISO 27001:
              </span>
              <span className="font-bold text-blue-300">{data.iso27001}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                HIPAA:
              </span>
              <span className="font-bold text-emerald-300">{data.hipaa}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                GDPR:
              </span>
              <span className="font-bold text-purple-300">{data.gdpr}%</span>
            </div>
            <div className="flex items-center justify-between col-span-2 pt-1 border-t border-slate-800">
              <span className="text-slate-400">Continuous Test Pass Rate:</span>
              <span className="font-bold text-emerald-400">{data.testsPassingRate}%</span>
            </div>
          </div>

          {data.milestone && (
            <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-300 flex items-start gap-1.5 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-cyan-300">Auditor Milestone:</strong> {data.milestone}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`executive-card p-5 sm:p-6 border relative overflow-hidden transition-all shadow-xl ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'border-slate-800 text-slate-100'
      } ${className}`}
    >
      {/* Subtle Ambient Gradient Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
              Historical Compliance Readiness Trend (Last 6 Months)
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              <TrendingUp className="w-3 h-3" />
              <span>+{totalGain}% 6-Mo Velocity</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Continuous evidence observation trend line across major compliance frameworks and automated controls.
          </p>
        </div>

        {/* View Mode Segmented Filter */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono">
          {[
            { id: 'all', label: 'All Frameworks' },
            { id: 'unified', label: 'Unified Readiness' },
            { id: 'soc2', label: 'SOC 2 Type II' },
            { id: 'iso27001', label: 'ISO 27001' },
            { id: 'evidence', label: 'Evidence & Tests' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium text-[11px] ${
                viewMode === mode.id
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trajectory Stat Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 font-mono">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Starting Baseline (Apr)</div>
          <div className="text-lg font-bold text-white mt-0.5">68.0%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Initial Gap Assessment</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 font-mono">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current Posture (Sep)</div>
          <div className="text-lg font-bold text-cyan-300 mt-0.5">94.0%</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">+26.0% Overall Gain</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 font-mono">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Audit Threshold</div>
          <div className="text-lg font-bold text-amber-300 mt-0.5">85.0%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Exceeded in Month 4</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 font-mono">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Drift Rate</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">&lt; 0.6%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">2 Failing of 42 Tests</div>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="h-72 sm:h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={HISTORICAL_6_MONTHS_DATA}
            margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isLight ? '#E2E8F0' : '#1E293B'}
              vertical={false}
            />
            
            <XAxis
              dataKey="displayMonth"
              stroke={isLight ? '#64748B' : '#94A3B8'}
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: isLight ? '#CBD5E1' : '#334155' }}
            />

            <YAxis
              domain={[50, 100]}
              ticks={[50, 60, 70, 80, 85, 90, 100]}
              stroke={isLight ? '#64748B' : '#94A3B8'}
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickFormatter={(val) => `${val}%`}
              tickLine={false}
              axisLine={{ stroke: isLight ? '#CBD5E1' : '#334155' }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Audit Readiness Threshold Reference Line */}
            <ReferenceLine
              y={85}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'CPA Readiness Benchmark (85%)',
                position: 'insideTopRight',
                fill: '#F59E0B',
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />

            {/* Render Lines Based on ViewMode */}
            {(viewMode === 'all' || viewMode === 'unified') && (
              <Line
                type="monotone"
                dataKey="unifiedScore"
                name="Unified Readiness"
                stroke="#00D2FF"
                strokeWidth={3}
                dot={{ r: 4, fill: '#00D2FF', strokeWidth: 2, stroke: isLight ? '#fff' : '#0B1120' }}
                activeDot={{ r: 6, fill: '#00D2FF', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {(viewMode === 'all' || viewMode === 'soc2') && (
              <Line
                type="monotone"
                dataKey="soc2"
                name="SOC 2 Type II"
                stroke="#38BDF8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#38BDF8' }}
                activeDot={{ r: 5, fill: '#38BDF8' }}
              />
            )}

            {(viewMode === 'all' || viewMode === 'iso27001') && (
              <Line
                type="monotone"
                dataKey="iso27001"
                name="ISO 27001:2022"
                stroke="#818CF8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#818CF8' }}
                activeDot={{ r: 5, fill: '#818CF8' }}
              />
            )}

            {viewMode === 'all' && (
              <Line
                type="monotone"
                dataKey="hipaa"
                name="HIPAA Security"
                stroke="#34D399"
                strokeWidth={2}
                dot={{ r: 3, fill: '#34D399' }}
                activeDot={{ r: 5, fill: '#34D399' }}
              />
            )}

            {viewMode === 'all' && (
              <Line
                type="monotone"
                dataKey="gdpr"
                name="GDPR / Privacy"
                stroke="#C084FC"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={{ r: 3, fill: '#C084FC' }}
                activeDot={{ r: 5, fill: '#C084FC' }}
              />
            )}

            {viewMode === 'evidence' && (
              <>
                <Line
                  type="monotone"
                  dataKey="testsPassingRate"
                  name="Continuous Test Pass Rate"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981' }}
                  activeDot={{ r: 6, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="evidenceCoverageRate"
                  name="Evidence Coverage Rate"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366F1' }}
                  activeDot={{ r: 6, fill: '#6366F1' }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & Interactive Indicators */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#00D2FF] rounded-full" />
            <span className="text-slate-300">Unified Readiness</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#38BDF8] rounded-full" />
            <span className="text-slate-300">SOC 2 Type II</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#818CF8] rounded-full" />
            <span className="text-slate-300">ISO 27001</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#34D399] rounded-full" />
            <span className="text-slate-300">HIPAA Security</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-[#F59E0B]" />
            <span className="text-amber-400">85% Audit Pass Threshold</span>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('drift-timeline')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-sans"
          >
            <span>Explore Drift Timeline</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* 6-Month Historical Milestones Timeline Strip */}
      <div className="mt-5 pt-4 border-t border-slate-800/60">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Historical Audit & Remediation Milestones (April – September 2026)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {HISTORICAL_6_MONTHS_DATA.filter((d) => d.milestone).slice(-3).map((item) => (
            <div
              key={item.month}
              className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-start gap-2 text-xs"
            >
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1 font-mono">
                  <span className="text-cyan-300 font-bold text-[11px]">{item.month}</span>
                  <span className="text-[10px] text-slate-400">{item.unifiedScore}% Score</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {item.milestone}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { DepartmentHeatmapCell, BusinessUnitMaturity, FrameworkId } from '../types/grc';
import { initialHeatmapCells, businessUnitsList, controlDomainsList } from '../data/mockHeatmapData';
import {
  ShieldCheck,
  Building,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  X,
  UserCheck,
  FileCheck2,
  ExternalLink,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

interface ComplianceReadinessHeatmapProps {
  onNavigateTab?: (tabId: string) => void;
  selectedFramework?: FrameworkId | 'all';
}

type MetricMode = 'score' | 'failing' | 'ratio';
type SortMode = 'default' | 'highest' | 'lowest';

export const ComplianceReadinessHeatmap: React.FC<ComplianceReadinessHeatmapProps> = ({
  onNavigateTab,
  selectedFramework = 'all',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cells, setCells] = useState<DepartmentHeatmapCell[]>(initialHeatmapCells);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [metricMode, setMetricMode] = useState<MetricMode>('score');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [selectedCell, setSelectedCell] = useState<DepartmentHeatmapCell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<DepartmentHeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(900);

  // Measure container for responsive D3 rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filtered & sorted departments
  const departments = useMemo(() => {
    let list = [...businessUnitsList];
    if (selectedDeptId !== 'all') {
      list = list.filter((d) => d.id === selectedDeptId);
    }
    if (sortMode === 'highest') {
      list.sort((a, b) => b.overallMaturity - a.overallMaturity);
    } else if (sortMode === 'lowest') {
      list.sort((a, b) => a.overallMaturity - b.overallMaturity);
    }
    return list;
  }, [selectedDeptId, sortMode]);

  // Overall metrics calculation
  const overallMetrics = useMemo(() => {
    const totalScore = cells.reduce((acc, c) => acc + c.maturityScore, 0);
    const avgScore = Math.round(totalScore / cells.length);
    const highRiskCount = cells.filter((c) => c.maturityScore < 75).length;
    const optimalCount = cells.filter((c) => c.maturityScore >= 90).length;

    const highestUnit = [...businessUnitsList].sort(
      (a, b) => b.overallMaturity - a.overallMaturity
    )[0];
    const lowestUnit = [...businessUnitsList].sort(
      (a, b) => a.overallMaturity - b.overallMaturity
    )[0];

    return {
      avgScore,
      highRiskCount,
      optimalCount,
      highestUnit,
      lowestUnit,
    };
  }, [cells]);

  // Color interpolator for maturity
  const getColorForScore = (score: number) => {
    if (score >= 90) return '#10b981'; // Emerald 500
    if (score >= 75) return '#3b82f6'; // Blue 500
    if (score >= 60) return '#f59e0b'; // Amber 500
    return '#f43f5e'; // Rose 500
  };

  const getBackgroundForScore = (score: number) => {
    if (score >= 90) return 'rgba(16, 185, 129, 0.12)';
    if (score >= 75) return 'rgba(59, 130, 246, 0.12)';
    if (score >= 60) return 'rgba(245, 158, 11, 0.14)';
    return 'rgba(244, 63, 94, 0.15)';
  };

  const getBorderForScore = (score: number) => {
    if (score >= 90) return 'rgba(16, 185, 129, 0.35)';
    if (score >= 75) return 'rgba(59, 130, 246, 0.35)';
    if (score >= 60) return 'rgba(245, 158, 11, 0.4)';
    return 'rgba(244, 63, 94, 0.45)';
  };

  // D3 Rendering Hook
  useEffect(() => {
    if (!svgRef.current || departments.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Chart margins
    const margin = {
      top: 40,
      right: 20,
      bottom: 60,
      left: Math.min(220, Math.max(160, Math.floor(containerWidth * 0.24))),
    };

    const width = containerWidth - margin.left - margin.right;
    const rowHeight = 44;
    const height = controlDomainsList.length * rowHeight;
    const totalSvgHeight = height + margin.top + margin.bottom;

    svg.attr('width', containerWidth).attr('height', totalSvgHeight);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Business Units
    const deptNames = departments.map((d) => d.name);
    const xScale = d3
      .scaleBand()
      .domain(deptNames)
      .range([0, width])
      .padding(0.08);

    // Y Scale: Control Domains
    const domainNames = controlDomainsList.map((d) => d.name);
    const yScale = d3
      .scaleBand()
      .domain(domainNames)
      .range([0, height])
      .padding(0.08);

    // D3 Color scale for gradient
    const colorScale = d3
      .scaleLinear<string>()
      .domain([50, 65, 78, 90, 100])
      .range(['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#059669'])
      .interpolate(d3.interpolateRgb);

    // X Axis (Top & Bottom)
    const xAxis = d3.axisTop(xScale).tickSize(0);
    const xAxisG = g
      .append('g')
      .attr('class', 'x-axis text-slate-700 font-semibold text-xs')
      .call(xAxis);

    xAxisG.select('.domain').remove();
    xAxisG
      .selectAll('text')
      .attr('transform', 'rotate(-25)')
      .attr('text-anchor', 'start')
      .attr('dx', '8px')
      .attr('dy', '-4px')
      .style('font-size', containerWidth < 768 ? '10px' : '11px')
      .style('fill', '#334155')
      .text((d) => {
        const text = d as string;
        if (containerWidth < 900) {
          // Abbreviations for tight viewports
          return text.length > 18 ? `${text.slice(0, 16)}...` : text;
        }
        return text;
      });

    // Y Axis (Left)
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisG = g
      .append('g')
      .attr('class', 'y-axis text-slate-800 font-medium text-xs')
      .call(yAxis);

    yAxisG.select('.domain').remove();
    yAxisG
      .selectAll('text')
      .attr('dx', '-8px')
      .style('font-size', '11px')
      .style('fill', '#1e293b')
      .style('font-weight', '500')
      .text((d) => {
        const text = d as string;
        const domainItem = controlDomainsList.find((c) => c.name === text);
        return domainItem ? `${text}` : text;
      });

    // Heatmap cell groups
    const cellGroups = g
      .selectAll('.heatmap-cell')
      .data(
        cells.filter((c) =>
          departments.some((d) => d.id === c.departmentId)
        )
      )
      .enter()
      .append('g')
      .attr('class', 'heatmap-cell cursor-pointer group')
      .attr(
        'transform',
        (d) =>
          `translate(${xScale(d.departmentName) || 0}, ${
            yScale(d.domainName) || 0
          })`
      );

    // Background Rectangles with rounded corners
    const cellWidth = xScale.bandwidth();
    const cellHeight = yScale.bandwidth();

    cellGroups
      .append('rect')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', (d) => getBackgroundForScore(d.maturityScore))
      .attr('stroke', (d) => getBorderForScore(d.maturityScore))
      .attr('stroke-width', 1.5)
      .style('transition', 'all 0.2s ease-in-out')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2.5)
          .attr('fill', colorScale(d.maturityScore))
          .style('opacity', 0.95);

        // Update tooltip
        const [x, y] = d3.pointer(event, containerRef.current);
        setHoveredCell(d);
        setTooltipPos({ x, y });
      })
      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltipPos({ x, y });
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .attr('stroke', getBorderForScore(d.maturityScore))
          .attr('stroke-width', 1.5)
          .attr('fill', getBackgroundForScore(d.maturityScore))
          .style('opacity', 1);

        setHoveredCell(null);
        setTooltipPos(null);
      })
      .on('click', function (event, d) {
        setSelectedCell(d);
      });

    // Color pill indicator in the cell
    cellGroups
      .append('rect')
      .attr('x', 5)
      .attr('y', 5)
      .attr('width', 4)
      .attr('height', Math.max(8, cellHeight - 10))
      .attr('rx', 2)
      .attr('fill', (d) => getColorForScore(d.maturityScore))
      .style('pointer-events', 'none');

    // Text Label inside Cell (Maturity Score or Ratio)
    cellGroups
      .append('text')
      .attr('x', cellWidth / 2)
      .attr('y', cellHeight / 2 + (cellHeight > 34 ? 1 : 4))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', cellWidth < 65 ? '10px' : '11px')
      .attr('font-weight', '700')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', (d) => {
        if (d.maturityScore >= 90) return '#065f46';
        if (d.maturityScore >= 75) return '#1e40af';
        if (d.maturityScore >= 60) return '#92400e';
        return '#9f1239';
      })
      .style('pointer-events', 'none')
      .text((d) => {
        if (metricMode === 'score') {
          return `${d.maturityScore}%`;
        }
        if (metricMode === 'failing') {
          return d.failingControls === 0
            ? '✓ Pass'
            : `${d.failingControls} Fail`;
        }
        return `${d.passingControls}/${d.totalControls}`;
      });

    // Subtitle inside cell if space permits
    if (cellWidth > 80 && cellHeight > 36) {
      cellGroups
        .append('text')
        .attr('x', cellWidth / 2)
        .attr('y', cellHeight / 2 + 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('fill', '#64748b')
        .style('pointer-events', 'none')
        .text((d) => `${d.passingControls}/${d.totalControls} ctl`);
    }
  }, [departments, cells, metricMode, containerWidth]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5 relative">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <Layers className="w-4 h-4" />
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Compliance Readiness Heatmap (D3.js)
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Department Maturity Map
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time cross-matrix evaluation of internal security control maturity across 7 business units and 8 core compliance domains.
          </p>
        </div>

        {/* Toolbar Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Unit:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Departments ({businessUnitsList.length})</option>
              {businessUnitsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.overallMaturity}%)
                </option>
              ))}
            </select>
          </div>

          {/* Metric Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMetricMode('score')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricMode === 'score'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Score (%)
            </button>
            <button
              onClick={() => setMetricMode('failing')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricMode === 'failing'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Failures
            </button>
            <button
              onClick={() => setMetricMode('ratio')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricMode === 'ratio'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pass Ratio
            </button>
          </div>

          {/* Sorting */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-hidden"
          >
            <option value="default">Default Order</option>
            <option value="highest">Highest Maturity First</option>
            <option value="lowest">Lowest Maturity (Attention)</option>
          </select>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 text-xs">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Overall Maturity Index
          </span>
          <span className="text-base font-bold font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{overallMetrics.avgScore}%</span>
            <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100 px-1 rounded">
              High
            </span>
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Most Mature Squad
          </span>
          <span className="text-xs font-semibold text-slate-900 truncate block mt-1">
            {overallMetrics.highestUnit.name}
          </span>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold">
            {overallMetrics.highestUnit.overallMaturity}% Verified
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Needs Remediation
          </span>
          <span className="text-xs font-semibold text-slate-900 truncate block mt-1">
            {overallMetrics.lowestUnit.name}
          </span>
          <span className="text-[11px] font-mono text-amber-700 font-semibold">
            {overallMetrics.lowestUnit.overallMaturity}% Maturity
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Critical Domain Gaps
          </span>
          <span className="text-base font-bold font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{overallMetrics.highRiskCount}</span>
            <span className="text-[11px] font-normal text-slate-500">
              Domains &lt; 75%
            </span>
          </span>
        </div>
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="overflow-x-auto relative min-h-[420px] pb-2">
        <svg ref={svgRef} className="w-full select-none" />

        {/* Dynamic D3 Hover Tooltip */}
        {hoveredCell && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/95 text-white rounded-xl shadow-xl p-3 max-w-xs text-xs border border-slate-700 backdrop-blur-xs transition-all animate-in fade-in duration-150"
            style={{
              left: Math.min(
                Math.max(10, tooltipPos.x + 15),
                containerWidth - 260
              ),
              top: Math.max(10, tooltipPos.y - 120),
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="font-semibold text-slate-200 truncate">
                {hoveredCell.departmentName}
              </span>
              <span
                className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px]"
                style={{
                  backgroundColor: getColorForScore(hoveredCell.maturityScore),
                  color: '#ffffff',
                }}
              >
                {hoveredCell.maturityScore}%
              </span>
            </div>

            <div className="text-[11px] text-slate-300 font-medium">
              Domain: <strong className="text-white">{hoveredCell.domainName}</strong>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Passing Controls:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {hoveredCell.passingControls} / {hoveredCell.totalControls}
              </span>
            </div>

            {hoveredCell.topRiskFinding && (
              <div className="mt-2 text-[10px] text-slate-300 bg-slate-800/80 p-1.5 rounded border border-slate-700/60 leading-relaxed">
                <span className="text-amber-300 font-semibold block mb-0.5">Finding:</span>
                {hoveredCell.topRiskFinding}
              </div>
            )}

            <div className="mt-2 text-[9px] text-slate-400 font-mono text-right">
              Click cell to drill down into controls →
            </div>
          </div>
        )}
      </div>

      {/* Color Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Maturity Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              &lt; 60% Critical Risk
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              60 - 74% Attention
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              75 - 89% Substantial
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              90 - 100% Audit-Ready
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Click any cell to inspect controls, audit evidence, and assign owners.
        </div>
      </div>

      {/* Drill-down Modal / Slide-over Drawer for Selected Cell */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold font-mono text-sm shrink-0"
                  style={{
                    backgroundColor: getColorForScore(selectedCell.maturityScore),
                  }}
                >
                  {selectedCell.maturityScore}%
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">
                    Department Compliance Deep Dive
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-0.5">
                    {selectedCell.departmentName}
                  </h3>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 font-medium">
                    <span>Domain:</span>
                    <strong className="text-blue-700">{selectedCell.domainName}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Passing Controls
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 mt-0.5 block">
                    {selectedCell.passingControls} / {selectedCell.totalControls}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {Math.round((selectedCell.passingControls / selectedCell.totalControls) * 100)}% Pass Rate
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Lead Owner
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                    {selectedCell.leadOwner}
                  </span>
                  <span className="text-[10px] text-slate-500">Accountable Lead</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Standard Citation
                  </span>
                  <span className="font-mono text-slate-800 mt-0.5 block truncate text-[11px]">
                    {selectedCell.frameworkStandard}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">Mapped Framework</span>
                </div>
              </div>

              {/* Finding / Observation Box */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Latest Continuous Audit Finding</span>
                </div>
                <p className="text-amber-950 text-xs leading-relaxed">
                  {selectedCell.topRiskFinding ||
                    'All technical checks in this domain are executing with zero reported configuration drift.'}
                </p>
              </div>

              {/* Status Breakdown Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>Audit Readiness Assessment</span>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded font-semibold text-white"
                    style={{
                      backgroundColor: getColorForScore(selectedCell.maturityScore),
                    }}
                  >
                    {selectedCell.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  This domain contributes directly to your SOC 2 Type II Security & Confidentiality Trust Services Criteria. External auditors require 100% automated evidence collection for the last 90-day observation window.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setSelectedCell(null);
                  if (onNavigateTab) {
                    onNavigateTab('controls');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Inspect Controls for this Domain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

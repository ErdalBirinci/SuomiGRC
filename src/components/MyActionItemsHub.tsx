import React, { useState, useMemo } from 'react';
import {
  ActionItem,
  ActionItemCategory,
  ActionItemPriority,
  ActionItemStatus,
} from '../types/actionItems';
import { useRBAC } from '../context/RbacContext';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  Code2,
  UserCheck,
  FileWarning,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Plus,
  Calendar,
  Layers,
  Download,
  Check,
  X,
  RefreshCw,
  FolderLock,
  ChevronRight,
  ShieldAlert,
  Flame,
  Zap,
  Tag,
  Eye,
  Bell,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface MyActionItemsHubProps {
  actionItems: ActionItem[];
  onUpdateActionItems: (items: ActionItem[]) => void;
  onNavigateTab: (tabId: string, entityId?: string) => void;
}

const CATEGORY_CONFIG: Record<
  ActionItemCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  evidence_request: {
    label: 'Evidence Requests',
    icon: FileCheck2,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  control_remediation: {
    label: 'Remediations',
    icon: Code2,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  access_review: {
    label: 'Access Reviews',
    icon: UserCheck,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  waiver_approval: {
    label: 'Waivers & SoA',
    icon: FileWarning,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  policy_attestation: {
    label: 'Policy Attestations',
    icon: Layers,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  vendor_assessment: {
    label: 'Vendor Risk & RFPs',
    icon: Sparkles,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  },
  vulnerability_sla: {
    label: 'Vulnerabilities & CVEs',
    icon: ShieldAlert,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
};

export const MyActionItemsHub: React.FC<MyActionItemsHubProps> = ({
  actionItems,
  onUpdateActionItems,
  onNavigateTab,
}) => {
  const { currentRole, currentUser } = useRBAC();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActionItemCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<ActionItemPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');

  // Interactive state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<ActionItemCategory>('evidence_request');
  const [newTaskPriority, setNewTaskPriority] = useState<ActionItemPriority>('p1_high');
  const [newTaskDueDate, setNewTaskDueDate] = useState('In 3 Days');
  const [newTaskFramework, setNewTaskFramework] = useState('SOC 2 CC6.1');
  const [newTaskTargetTab, setNewTaskTargetTab] = useState('controls');

  // Trigger brief notification toast
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setActionToast({ message, type });
    setTimeout(() => {
      setActionToast(null);
    }, 3500);
  };

  // Filter items personalized by RBAC role + search & category filters
  const filteredItems = useMemo(() => {
    return actionItems.filter((item) => {
      // Role matching: match user's role or 'all'
      const roleMatches =
        item.assignedRole === currentRole || item.assignedRole === 'all';

      if (!roleMatches) return false;

      // Status matching
      if (statusFilter === 'pending' && item.status === 'completed') return false;
      if (statusFilter === 'completed' && item.status !== 'completed') return false;

      // Category matching
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Priority matching
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSource = item.metadata.source.toLowerCase().includes(q);
        const matchesFw = item.metadata.framework?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSource && !matchesFw) {
          return false;
        }
      }

      return true;
    });
  }, [actionItems, currentRole, statusFilter, selectedCategory, selectedPriority, searchQuery]);

  // Aggregate KPI metrics
  const roleSpecificAllItems = useMemo(() => {
    return actionItems.filter(
      (item) => item.assignedRole === currentRole || item.assignedRole === 'all'
    );
  }, [actionItems, currentRole]);

  const pendingItems = roleSpecificAllItems.filter((i) => i.status !== 'completed');
  const completedItems = roleSpecificAllItems.filter((i) => i.status === 'completed');
  const criticalOverdueItems = pendingItems.filter(
    (i) => i.priority === 'p0_critical' && i.slaHoursRemaining <= 12
  );
  const dueTodayItems = pendingItems.filter((i) => i.slaHoursRemaining <= 24);
  const completionRate =
    roleSpecificAllItems.length > 0
      ? Math.round((completedItems.length / roleSpecificAllItems.length) * 100)
      : 100;

  // Handlers
  const handleMarkComplete = (itemId: string, title: string) => {
    const updated = actionItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'completed' as ActionItemStatus,
          completedAt: new Date().toISOString(),
          completedBy: currentUser.name,
        };
      }
      return item;
    });
    onUpdateActionItems(updated);
    showToast(`✓ Resolved & signed off: "${title}"`);
  };

  const handleSnooze = (itemId: string, title: string) => {
    const updated = actionItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'snoozed' as ActionItemStatus,
          slaHoursRemaining: item.slaHoursRemaining + 24,
          dueDate: 'Snoozed (+24h)',
        };
      }
      return item;
    });
    onUpdateActionItems(updated);
    showToast(`Snoozed task for 24 hours: "${title}"`, 'info');
  };

  const handleBatchCompleteSelected = () => {
    if (selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    const updated = actionItems.map((item) => {
      if (selectedItemIds.includes(item.id)) {
        return {
          ...item,
          status: 'completed' as ActionItemStatus,
          completedAt: new Date().toISOString(),
          completedBy: currentUser.name,
        };
      }
      return item;
    });
    onUpdateActionItems(updated);
    setSelectedItemIds([]);
    showToast(`✓ Completed and archived ${count} selected action items.`);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newItem: ActionItem = {
      id: `ACT-CUSTOM-${Date.now().toString().slice(-4)}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || 'Custom compliance follow-up action created manually.',
      category: newTaskCategory,
      priority: newTaskPriority,
      status: 'pending',
      dueDate: newTaskDueDate,
      slaHoursRemaining: newTaskPriority === 'p0_critical' ? 12 : 72,
      assignedRole: currentRole,
      targetTab: newTaskTargetTab,
      metadata: {
        source: `Manual Task (${currentUser.title})`,
        framework: newTaskFramework,
        impact: 'Personal compliance tracking',
        suggestedAction: 'Execute required task and update audit register.',
      },
    };

    onUpdateActionItems([newItem, ...actionItems]);
    setIsCreateModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    showToast(`✓ Created new action item: "${newItem.title}"`);
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportDigest = () => {
    const lines = [
      `SUOMIGRC PERSONAL WORK QUEUE REPORT`,
      `User: ${currentUser.name} (${currentUser.title})`,
      `Role: ${currentRole.toUpperCase()}`,
      `Generated: ${new Date().toUTCString()}`,
      `--------------------------------------------------------------------------------`,
      `Pending Items: ${pendingItems.length} | Completed: ${completedItems.length} (${completionRate}%)`,
      `--------------------------------------------------------------------------------\n`,
    ];

    filteredItems.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. [${item.priority.toUpperCase()}] ${item.title}`
      );
      lines.push(`   Status: ${item.status.toUpperCase()} | Due: ${item.dueDate} (${item.slaHoursRemaining}h SLA)`);
      lines.push(`   Category: ${item.category} | Source: ${item.metadata.source}`);
      if (item.metadata.framework) {
        lines.push(`   Framework: ${item.metadata.framework}`);
      }
      lines.push(`   Description: ${item.description}`);
      lines.push(`\n`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SuomiGRC-Action-Items-${currentUser.name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Exported personal work queue briefing to text digest.');
  };

  return (
    <div className="space-y-6 max-w-[1536px] mx-auto pb-16">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium">{actionToast.message}</span>
          <button
            onClick={() => setActionToast(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner: Personalized Work Queue Context */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Personal Prioritized Work Queue
              </span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-700">{currentUser.name}</span>
              <span className="text-slate-300">/</span>
              <span
                className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                  currentRole === 'ciso'
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : currentRole === 'compliance_analyst'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {currentUser.badgeLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              My Action Items &amp; Assigned Deliverables
            </h1>
            <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
              Unified, prioritized queue of required compliance sign-offs, failing automated tests requiring GitOps code remediation, Provided-By-Client evidence sample uploads, and quarterly access reviews assigned to your role.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Action Item</span>
            </button>

            <button
              onClick={handleExportDigest}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs"
              title="Download text summary of active tasks"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Pending Queue */}
        <div
          onClick={() => setStatusFilter('pending')}
          className={`executive-card p-5 cursor-pointer group transition-all ${
            statusFilter === 'pending' ? 'ring-2 ring-indigo-600/30 border-indigo-300' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Pending In Queue
            </span>
            <Clock className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {pendingItems.length}{' '}
            <span className="text-sm font-normal text-slate-400">/ {roleSpecificAllItems.length} total</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Role Assignments</span>
            <span className="font-mono text-indigo-600 font-semibold">{pendingItems.length} active</span>
          </div>
        </div>

        {/* Tile 2: P0 Critical Overdue Alert */}
        <div className="executive-card p-5 group">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              P0 Critical &amp; Urgent
            </span>
            <Flame className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums flex items-baseline gap-2">
            <span className={criticalOverdueItems.length > 0 ? 'text-rose-600' : 'text-slate-900'}>
              {criticalOverdueItems.length}
            </span>
            <span className="text-xs font-normal text-slate-400">under 12h SLA</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="text-slate-500">Observation Window SLA</span>
            {criticalOverdueItems.length > 0 ? (
              <span className="text-rose-600 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                Action Required
              </span>
            ) : (
              <span className="text-emerald-600 font-mono font-semibold">Zero Overdue</span>
            )}
          </div>
        </div>

        {/* Tile 3: Due Today */}
        <div className="executive-card p-5 group">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Due Today (24h)
            </span>
            <Calendar className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {dueTodayItems.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Next Deadline</span>
            <span className="font-mono text-slate-900 font-medium">In ~4 hours</span>
          </div>
        </div>

        {/* Tile 4: Completion Rate */}
        <div
          onClick={() => setStatusFilter('completed')}
          className={`executive-card p-5 cursor-pointer group transition-all ${
            statusFilter === 'completed' ? 'ring-2 ring-emerald-600/30 border-emerald-300' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Completion Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, and Batch Operations */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, control, framework, or source..."
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

          {/* Status & Priority Segmented Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Pending ({pendingItems.length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Completed ({completedItems.length})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                All ({roleSpecificAllItems.length})
              </button>
            </div>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="p0_critical">P0 - Critical</option>
              <option value="p1_high">P1 - High</option>
              <option value="p2_medium">P2 - Medium</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            All Categories ({filteredItems.length})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const count = roleSpecificAllItems.filter(
              (i) => i.category === key && (statusFilter === 'all' || i.status === statusFilter)
            ).length;
            if (count === 0 && selectedCategory !== key) return null;
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as ActionItemCategory)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  selectedCategory === key
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{config.label}</span>
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Batch Action Bar (Visible when items are selected) */}
        {selectedItemIds.length > 0 && (
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between animate-in fade-in duration-150 text-xs">
            <span className="font-semibold text-indigo-900">
              {selectedItemIds.length} item(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchCompleteSelected}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Selected as Completed</span>
              </button>
              <button
                onClick={() => setSelectedItemIds([])}
                className="px-2 py-1 text-slate-600 hover:text-slate-900"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isCompleted = item.status === 'completed';
            const categoryDef = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.evidence_request;
            const CategoryIcon = categoryDef.icon;
            const isSelected = selectedItemIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`executive-card p-4 sm:p-5 transition-all relative overflow-hidden ${
                  isCompleted ? 'bg-slate-50/70 opacity-75 border-slate-200' : ''
                } ${isSelected ? 'ring-2 ring-indigo-500/40 bg-indigo-50/20' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Checkbox, Metadata, Title, Description */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Select Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />

                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Top Metadata Line */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {/* Priority Badge */}
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.priority === 'p0_critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.priority === 'p1_high'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {item.priority === 'p0_critical'
                            ? 'P0 Critical'
                            : item.priority === 'p1_high'
                            ? 'P1 High'
                            : 'P2 Medium'}
                        </span>

                        {/* Category */}
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <CategoryIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{categoryDef.label}</span>
                        </span>

                        <span className="text-slate-300">·</span>

                        {/* Source */}
                        <span className="font-mono text-[11px] text-slate-500 truncate max-w-[200px]">
                          {item.metadata.source}
                        </span>

                        {item.metadata.framework && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                              {item.metadata.framework}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-sm sm:text-base font-bold text-slate-900 tracking-tight font-display ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                        {item.description}
                      </p>

                      {/* Suggested Action Note */}
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                        <span className="font-bold text-slate-900 shrink-0">Action:</span>
                        <span>{item.metadata.suggestedAction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Due Date SLA & Action Buttons */}
                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-start gap-2.5 shrink-0 self-stretch md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {/* SLA Timer */}
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-900 flex items-center justify-end gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.dueDate}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {isCompleted ? (
                          <span className="text-emerald-600 font-bold">
                            Completed by {item.completedBy || 'User'}
                          </span>
                        ) : (
                          <span>{item.slaHoursRemaining}h remaining SLA</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {!isCompleted && (
                        <>
                          <button
                            onClick={() => onNavigateTab(item.targetTab, item.entityId)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap"
                            title="Navigate directly to action workspace"
                          >
                            <span>Open in Module</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleMarkComplete(item.id, item.title)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg transition-colors"
                            title="Mark as completed / approved"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleSnooze(item.id, item.title)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors"
                            title="Snooze 24 hours"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 font-mono">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              All Caught Up! Zero Pending Items
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You have resolved all prioritized deliverables assigned to your role ({currentUser.title}). All continuous SLA deadlines are met.
            </p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline inline-block mt-1"
            >
              Reset filters and view history →
            </button>
          </div>
        )}
      </div>

      {/* Modal: Create New Action Item */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 font-display">
                  Create Custom Action Item
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Action Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Rotate AWS Root IAM Access Keys before Q4 audit"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description &amp; Context
                </label>
                <textarea
                  rows={2}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Details on what evidence or remediation is expected..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as ActionItemCategory)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="evidence_request">Evidence Request</option>
                    <option value="control_remediation">Control Remediation</option>
                    <option value="access_review">Access Review</option>
                    <option value="waiver_approval">Waiver Approval</option>
                    <option value="policy_attestation">Policy Attestation</option>
                    <option value="vendor_assessment">Vendor Risk &amp; RFP</option>
                    <option value="vulnerability_sla">Vulnerability SLA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as ActionItemPriority)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="p0_critical">P0 - Critical (Urgent)</option>
                    <option value="p1_high">P1 - High</option>
                    <option value="p2_medium">P2 - Medium</option>
                    <option value="p3_low">P3 - Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Framework Scope
                  </label>
                  <input
                    type="text"
                    value={newTaskFramework}
                    onChange={(e) => setNewTaskFramework(e.target.value)}
                    placeholder="e.g. SOC 2 CC6.1, ISO 27001"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Workspace Tab
                  </label>
                  <select
                    value={newTaskTargetTab}
                    onChange={(e) => setNewTaskTargetTab(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="controls">Controls &amp; Tests</option>
                    <option value="auditor">Auditor Workspace</option>
                    <option value="remediation-code">Auto-Remediation</option>
                    <option value="uar">User Access Reviews</option>
                    <option value="exceptions">Risk Exceptions</option>
                    <option value="policies">Policy Center</option>
                    <option value="fleet">Desktop Fleet</option>
                    <option value="vulnerabilities">Vulnerabilities</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  Save Action Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

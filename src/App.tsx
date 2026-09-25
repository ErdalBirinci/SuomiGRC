import React, { useState } from 'react';
import {
  initialFrameworks,
  initialIntegrations,
  initialAutomatedTests,
  initialControls,
  initialRisks,
  initialVendors,
  initialPolicies,
  initialEmployees,
  initialAuditRequests,
  initialWebhooks,
  initialDeliveryLogs,
} from './data/mockGrcData';
import {
  initialUarCampaigns,
  initialUarItems,
  initialQuestionnaires,
  initialQuestionnaireItems,
  initialDevices,
  initialTrainingCourses,
  initialCourseProgress,
  initialComplianceSnapshots,
  initialAuditExceptions,
} from './data/mockEnterpriseData';
import {
  Framework,
  Integration,
  AutomatedTest,
  Control,
  RiskItem,
  Vendor,
  Policy,
  Employee,
  AuditRequest,
  FrameworkId,
  WebhookConfig,
  WebhookDeliveryLog,
  UserAccessReviewCampaign,
  UserAccessItem,
  SecurityQuestionnaire,
  QuestionnaireItem,
  DesktopDevice,
  TrainingCourse,
  EmployeeCourseProgress,
  ComplianceSnapshot,
  AuditException,
} from './types/grc';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { IntegrationsHub } from './components/IntegrationsHub';
import { ControlsMonitoring } from './components/ControlsMonitoring';
import { FrameworkMatrix } from './components/FrameworkMatrix';
import { RiskRegister } from './components/RiskRegister';
import { VendorRisk } from './components/VendorRisk';
import { PolicyCenter } from './components/PolicyCenter';
import { PersonnelCompliance } from './components/PersonnelCompliance';
import { AuditorWorkspace } from './components/AuditorWorkspace';
import { TrustCenterView } from './components/TrustCenterView';
import { RemediationModal } from './components/RemediationModal';
import { NotificationSettings } from './components/NotificationSettings';
import { UserAccessReviews } from './components/UserAccessReviews';
import { QuestionnairesHub } from './components/QuestionnairesHub';
import { DesktopFleetHub } from './components/DesktopFleetHub';
import { SecurityTrainingHub } from './components/SecurityTrainingHub';
import { ComplianceDriftTimeline } from './components/ComplianceDriftTimeline';
import { AuditExceptionsHub } from './components/AuditExceptionsHub';
import { AutoRemediationHub } from './components/AutoRemediationHub';
import { PredictiveAuditEngine } from './components/PredictiveAuditEngine';
import { CrossFrameworkDeltaHub } from './components/CrossFrameworkDeltaHub';
import { ZkProofSandbox } from './components/ZkProofSandbox';
import { CyberInsuranceArbiter } from './components/CyberInsuranceArbiter';
import { ShadowAiSentinel } from './components/ShadowAiSentinel';
import { ApiActivityLogDashboard } from './components/ApiActivityLogDashboard';
import { EvidenceVault } from './components/EvidenceVault';
import { RegulatoryNewsAggregator } from './components/RegulatoryNewsAggregator';
import { AuditorMarketplaceHub } from './components/AuditorMarketplaceHub';
import { VulnerabilityManagementHub } from './components/VulnerabilityManagementHub';
import { IsoSoaGeneratorHub } from './components/IsoSoaGeneratorHub';
import { MyActionItemsHub } from './components/MyActionItemsHub';
import { CloudDiscoveryHub } from './components/CloudDiscoveryHub';
import { OffboardingTrackerHub } from './components/OffboardingTrackerHub';
import { IncidentResponseHub } from './components/IncidentResponseHub';
import { BcdrTabletopHub } from './components/BcdrTabletopHub';
import { EasmPentestHub } from './components/EasmPentestHub';
import { TicketingSyncHub } from './components/TicketingSyncHub';
import { initialOffboardingRecords } from './data/mockOffboardingData';
import { initialSecurityIncidents } from './data/mockIncidentData';
import { initialBcdrAssets, initialTabletopDrills } from './data/mockBcdrData';
import { initialAttackSurfaceAssets, initialPentestEngagements } from './data/mockEasmPentestData';
import { initialRemediationTickets } from './data/mockTicketingSyncData';
import { RegulatoryNewsItem } from './types/regulatoryNews';
import { EvidenceItem } from './types/evidence';
import { ActionItem } from './types/actionItems';
import { DiscoveredResource, CloudAccountConnector } from './types/cloudDiscovery';
import { initialEvidenceItems } from './data/mockEvidenceData';
import { initialAuditorFirms } from './data/mockAuditorMarketplaceData';
import { initialVulnerabilities } from './data/mockVulnerabilityData';
import { initialIsoSoaControls } from './data/mockIsoSoaData';
import { initialActionItems } from './data/mockActionItemsData';
import { initialDiscoveredResources, initialCloudConnectors } from './data/mockCloudDiscoveryData';
import { AuditorFirm, AuditEngagementBooking } from './types/auditorMarketplace';
import { VulnerabilityItem } from './types/vulnerabilities';
import { IsoSoaControlItem } from './types/isoSoa';
import { useRBAC } from './context/RbacContext';
import { useTheme } from './context/ThemeContext';
import { AccessDeniedView } from './components/AccessDeniedView';
import { RoleContextBanner } from './components/RoleContextBanner';
import { RoleMatrixModal } from './components/RoleMatrixModal';
import {
  initialAutoRemediationPatches,
  initialPredictiveAuditReport,
} from './data/mockInnovativeData';
import { dispatchTestWebhook } from './utils/webhookDispatcher';
import {
  Bell,
  X,
  CheckCircle2,
} from 'lucide-react';

interface ToastAlert {
  id: string;
  type: 'failing' | 'resolved';
  title: string;
  channel: string;
  severity: string;
}

export default function App() {
  // Global compliance states
  const [frameworks, setFrameworks] = useState<Framework[]>(initialFrameworks);
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [tests, setTests] = useState<AutomatedTest[]>(initialAutomatedTests);
  const [controls, setControls] = useState<Control[]>(initialControls);
  const [risks, setRisks] = useState<RiskItem[]>(initialRisks);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>(initialAuditRequests);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(initialWebhooks);
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookDeliveryLog[]>(initialDeliveryLogs);

  // Enterprise Vanta-grade states
  const [accessCampaigns, setAccessCampaigns] = useState<UserAccessReviewCampaign[]>(initialUarCampaigns);
  const [uarItems, setUarItems] = useState<UserAccessItem[]>(initialUarItems);
  const [questionnaires, setQuestionnaires] = useState<SecurityQuestionnaire[]>(initialQuestionnaires);
  const [questionnaireItems, setQuestionnaireItems] = useState<QuestionnaireItem[]>(initialQuestionnaireItems);
  const [devices, setDevices] = useState<DesktopDevice[]>(initialDevices);
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>(initialTrainingCourses);
  const [courseProgress, setCourseProgress] = useState<EmployeeCourseProgress[]>(initialCourseProgress);
  const [snapshots, setSnapshots] = useState<ComplianceSnapshot[]>(initialComplianceSnapshots);
  const [exceptions, setExceptions] = useState<AuditException[]>(initialAuditExceptions);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(initialEvidenceItems);
  const [evidenceControlFilter, setEvidenceControlFilter] = useState<string | null>(null);

  // Vanta Parity Hub states (Auditor Marketplace, Vulnerability Management, ISO SoA, Action Items, Cloud Discovery)
  const [auditorFirms, setAuditorFirms] = useState<AuditorFirm[]>(initialAuditorFirms);
  const [auditBookings, setAuditBookings] = useState<AuditEngagementBooking[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityItem[]>(initialVulnerabilities);
  const [soaControls, setSoaControls] = useState<IsoSoaControlItem[]>(initialIsoSoaControls);
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialActionItems);
  const [cloudResources, setCloudResources] = useState<DiscoveredResource[]>(initialDiscoveredResources);
  const [cloudConnectors, setCloudConnectors] = useState<CloudAccountConnector[]>(initialCloudConnectors);

  // Market-Leading Next-Gen Expansion States
  const [offboardingRecords, setOffboardingRecords] = useState(initialOffboardingRecords);
  const [securityIncidents, setSecurityIncidents] = useState(initialSecurityIncidents);
  const [bcdrAssets, setBcdrAssets] = useState(initialBcdrAssets);
  const [tabletopDrills, setTabletopDrills] = useState(initialTabletopDrills);
  const [attackSurfaceAssets, setAttackSurfaceAssets] = useState(initialAttackSurfaceAssets);
  const [pentestEngagements, setPentestEngagements] = useState(initialPentestEngagements);
  const [remediationTickets, setRemediationTickets] = useState(initialRemediationTickets);

  // Synchronize evidence items with control count updates
  const handleUpdateEvidence = (updatedEvidence: EvidenceItem[]) => {
    setEvidenceList(updatedEvidence);
    const countMap: Record<string, number> = {};
    updatedEvidence.forEach((item) => {
      countMap[item.controlId] = (countMap[item.controlId] || 0) + 1;
      item.secondaryControlIds?.forEach((secId) => {
        countMap[secId] = (countMap[secId] || 0) + 1;
      });
    });

    setControls((prev) =>
      prev.map((c) => ({
        ...c,
        evidenceCount: countMap[c.id] !== undefined ? countMap[c.id] : c.evidenceCount,
      }))
    );
  };

  // Revolutionary GRC 3.0 Next-Gen states
  const [patches, setPatches] = useState(initialAutoRemediationPatches);
  const [predictiveReport, setPredictiveReport] = useState(initialPredictiveAuditReport);

  // Real-time toast state
  const [activeToast, setActiveToast] = useState<ToastAlert | null>(null);

  // Active view tab & selected framework filter
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedFramework, setSelectedFramework] = useState<FrameworkId | 'all'>('all');
  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);

  // Search pre-fill and navigation target state
  const [searchPreFill, setSearchPreFill] = useState<{
    tab: 'controls' | 'risks' | 'vendors' | 'policies';
    query: string;
    subTab?: 'tests' | 'controls';
    entityId?: string;
    testItem?: AutomatedTest;
  } | null>(null);

  const handleNavigateToEntity = (
    tab: 'controls' | 'risks' | 'vendors' | 'policies',
    searchQuery: string,
    options?: { subTab?: 'tests' | 'controls'; entityId?: string; testItem?: AutomatedTest }
  ) => {
    setSearchPreFill({
      tab,
      query: searchQuery,
      subTab: options?.subTab,
      entityId: options?.entityId,
      testItem: options?.testItem,
    });
    setActiveTab(tab);

    if (options?.testItem) {
      setActiveRemediationTest(options.testItem);
    }
  };

  // Active remediation modal (drill down from any view)
  const [activeRemediationTest, setActiveRemediationTest] = useState<AutomatedTest | null>(null);

  // Trigger real-time test failure webhook
  const handleTriggerTestFailureNotification = (testToFail: AutomatedTest, specificWebhookId?: string) => {
    const targetWebhooks = specificWebhookId
      ? webhooks.filter((w) => w.id === specificWebhookId)
      : webhooks;

    const { logs, updatedWebhooks, notifiedChannels } = dispatchTestWebhook(testToFail, false, targetWebhooks);

    if (logs.length > 0) {
      setDeliveryLogs((prev) => [...logs, ...prev]);
      setWebhooks(updatedWebhooks);

      const targetDesc = notifiedChannels.slice(0, 2).join(' & ');
      setActiveToast({
        id: `toast-${Date.now()}`,
        type: 'failing',
        title: testToFail.title,
        channel: targetDesc || 'Slack & MS Teams',
        severity: testToFail.severity,
      });

      // Auto dismiss after 5s
      setTimeout(() => {
        setActiveToast((current) => (current?.title === testToFail.title ? null : current));
      }, 5000);
    }
  };

  // Handle single test passing & update corresponding controls, frameworks, and webhooks
  const handlePassTest = (testId: string) => {
    const testToPass = tests.find((t) => t.id === testId);

    const updatedTests = tests.map((t) =>
      t.id === testId
        ? {
            ...t,
            status: 'passing' as const,
            failingResources: [],
            lastRunAt: 'Just now',
          }
        : t
    );
    setTests(updatedTests);

    // If test was previously failing, trigger resolution webhook
    if (testToPass && testToPass.status === 'failing') {
      const { logs, updatedWebhooks, notifiedChannels } = dispatchTestWebhook(testToPass, true, webhooks);
      if (logs.length > 0) {
        setDeliveryLogs((prev) => [...logs, ...prev]);
        setWebhooks(updatedWebhooks);

        setActiveToast({
          id: `toast-res-${Date.now()}`,
          type: 'resolved',
          title: `Resolved: ${testToPass.title}`,
          channel: notifiedChannels.slice(0, 2).join(' & ') || 'Slack & MS Teams',
          severity: 'low',
        });

        setTimeout(() => {
          setActiveToast(null);
        }, 5000);
      }
    }

    // Update controls
    const updatedControls = controls.map((c) => {
      if (c.automatedTestIds.includes(testId)) {
        const testsForControl = updatedTests.filter((t) => c.automatedTestIds.includes(t.id));
        const allPass = testsForControl.every((t) => t.status === 'passing');
        return {
          ...c,
          status: allPass ? ('automated_passing' as const) : ('automated_failing' as const),
          lastAudited: 'Just now',
        };
      }
      return c;
    });
    setControls(updatedControls);

    // Update framework readiness scores
    setFrameworks((prev) =>
      prev.map((fw) => ({
        ...fw,
        readinessPercentage: Math.min(100, fw.readinessPercentage + 2),
      }))
    );
  };

  const handleAddRiskFromRegulatoryAlert = (alert: RegulatoryNewsItem) => {
    const newRisk: RiskItem = {
      id: `risk-reg-${Date.now()}`,
      title: `Regulatory Threat: ${alert.title}`,
      category: alert.category.includes('Privacy')
        ? 'Data Privacy'
        : alert.category.includes('Resilience') || alert.category.includes('Third-Party')
        ? 'Third-Party & Vendor'
        : alert.category.includes('Identity')
        ? 'Access & Identity'
        : 'Infrastructure & Cloud',
      inherentLikelihood: alert.severity === 'critical' ? 5 : alert.severity === 'high' ? 4 : 3,
      inherentImpact: alert.severity === 'critical' ? 5 : alert.severity === 'high' ? 4 : 3,
      residualLikelihood: alert.severity === 'critical' ? 3 : 2,
      residualImpact: alert.severity === 'critical' ? 3 : 2,
      treatment: 'Mitigate',
      treatmentDetails: alert.recommendedAction,
      owner: 'SecOps & Compliance Lead',
      mitigatingControlIds: alert.affectedControlCodes,
      lastReviewedDate: 'Today',
      status: 'Open',
    };
    setRisks((prev) => [newRisk, ...prev]);
  };

  const failingTestsCount = tests.filter((t) => t.status === 'failing').length;
  const activeWebhooksCount = webhooks.filter((w) => w.enabled).length;
  const activeExceptionsCount = exceptions.filter((e) => e.status === 'active').length;
  const nonCompliantDevicesCount = devices.filter((d) => d.status === 'non_compliant').length;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // RBAC permissions engine & Theme context
  const { canAccessTab, currentRole, currentUser } = useRBAC();
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-slate-50 text-slate-900 selection:bg-cyan-200 selection:text-slate-900'
          : 'bg-[#070B14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200'
      }`}
    >
      {/* Top Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedFramework={selectedFramework}
        onSelectFramework={setSelectedFramework}
        failingTestsCount={failingTestsCount}
        activeWebhooksCount={activeWebhooksCount}
        controls={controls}
        risks={risks}
        vendors={vendors}
        policies={policies}
        tests={tests}
        onNavigateToEntity={handleNavigateToEntity}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Workspace with Corporate Sidebar */}
      <div className="flex-1 max-w-[1536px] w-full mx-auto px-3 sm:px-6 py-5 flex gap-5">
        {/* Left Desktop Sidebar Navigation */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            failingTestsCount={failingTestsCount}
            nonCompliantDevicesCount={nonCompliantDevicesCount}
            activeExceptionsCount={activeExceptionsCount}
            activeWebhooksCount={activeWebhooksCount}
            pendingActionItemsCount={actionItems.filter((i) => (i.assignedRole === currentRole || i.assignedRole === 'all') && i.status !== 'completed').length}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        </div>

        {/* Main Viewport Content Area */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Active Persona Banner with Quick Switcher & Matrix Modal */}
          <RoleContextBanner
            onOpenMatrix={() => setIsRoleMatrixOpen(true)}
            onNavigateTab={setActiveTab}
          />

          {/* RBAC Access Guard */}
          {!canAccessTab(activeTab) ? (
            <AccessDeniedView
              attemptedTab={activeTab}
              onSwitchTab={setActiveTab}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
            <DashboardOverview
              frameworks={frameworks}
              integrations={integrations}
              tests={tests}
              controls={controls}
              risks={risks}
              vendors={vendors}
              onNavigateTab={setActiveTab}
              onSelectTest={(test) => setActiveRemediationTest(test)}
              selectedFramework={selectedFramework}
              onSelectFramework={(fwId) => {
                setSelectedFramework(fwId);
                setActiveTab('controls');
              }}
            />
          )}

          {activeTab === 'action-items' && (
            <MyActionItemsHub
              actionItems={actionItems}
              onUpdateActionItems={setActionItems}
              onNavigateTab={(tabId, entityId) => {
                if (entityId && tabId === 'controls') {
                  handleNavigateToEntity('controls', entityId, { subTab: 'controls', entityId });
                } else if (entityId && tabId === 'risks') {
                  handleNavigateToEntity('risks', entityId, { entityId });
                } else if (entityId && tabId === 'policies') {
                  handleNavigateToEntity('policies', entityId, { entityId });
                } else {
                  setActiveTab(tabId);
                }
              }}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsHub
              integrations={integrations}
              onUpdateIntegrations={setIntegrations}
              selectedFramework={selectedFramework}
            />
          )}

          {activeTab === 'cloud-discovery' && (
            <CloudDiscoveryHub
              resources={cloudResources}
              connectors={cloudConnectors}
              onUpdateResources={setCloudResources}
              onUpdateConnectors={setCloudConnectors}
              onNavigateToControls={(ctrlCode) => {
                handleNavigateToEntity('controls', ctrlCode || '', { subTab: 'controls', entityId: ctrlCode });
              }}
            />
          )}

          {activeTab === 'controls' && (
            <ControlsMonitoring
              tests={tests}
              controls={controls}
              onUpdateTests={setTests}
              onUpdateControls={setControls}
              selectedFramework={selectedFramework}
              onNavigateTab={setActiveTab}
              onNavigateToEvidenceVault={(ctrlId) => {
                setEvidenceControlFilter(ctrlId);
                setActiveTab('evidence-vault');
              }}
              onTriggerWebhookAlert={handleTriggerTestFailureNotification}
              initialSubTab={searchPreFill?.tab === 'controls' ? searchPreFill.subTab : undefined}
              initialSearchQuery={searchPreFill?.tab === 'controls' ? searchPreFill.query : undefined}
              initialSelectedTest={searchPreFill?.tab === 'controls' ? searchPreFill.testItem : undefined}
            />
          )}

          {activeTab === 'vulnerabilities' && (
            <VulnerabilityManagementHub
              vulnerabilities={vulnerabilities}
              onUpdateVulnerabilities={setVulnerabilities}
              onNavigateToControls={(ctrlCode) => {
                handleNavigateToEntity('controls', ctrlCode, { subTab: 'controls', entityId: ctrlCode });
              }}
              onTriggerRemediation={(cveId) => {
                setActiveTab('remediation-code');
              }}
            />
          )}

          {activeTab === 'frameworks' && (
            <FrameworkMatrix
              frameworks={frameworks}
              controls={controls}
              onSelectFramework={(fwId) => {
                setSelectedFramework(fwId);
                setActiveTab('controls');
              }}
            />
          )}

          {activeTab === 'uar' && (
            <UserAccessReviews
              campaigns={accessCampaigns}
              items={uarItems}
              onUpdateItems={setUarItems}
              onUpdateCampaigns={setAccessCampaigns}
            />
          )}

          {activeTab === 'questionnaires' && (
            <QuestionnairesHub
              questionnaires={questionnaires}
              items={questionnaireItems}
              policies={policies}
              controls={controls}
              onUpdateItems={setQuestionnaireItems}
              onUpdateQuestionnaires={setQuestionnaires}
            />
          )}

          {activeTab === 'fleet' && (
            <DesktopFleetHub
              devices={devices}
              onUpdateDevices={setDevices}
            />
          )}

          {activeTab === 'training' && (
            <SecurityTrainingHub
              courses={trainingCourses}
              progressList={courseProgress}
              employees={employees}
              onUpdateProgress={setCourseProgress}
            />
          )}

          {activeTab === 'regulatory-news' && (
            <RegulatoryNewsAggregator
              onNavigateTab={setActiveTab}
              onNavigateToEntity={handleNavigateToEntity}
              onAddRiskFromAlert={handleAddRiskFromRegulatoryAlert}
            />
          )}

          {activeTab === 'drift' && (
            <ComplianceDriftTimeline
              snapshots={snapshots}
            />
          )}

          {activeTab === 'exceptions' && (
            <AuditExceptionsHub
              exceptions={exceptions}
              tests={tests}
              onUpdateExceptions={setExceptions}
            />
          )}

          {activeTab === 'risks' && (
            <RiskRegister
              risks={risks}
              onUpdateRisks={setRisks}
              initialSearchQuery={searchPreFill?.tab === 'risks' ? searchPreFill.query : undefined}
              initialSelectedRiskId={searchPreFill?.tab === 'risks' ? searchPreFill.entityId : undefined}
              onNavigateToControl={(ctrlCode) => {
                handleNavigateToEntity('controls', ctrlCode, { subTab: 'controls', entityId: ctrlCode });
              }}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorRisk
              vendors={vendors}
              onUpdateVendors={setVendors}
              initialSearchQuery={searchPreFill?.tab === 'vendors' ? searchPreFill.query : undefined}
              initialSelectedVendorId={searchPreFill?.tab === 'vendors' ? searchPreFill.entityId : undefined}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'policies' && (
            <PolicyCenter
              policies={policies}
              onUpdatePolicies={setPolicies}
              selectedFramework={selectedFramework}
              initialSearchQuery={searchPreFill?.tab === 'policies' ? searchPreFill.query : undefined}
              initialSelectedPolicyId={searchPreFill?.tab === 'policies' ? searchPreFill.entityId : undefined}
            />
          )}

          {activeTab === 'iso-soa' && (
            <IsoSoaGeneratorHub
              soaControls={soaControls}
              onUpdateControls={setSoaControls}
              onNavigateToEvidenceVault={(ctrlId) => {
                setEvidenceControlFilter(ctrlId);
                setActiveTab('evidence-vault');
              }}
              onNavigateToControls={(ctrlId) => {
                handleNavigateToEntity('controls', ctrlId, { subTab: 'controls', entityId: ctrlId });
              }}
            />
          )}

          {activeTab === 'personnel' && (
            <PersonnelCompliance
              employees={employees}
              onUpdateEmployees={setEmployees}
            />
          )}

          {activeTab === 'auditor' && (
            <AuditorWorkspace
              auditRequests={auditRequests}
              onUpdateAuditRequests={setAuditRequests}
              selectedFramework={selectedFramework}
              snapshots={snapshots}
              exceptions={exceptions}
              tests={tests}
              onUpdateExceptions={setExceptions}
            />
          )}

          {activeTab === 'auditor-marketplace' && (
            <AuditorMarketplaceHub
              firms={auditorFirms}
              bookings={auditBookings}
              onAddBooking={(newBooking) => setAuditBookings((prev) => [newBooking, ...prev])}
              onNavigateToAuditorWorkspace={() => setActiveTab('auditor')}
            />
          )}

          {activeTab === 'evidence-vault' && (
            <EvidenceVault
              evidenceList={evidenceList}
              onUpdateEvidence={handleUpdateEvidence}
              controls={controls}
              selectedFramework={selectedFramework}
              initialControlFilter={evidenceControlFilter}
              onClearInitialControlFilter={() => setEvidenceControlFilter(null)}
              onNavigateToControl={(ctrlId) => {
                handleNavigateToEntity('controls', ctrlId, { subTab: 'controls', entityId: ctrlId });
              }}
            />
          )}

          {activeTab === 'trust-center' && (
            <TrustCenterView frameworks={frameworks} vendors={vendors} />
          )}

          {activeTab === 'webhooks' && (
            <NotificationSettings
              webhooks={webhooks}
              deliveryLogs={deliveryLogs}
              tests={tests}
              onUpdateWebhooks={setWebhooks}
              onUpdateDeliveryLogs={setDeliveryLogs}
              onTriggerTestFailureNotification={handleTriggerTestFailureNotification}
            />
          )}

          {activeTab === 'remediation-code' && (
            <AutoRemediationHub
              patches={patches}
              onPassTest={handlePassTest}
            />
          )}

          {activeTab === 'predictive-audit' && (
            <PredictiveAuditEngine
              report={predictiveReport}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'framework-delta' && (
            <CrossFrameworkDeltaHub />
          )}

          {activeTab === 'zk-sandbox' && (
            <ZkProofSandbox />
          )}

          {activeTab === 'cyber-insurance' && (
            <CyberInsuranceArbiter />
          )}

          {activeTab === 'shadow-ai' && (
            <ShadowAiSentinel />
          )}

          {activeTab === 'activity-log' && (
            <ApiActivityLogDashboard onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'offboarding' && (
            <OffboardingTrackerHub
              records={offboardingRecords}
              onUpdateRecords={setOffboardingRecords}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'incident-response' && (
            <IncidentResponseHub
              incidents={securityIncidents}
              onUpdateIncidents={setSecurityIncidents}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'bcdr' && (
            <BcdrTabletopHub
              assets={bcdrAssets}
              drills={tabletopDrills}
              onUpdateAssets={setBcdrAssets}
              onUpdateDrills={setTabletopDrills}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'easm-pentest' && (
            <EasmPentestHub
              assets={attackSurfaceAssets}
              engagements={pentestEngagements}
              onUpdateAssets={setAttackSurfaceAssets}
              onUpdateEngagements={setPentestEngagements}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'ticketing-sync' && (
            <TicketingSyncHub
              tickets={remediationTickets}
              failingTests={tests.filter((t) => t.status === 'failing')}
              onUpdateTickets={setRemediationTickets}
              onNavigateTab={setActiveTab}
            />
          )}
            </>
          )}
        </main>
      </div>

      {/* Real-time Webhook Dispatched Toast Banner */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                activeToast.type === 'failing'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {activeToast.type === 'failing' ? (
                <Bell className="w-5 h-5 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded font-mono ${
                    activeToast.type === 'failing'
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                      : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                  }`}
                >
                  {activeToast.type === 'failing' ? 'Test Failure Webhook' : 'Resolved Webhook'}
                </span>
                <span className="text-[11px] text-slate-400">Just now</span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 mt-1 truncate">
                {activeToast.title}
              </h4>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Delivered HTTP POST (200 OK) to{' '}
                <strong className="text-slate-200 font-semibold">{activeToast.channel}</strong>
              </p>

              <div className="flex items-center gap-3 mt-2.5">
                <button
                  onClick={() => {
                    setActiveTab('webhooks');
                    setActiveToast(null);
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                >
                  <span>Inspect Webhook Log</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Global Drill-Down Remediation Modal */}
      {activeRemediationTest && (
        <RemediationModal
          test={activeRemediationTest}
          onClose={() => setActiveRemediationTest(null)}
          onRunTest={handlePassTest}
        />
      )}

      {/* Role-Based Access Control (RBAC) Permissions Matrix Modal */}
      <RoleMatrixModal
        isOpen={isRoleMatrixOpen}
        onClose={() => setIsRoleMatrixOpen(false)}
      />
    </div>
  );
}

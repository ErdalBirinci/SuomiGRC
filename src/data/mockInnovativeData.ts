import {
  AutoRemediationPatch,
  PredictiveAuditReport,
  FrameworkDeltaComparison,
  ZkVerificationProbe,
  CyberInsuranceCarrierScore,
  ShadowAiTool,
  ShadowAiDlpEvent,
} from '../types/grc';

// =========================================================================
// 1. Auto-Remediation as Code (GitOps & Terraform PR Engine)
// =========================================================================
export const initialAutoRemediationPatches: AutoRemediationPatch[] = [
  {
    id: 'patch-001',
    testId: 'test-aws-s3-encryption',
    testTitle: 'S3 Buckets Server-Side Encryption (KMS AES-256)',
    targetProvider: 'aws',
    resourceType: 'aws_s3_bucket_server_side_encryption_configuration',
    resourceId: 'arn:aws:s3:::prod-customer-telemetry-raw',
    format: 'terraform',
    filePath: 'infra/terraform/modules/storage/s3_buckets.tf',
    gitBranch: 'grc/auto-fix-s3-kms-encryption',
    prTitle: 'fix(security): enforce AWS KMS SSE and bucket key for prod telemetry S3 bucket',
    prDescription: `### Automated GRC Remediation
Remediates failing control **CC6.1 / ISO A.10.1.1** detected on \`prod-customer-telemetry-raw\`.

- Applies \`aws:kms\` SSE algorithm with customer managed key alias \`alias/nordicscale-s3-prod-key\`
- Enables \`bucket_key_enabled = true\` to reduce KMS request fees by 99%
- Enforces SSL transport policy with condition \`aws:SecureTransport = true\`
- **Pre-execution dry run passed 0 errors.** Verified with \`terraform validate\` and \`trivy fs\`.`,
    codeDiff: {
      original: `resource "aws_s3_bucket" "telemetry" {
  bucket = "prod-customer-telemetry-raw"
  tags = {
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}`,
      patch: `resource "aws_s3_bucket" "telemetry" {
  bucket = "prod-customer-telemetry-raw"
  tags = {
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "telemetry_sse" {
  bucket = aws_s3_bucket.telemetry.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = "alias/nordicscale-s3-prod-key"
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}`,
    },
    cliCommand: `aws s3api put-bucket-encryption \\
  --bucket prod-customer-telemetry-raw \\
  --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms", "KMSMasterKeyId": "alias/nordicscale-s3-prod-key"}, "BucketKeyEnabled": true}]}'`,
    rollbackCommand: `aws s3api delete-bucket-encryption --bucket prod-customer-telemetry-raw`,
    safetyScore: 98,
    status: 'pr_opened',
    prUrl: 'https://github.com/nordicscale/infra-cloud/pull/482',
    prNumber: 482,
    lastSimulatedAt: '12 minutes ago',
    simulationOutput: [
      '[sandbox-ci] Initializing Terraform backend in AWS eu-central-1...',
      '[sandbox-ci] Module "storage" validated: Syntax OK.',
      '[sandbox-ci] Plan: 1 to add, 0 to change, 0 to destroy.',
      '[sandbox-ci] + aws_s3_bucket_server_side_encryption_configuration.telemetry_sse',
      '[sandbox-ci] Trivy vulnerability scan: 0 critical, 0 high.',
      '[sandbox-ci] Safety analysis: Zero downtime, non-destructive mutation.',
    ],
  },
  {
    id: 'patch-002',
    testId: 'test-iam-root-mfa',
    testTitle: 'Enforce IAM Hardware MFA & Session Limit',
    targetProvider: 'aws',
    resourceType: 'aws_iam_account_password_policy',
    resourceId: 'aws_iam_policy.enforce_mfa',
    format: 'terraform',
    filePath: 'infra/terraform/iam/policies.tf',
    gitBranch: 'grc/auto-fix-iam-mfa-condition',
    prTitle: 'security: enforce aws:MultiFactorAuthPresent condition on all mutating APIs',
    prDescription: `### Automated GRC Remediation
Remediates failing control **CC6.3 / HIPAA 164.312(a)(2)(iv)** for IAM accounts.

- Injects \`aws:MultiFactorAuthPresent: true\` deny-clause across production IAM roles
- Disallows console API access without hardware or virtual MFA challenge
- Excludes automated CI/CD machine service accounts with short-lived STS tokens`,
    codeDiff: {
      original: `statement {
  sid       = "AllowMutatingInfrastructure"
  effect    = "Allow"
  actions   = ["ec2:*", "rds:*", "s3:*"]
  resources = ["*"]
}`,
      patch: `statement {
  sid       = "AllowMutatingInfrastructure"
  effect    = "Allow"
  actions   = ["ec2:*", "rds:*", "s3:*"]
  resources = ["*"]
  condition {
    test     = "Bool"
    variable = "aws:MultiFactorAuthPresent"
    values   = ["true"]
  }
}`,
    },
    cliCommand: `aws iam update-account-password-policy --minimum-password-length 14 --require-symbols --require-numbers --require-uppercase-characters --require-lowercase-characters --allow-users-to-change-password --max-password-age 90`,
    rollbackCommand: `aws iam delete-account-password-policy`,
    safetyScore: 94,
    status: 'draft',
    lastSimulatedAt: '45 minutes ago',
    simulationOutput: [
      '[sandbox-ci] Evaluating IAM JSON policy schema...',
      '[sandbox-ci] Policy syntax validation passed.',
      '[sandbox-ci] Checking break-glass role exclusions: "Role/InfraDeployer" safely bypassed.',
      '[sandbox-ci] Dry-run evaluation: 0 unauthorized lockouts predicted.',
    ],
  },
  {
    id: 'patch-003',
    testId: 'test-github-branch-protect',
    testTitle: 'GitHub Main Branch Protection with Mandatory Reviews',
    targetProvider: 'github',
    resourceType: 'github_branch_protection',
    resourceId: 'nordicscale/core-banking-api:main',
    format: 'github_actions',
    filePath: '.github/workflows/branch-protection-rules.yml',
    gitBranch: 'grc/auto-fix-branch-rules',
    prTitle: 'ci(governance): enforce 2 peer approvals and status checks before merge to main',
    prDescription: `### Automated GRC Remediation
Remediates failing control **CC8.1 / ISO A.12.1.2** for source code governance.

- Sets \`required_approving_review_count = 2\`
- Enables \`dismiss_stale_reviews = true\`
- Blocks force pushes (\`allow_force_pushes = false\`)
- Requires linear commit history`,
    codeDiff: {
      original: `resource "github_branch_protection" "main" {
  repository_id = github_repository.core_api.name
  pattern       = "main"
  enforce_admins = false
}`,
      patch: `resource "github_branch_protection" "main" {
  repository_id = github_repository.core_api.name
  pattern       = "main"
  enforce_admins = true

  required_status_checks {
    strict   = true
    contexts = ["ci/test", "security/sonarqube", "security/trivy"]
  }

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
    required_approving_review_count = 2
  }
}`,
    },
    cliCommand: `gh api -X PUT /repos/nordicscale/core-banking-api/branches/main/protection \\
  -F required_status_checks[strict]=true \\
  -F required_pull_request_reviews[required_approving_review_count]=2 \\
  -F enforce_admins=true`,
    rollbackCommand: `gh api -X DELETE /repos/nordicscale/core-banking-api/branches/main/protection`,
    safetyScore: 99,
    status: 'applied',
    prUrl: 'https://github.com/nordicscale/core-banking-api/pull/190',
    prNumber: 190,
    lastSimulatedAt: '2 hours ago',
    simulationOutput: [
      '[sandbox-ci] Checking GitHub API token scopes...',
      '[sandbox-ci] Rule payload verified against GitHub REST API v3 schema.',
      '[sandbox-ci] Applied protection rule to 1 repository branch.',
      '[sandbox-ci] Verification test run: PASSED. Control CC8.1 now compliant.',
    ],
  },
  {
    id: 'patch-004',
    testId: 'test-k8s-pod-security',
    testTitle: 'Kubernetes Pod Security Admission - Restricted Profile',
    targetProvider: 'kubernetes',
    resourceType: 'k8s_namespace_labels',
    resourceId: 'namespaces/production-workloads',
    format: 'kubernetes',
    filePath: 'k8s/base/production-namespace.yaml',
    gitBranch: 'grc/k8s-pod-security-standard',
    prTitle: 'k8s(security): enforce baseline/restricted pod security standard in prod namespace',
    prDescription: `### Automated GRC Remediation
Remediates failing control **CC6.6 / CIS Benchmark 5.2.1**.

- Prevents containers from running as root (\`runAsNonRoot: true\`)
- Drops all default Linux capabilities except \`NET_BIND_SERVICE\`
- Enforces read-only root filesystems across production pods`,
    codeDiff: {
      original: `apiVersion: v1
kind: Namespace
metadata:
  name: production-workloads
  labels:
    env: production`,
      patch: `apiVersion: v1
kind: Namespace
metadata:
  name: production-workloads
  labels:
    env: production
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/audit: restricted`,
    },
    cliCommand: `kubectl label --overwrite namespace production-workloads pod-security.kubernetes.io/enforce=restricted pod-security.kubernetes.io/warn=restricted`,
    rollbackCommand: `kubectl label namespace production-workloads pod-security.kubernetes.io/enforce-`,
    safetyScore: 88,
    status: 'draft',
    lastSimulatedAt: '3 hours ago',
    simulationOutput: [
      '[sandbox-ci] Validating K8s admission webhook logs...',
      '[sandbox-ci] Pods currently running in namespace: 18.',
      '[sandbox-ci] 1 pod found with privileged: true (monitoring daemon). Requires waiver.',
      '[sandbox-ci] Caution: Review daemonset securityContext before auto-merging.',
    ],
  },
];

// =========================================================================
// 2. Predictive Audit Simulator & Monte Carlo Bayesian Engine
// =========================================================================
export const initialPredictiveAuditReport: PredictiveAuditReport = {
  overallCleanProbability: 84.6,
  qualifiedRiskProbability: 13.8,
  adverseRiskProbability: 1.6,
  targetAuditorFirm: 'Big 4 (PwC/EY/Deloitte/KPMG)',
  auditWindow: 'Q4 2026 SOC 2 Type II',
  sampleSizeRange: [25, 45],
  highestRiskControls: [
    {
      controlId: 'ctrl-iam-mfa',
      controlCode: 'CC6.1',
      title: 'Privileged Access Multi-Factor Authentication',
      failureProbability: 18.4,
      impactOnPassRate: 6.8,
      recommendedAction: 'Merge open Terraform PR #482 to inject MFA condition into mutating IAM roles.',
      department: 'Cloud Infrastructure',
      effortHours: 3,
    },
    {
      controlId: 'ctrl-vendor-soc2',
      controlCode: 'CC9.2',
      title: 'Third-Party Vendor SOC 2 / ISO Recertification Review',
      failureProbability: 24.2,
      impactOnPassRate: 5.4,
      recommendedAction: 'Collect renewal SOC 2 reports from Snowflake and Stripe prior to Nov 15.',
      department: 'Legal & Procurement',
      effortHours: 8,
    },
    {
      controlId: 'ctrl-code-review',
      controlCode: 'CC8.1',
      title: 'Segregation of Duties & Two-Person Pull Request Approvals',
      failureProbability: 12.0,
      impactOnPassRate: 4.1,
      recommendedAction: 'Apply branch protection rule on core-banking-api repo to eliminate single-author bypasses.',
      department: 'Engineering',
      effortHours: 2,
    },
    {
      controlId: 'ctrl-uar-quarterly',
      controlCode: 'CC6.3',
      title: 'Quarterly User Access Review Attestation Completeness',
      failureProbability: 15.6,
      impactOnPassRate: 3.9,
      recommendedAction: 'Obtain VP Engineering sign-off on 4 remaining flagged access items in UAR Campaign Q3.',
      department: 'Security Operations',
      effortHours: 4,
    },
  ],
  monteCarloTrials: Array.from({ length: 40 }).map((_, i) => {
    // Generate realistic distribution of 40 visual simulation points
    const rand = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const normalized = rand - Math.floor(rand);
    const score = Math.round(72 + normalized * 26);
    const opinion = score >= 88 ? 'clean' : score >= 75 ? 'clean' : score >= 65 ? 'qualified_exception' : 'adverse';
    const exceptionsCount = opinion === 'clean' ? 0 : opinion === 'qualified_exception' ? 1 : 3;
    const auditorSampleSize = 25 + Math.floor(normalized * 20);

    return {
      trialIndex: i + 1,
      opinion,
      exceptionsCount,
      auditorSampleSize,
      simulatedScore: score,
    };
  }),
};

// =========================================================================
// 3. Cross-Framework Delta & Harmonization ROI Engine
// =========================================================================
export const mockFrameworkDeltas: Record<string, FrameworkDeltaComparison> = {
  'soc2-to-iso27001': {
    sourceFrameworkId: 'soc2',
    sourceFrameworkName: 'AICPA SOC 2 Type II',
    targetFrameworkId: 'iso27001',
    targetFrameworkName: 'ISO/IEC 27001:2022',
    overlapPercentage: 78.5,
    totalTargetControls: 93,
    inheritedControlsCount: 73,
    partialControlsCount: 14,
    gapControlsCount: 6,
    estimatedEngineeringHoursSaved: 380,
    estimatedDollarSavings: 57000,
    timeToAuditWeeksCompressed: 14,
    controlMappings: [
      {
        id: 'map-01',
        targetControlId: 'A.5.1',
        targetControlTitle: 'Policies for Information Security',
        targetDomain: 'Organizational controls',
        matchStatus: 'identical',
        inheritedSourceControlId: 'CC1.1',
        inheritedEvidenceTitle: 'Information Security Policy v2.4 (Annual Executive Sign-off)',
      },
      {
        id: 'map-02',
        targetControlId: 'A.5.23',
        targetControlTitle: 'Information Security for Use of Cloud Services',
        targetDomain: 'Organizational controls',
        matchStatus: 'identical',
        inheritedSourceControlId: 'CC6.6',
        inheritedEvidenceTitle: 'AWS & GCP CIS Benchmark Automated Continuous Telemetry',
      },
      {
        id: 'map-03',
        targetControlId: 'A.8.9',
        targetControlTitle: 'Configuration Management (Infrastructure as Code)',
        targetDomain: 'Technological controls',
        matchStatus: 'partial_gap',
        inheritedSourceControlId: 'CC8.1',
        inheritedEvidenceTitle: 'Terraform State Drift Checks in CI/CD',
        additionalRequirement: 'Needs formal baseline configuration documentation signed by SecOps.',
        recommendedQuickFix: 'Export Terraform baseline manifest and link to Policy Center in 1 click.',
      },
      {
        id: 'map-04',
        targetControlId: 'A.5.7',
        targetControlTitle: 'Threat Intelligence Ingestion and Actioning',
        targetDomain: 'Organizational controls',
        matchStatus: 'complete_gap',
        additionalRequirement: 'ISO 27001:2022 requires structured intake of external threat feeds (e.g. CISA KEV, AlienVault OTX).',
        recommendedQuickFix: 'Enable AlienVault OTX or CISA RSS integration in Integrations Hub.',
      },
      {
        id: 'map-05',
        targetControlId: 'A.8.28',
        targetControlTitle: 'Secure Coding Principles (SAST & DAST)',
        targetDomain: 'Technological controls',
        matchStatus: 'identical',
        inheritedSourceControlId: 'CC8.1',
        inheritedEvidenceTitle: 'GitHub Advanced Security & Trivy Pipeline Logs',
      },
    ],
  },
  'soc2-to-nis2': {
    sourceFrameworkId: 'soc2',
    sourceFrameworkName: 'AICPA SOC 2 Type II',
    targetFrameworkId: 'nis2',
    targetFrameworkName: 'EU NIS2 Directive (Cybersecurity Act)',
    overlapPercentage: 64.0,
    totalTargetControls: 45,
    inheritedControlsCount: 29,
    partialControlsCount: 11,
    gapControlsCount: 5,
    estimatedEngineeringHoursSaved: 290,
    estimatedDollarSavings: 43500,
    timeToAuditWeeksCompressed: 10,
    controlMappings: [
      {
        id: 'nis-01',
        targetControlId: 'NIS2-Art21.2a',
        targetControlTitle: 'Incident Handling & Early Warning Notification (24-hour SLA)',
        targetDomain: 'Incident Management',
        matchStatus: 'partial_gap',
        inheritedSourceControlId: 'CC7.3',
        inheritedEvidenceTitle: 'PagerDuty Major Incident Response Playbook',
        additionalRequirement: 'NIS2 mandates CSIRT/ENISA notification within 24 hours of suspected early warning.',
        recommendedQuickFix: 'Configure ENISA Incident Dispatcher Webhook in Notification Settings.',
      },
      {
        id: 'nis-02',
        targetControlId: 'NIS2-Art21.2b',
        targetControlTitle: 'Supply Chain Security of Direct Suppliers',
        targetDomain: 'Supply Chain',
        matchStatus: 'identical',
        inheritedSourceControlId: 'CC9.2',
        inheritedEvidenceTitle: 'TPRM Tier-1 Vendor Risk Register and DPA Audits',
      },
      {
        id: 'nis-03',
        targetControlId: 'NIS2-Art21.2c',
        targetControlTitle: 'Cyber Hygiene Practices and Basic Cybersecurity Training',
        targetDomain: 'Personnel',
        matchStatus: 'identical',
        inheritedSourceControlId: 'CC2.2',
        inheritedEvidenceTitle: 'KnowBe4 Security Training LMS 87% Completion Records',
      },
    ],
  },
};

// =========================================================================
// 4. Zero-Knowledge Live Trust Center Verification Sandbox
// =========================================================================
export const initialZkVerificationProbes: ZkVerificationProbe[] = [
  {
    id: 'zk-probe-01',
    title: 'Zero-Knowledge Multi-Tenant Cryptographic Isolation',
    category: 'data_isolation',
    description: 'Mathematically proves no customer database row or S3 object shares plaintext master keys with other tenants, without exposing key material or database schemas.',
    zkCircuitType: 'Groth16 ZK-SNARK on AWS KMS Envelope Pre-image',
    publicInputs: {
      tenantEntropyCommitment: '0x94f83b09d8e7...a19c',
      kmsMasterKeyRingHash: '0x33b1e2...f9a0',
      isolationProofEpoch: '2026-09-24T06:00:00Z',
    },
    verificationKeyFingerprint: 'ed25519:6a:88:f0:19:bb:77:30:2a:45:11:80:e9:2f:ac:56:0d',
    status: 'verified_clean',
    proofLatencyMs: 142,
    lastVerifiedAt: '8 minutes ago',
    cryptographicProofHash: 'zk-proof-sha256:7b1e4f901a88b5d3c8f29a00e4b8821903faee7b39921bc',
    proofBadgeLabel: 'MATHEMATICALLY PROVEN ISOLATED',
    inspectorExplanation: 'Zero plaintext leaks. The zk-SNARK verifies tenant-specific AES-GCM salt derivation without disclosing confidential KMS authorization policies.',
  },
  {
    id: 'zk-probe-02',
    title: 'Merkle Tree Continuous Audit Log Tamper-Proofing',
    category: 'merkle_audit_integrity',
    description: 'Proves the unbroken sequence of 2.4 million compliance audit events since platform inception. Any tampering or retroactive deletion renders the Merkle root invalid.',
    zkCircuitType: 'Recursive STARK Merkle Path Membership Proof',
    publicInputs: {
      merkleTreeRootHash: '0x884c7a6e190b...f291',
      totalLeavesCount: '2,419,082',
      ethereumAnchorTx: '0x5c901a...8831',
    },
    verificationKeyFingerprint: 'merkle:sha256:01:8a:bc:43:99:f1:02:ee:aa:55:bb:33',
    status: 'verified_clean',
    proofLatencyMs: 98,
    lastVerifiedAt: '3 minutes ago',
    cryptographicProofHash: 'stark-proof-sha256:4a00bc91ef7781b22309e44aa7b19902',
    proofBadgeLabel: 'TAMPER-PROOF LEDGER VERIFIED',
    inspectorExplanation: 'Every audit log is cryptographically anchored to a decentralized public ledger. Retrospective tampering is computationally impossible.',
  },
  {
    id: 'zk-probe-03',
    title: 'Zero-Knowledge Production TLS 1.3 & HSTS Cipher Suite Probe',
    category: 'encryption',
    description: 'Live handshake probe confirming NordicScale APIs only negotiate TLS 1.3 with forward secrecy (ECDHE-RSA-AES256-GCM-SHA384).',
    zkCircuitType: 'SNI Handshake Cipher Matrix Verification',
    publicInputs: {
      targetFqdn: 'api.nordicscale.com',
      negotiatedProtocol: 'TLSv1.3',
      cipherSuite: 'TLS_AES_256_GCM_SHA384',
    },
    verificationKeyFingerprint: 'x509:cert-pinning:e9:11:33:04:77:88:ba:dc',
    status: 'verified_clean',
    proofLatencyMs: 84,
    lastVerifiedAt: 'Just now',
    cryptographicProofHash: 'tls-probe-sha256:9901aa88b17ce420fa993b88',
    proofBadgeLabel: 'TLS 1.3 STRICT ENFORCEMENT',
    inspectorExplanation: 'Legacy TLS 1.0, 1.1, and 1.2 are rejected at the edge gateway. 100% of packets use modern authenticated encryption.',
  },
  {
    id: 'zk-probe-04',
    title: 'Disaster Recovery Point-in-Time Immutable Snapshot Verification',
    category: 'disaster_recovery',
    description: 'Cryptographically checks that hourly automated encrypted backups exist across dual geographic regions (Frankfurt & Dublin) without inspecting stored customer data.',
    zkCircuitType: 'Pedersen Commitment Storage State Proof',
    publicInputs: {
      primaryRegion: 'eu-central-1 (Frankfurt)',
      replicaRegion: 'eu-west-1 (Dublin)',
      lastSnapshotLagMinutes: '14 min',
      rpoCompliance: '< 60 min SLA',
    },
    verificationKeyFingerprint: 'storage:envelope:33:aa:88:cc:44:ee:11:99',
    status: 'verified_clean',
    proofLatencyMs: 168,
    lastVerifiedAt: '15 minutes ago',
    cryptographicProofHash: 'snapshot-proof-sha256:22ef901a88cb77a109',
    proofBadgeLabel: 'IMMUTABLE AIR-GAP BACKUP VERIFIED',
    inspectorExplanation: 'WORM (Write Once Read Many) snapshot lock verified. Ransomware cannot delete historical backups.',
  },
];

// =========================================================================
// 5. Cyber Insurance Arbiter & Underwriter Telemetry Hub
// =========================================================================
export const initialCyberInsuranceCarriers: CyberInsuranceCarrierScore[] = [
  {
    carrierName: 'Chubb Cyber Enterprise',
    logoColor: 'from-amber-600 to-amber-800',
    underwritingEligibility: 'Tier 1 Preferred',
    baseAnnualPremium: 92000,
    discountedAnnualPremium: 49500,
    annualSavings: 42500,
    insurabilityIndex: 96,
    warrantyChecklist: [
      {
        id: 'chubb-01',
        requirement: 'Mandatory 100% MFA for all employee remote email & SSO access (No SMS fallback)',
        severity: 'fatal_disqualifier',
        currentStatus: 'compliant',
        telemetrySource: 'Okta & Google Workspace continuous token scan',
        premiumImpactUsd: -16000,
      },
      {
        id: 'chubb-02',
        requirement: 'Immutable, air-gapped backups with quarterly tested restore verification',
        severity: 'fatal_disqualifier',
        currentStatus: 'compliant',
        telemetrySource: 'AWS Backup Vault Lock & CloudWatch metrics',
        premiumImpactUsd: -12500,
      },
      {
        id: 'chubb-03',
        requirement: 'Endpoint Detection & Response (EDR) active on ≥95% of workstation fleet',
        severity: 'rate_modifier',
        currentStatus: 'compliant',
        telemetrySource: 'Desktop Fleet Telemetry (Fleet Osquery Agent)',
        premiumImpactUsd: -8500,
      },
      {
        id: 'chubb-04',
        requirement: 'Privileged Access Management (PAM) with just-in-time session recording',
        severity: 'rate_modifier',
        currentStatus: 'partial',
        telemetrySource: 'Teleport SSH Proxy Audit Logs',
        premiumImpactUsd: -5500,
      },
    ],
  },
  {
    carrierName: 'Travelers CyberProtect',
    logoColor: 'from-red-600 to-red-800',
    underwritingEligibility: 'Tier 1 Preferred',
    baseAnnualPremium: 84000,
    discountedAnnualPremium: 46200,
    annualSavings: 37800,
    insurabilityIndex: 94,
    warrantyChecklist: [
      {
        id: 'trav-01',
        requirement: 'Ransomware Resilience: Dual-custody authorization for code deployment',
        severity: 'fatal_disqualifier',
        currentStatus: 'compliant',
        telemetrySource: 'GitHub 2-person approval branch rules',
        premiumImpactUsd: -14000,
      },
      {
        id: 'trav-02',
        requirement: 'Automated vulnerability patch SLA (< 14 days for Critical CVEs)',
        severity: 'rate_modifier',
        currentStatus: 'compliant',
        telemetrySource: 'Trivy & Snyk container scanner',
        premiumImpactUsd: -11000,
      },
      {
        id: 'trav-03',
        requirement: 'Annual external penetration test with all high findings remediated',
        severity: 'rate_modifier',
        currentStatus: 'compliant',
        telemetrySource: 'Bishop Fox Pentest Report 2026',
        premiumImpactUsd: -8800,
      },
      {
        id: 'trav-04',
        requirement: 'Employee security awareness training completion rate ≥ 85%',
        severity: 'rate_modifier',
        currentStatus: 'compliant',
        telemetrySource: 'Security Training LMS (Current: 87%)',
        premiumImpactUsd: -4000,
      },
    ],
  },
  {
    carrierName: 'Coalition Active Cyber Risk',
    logoColor: 'from-blue-600 to-indigo-800',
    underwritingEligibility: 'Tier 1 Preferred',
    baseAnnualPremium: 78000,
    discountedAnnualPremium: 41000,
    annualSavings: 37000,
    insurabilityIndex: 98,
    warrantyChecklist: [
      {
        id: 'coa-01',
        requirement: 'Zero open RDP, SMB, or database ports exposed directly to public internet',
        severity: 'fatal_disqualifier',
        currentStatus: 'compliant',
        telemetrySource: 'AWS Security Groups automated test: 0 failing',
        premiumImpactUsd: -15000,
      },
      {
        id: 'coa-02',
        requirement: 'Continuous External Attack Surface Management (EASM) with DNS monitoring',
        severity: 'rate_modifier',
        currentStatus: 'compliant',
        telemetrySource: 'Cloudflare Zero Trust integration',
        premiumImpactUsd: -12000,
      },
      {
        id: 'coa-03',
        requirement: 'Software Supply Chain SBOM & dependency license monitoring',
        severity: 'recommended',
        currentStatus: 'partial',
        telemetrySource: 'GitHub Dependabot alerts',
        premiumImpactUsd: -5000,
      },
    ],
  },
];

// =========================================================================
// 6. Shadow-AI & SaaS Data Exfiltration Sentinel
// =========================================================================
export const initialShadowAiTools: ShadowAiTool[] = [
  {
    id: 'ai-01',
    name: 'OpenAI ChatGPT Enterprise',
    category: 'LLM Agent',
    discoveredUsersCount: 142,
    firstDetectedAt: 'Jan 10, 2026',
    governanceStatus: 'sanctioned',
    dataRetentionPolicy: 'zero_retention_enterprise',
    compliancePosture: {
      hasSoc2: true,
      hasGdprDpa: true,
      hasHipaaBaa: true,
      dataResidency: 'EU',
    },
    dlpIncidentsDetected: 0,
    topRiskDescription: 'Sanctioned tenant with Business Associate Agreement (BAA) and Zero-Day retention enabled.',
    primaryRiskRating: 'Low',
    oauthTokenScope: 'read:user, model:chat',
  },
  {
    id: 'ai-02',
    name: 'Unverified GitHub Copilot Extension (Consumer License)',
    category: 'Code Assistant',
    discoveredUsersCount: 8,
    firstDetectedAt: '3 days ago',
    governanceStatus: 'quarantined',
    dataRetentionPolicy: 'trains_on_user_prompts',
    compliancePosture: {
      hasSoc2: true,
      hasGdprDpa: false,
      hasHipaaBaa: false,
      dataResidency: 'Non-Compliant',
    },
    dlpIncidentsDetected: 3,
    topRiskDescription: 'Engineers logged in with personal Microsoft accounts. Default terms allow telemetry code training.',
    primaryRiskRating: 'Critical',
    oauthTokenScope: 'repo, user:email',
  },
  {
    id: 'ai-03',
    name: 'Perplexity AI Search & Deep Research',
    category: 'Data Analytics',
    discoveredUsersCount: 29,
    firstDetectedAt: '2 weeks ago',
    governanceStatus: 'under_review',
    dataRetentionPolicy: '30_days_retained',
    compliancePosture: {
      hasSoc2: true,
      hasGdprDpa: true,
      hasHipaaBaa: false,
      dataResidency: 'US',
    },
    dlpIncidentsDetected: 1,
    topRiskDescription: 'Marketing and Product teams querying competitive data. DPA submitted to legal for review.',
    primaryRiskRating: 'Medium',
    oauthTokenScope: 'openid, profile, email',
  },
  {
    id: 'ai-04',
    name: 'v0.dev by Vercel (UI Code Generator)',
    category: 'Code Assistant',
    discoveredUsersCount: 14,
    firstDetectedAt: '1 month ago',
    governanceStatus: 'sanctioned',
    dataRetentionPolicy: 'zero_retention_enterprise',
    compliancePosture: {
      hasSoc2: true,
      hasGdprDpa: true,
      hasHipaaBaa: false,
      dataResidency: 'US',
    },
    dlpIncidentsDetected: 0,
    topRiskDescription: 'Enterprise team workspace active with prompt-isolation policy.',
    primaryRiskRating: 'Low',
  },
  {
    id: 'ai-05',
    name: 'HuggingFace Personal Space API Keys',
    category: 'LLM Agent',
    discoveredUsersCount: 4,
    firstDetectedAt: 'Yesterday',
    governanceStatus: 'blocked',
    dataRetentionPolicy: 'unknown',
    compliancePosture: {
      hasSoc2: false,
      hasGdprDpa: false,
      hasHipaaBaa: false,
      dataResidency: 'Unknown',
    },
    dlpIncidentsDetected: 2,
    topRiskDescription: 'Unsanctioned self-hosted model proxy exposing raw database query embeddings.',
    primaryRiskRating: 'Critical',
    oauthTokenScope: 'read:repos, write:models',
  },
];

export const initialShadowAiDlpEvents: ShadowAiDlpEvent[] = [
  {
    id: 'dlp-001',
    toolId: 'ai-02',
    toolName: 'Unverified GitHub Copilot Extension',
    detectedAt: '2 hours ago',
    userEmail: 'rasmus.lind@nordicscale.com',
    violationType: 'API_SECRET_KEY',
    redactedSnippet: 'export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" ...',
    actionTaken: 'blocked_in_transit',
  },
  {
    id: 'dlp-002',
    toolId: 'ai-05',
    toolName: 'HuggingFace Personal Space API Keys',
    detectedAt: '4 hours ago',
    userEmail: 'dev.intern@nordicscale.com',
    violationType: 'PII_SSN',
    redactedSnippet: 'INSERT INTO patients (ssn, full_name) VALUES ("***-**-8492", "Johnathan Doe");',
    actionTaken: 'token_revoked',
  },
  {
    id: 'dlp-003',
    toolId: 'ai-03',
    toolName: 'Perplexity AI Search',
    detectedAt: '1 day ago',
    userEmail: 'elena.s@nordicscale.com',
    violationType: 'SOURCE_CODE_IP',
    redactedSnippet: 'function calculateProprietaryOptionPricing(volatilityMatrix: Float64Array) { ... }',
    actionTaken: 'alert_sent_to_soc',
  },
];

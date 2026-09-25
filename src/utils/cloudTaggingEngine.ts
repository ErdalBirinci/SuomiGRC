import {
  DiscoveredResource,
  SensitivityLevel,
  UsageClassification,
  SuggestedSecurityTag,
  TaggingEngineStats,
} from '../types/cloudDiscovery';

/**
 * Infers sensitivity level and usage classification based on resource type,
 * naming conventions, ARNs, and existing metadata tags.
 */
export function inferSensitivityAndUsage(resource: DiscoveredResource): {
  sensitivityLevel: SensitivityLevel;
  usageClassification: UsageClassification;
} {
  const combinedText = `${resource.name} ${resource.arnOrUri} ${resource.resourceType} ${Object.entries(
    resource.tags || {}
  )
    .map(([k, v]) => `${k}:${v}`)
    .join(' ')}`.toLowerCase();

  // 1. Sensitivity Detection
  let sensitivityLevel: SensitivityLevel = 'Internal';

  if (
    combinedText.includes('pii') ||
    combinedText.includes('customer') ||
    combinedText.includes('patient') ||
    combinedText.includes('lakehouse') ||
    combinedText.includes('billing') ||
    combinedText.includes('financial') ||
    combinedText.includes('ephi') ||
    combinedText.includes('strictly confidential')
  ) {
    sensitivityLevel = 'Restricted PII';
  } else if (
    combinedText.includes('keyvault') ||
    combinedText.includes('kms') ||
    combinedText.includes('secret') ||
    combinedText.includes('prod') ||
    combinedText.includes('aurora') ||
    combinedText.includes('database') ||
    combinedText.includes('hsm') ||
    combinedText.includes('core-prod') ||
    combinedText.includes('auth-tokens')
  ) {
    sensitivityLevel = 'Confidential';
  } else if (
    combinedText.includes('public') ||
    combinedText.includes('cdn') ||
    combinedText.includes('dns') ||
    combinedText.includes('ingress-public') ||
    combinedText.includes('landing')
  ) {
    sensitivityLevel = 'Public';
  } else {
    sensitivityLevel = 'Internal';
  }

  // 2. Usage Classification Detection
  let usageClassification: UsageClassification = 'Production Core';

  if (
    combinedText.includes('lakehouse') ||
    combinedText.includes('analytics') ||
    combinedText.includes('bigquery') ||
    combinedText.includes('s3:::acme-prod-analytics') ||
    combinedText.includes('data lake')
  ) {
    usageClassification = 'Data Analytics & Lakehouse';
  } else if (
    combinedText.includes('auth') ||
    combinedText.includes('identity') ||
    combinedText.includes('token') ||
    combinedText.includes('keyvault') ||
    combinedText.includes('kms') ||
    combinedText.includes('mfa')
  ) {
    usageClassification = 'Identity & Auth';
  } else if (
    combinedText.includes('billing') ||
    combinedText.includes('payment') ||
    combinedText.includes('finops') ||
    combinedText.includes('invoice') ||
    combinedText.includes('stripe')
  ) {
    usageClassification = 'Payment & Financial';
  } else if (
    combinedText.includes('staging') ||
    combinedText.includes('dev') ||
    combinedText.includes('preview') ||
    combinedText.includes('sandbox') ||
    combinedText.includes('test')
  ) {
    usageClassification = 'Staging / QA';
  } else if (
    combinedText.includes('public') ||
    combinedText.includes('cdn') ||
    combinedText.includes('gateway') ||
    combinedText.includes('ingress') ||
    combinedText.includes('dns')
  ) {
    usageClassification = 'Public Edge';
  } else if (
    combinedText.includes('monitoring') ||
    combinedText.includes('telemetry') ||
    combinedText.includes('ci-cd') ||
    combinedText.includes('runner')
  ) {
    usageClassification = 'Internal Tooling';
  } else {
    usageClassification = 'Production Core';
  }

  return { sensitivityLevel, usageClassification };
}

/**
 * Generates tailored security control tag suggestions based on resource type,
 * operational usage, and data sensitivity.
 */
export function generateSecurityTagSuggestions(
  resource: DiscoveredResource,
  sensitivityLevel: SensitivityLevel,
  usageClassification: UsageClassification
): SuggestedSecurityTag[] {
  const suggestions: SuggestedSecurityTag[] = [];
  const currentTags = resource.tags || {};
  const currentKeys = Object.keys(currentTags);

  const isTagAlreadySet = (key: string, value: string) => {
    const existingVal = currentTags[key];
    if (!existingVal) return false;
    return existingVal.toLowerCase() === value.toLowerCase();
  };

  // 1. Data Sensitivity Tag
  const sensitivityValue =
    sensitivityLevel === 'Restricted PII'
      ? 'restricted-pii'
      : sensitivityLevel === 'Confidential'
      ? 'confidential-prod'
      : sensitivityLevel === 'Public'
      ? 'public-edge'
      : 'internal';

  suggestions.push({
    key: 'sec:data-sensitivity',
    value: sensitivityValue,
    category: 'sensitivity',
    confidence: sensitivityLevel === 'Restricted PII' ? 99 : 96,
    reason: `Inferred from resource type "${resource.resourceType}" and usage context "${usageClassification}". Mandates DLP & strict audit logging.`,
    isApplied: isTagAlreadySet('sec:data-sensitivity', sensitivityValue),
  });

  // 2. Framework Governance Scope Tag
  let frameworkValue = 'soc2-cc6.1,iso27001-a.8.24';
  if (sensitivityLevel === 'Restricted PII') {
    frameworkValue = 'soc2-cc6.1,iso27001-a.8.24,gdpr-art32';
    if (usageClassification === 'Payment & Financial') {
      frameworkValue += ',pci-dss-req3';
    }
  } else if (usageClassification === 'Identity & Auth') {
    frameworkValue = 'soc2-cc6.2,iso27001-a.9.4,nist-csf-pr.ac';
  } else if (usageClassification === 'Staging / QA') {
    frameworkValue = 'soc2-cc8.1,iso27001-a.12.1';
  }

  suggestions.push({
    key: 'sec:framework-scope',
    value: frameworkValue,
    category: 'framework',
    confidence: 97,
    reason: `Maps asset to statutory control audits (${frameworkValue.toUpperCase()}) for automatic evidence bundling.`,
    isApplied: isTagAlreadySet('sec:framework-scope', frameworkValue),
  });

  // 3. Encryption at Rest & In-Transit Tag
  let encValue = 'sse-kms-cmk-strict-tls13';
  if (resource.resourceType.includes('Key Vault') || resource.resourceType.includes('KMS')) {
    encValue = 'fips-140-3-hsm-purge-protected';
  } else if (sensitivityLevel === 'Internal' || usageClassification === 'Staging / QA') {
    encValue = 'cloud-default-sse-aes256';
  }

  suggestions.push({
    key: 'sec:encryption-requirement',
    value: encValue,
    category: 'encryption',
    confidence: 95,
    reason: `Enforces hardware-backed cryptographic protection matching SOC 2 CC6.7 & ISO 27001 A.8.24.`,
    isApplied: isTagAlreadySet('sec:encryption-requirement', encValue),
  });

  // 4. Backup & Disaster Recovery Tier Tag
  let backupTier = 'tier-2-daily-snapshot';
  if (sensitivityLevel === 'Restricted PII' || usageClassification === 'Production Core') {
    backupTier = 'tier-1-rpo-15m-worm-immutable';
  } else if (usageClassification === 'Staging / QA' || usageClassification === 'Internal Tooling') {
    backupTier = 'tier-3-ephemeral-no-backup';
  }

  suggestions.push({
    key: 'sec:backup-tier',
    value: backupTier,
    category: 'backup',
    confidence: 94,
    reason: `Instructs BCDR automated schedulers to apply ${backupTier.toUpperCase()} retention under ISO 27001 A.17 & SOC 2 A1.2.`,
    isApplied: isTagAlreadySet('sec:backup-tier', backupTier),
  });

  // 5. Access Policy & Network Ingress Tag
  let accessPolicy = 'private-endpoint-no-public-ip';
  if (usageClassification === 'Public Edge') {
    accessPolicy = 'public-waf-ddos-shielded';
  } else if (usageClassification === 'Identity & Auth') {
    accessPolicy = 'strict-mfa-least-privilege-iam';
  }

  suggestions.push({
    key: 'sec:access-policy',
    value: accessPolicy,
    category: 'access',
    confidence: 96,
    reason: `Configures perimeter boundary guardrails and prevents accidental public exposure (SOC 2 CC6.6).`,
    isApplied: isTagAlreadySet('sec:access-policy', accessPolicy),
  });

  // 6. Compliance Ownership Tag
  let complianceOwner = 'SecOps-CloudGovernance';
  if (usageClassification === 'Data Analytics & Lakehouse') {
    complianceOwner = 'DataEngineering-SecOps';
  } else if (usageClassification === 'Identity & Auth') {
    complianceOwner = 'IAM-SecOps-Team';
  } else if (usageClassification === 'Payment & Financial') {
    complianceOwner = 'FinOps-Security-Lead';
  } else if (usageClassification === 'Staging / QA') {
    complianceOwner = 'DevOps-Release-Team';
  }

  suggestions.push({
    key: 'sec:compliance-owner',
    value: complianceOwner,
    category: 'owner',
    confidence: 92,
    reason: `Assigns direct accountability for control drift remediation tickets in Jira/Linear.`,
    isApplied: isTagAlreadySet('sec:compliance-owner', complianceOwner),
  });

  // 7. Regulatory Retention Schedule Tag
  let retentionSchedule = '1-year-audit-compliance';
  if (sensitivityLevel === 'Restricted PII' || usageClassification === 'Payment & Financial') {
    retentionSchedule = '7-years-regulatory-immutable';
  } else if (usageClassification === 'Staging / QA') {
    retentionSchedule = '30-days-ephemeral';
  } else if (usageClassification === 'Internal Tooling') {
    retentionSchedule = '90-days-operational';
  }

  suggestions.push({
    key: 'sec:retention-schedule',
    value: retentionSchedule,
    category: 'retention',
    confidence: 95,
    reason: `Enforces data lifecycle and statutory purge windows matching GDPR Art. 5(1)(e) & SOC 2 CC6.5.`,
    isApplied: isTagAlreadySet('sec:retention-schedule', retentionSchedule),
  });

  // 8. Security Audit Logging Policy Tag
  let auditLoggingPolicy = 'cloudtrail-mgmt-events';
  if (sensitivityLevel === 'Restricted PII' || usageClassification === 'Production Core') {
    auditLoggingPolicy = 'cloudtrail-data-events-worm-secured';
  } else if (usageClassification === 'Public Edge') {
    auditLoggingPolicy = 'edge-waf-flow-logs-active';
  }

  suggestions.push({
    key: 'sec:audit-logging',
    value: auditLoggingPolicy,
    category: 'audit',
    confidence: 96,
    reason: `Configures real-time SIEM ingestion and tamper-proof WORM storage for compliance audit trails.`,
    isApplied: isTagAlreadySet('sec:audit-logging', auditLoggingPolicy),
  });

  return suggestions;
}

/**
 * Scans a single resource and returns an enriched resource with sensitivity,
 * usage, suggested tags, and tagging status computed.
 */
export function scanAndEnrichResourceWithTags(resource: DiscoveredResource): DiscoveredResource {
  const { sensitivityLevel, usageClassification } = inferSensitivityAndUsage(resource);
  const suggestedTags = generateSecurityTagSuggestions(resource, sensitivityLevel, usageClassification);

  const appliedCount = suggestedTags.filter((t) => t.isApplied).length;
  let taggingStatus: 'fully_tagged' | 'suggestions_pending' | 'untagged' = 'suggestions_pending';

  if (appliedCount === suggestedTags.length && suggestedTags.length > 0) {
    taggingStatus = 'fully_tagged';
  } else if (appliedCount === 0 && Object.keys(resource.tags || {}).length <= 1) {
    taggingStatus = 'untagged';
  } else {
    taggingStatus = 'suggestions_pending';
  }

  return {
    ...resource,
    sensitivityLevel,
    usageClassification,
    suggestedTags,
    taggingStatus,
    lastTagScanTime: 'Just now',
  };
}

/**
 * Scans all cloud resources with the automated tagging engine.
 */
export function scanAllCloudResources(resources: DiscoveredResource[]): {
  enrichedResources: DiscoveredResource[];
  stats: TaggingEngineStats;
} {
  const enrichedResources = resources.map(scanAndEnrichResourceWithTags);
  const stats = computeTaggingStats(enrichedResources);
  return { enrichedResources, stats };
}

/**
 * Computes aggregated statistics for the tagging engine.
 */
export function computeTaggingStats(resources: DiscoveredResource[]): TaggingEngineStats {
  const totalResources = resources.length;
  const fullyTaggedCount = resources.filter((r) => r.taggingStatus === 'fully_tagged').length;
  const suggestionsPendingCount = resources.filter(
    (r) => r.taggingStatus === 'suggestions_pending'
  ).length;
  const untaggedCount = resources.filter((r) => r.taggingStatus === 'untagged').length;

  const coveragePercentage =
    totalResources > 0 ? Math.round((fullyTaggedCount / totalResources) * 100) : 0;

  const totalSuggestedTagsCount = resources.reduce(
    (acc, r) => acc + (r.suggestedTags?.filter((t) => !t.isApplied).length || 0),
    0
  );

  return {
    totalResources,
    fullyTaggedCount,
    suggestionsPendingCount,
    untaggedCount,
    coveragePercentage,
    totalSuggestedTagsCount,
  };
}

/**
 * Applies all or specific suggested tags to a resource.
 */
export function applySuggestedTagsToResource(
  resource: DiscoveredResource,
  tagKeysToApply?: string[]
): DiscoveredResource {
  const currentTags = { ...(resource.tags || {}) };
  const suggestions = resource.suggestedTags || [];

  suggestions.forEach((sug) => {
    if (!tagKeysToApply || tagKeysToApply.includes(sug.key)) {
      currentTags[sug.key] = sug.value;
    }
  });

  return scanAndEnrichResourceWithTags({
    ...resource,
    tags: currentTags,
  });
}

/**
 * Generates Infrastructure as Code (Terraform) tag block snippet
 * so DevOps teams can paste the verified security tags directly into their repo.
 */
export function generateTerraformTagSnippet(resource: DiscoveredResource): string {
  const allTags = { ...(resource.tags || {}) };
  if (resource.suggestedTags) {
    resource.suggestedTags.forEach((s) => {
      allTags[s.key] = s.value;
    });
  }

  const tagLines = Object.entries(allTags)
    .map(([k, v]) => `    "${k}" = "${v}"`)
    .join('\n');

  return `# Terraform / OpenTofu Security Tags for ${resource.name}
# Auto-generated by SuomiGRC Cloud Discovery Tagging Engine
locals {
  security_tags = {
${tagLines}
  }
}

resource "${resource.cloudProvider === 'aws' ? 'aws_resourcegroups_group' : 'google_tags_tag_binding'}" "sec_compliance" {
  tags = local.security_tags
}`;
}

/**
 * Generates AWS CLI / Azure CLI / GCP CLI command to tag resource directly.
 */
export function generateCliTagCommand(resource: DiscoveredResource): string {
  const allTags = { ...(resource.tags || {}) };
  if (resource.suggestedTags) {
    resource.suggestedTags.forEach((s) => {
      allTags[s.key] = s.value;
    });
  }

  if (resource.cloudProvider === 'aws') {
    const tagArg = Object.entries(allTags)
      .map(([k, v]) => `Key=${k},Value=${v}`)
      .join(' ');
    return `# Apply security tags via AWS CLI
aws resourcegroupstaggingapi tag-resources \\
  --resource-arn-list "${resource.arnOrUri}" \\
  --tags ${tagArg}`;
  } else if (resource.cloudProvider === 'gcp') {
    return `# Apply security labels via gcloud CLI
gcloud resource-manager tags bindings create \\
  --tag-value="..." \\
  --parent="//cloudresourcemanager.googleapis.com/${resource.id}"`;
  } else {
    const tagArg = Object.entries(allTags)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    return `# Apply security tags via Azure CLI
az tag create --resource-id "${resource.arnOrUri}" --tags ${tagArg}`;
  }
}

/**
 * Exports complete Tagging Engine Audit Matrix as CSV
 */
export function generateTaggingAuditCsv(resources: DiscoveredResource[]): string {
  const headers = [
    'Resource Name',
    'Resource Type',
    'Cloud Provider',
    'Region',
    'Account Name',
    'Account ID',
    'Inferred Sensitivity',
    'Operational Usage',
    'Tagging Status',
    'Existing Tags Count',
    'Pending Suggestions Count',
    'Suggested Security Tags',
    'ARN / URI',
  ];

  const rows = resources.map((r) => {
    const pendingCount = r.suggestedTags?.filter((t) => !t.isApplied).length || 0;
    const suggestedTagsStr = (r.suggestedTags || [])
      .map((t) => `${t.key}=${t.value} [${t.category} ${t.confidence}%]`)
      .join('; ');

    return [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.resourceType}"`,
      r.cloudProvider.toUpperCase(),
      r.region,
      `"${r.accountName}"`,
      r.accountId,
      r.sensitivityLevel || 'Unspecified',
      `"${r.usageClassification || 'Unclassified'}"`,
      r.taggingStatus || 'untagged',
      Object.keys(r.tags || {}).length,
      pendingCount,
      `"${suggestedTagsStr.replace(/"/g, '""')}"`,
      `"${r.arnOrUri}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Exports complete Tagging Engine Audit Matrix as JSON
 */
export function generateTaggingAuditJson(resources: DiscoveredResource[]): string {
  const report = {
    generatedAt: new Date().toISOString(),
    complianceEngine: 'SuomiGRC Automated Cloud Tagging Engine v4.8',
    standardsSupported: ['SOC 2 Trust Services Criteria', 'ISO/IEC 27001:2022', 'GDPR Art. 32', 'PCI-DSS v4.0.1'],
    totalResources: resources.length,
    statistics: computeTaggingStats(resources),
    resources: resources.map((r) => ({
      id: r.id,
      name: r.name,
      arnOrUri: r.arnOrUri,
      cloudProvider: r.cloudProvider,
      resourceType: r.resourceType,
      region: r.region,
      account: {
        name: r.accountName,
        id: r.accountId,
      },
      sensitivityLevel: r.sensitivityLevel,
      usageClassification: r.usageClassification,
      taggingStatus: r.taggingStatus,
      tags: r.tags,
      suggestedSecurityTags: r.suggestedTags,
      mappedControls: r.mappedControls,
    })),
  };

  return JSON.stringify(report, null, 2);
}

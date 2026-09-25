import { RegulatoryNewsItem } from '../types/regulatoryNews';

export const initialRegulatoryNews: RegulatoryNewsItem[] = [
  {
    id: 'reg-cisa-kev-2026-01',
    title: 'CISA Adds High-Impact Remote Code Execution & Auth Bypass Vulnerabilities to KEV Catalog',
    authority: 'CISA',
    category: 'Vulnerability & Exploit Directive',
    publicationDate: 'September 22, 2026',
    timeAgo: '3 hours ago',
    severity: 'critical',
    executiveSummary:
      'CISA has added active zero-day exploits impacting enterprise multi-cloud VPN gateways and container orchestration controllers to its Known Exploited Vulnerabilities (KEV) catalog. Under Binding Operational Directive (BOD) 22-01, federal agencies and contracted defense/enterprise suppliers must remediate by October 12, 2026.',
    keyTakeaways: [
      'BOD 22-01 mandates patch deployment or compensating network segmentation within 21 days.',
      'Active reconnaissance detected targeting internet-facing management interfaces with unpatched OAuth endpoints.',
      'Auditors for FedRAMP, SOC 2, and ISO 27001 are verifying continuous vulnerability scanning SLAs.',
    ],
    affectedFrameworks: ['SOC 2 CC6.8', 'ISO 27001 A.8.8', 'NIST CSF PR.IP-12', 'PCI DSS 6.3.3'],
    affectedControlCodes: ['SEC-04', 'VULN-01', 'NET-02'],
    recommendedAction:
      'Run emergency asset scan against KEV identifiers, verify edge proxy patch levels, and enforce zero-trust network access policies.',
    primaryUrl: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    sources: [
      {
        title: 'CISA Known Exploited Vulnerabilities Catalog',
        uri: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
        sourceAuthority: 'CISA.gov',
      },
      {
        title: 'BOD 22-01: Reducing the Significant Risk of Known Exploited Vulnerabilities',
        uri: 'https://www.cisa.gov/binding-operational-directive-22-01',
        sourceAuthority: 'Cybersecurity and Infrastructure Security Agency',
      },
    ],
    complianceImpactScore: 96,
    regulatoryJurisdiction: 'United States (Federal & Supply Chain)',
    enforcementDeadline: 'Oct 12, 2026',
    isBookmarked: true,
  },
  {
    id: 'reg-nist-csf-pqc-2026-02',
    title: 'NIST Releases Finalized Post-Quantum Cryptography (PQC) Standards & CSF 2.0 Governance Implementation Guide',
    authority: 'NIST',
    category: 'Framework & Standard Revision',
    publicationDate: 'September 20, 2026',
    timeAgo: '1 day ago',
    severity: 'high',
    executiveSummary:
      'NIST has published FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) alongside actionable implementation mapping for the NIST Cybersecurity Framework (CSF 2.0) "Govern" (GV) function. GRC organizations must begin inventorying classical RSA/ECC encryption algorithms in data-at-rest and TLS transit paths.',
    keyTakeaways: [
      'NIST CSF 2.0 elevates Governance (GV) into a dedicated 6th core pillar equal to Identify, Protect, Detect, Respond, and Recover.',
      'Cryptographic asset inventories are now explicitly requested by Big-4 CPA firms during SOC 2 Type II examinations.',
      'Transition roadmap mandates phased replacement of RSA-2048 keys and SHA-1 legacies by 2030.',
    ],
    affectedFrameworks: ['NIST CSF 2.0 GV.OC-01', 'ISO 27001 A.8.24', 'SOC 2 CC6.1', 'HIPAA § 164.312'],
    affectedControlCodes: ['CRYPTO-01', 'GOV-03', 'DAT-04'],
    recommendedAction:
      'Initiate enterprise cryptographic bill of materials (CBOM) audit and review KMS keys across AWS, Azure, and GCP environments.',
    primaryUrl: 'https://csrc.nist.gov/publications/detail/fips/203/final',
    sources: [
      {
        title: 'NIST Releases First 3 Finalized Post-Quantum Encryption Standards',
        uri: 'https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards',
        sourceAuthority: 'NIST CSRC',
      },
      {
        title: 'NIST Cybersecurity Framework (CSF) 2.0 Resource Hub',
        uri: 'https://www.nist.gov/cyberframework',
        sourceAuthority: 'NIST.gov',
      },
    ],
    complianceImpactScore: 89,
    regulatoryJurisdiction: 'Global & US Standards',
    enforcementDeadline: 'Ongoing Phased Rollout',
    isBookmarked: true,
  },
  {
    id: 'reg-gdpr-edpb-ai-2026-03',
    title: 'European Data Protection Board (EDPB) Issues Landmark Rulings on Generative AI Data Ingestion and Model Retention',
    authority: 'GDPR/EDPB',
    category: 'Data Privacy & Cross-Border',
    publicationDate: 'September 18, 2026',
    timeAgo: '3 days ago',
    severity: 'critical',
    executiveSummary:
      'The EDPB alongside leading national Data Protection Authorities (CNIL, DPC, BfDI) has released binding guidelines establishing that LLM training and corporate RAG systems processing personal data without valid legal basis (Art. 6) or automated deletion mechanisms violate GDPR Articles 17 (Right to Erasure) and 25 (Data Protection by Design).',
    keyTakeaways: [
      'Organizations using customer telemetry or employee transcripts for AI fine-tuning must provide verifiable opt-outs and zero-retention assurances.',
      'Standard Contractual Clauses (SCCs) alone are insufficient without supplementary transfer risk assessments (TIA) for US-hosted LLMs.',
      'Potential statutory administrative fines up to €20M or 4% of worldwide annual turnover for systemic non-compliance.',
    ],
    affectedFrameworks: ['GDPR Art. 5/17/25/32', 'ISO 27701 6.5', 'SOC 2 P1.1 (Privacy)'],
    affectedControlCodes: ['PRIV-01', 'AI-02', 'DAT-02'],
    recommendedAction:
      'Review Shadow-AI Sentinel telemetry, verify zero-retention enterprise terms with OpenAI/Anthropic/Google, and update public Data Processing Agreements (DPA).',
    primaryUrl: 'https://www.edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en',
    sources: [
      {
        title: 'EDPB Guidelines on the Processing of Personal Data through Artificial Intelligence Systems',
        uri: 'https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines_en',
        sourceAuthority: 'European Data Protection Board',
      },
      {
        title: 'CNIL Practical Recommendations for AI and GDPR Compliance',
        uri: 'https://www.cnil.fr/en/artificial-intelligence',
        sourceAuthority: 'Commission Nationale de l’Informatique et des Libertés',
      },
    ],
    complianceImpactScore: 94,
    regulatoryJurisdiction: 'European Union & Global Data Controllers',
    enforcementDeadline: 'Immediate Enforcement',
  },
  {
    id: 'reg-sec-item-105-2026-04',
    title: 'SEC Concludes First Enforcement Sweeps on Item 1.05 Form 8-K Material Cybersecurity Disclosures',
    authority: 'SEC',
    category: 'Enforcement & Penalty Ruling',
    publicationDate: 'September 15, 2026',
    timeAgo: '5 days ago',
    severity: 'high',
    executiveSummary:
      'The U.S. Securities and Exchange Commission (SEC) announced settlement orders against multiple registrants for providing misleading, generalized, or delayed disclosures following material cloud breaches under Item 1.05 of Form 8-K. The Division of Corporation Finance emphasized that "without unreasonable delay" determinations require documented GRC triage logs.',
    keyTakeaways: [
      'Companies must file Form 8-K within four business days after determining that a cyber incident is material.',
      'Materiality determinations must encompass qualitative impact (customer trust, intellectual property, audit qualifications), not merely immediate direct ransom extortion sums.',
      'Annual Form 10-K cyber governance disclosures must substantiate board oversight processes and CISO reporting lines.',
    ],
    affectedFrameworks: ['SEC Cyber Disclosure Rule', 'SOC 2 CC7.3 (Incident Response)', 'ISO 27001 A.5.24'],
    affectedControlCodes: ['INC-01', 'GOV-01', 'AUD-03'],
    recommendedAction:
      'Audit the enterprise Incident Response Plan (IRP) SLA trigger protocols and verify automated evidence archiving for breach discovery timestamps.',
    primaryUrl: 'https://www.sec.gov/news/press-release/2023-139',
    sources: [
      {
        title: 'SEC Adopts Rules on Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure',
        uri: 'https://www.sec.gov/news/press-release/2023-139',
        sourceAuthority: 'U.S. Securities and Exchange Commission',
      },
      {
        title: 'Division of Corporation Finance Statement on Cybersecurity Disclosures',
        uri: 'https://www.sec.gov/corpfin/secg-cybersecurity-disclosure',
        sourceAuthority: 'SEC.gov',
      },
    ],
    complianceImpactScore: 88,
    regulatoryJurisdiction: 'United States (Public Companies & Pre-IPO)',
    enforcementDeadline: 'Active Enforced Rule',
  },
  {
    id: 'reg-eu-nis2-dora-2026-05',
    title: 'EU NIS2 Directive and DORA Digital Operational Resilience Act Mandate Critical Third-Party ICT Oversight',
    authority: 'EU NIS2/DORA',
    category: 'Operational Resilience',
    publicationDate: 'September 12, 2026',
    timeAgo: '1 week ago',
    severity: 'high',
    executiveSummary:
      'The European Banking Authority (EBA), EIOPA, and ESMA alongside ENISA have published joint regulatory technical standards (RTS) for the Digital Operational Resilience Act (DORA) and NIS2. All financial entities and essential digital providers must establish comprehensive registers of information on third-party ICT service providers.',
    keyTakeaways: [
      'Requires strict contractual clauses regarding audit rights, service level guarantees, and exit strategies with cloud suppliers.',
      'Establishes an early warning 24-hour notification threshold for major ICT-related incidents to competent national authorities.',
      'Executive management bodies face direct personal accountability and sanctions for non-compliance with cyber hygiene mandates.',
    ],
    affectedFrameworks: ['NIS2 Directive Art. 21', 'DORA Chapter V (Third-Party Risk)', 'ISO 27001 A.5.19', 'SOC 2 CC9.2'],
    affectedControlCodes: ['VEN-01', 'DR-02', 'SEC-01'],
    recommendedAction:
      'Conduct vendor tiering sweep in the TPRM module, verify business continuity / disaster recovery failover drill logs, and update DPA addendums.',
    primaryUrl: 'https://www.enisa.europa.eu/topics/cybersecurity-policy/nis2-directive',
    sources: [
      {
        title: 'ENISA Briefing on the NIS 2 Directive and European Cyber Resilience',
        uri: 'https://www.enisa.europa.eu/topics/cybersecurity-policy/nis2-directive',
        sourceAuthority: 'European Union Agency for Cybersecurity (ENISA)',
      },
      {
        title: 'European Supervisory Authorities (ESAs) Final Report on DORA RTS',
        uri: 'https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/digital-operational-resilience-act-dora',
        sourceAuthority: 'European Banking Authority (EBA)',
      },
    ],
    complianceImpactScore: 91,
    regulatoryJurisdiction: 'European Union (Banking, Fintech, Cloud, Critical Infra)',
    enforcementDeadline: 'Jan 17, 2025 - Phased Enforcement 2026',
  },
  {
    id: 'reg-cisa-lotl-2026-06',
    title: 'CISA, NSA, and International Partners Publish Living-Off-the-Land (LotL) Defense & Endpoint Telemetry Advisory',
    authority: 'CISA',
    category: 'Vulnerability & Exploit Directive',
    publicationDate: 'September 10, 2026',
    timeAgo: '1 week ago',
    severity: 'medium',
    executiveSummary:
      'CISA, FBI, NSA, and the cybersecurity agencies of the UK (NCSC-UK), Australia (ACSC), Canada (CCCS), and New Zealand (NCSC-NZ) published a joint cybersecurity advisory on detecting and mitigating Living-Off-the-Land (LotL) techniques. Attackers use built-in Windows PowerShell, WMI, and Linux bash binaries to evade traditional signature-based AV.',
    keyTakeaways: [
      'Recommends continuous script block logging (PowerShell Event ID 4104) and centralized audit ingestion.',
      'Mandates separation of administrative credentials and blocking outbound SMB/RPC connections from unprivileged workstation subnets.',
      'Directly aligns with SOC 2 CC6.6 boundary protection and ISO 27001 A.8.15 logging controls.',
    ],
    affectedFrameworks: ['SOC 2 CC6.6/CC7.2', 'ISO 27001 A.8.15', 'NIST CSF DE.AE-03', 'CIS Controls 8.2'],
    affectedControlCodes: ['LOG-01', 'EP-02', 'IAM-03'],
    recommendedAction:
      'Verify MDM Fleet EDR agent status, enable PowerShell script block telemetry, and check centralized CloudWatch / Datadog retention settings.',
    primaryUrl: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a',
    sources: [
      {
        title: 'Identifying and Mitigating Living-Off-the-Land Techniques',
        uri: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a',
        sourceAuthority: 'CISA & NSA Joint Advisory',
      },
    ],
    complianceImpactScore: 84,
    regulatoryJurisdiction: 'Five Eyes & Global IT Networks',
    enforcementDeadline: 'Immediate Best Practice',
  },
  {
    id: 'reg-hipaa-hhs-2026-07',
    title: 'HHS Office for Civil Rights (OCR) Imposes $4.8M Fine for Unencrypted Cloud S3 Buckets & Missing BAAs',
    authority: 'HIPAA/HHS',
    category: 'Enforcement & Penalty Ruling',
    publicationDate: 'September 05, 2026',
    timeAgo: '2 weeks ago',
    severity: 'high',
    executiveSummary:
      'The U.S. Department of Health and Human Services (HHS) OCR reached a $4.8 million civil monetary settlement with a multi-state digital health provider following a breach exposing protected health information (PHI). The investigation discovered AWS S3 buckets lacking default SSE-KMS encryption and missing executed Business Associate Agreements with two AI transcription vendors.',
    keyTakeaways: [
      '45 CFR § 164.312(a)(2)(iv) requires encryption at rest for all electronic PHI (ePHI).',
      'Using third-party SaaS without verified executed BAAs is treated by OCR as willful neglect.',
      'Resolution agreements now require mandatory 2-year independent third-party compliance monitoring.',
    ],
    affectedFrameworks: ['HIPAA Security Rule § 164.308/312', 'SOC 2 CC6.1', 'ISO 27001 A.8.24'],
    affectedControlCodes: ['HIPAA-01', 'DAT-01', 'VEN-02'],
    recommendedAction:
      'Run automated S3 / Cloud Storage encryption check in Controls Monitoring and verify all subprocessor BAAs in the Vendor Risk tab.',
    primaryUrl: 'https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/index.html',
    sources: [
      {
        title: 'HHS OCR Enforcement Resolution Agreements',
        uri: 'https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/index.html',
        sourceAuthority: 'HHS Office for Civil Rights',
      },
    ],
    complianceImpactScore: 92,
    regulatoryJurisdiction: 'United States (Covered Entities & Business Associates)',
    enforcementDeadline: 'Settlement Precedent',
  },
  {
    id: 'reg-pci-dss-40-2026-08',
    title: 'PCI Security Standards Council (PCI SSC) Reminds Merchants of Full PCI DSS v4.0 Enforcement Deadlines',
    authority: 'PCI-SSC',
    category: 'Identity & Access Mandate',
    publicationDate: 'September 01, 2026',
    timeAgo: '3 weeks ago',
    severity: 'medium',
    executiveSummary:
      'The PCI SSC has issued a final compliance bulletin emphasizing that all future-dated requirements in PCI DSS v4.0.1 become strictly mandatory. Key areas of immediate audit scrutiny include Requirement 8.4.2 (multi-factor authentication for all non-console administrative access into the cardholder data environment) and Requirement 6.4.3 (client-side script integrity verification to prevent Magecart skimming).',
    keyTakeaways: [
      'MFA is now mandatory for every single access attempt into the CDE, irrespective of whether the network is trusted or internal.',
      'E-commerce payment forms must maintain automated script authorization workflows and CSP hash headers.',
      'Targeted risk analysis (TRA) documents must be signed off annually for customized approaches.',
    ],
    affectedFrameworks: ['PCI DSS v4.0.1 Req 8.4.2 / Req 6.4.3', 'SOC 2 CC6.2', 'ISO 27001 A.8.5'],
    affectedControlCodes: ['IAM-01', 'APP-03', 'RISK-02'],
    recommendedAction:
      'Inspect IdP MFA enforcement rules for cloud administrators and review CSP script integrity monitoring on public checkout surfaces.',
    primaryUrl: 'https://www.pcisecuritystandards.org/standards/pci_dss/',
    sources: [
      {
        title: 'PCI SSC Document Library - PCI DSS v4.0.1 Resource Hub',
        uri: 'https://www.pcisecuritystandards.org/standards/pci_dss/',
        sourceAuthority: 'PCI Security Standards Council',
      },
    ],
    complianceImpactScore: 86,
    regulatoryJurisdiction: 'Global Payment Card Ecosystem',
    enforcementDeadline: 'Enforced Compliance',
  },
];

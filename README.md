# suomiGRC — Enterprise Continuous Assurance & Automated GRC Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Status: SOC 2 Ready](https://img.shields.io/badge/SOC%202%20Type%20II-Continuous%20Monitoring-emerald.svg)](#)
[![Theme: Obsidian Shield](https://img.shields.io/badge/Theme-Obsidian%20Tactical%20%2B%20High%20Contrast-cyan.svg)](#)

> **suomiGRC** is an enterprise-grade Governance, Risk, and Compliance (GRC) continuous assurance platform. It unifies automated multi-cloud telemetry collection, continuous controls monitoring, cross-framework compliance mapping, cryptographic evidence vaulting, and auditor workspaces into a high-performance command center.

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [Key Architectural Highlights](#-key-architectural-highlights)
- [Compliance Frameworks Supported](#-compliance-frameworks-supported)
- [Core Modules & Features](#-core-modules--features)
  - [1. Executive Command Center & Recharts Analytics](#1-executive-command-center--recharts-analytics)
  - [2. Multi-Strategy Global Fuzzy Search](#2-multi-strategy-global-fuzzy-search)
  - [3. Role-Based Access Control (RBAC) Engine](#3-role-based-access-control-rbac-engine)
  - [4. Obsidian Tactical & High-Contrast Light Theme](#4-obsidian-tactical--high-contrast-light-theme)
  - [5. Continuous Telemetry & GitOps Auto-Remediation](#5-continuous-telemetry--gitops-auto-remediation)
  - [6. Immutable Cryptographic Evidence Vault (WORM & Merkle Proofs)](#6-immutable-cryptographic-evidence-vault-worm--merkle-proofs)
  - [7. Enterprise Risk Register & Treatment Engine](#7-enterprise-risk-register--treatment-engine)
  - [8. Third-Party Vendor Risk & Questionnaire Automation](#8-third-party-vendor-risk--questionnaire-automation)
  - [9. User Access Reviews (UAR) & Fleet MDM Compliance](#9-user-access-reviews-uar--fleet-mdm-compliance)
  - [10. Auditor Marketplace & Public Trust Center](#10-auditor-marketplace--public-trust-center)
  - [11. RFC-4180 CSV & CPA Evidence Package Exporter](#11-rfc-4180-csv--cpa-evidence-package-exporter)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Development Server](#running-the-development-server)
  - [Production Build](#production-build)
- [Scripts Reference](#-scripts-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Executive Summary

Traditional compliance relies on point-in-time audits, manual screenshots, and fragmented spreadsheets. **suomiGRC** transforms compliance into **real-time code-level continuous assurance**:

1. **Continuous Evidence Stream:** Collects telemetry every 5 minutes across AWS, GCP, Azure, GitHub, Cloudflare, and Okta.
2. **One-to-Many Control Mapping:** Map once to satisfy SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS v4, NIST CSF 2.0, DORA, and NIS2 simultaneously.
3. **Cryptographic Provenance:** Every evidence item and test output is stamped with an immutable SHA-256 Merkle root.
4. **GitOps Auto-Remediation:** Generates instant Terraform and Bash pull requests to fix non-compliant infrastructure automatically.

---

## 🏗 Key Architectural Highlights

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         suomiGRC Obsidian Command Header                    │
│   [Logo]  [Breadcrumbs]  [Global Fuzzy Search]  [Modules]  [Theme]  [RBAC]  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
      ┌────────────────────────────────┼────────────────────────────────┐
      ▼                                ▼                                ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ Continuous Telemetry │    │   Weighted Maturity  │    │   Evidence Vault     │
│ Multi-Cloud Mesh     │    │   Score Index (0-100)│    │   Merkle Root WORM   │
│ AWS · GCP · Okta · GH│    │   35% Impl / 35% Ev  │    │   SHA-256 Hashes     │
└──────────┬───────────┘    └──────────┬───────────┘    └──────────┬───────────┘
           │                           │                           │
           └───────────────────────────┼───────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Historical 6-Month Recharts Trend & Forecast                │
│   April ───► May ───► June ───► July ───► August ───► September (Current)   │
│   (68% ───► 75% ───► 82% ───► 87% ───► 91% ───► 94% Live Readiness)         │
│   Benchmark Reference Line: 85% CPA Assurance Target                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
      ┌────────────────────────────────┼────────────────────────────────┐
      ▼                                ▼                                ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Automated Tests &   │    │  Controls Lifecycle  │    │  Auditor Workspace   │
│  GitOps Remediation  │    │  Draft -> Monitoring │    │  Sampling & Sign-Off │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

---

## 🛡 Compliance Frameworks Supported

| Framework | Version / Standard | Default Controls | Automated Coverage | Target Output |
|:---|:---|:---:|:---:|:---|
| **SOC 2 Type II** | 2024 AICPA Trust Services Criteria | 48 Controls | **96%** | SOC 2 Type II Report |
| **ISO/IEC 27001** | 2022 ISMS Standard (Annex A) | 93 Controls | **93%** | ISO 27001 Certification & SoA |
| **HIPAA** | Security & Privacy Rules (45 CFR § 164) | 42 Controls | **96%** | HIPAA Attestation |
| **GDPR** | EU 2016/679 Data Protection Regulation | 36 Controls | **94%** | DPIA & Records of Processing |
| **PCI DSS** | Version 4.0.1 Compliance Standard | 64 Controls | **91%** | RoC / SAQ-D Attestation |
| **NIST CSF** | Version 2.0 (Govern, Identify, Protect, Detect, Respond, Recover) | 54 Controls | **90%** | NIST Assessment Scorecard |
| **DORA** | Digital Operational Resilience Act (EU 2022/2554) | 40 Controls | **88%** | ICT Risk Management Report |
| **NIS2** | Directive (EU) 2022/2555 Cybersecurity | 38 Controls | **89%** | Critical Infrastructure Audit |

---

## 🚀 Core Modules & Features

### 1. Executive Command Center & Recharts Analytics
- **Continuous Maturity Index:** Weighted calculation combining Control Implementation (35%), Evidence Coverage (35%), and Continuous Test Pass Rate (30%).
- **Interactive Recharts Trend Graph:** 6-month historical trajectory line chart with multi-framework overlays, CPA 85% benchmark reference lines, and interactive milestone tags.
- **Sparkline KPI Tiles:** Live gauges for Unified Readiness, Automated Tests, Cloud Integrations, and Enterprise Risk Exposure.

### 2. Multi-Strategy Global Fuzzy Search
Located in the top command navigation (`⌘K` shortcut):
- **Subsequence Matching with Word-Boundary Bonuses:** Intelligently scores inputs like `mfa` to find *Multi-Factor Authentication*.
- **Typo Tolerance via Damerau-Levenshtein Edit Distance:** Resilient to transposition and spelling errors (e.g., `passowrd` -> `Password Policy`).
- **Entity Scope Filters:** Filter across Controls, Risks, Vendors, Policies, and Automated Tests.
- **Visual Score Highlighting:** Letter-by-letter match highlight badges with direct deep-link navigation.

### 3. Role-Based Access Control (RBAC) Engine
- **CISO / Head of Security:** Full administrative control, SIEM integrations, risk acceptance, and policy approval authority.
- **Compliance Analyst / SecOps:** Remediation code execution, control editing, evidence uploads, and vendor reviews.
- **External CPA Auditor:** Read-only access to evidence vault, PBC sampling workflows, and observation window controls.
- **Interactive Persona Switcher & RBAC Matrix Modal:** Live switching with instant UI access gating and role context banners.

### 4. Obsidian Tactical & High-Contrast Light Theme
- **Obsidian Dark (Default):** Deep tactical command palette (`#070B14`, `#0A0F1D`) with cyan (`#00D2FF`) and Scandinavian blue (`#0052CC`) neon accents.
- **Light / High Contrast Mode:** Specially designed for external auditors and compliance officers during long review sessions, with high contrast text (`#0F172A`), crisp borders (`#E2E8F0`), and clear status chips.
- Persistent state saved to `localStorage` (`suomigrc_theme_preference`).

### 5. Continuous Telemetry & GitOps Auto-Remediation
- 42+ out-of-the-box automated tests running continuous checks against cloud assets.
- One-click **Auto-Remediation Hub**: Generates ready-to-merge Terraform code blocks (`aws_s3_bucket_server_side_encryption_configuration`, `aws_db_instance.multi_az`) and shell scripts.
- Real-time failing asset list with ARNs, resource paths, and detection timestamps.

### 6. Immutable Cryptographic Evidence Vault (WORM & Merkle Proofs)
- Write-Once-Read-Many (WORM) evidence storage architecture.
- SHA-256 Merkle root calculation for tamper-evident auditor verification.
- Zero-Knowledge (ZK) proof sandbox demonstrating cryptographic proof of compliance without exposing underlying sensitive database rows.

### 7. Enterprise Risk Register & Treatment Engine
- 5x5 Inherent and Residual Risk heatmaps.
- Treatment strategies: *Mitigate*, *Accept*, *Transfer*, *Avoid*.
- Direct cross-linking between risk items and mitigating control codes.

### 8. Third-Party Vendor Risk & Questionnaire Automation
- Vendor risk tiering (Tier 1 Critical to Tier 4 Low).
- DPA tracking, SOC 2 report expiration alerts, and questionnaire scoring.
- AI-assisted security questionnaire autofill with evidence source attribution.

### 9. User Access Reviews (UAR) & Fleet MDM Compliance
- Periodic access review campaigns with manager approval flows and auto-revocation.
- Desktop Fleet Hub monitoring FileVault disk encryption, OS updates, and screen lock timeouts.

### 10. Auditor Marketplace & Public Trust Center
- Direct booking platform for top CPA auditor firms (Schellman, A-LIGN, Coalfire, Prescient Security).
- Customer-facing **Public Trust Center** showcasing live compliance badges, SOC 2 status, sub-processors, and NDA-gated security whitepapers.

### 11. RFC-4180 CSV & CPA Evidence Package Exporter
- One-click **Download Report** exporting multi-section compliance posture, maturity breakdowns, and test inventory into CSV format.
- Prepend with UTF-8 BOM (`\uFEFF`) for native compatibility with Microsoft Excel, Apple Numbers, and Google Sheets.
- ZIP evidence pack generation for external auditor handoffs.

---

## 💻 Technology Stack

- **Frontend Core:** React 19, TypeScript, Vite
- **Styling & Layout:** Tailwind CSS v4, PostCSS, Lucide React Icons
- **Data Visualization:** Recharts (Line charts, Responsive containers, Reference lines, Custom tooltips), D3.js (Spatial hierarchies, Radials)
- **Animation & Transitions:** Motion, CSS Keyframes (Live radar sweeps, pulsing dots)
- **Backend / Dev Proxy:** Express, Node.js (`tsx`)
- **Fuzzy Search Algorithm:** Custom Subsequence Matching + Damerau-Levenshtein Distance Engine (`src/utils/fuzzySearch.ts`)

---

## 📐 System Architecture

```
suomiGRC/
├── src/
│   ├── components/                # Modular React UI Components
│   │   ├── Navigation.tsx         # Top Command Header (Zones 1-3)
│   │   ├── Sidebar.tsx            # Docked Tactical Navigation Rail
│   │   ├── DashboardOverview.tsx  # Executive Dashboard & KPI Grid
│   │   ├── ComplianceReadinessTrendChart.tsx # Recharts 6-Month Line Chart
│   │   ├── GlobalSearchBar.tsx    # Fuzzy Search Command Center (⌘K)
│   │   ├── ThemeToggle.tsx        # Obsidian/Light Theme Switcher
│   │   ├── RoleSwitcher.tsx       # RBAC Persona Switcher
│   │   ├── RoleMatrixModal.tsx    # Granular Permissions Matrix
│   │   ├── EvidenceVault.tsx      # WORM Storage & Merkle Hash Verification
│   │   ├── ControlsMonitoring.tsx # Controls Inventory & Lifecycle
│   │   ├── RiskRegister.tsx       # Risk Heatmap & Mitigations
│   │   ├── VendorRisk.tsx         # Third-Party Supply Chain Hub
│   │   ├── PolicyCenter.tsx       # Policy Editor & Employee Attestation
│   │   ├── AuditorWorkspace.tsx   # CPA PBC Sampling & Review Mode
│   │   ├── TrustCenterView.tsx    # Public Trust & Security Badges
│   │   └── ...                    # Additional Enterprise Hubs
│   ├── context/
│   │   ├── RbacContext.tsx        # RBAC Engine & Role State
│   │   └── ThemeContext.tsx       # Persistent Theme Context
│   ├── data/
│   │   ├── mockGrcData.ts         # Core Controls, Frameworks, Tests
│   │   ├── mockEnterpriseData.ts  # UAR, Questionnaires, Fleet Devices
│   │   ├── mockEvidenceData.ts    # Evidence Vault Items & Hashes
│   │   └── navigationStructure.ts # Module Hierarchy & Categorization
│   ├── types/
│   │   ├── grc.ts                 # Core TypeScript Interfaces
│   │   ├── rbac.ts                # Permission Defs & User Roles
│   │   └── ...                    # Domain Models
│   ├── utils/
│   │   ├── fuzzySearch.ts         # Multi-Strategy Fuzzy Engine
│   │   └── webhookDispatcher.ts   # Real-time Alert Dispatcher
│   ├── App.tsx                    # Root Application Shell
│   ├── main.tsx                   # Entry Point & Context Providers
│   └── index.css                  # Global Tailwind Tokens & Obsidian Layers
├── server.ts                      # Express Backend / Dev Proxy
├── vite.config.ts                 # Vite Build Configuration
├── tsconfig.json                  # TypeScript Compiler Options
├── package.json                   # Project Manifest & Dependencies
└── README.md                      # Documentation
```

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js:** `>= 18.0.0` (v20+ recommended)
- **npm:** `>= 9.0.0` or **yarn** / **pnpm**

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-org/suomigrc.git
   cd suomigrc
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example` if needed):

```env
PORT=3000
NODE_ENV=development
```

### Running the Development Server

Start the full-stack development server on port `3000`:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

To produce an optimized production bundle:

```bash
npm run build
```

To preview or run the production build:

```bash
npm start
```

---

## 📜 Scripts Reference

| Command | Description |
|:---|:---|
| `npm run dev` | Starts the Express + Vite development server on port 3000 |
| `npm run build` | Builds TypeScript and bundles optimized static assets |
| `npm run start` | Runs the production Node.js server |
| `npm run preview`| Previews the Vite production build locally |
| `npm run lint` | Runs `tsc --noEmit` to validate types with zero errors |
| `npm run clean` | Cleans previous build artifacts (`dist`, `server.js`) |

---

## 🧪 Testing & Quality Assurance

suomiGRC adheres to strict TypeScript type safety. All pull requests must pass compilation and type checking:

```bash
# Verify TypeScript definitions with zero errors
npm run lint
```

Key validation guarantees:
- ✅ Strict null checks enabled.
- ✅ Zero unused imports or implicit `any` types.
- ✅ Full accessibility compliance with keyboard shortcuts (`⌘K` for global search, `⌘B` for sidebar toggle, `Esc` for modal dismissal).

---

## 🤝 Contributing

Contributions are welcome! Please follow standard GitOps guidelines:

1. **Fork the repository.**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/automated-iso-soa-expansion
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "feat(analytics): add 12-month compliance forecast model"
   ```
4. **Push to your branch:**
   ```bash
   git push origin feature/automated-iso-soa-expansion
   ```
5. **Open a Pull Request** describing your changes and testing steps.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full details.

---

<p align="center">
  <strong>suomiGRC</strong> • Next-Generation Continuous Assurance & Automated GRC Platform<br/>
  <em>Built for CISOs, SecOps Engineers, and External Auditors.</em>
</p>

# Contributing to MoneeHunt

First off, thank you for considering contributing to **MoneeHunt**! MoneeHunt is building open-source, trustless escrow infrastructure for the Stellar economy powered by Soroban smart contracts.

Whether you're fixing a bug in a Soroban WASM contract, improving frontend UX, optimizing gas efficiency, or writing documentation, your contributions are welcome.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Recommended Open-Source Workflow](#recommended-open-source-workflow)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
- [Development & Testing Guidelines](#development--testing-guidelines)
  - [Smart Contracts (Soroban / Rust)](#1-smart-contracts-soroban--rust)
  - [Frontend (React / TypeScript / Vite)](#2-frontend-react--typescript--vite)
- [Commit Message Protocol](#commit-message-protocol)
- [Pull Request Protocol (The Pro Way)](#pull-request-protocol-the-pro-way)
- [Security Disclosure](#security-disclosure)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and respectful environment for all contributors. Please adhere to basic standards of professional etiquette and constructive code reviews.

---

## Recommended Open-Source Workflow

MoneeHunt uses the **GitHub Fork & Pull Request Workflow** (GitHub Flow) backed by automated CI status checks.

```
┌─────────────────┐        ┌──────────────────┐        ┌───────────────────┐
│  Fork Repository │ ─────> │ Create Feature   │ ─────> │ Local Dev & Tests │
│  on GitHub      │        │ Branch           │        │ (cargo/npm test)  │
└─────────────────┘        └──────────────────┘        └─────────┬─────────┘
                                                                 │
┌─────────────────┐        ┌──────────────────┐                  │
│ Merge into      │ <───── │ Code Review &    │ <────────────────┘
│ main            │        │ Automated CI     │  Push to Fork &
└─────────────────┘        └──────────────────┘  Open Pull Request
```

### 1. Branch Naming Structure
Always create short, descriptive branch names prefixed by category:
- `feat/description` — New features or components (e.g., `feat/batch-payroll-csv`)
- `fix/description` — Bug fixes (e.g., `fix/soroban-ttl-archival`)
- `docs/description` — Documentation improvements (e.g., `docs/api-spec`)
- `refactor/description` — Code improvements without behavior changes
- `test/description` — Adding or updating test suites

---

## Getting Started

### Prerequisites
- **Rust & Cargo** (latest stable toolchain with `wasm32-unknown-unknown` target)
- **Stellar CLI** (`cargo install --locked stellar-cli`)
- **Node.js** v18+ & **npm**
- **Freighter Wallet** extension (for testing wallet interactions)

### Local Setup

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/moneehunt.git
   cd moneehunt
   ```
3. **Add Upstream Remote**:
   ```bash
   git remote add upstream https://github.com/nodeblocteam/moneehunt.git
   git fetch upstream
   ```

---

## Development & Testing Guidelines

### 1. Smart Contracts (Soroban / Rust)

Contracts are located in `/contracts`.

```bash
# Build contracts to WASM
cd contracts/milestone-escrow && stellar contract build
cd ../product-escrow && stellar contract build
cd ../batch-payroll && stellar contract build

# Run unit tests
cargo test
```

**Contract Rules:**
- Ensure all public functions are documented.
- Protect state variables with appropriate storage TTL management.
- Test edge cases: insufficient balances, unauthorized calls, reentrancy risk, and invalid milestone transitions.

### 2. Frontend (React / TypeScript / Vite)

Frontend code lives in `/frontend`.

```bash
cd frontend
npm install

# Start local dev server
npm run dev

# Run linter & typecheck
npm run lint
npm run build
```

**Frontend Rules:**
- Strict TypeScript typing (avoid `any` where possible).
- Align with the existing **Glassmorphism Design System** (gold `#E6AA3A`, cyan `#00F2FE`, emerald `#10B981` palette).
- Ensure all interactive elements handle wallet connected/disconnected states cleanly.

---

## Commit Message Protocol

We enforce **Conventional Commits** to keep git history clean, searchable, and automated-release friendly.

### Structure
```
<type>(<scope>): <short description in present imperative>

[optional detailed body explaining WHY, not just WHAT]

[optional issue reference, e.g., Closes #42]
```

### Allowed Types
| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(frontend): add CSV upload to payroll dashboard` |
| `fix` | Bug fix | `fix(contract): prevent duplicate milestone approval` |
| `docs` | Documentation | `docs: update deployment CLI guide` |
| `refactor`| Code change that neither fixes a bug nor adds a feature | `refactor(context): streamline Stellar wallet connection` |
| `test` | Adding missing tests | `test(payroll): add snapshot tests for batch disbursement` |
| `chore` | Maintenance tasks | `chore(deps): upgrade stellar-sdk to latest` |

---

## Pull Request Protocol (The Pro Way)

To ensure your Pull Request is reviewed quickly and merged smoothly:

1. **Keep PRs Atomic & Focused**: One feature or bug fix per PR. Avoid bundling unrelated refactors.
2. **Sync with Upstream**: Always rebase on `upstream/main` before opening a PR:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
3. **Verify Locally Before Opening**:
   - [x] `cargo test` passes in `/contracts`
   - [x] `npm run build` & `npm run lint` pass in `/frontend`
   - [x] No untracked build artifacts or scratch files checked in
4. **Write a Comprehensive PR Description**:
   - **Summary**: High-level explanation of the change.
   - **Motivation**: Problem being solved or feature enabled.
   - **Changes**: List of modified modules.
   - **Verification**: Commands executed and screenshot/recording if UI changes were made.
5. **Respond to Code Review**: Be open to feedback. Push review fix commits directly to your feature branch; GitHub will update the PR automatically.

---

## Security Disclosure

Smart contract security is paramount in decentralized escrow systems.

- **Do NOT open a public GitHub issue** for suspected security vulnerabilities or exploit vectors.
- Please email security findings confidentially to **security@moneehunt.io** or reach out via our security contacts.
- We acknowledge and reward responsible disclosures!

---

<div align="center">

**Building trustless commerce together on Stellar.**

</div>

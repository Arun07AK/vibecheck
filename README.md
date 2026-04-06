# VibeCheck

**AI-Powered Code Auditor for Vibe-Coded Apps**

Scan. Simulate. Learn. Fix.

VibeCheck is a security audit platform that scans AI-generated codebases for vulnerabilities, simulates real user attacks using an AI-driven browser, and generates actionable fix prompts.

## Problem

AI writes 80% of new code. 24.7% of it has security flaws. 19.7% of AI-suggested packages don't even exist on npm. Tools like Cursor and Copilot let anyone build apps in minutes — but nobody's checking if that code is safe to ship.

## What VibeCheck Does

1. **4 Static Scanners** — Secrets (20+ patterns), Dependencies (OSV.dev CVEs + hallucinated packages), PII (email, phone, Aadhaar, SSN), Code Smells (eval, empty catch, XSS, SQL injection)
2. **AI Simulation** — Playwright MCP gives Claude Sonnet 4.6 direct browser control (21 tools). The AI navigates the app, types XSS payloads, clicks buttons, and verifies vulnerabilities in real-time.
3. **Scoring** — 0-100 score with letter grade (A+ to F) and verdict (GO / WARNING / NO-GO)
4. **5 AI Agents** — Security, UX, Performance, Scalability, Production Readiness — each generates copy-paste fix prompts
5. **Knowledge Base** — Learns from every scan. 34 repos scanned, 50 patterns, 11,540+ issues tracked.
6. **GitHub Action** — Auto-generated CI config. One file, every commit audited.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Vite, Lucide Icons |
| Backend | Node.js, Express |
| AI Simulation | Playwright MCP, Claude Sonnet 4.6 (Anthropic API) |
| AI Agents | Claude Sonnet 4.6 |
| Database | SQLite (better-sqlite3) |
| CVE Data | OSV.dev API |
| CI/CD | GitHub Actions |

## Setup

```bash
# Install
cd server && npm install && cd ../client && npm install && cd ..

# Run (requires ANTHROPIC_API_KEY for AI features)
ANTHROPIC_API_KEY=your-key npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

> **Note:** The AI Simulation and AI Agents features require your own Anthropic API key. The static scanners (secrets, dependencies, PII, code smells), scoring, and knowledge base work without it. Get a key at [console.anthropic.com](https://console.anthropic.com).

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scan` | POST | Scan GitHub repo |
| `/api/scan-local` | POST | Scan local directory |
| `/api/scan/:id` | GET | Load saved scan |
| `/api/scan/:id/files` | GET | Heatmap file data |
| `/api/agents/analyze` | POST | Run 5 AI agents |
| `/api/badge/:id` | GET | SVG badge |
| `/api/history` | GET | Past scans |
| `/api/patterns` | GET | Knowledge base |
| `/api/health` | GET | Health check |

## What Makes Us Different

| Feature | SonarQube | Snyk | ESLint | VibeCheck |
|---------|-----------|------|--------|-----------|
| Static scanning | Yes | Yes | Yes | Yes |
| Runtime simulation | No | No | No | Yes — AI drives a real browser |
| AI-guided testing | No | No | No | Yes — Claude Sonnet 4.6 via MCP |
| Knowledge base | No | No | No | Yes — learns from every scan |
| Fix generation | No | Partial | No | Yes — 5 AI agents |
| CI/CD integration | Yes | Yes | Yes | Yes — auto-generated GitHub Action |
| Hallucinated package detection | No | No | No | Yes |

## Team

**Pipped Pipers** — Eclipse 6.0, ACM Thapar Student Chapter

Arun AK | Dev Ariwala | Yash Jag | Abhijay | Adaa

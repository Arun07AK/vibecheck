# VibeCheck — Pitch Deck Content

**Team:** Pipped Pipers | **Eclipse 6.0, ACM Thapar**
**Members:** Arun AK, Dev Ariwala, Yash Jag, Abhijay, Adaa

---

## SLIDE 1 — Title

**VibeCheck**
*Lighthouse for Vibe-Coded Apps*

AI-Powered Code Auditor | Scan. Simulate. Learn. Fix.

Team: Pipped Pipers
Eclipse 6.0 | ACM Thapar Student Chapter

---

## SLIDE 2 — The Problem

**AI writes 80% of new code. But who's checking it?**

- 24.7% of AI-generated code has security flaws
- AI code has 1.5–2.7x more vulnerabilities than human code
- 19.7% of AI-suggested packages don't even exist on npm (slopsquatting)
- No tool combines scanning + runtime simulation + learning + fix generation

*Cursor, Copilot, and ChatGPT let anyone build apps. Nobody's checking if they're safe.*

---

## SLIDE 3 — The Solution

**VibeCheck — AI auditing AI-generated code**

Paste a GitHub URL → We scan, simulate, score, and fix.

Four layers of analysis:
1. **Static Scanning** — 4 scanners running in parallel
2. **AI Simulation** — Playwright MCP + Claude Sonnet 4.6 attacking the running app
3. **Knowledge Base** — learns from every scan, gets smarter over time
4. **Fix Generation** — 5 AI agents generate copy-paste fix prompts

---

## SLIDE 4 — How It Works

**The VibeCheck Pipeline**

```
Input (GitHub URL or local path)
  → Clone repo
  → Run 4 scanners in parallel
     ├── Secrets (20+ regex patterns: AWS, Stripe, OpenAI, JWT...)
     ├── Dependencies (OSV.dev CVEs + hallucinated package detection)
     ├── PII (email, phone, Aadhaar, SSN, credit cards, console.log)
     └── Code Smells (eval, empty catch, XSS, SQL injection, CORS)
  → AI Simulation (Playwright MCP + Claude Sonnet 4.6)
     └── Boots the app → AI navigates, types payloads, clicks buttons
     └── Catches runtime crashes, XSS, exposed APIs
  → Calculate Score (0-100) → Grade (A+ to F) → Verdict (GO / WARNING / NO-GO)
  → Store in Knowledge Base (patterns + frequency)
  → 5 AI Agents generate copy-paste fix prompts
```

---

## SLIDE 5 — The 4 Static Scanners

| Scanner | What It Catches | Patterns |
|---------|----------------|----------|
| **Secrets** | API keys, passwords, tokens, database URLs | 20+ regex patterns |
| **Dependencies** | Known CVEs (OSV.dev API) + hallucinated npm packages | Real-time vulnerability DB |
| **PII** | Emails, phone numbers, Aadhaar, SSN, credit cards | 6 PII patterns |
| **Code Smells** | eval(), empty catch, innerHTML XSS, SQL injection, hardcoded localhost | 10 code patterns |

All 4 run in parallel — scan completes in under 5 seconds.

---

## SLIDE 6 — AI Simulation (The Differentiator)

**We don't just read code. We RUN the app and try to break it.**

- Playwright MCP gives Claude Sonnet 4.6 **direct browser control**
- 21 browser tools: navigate, click, fill, snapshot, evaluate, console_messages
- Claude gets the **accessibility tree** (not screenshots) — knows every element
- Tests XSS payloads, SQL injection, exposed APIs, empty form submissions
- Catches **real runtime errors** — crashes, undefined variables, unhandled exceptions

**Result:** Claude typed `<script>alert('XSS')</script>`, clicked submit, and alert() fired. XSS confirmed by the AI — not a guess, a verified exploit.

*SonarQube reads code. Snyk reads code. VibeCheck RUNS the app.*

---

## SLIDE 7 — Scoring & Grading

**Vibe-to-Value Score: 0–100**

| Score | Grade | Verdict | Meaning |
|-------|-------|---------|---------|
| 70-100 | A+ to C- | **GO** (green) | Safe to ship |
| 40-69 | D to E | **WARNING** (yellow) | Proceed with caution |
| 0-39 | F | **NO-GO** (red) | Don't deploy |

Deductions: CRITICAL -15, HIGH -8, MEDIUM -3, LOW -1

**Achievement Badges:** Secret Keeper, Eval Explorer, Dependency Hell, PII Leaker, Silent Catcher, XSS Risk, Clean Room, Fort Knox, Flawless

---

## SLIDE 8 — Knowledge Base (Learning Loop)

**Every scan makes VibeCheck smarter.**

- 34 repos scanned
- 50 unique patterns learned
- 11,540 total issues found

**Top AI Mistakes:**
1. Email Address exposure — 4,335x
2. Phone Number exposure — 3,989x
3. Console.log in Production — 1,196x
4. Hardcoded localhost — 350x
5. Hardcoded IP Address — 244x

*The more repos we scan, the better we get at predicting what AI gets wrong.*

---

## SLIDE 9 — 5 AI Agents (Fix Generation)

**We don't just find problems — we fix them.**

| Agent | Domain | Output |
|-------|--------|--------|
| Security Auditor | Auth, secrets, OWASP | Copy-paste security fix prompt |
| UX Reviewer | Error handling, forms, a11y | Copy-paste UX fix prompt |
| Performance Analyst | Async I/O, caching, bundles | Copy-paste perf fix prompt |
| Scalability Architect | Stateless design, DB, config | Copy-paste scale fix prompt |
| Production Readiness | Env vars, health checks, CI/CD | Copy-paste deploy fix prompt |

Each agent generates a prompt you paste into Cursor/Copilot → AI fixes its own mistakes.

---

## SLIDE 10 — GitHub Action (CI/CD Integration)

**One file. Every commit protected.**

- VibeCheck generates a `.github/workflows/vibecheck.yml`
- Drop it in any repo → every push is auto-audited
- Score below 40 → CI fails → bad code can't merge

**Already tested:** Ran on a real GitHub repo. Push failed because VibeCheck caught 8 vulnerabilities.

*VibeCheck isn't just a website. It's a CI pipeline.*

---

## SLIDE 11 — Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Vite, Chart.js, Lucide Icons |
| Backend | Node.js, Express |
| AI Simulation | Playwright MCP, Claude Sonnet 4.6 (Anthropic API) |
| AI Agents | Claude Sonnet 4.6 via Anthropic API |
| Database | SQLite (better-sqlite3) |
| CVE Data | OSV.dev API (real-time) |
| CI/CD | GitHub Actions (auto-generated YAML) |
| Design | Apple Liquid Glass (monochrome, translucent) |

---

## SLIDE 12 — Demo Results

**Broken App (vibe-coded todo app):**
- Score: 1/100 — F — NO-GO
- 16 issues: leaked Stripe key, eval(), empty catch, XSS, PII
- AI simulation: XSS confirmed, alert() fired, exposed API found
- 5 badges: Secret Keeper, Eval Explorer, PII Leaker, Silent Catcher, XSS Risk

**Clean App (well-built todo app):**
- Score: 92/100 — A- — GO
- 4 minor issues (console.log, input validation pattern)
- AI simulation: no runtime errors, app stable
- 2 badges: Clean Room, Fort Knox

---

## SLIDE 13 — What Makes Us Different

| Feature | SonarQube | Snyk | ESLint | **VibeCheck** |
|---------|-----------|------|--------|-------------|
| Static scanning | Yes | Yes | Yes | **Yes** |
| Runtime simulation | No | No | No | **Yes — AI drives a real browser** |
| AI-guided testing | No | No | No | **Yes — Claude Sonnet 4.6 via MCP** |
| Knowledge base | No | No | No | **Yes — learns from every scan** |
| Fix generation | No | Partial | No | **Yes — 5 AI agents, copy-paste prompts** |
| CI/CD integration | Yes | Yes | Yes | **Yes — auto-generated GitHub Action** |
| Hallucinated package detection | No | No | No | **Yes** |

---

## SLIDE 14 — Social Impact

**Who benefits from VibeCheck?**

- **Student developers** — learning to code with AI, don't know security basics
- **Startup founders** — shipping fast with Cursor/Copilot, need safety checks
- **Open source maintainers** — accepting AI-generated PRs, need automated auditing
- **Enterprise teams** — adopting AI coding tools, need governance

*AI-generated code is everywhere. VibeCheck ensures it doesn't ship with your users' data exposed.*

---

## SLIDE 15 — Future Roadmap

- VS Code extension for inline scanning
- npm package: `npx vibecheck` CLI
- GitHub PR comment bot (auto-post scan results)
- PDF report export (Lighthouse-style)
- Team dashboard with scan history
- Hosted version (SaaS)

---

## SLIDE 16 — Thank You

**VibeCheck**
*Scan. Simulate. Learn. Fix.*

**Team Pipped Pipers:**
Arun AK | Dev Ariwala | Yash Jag | Abhijay | Adaa

GitHub: github.com/Arun07AK/vibecheck

*AI-generated code deserves AI-powered auditing.*

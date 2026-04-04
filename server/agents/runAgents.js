const fs = require('fs');
const path = require('path');

let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch { Anthropic = null; }

const AGENTS = [
  {
    name: 'Security Auditor',
    icon: '🛡️',
    domain: 'security',
    prompt: (context) => `You are a senior security engineer auditing a vibe-coded (AI-generated) codebase.

SCAN RESULTS:
${context.issuesSummary}

SOURCE FILES:
${context.fileList}

Analyze the security posture of this project. Focus on:
1. Authentication & authorization flaws
2. Input validation gaps
3. Secrets management
4. Dependency vulnerabilities
5. OWASP Top 10 risks

Generate a COPY-PASTE PROMPT that the developer can give to their AI coding assistant (Cursor, Copilot, etc.) to fix all security issues. The prompt should be specific, actionable, and reference exact files.

Format:
## Security Assessment
[2-3 sentence summary]

## Risk Level: [CRITICAL/HIGH/MEDIUM/LOW]

## Copy-Paste Fix Prompt
\`\`\`
[The prompt the developer should paste into their AI assistant]
\`\`\`

## Top 3 Priorities
1. ...
2. ...
3. ...`,
  },
  {
    name: 'UX Reviewer',
    icon: '🎨',
    domain: 'ux',
    prompt: (context) => `You are a UX expert reviewing a vibe-coded web application.

PROJECT FILES:
${context.fileList}

CODE SMELLS FOUND:
${context.issuesSummary}

Analyze the UX quality. Focus on:
1. Error handling UX (empty catch blocks = silent failures for users)
2. Loading states and feedback
3. Form validation and user guidance
4. Accessibility basics (semantic HTML, labels, ARIA)
5. Mobile responsiveness indicators

Generate a COPY-PASTE PROMPT for the developer's AI assistant to fix UX issues.

Format:
## UX Assessment
[2-3 sentence summary]

## Copy-Paste Fix Prompt
\`\`\`
[The prompt]
\`\`\`

## Top 3 UX Fixes
1. ...
2. ...
3. ...`,
  },
  {
    name: 'Performance Analyst',
    icon: '⚡',
    domain: 'performance',
    prompt: (context) => `You are a performance engineer analyzing a vibe-coded codebase.

PROJECT FILES:
${context.fileList}

ISSUES FOUND:
${context.issuesSummary}

Analyze performance. Focus on:
1. Synchronous I/O in server code (blocking event loop)
2. Missing caching strategies
3. N+1 query patterns
4. Large bundle / unnecessary dependencies
5. Missing compression, lazy loading

Generate a COPY-PASTE PROMPT for the developer's AI assistant.

Format:
## Performance Assessment
[2-3 sentence summary]

## Copy-Paste Fix Prompt
\`\`\`
[The prompt]
\`\`\`

## Top 3 Performance Wins
1. ...
2. ...
3. ...`,
  },
  {
    name: 'Scalability Architect',
    icon: '📐',
    domain: 'scalability',
    prompt: (context) => `You are a systems architect reviewing a vibe-coded app for scalability.

PROJECT FILES:
${context.fileList}

ISSUES FOUND:
${context.issuesSummary}

Analyze scalability. Focus on:
1. Stateless design (or lack thereof)
2. Database design and query patterns
3. API design and rate limiting
4. Hardcoded configurations (localhost, file paths)
5. Horizontal scaling readiness

Generate a COPY-PASTE PROMPT for the developer's AI assistant.

Format:
## Scalability Assessment
[2-3 sentence summary]

## Copy-Paste Fix Prompt
\`\`\`
[The prompt]
\`\`\`

## Top 3 Scalability Improvements
1. ...
2. ...
3. ...`,
  },
  {
    name: 'Production Readiness',
    icon: '🚀',
    domain: 'production',
    prompt: (context) => `You are a DevOps/SRE engineer assessing production readiness of a vibe-coded app.

PROJECT FILES:
${context.fileList}

ISSUES FOUND:
${context.issuesSummary}

Assess production readiness. Focus on:
1. Environment configuration (hardcoded values, missing .env)
2. Error handling and logging
3. Health checks and monitoring hooks
4. CI/CD readiness
5. Docker/deployment configuration
6. Security headers and CORS

Generate a COPY-PASTE PROMPT for the developer's AI assistant.

Format:
## Production Readiness Assessment
[2-3 sentence summary]

## Readiness Level: [NOT READY / NEEDS WORK / ALMOST READY / READY]

## Copy-Paste Fix Prompt
\`\`\`
[The prompt]
\`\`\`

## Pre-Launch Checklist
- [ ] ...
- [ ] ...
- [ ] ...`,
  },
];

function getFileList(repoPath) {
  const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv']);
  const files = [];
  function walk(dir, depth = 0) {
    if (depth > 4) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (SKIP.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        const rel = path.relative(repoPath, full);
        if (entry.isDirectory()) { files.push(rel + '/'); walk(full, depth + 1); }
        else files.push(rel);
      }
    } catch {}
  }
  walk(repoPath);
  return files.slice(0, 50).join('\n');
}

function buildContext(repoPath, scanResults) {
  const fileList = getFileList(repoPath);
  const issuesSummary = (scanResults.issues || [])
    .map(i => `[${i.severity}] ${i.title} — ${i.filePath || 'N/A'}:${i.lineNumber || '?'} — ${i.description}`)
    .join('\n');
  return { fileList, issuesSummary };
}

function generateTemplateFix(agent, context) {
  const templates = {
    security: `## Security Assessment\nMultiple security issues detected including exposed secrets and code injection risks.\n\n## Risk Level: HIGH\n\n## Copy-Paste Fix Prompt\n\`\`\`\nReview my codebase for security issues. Specifically:\n1. Move all hardcoded secrets to environment variables\n2. Add input validation on all user-facing endpoints\n3. Replace eval() with safe alternatives\n4. Add proper CORS configuration\n5. Sanitize all innerHTML assignments\n\`\`\`\n\n## Top 3 Priorities\n1. Remove hardcoded API keys and passwords immediately\n2. Fix SQL injection and XSS vulnerabilities\n3. Add input validation on all endpoints`,
    ux: `## UX Assessment\nThe app has silent failure modes and missing error feedback due to empty catch blocks and unhandled errors.\n\n## Copy-Paste Fix Prompt\n\`\`\`\nImprove error handling UX in my app:\n1. Replace all empty catch blocks with user-friendly error messages\n2. Add loading states to all async operations\n3. Add form validation with clear error messages\n4. Add a global error boundary component\n\`\`\`\n\n## Top 3 UX Fixes\n1. Show error messages instead of silent failures\n2. Add loading spinners during API calls\n3. Add input validation with inline feedback`,
    performance: `## Performance Assessment\nSynchronous I/O and console.log statements will degrade performance under load.\n\n## Copy-Paste Fix Prompt\n\`\`\`\nOptimize my app's performance:\n1. Replace all readFileSync/writeFileSync with async versions\n2. Remove console.log statements or replace with a logger\n3. Add response caching for repeated queries\n4. Implement connection pooling for database\n\`\`\`\n\n## Top 3 Performance Wins\n1. Switch to async file I/O\n2. Add caching layer\n3. Remove excessive logging`,
    scalability: `## Scalability Assessment\nHardcoded localhost URLs and lack of configuration management prevent deployment scaling.\n\n## Copy-Paste Fix Prompt\n\`\`\`\nMake my app scalable:\n1. Replace all hardcoded URLs with environment variables\n2. Add a configuration management system\n3. Make the app stateless (no in-memory state)\n4. Add database connection pooling\n\`\`\`\n\n## Top 3 Scalability Improvements\n1. Externalize all configuration\n2. Remove hardcoded URLs\n3. Add horizontal scaling support`,
    production: `## Production Readiness Assessment\nThe app is not production-ready due to exposed secrets, missing error handling, and hardcoded configuration.\n\n## Readiness Level: NOT READY\n\n## Copy-Paste Fix Prompt\n\`\`\`\nPrepare my app for production:\n1. Move all secrets to environment variables\n2. Add proper error handling and logging\n3. Add a health check endpoint\n4. Configure security headers (helmet)\n5. Set up proper CORS\n6. Add a Dockerfile\n\`\`\`\n\n## Pre-Launch Checklist\n- [ ] All secrets in env vars\n- [ ] Error handling on all routes\n- [ ] Health check endpoint\n- [ ] Security headers configured\n- [ ] CORS restricted to known origins`,
  };
  return templates[agent.domain] || 'Analysis not available.';
}

async function runAgents(repoPath, scanResults) {
  const context = buildContext(repoPath, scanResults);
  const useAI = process.env.ANTHROPIC_API_KEY && Anthropic;

  if (!useAI) {
    return AGENTS.map(agent => ({
      name: agent.name,
      icon: agent.icon,
      domain: agent.domain,
      analysis: generateTemplateFix(agent, context),
      mode: 'template',
    }));
  }

  const client = new Anthropic();

  const results = await Promise.all(
    AGENTS.map(async (agent) => {
      try {
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: agent.prompt(context) }],
        });
        return {
          name: agent.name,
          icon: agent.icon,
          domain: agent.domain,
          analysis: response.content[0].text,
          mode: 'ai',
        };
      } catch (err) {
        return {
          name: agent.name,
          icon: agent.icon,
          domain: agent.domain,
          analysis: generateTemplateFix(agent, context),
          mode: 'fallback',
        };
      }
    })
  );

  return results;
}

module.exports = { runAgents };

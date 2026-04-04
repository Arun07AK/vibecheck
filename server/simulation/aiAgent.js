const puppeteer = require('puppeteer');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch { Anthropic = null; }

// --- App startup helpers ---

function detectStartCommand(repoPath) {
  const pkgPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.main && fs.existsSync(path.join(repoPath, pkg.main)))
        return { cmd: 'node', args: [pkg.main], cwd: repoPath };
      for (const f of ['server.js', 'index.js', 'app.js', 'src/index.js', 'src/server.js']) {
        if (fs.existsSync(path.join(repoPath, f)))
          return { cmd: 'node', args: [f], cwd: repoPath };
      }
      if (pkg.scripts?.start) return { cmd: 'npm', args: ['start'], cwd: repoPath };
      if (pkg.scripts?.dev) return { cmd: 'npm', args: ['run', 'dev'], cwd: repoPath };
    } catch {}
  }
  if (fs.existsSync(path.join(repoPath, 'app.py')))
    return { cmd: 'python3', args: ['app.py'], cwd: repoPath };
  return null;
}

function installDeps(repoPath) {
  if (fs.existsSync(path.join(repoPath, 'package.json')) && !fs.existsSync(path.join(repoPath, 'node_modules'))) {
    try {
      execSync('npm install --production --no-audit --no-fund', { cwd: repoPath, timeout: 30000, stdio: 'pipe' });
    } catch {}
  }
}

function waitForPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}/`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`App did not respond on port ${port} within ${timeoutMs}ms`));
        else setTimeout(check, 500);
      });
      req.setTimeout(2000, () => req.destroy());
    };
    check();
  });
}

function startApp(repoPath) {
  return new Promise(async (resolve, reject) => {
    const startInfo = detectStartCommand(repoPath);
    if (!startInfo) return reject(new Error('Cannot detect how to start the app'));
    installDeps(repoPath);

    const port = 4000 + Math.floor(Math.random() * 1000);
    const env = { ...process.env, PORT: String(port) };
    const proc = spawn(startInfo.cmd, startInfo.args, { cwd: startInfo.cwd, env, stdio: 'pipe' });

    let errOutput = '';
    proc.stderr.on('data', (d) => { errOutput += d.toString(); });
    proc.stdout.on('data', () => {});
    proc.on('error', (err) => reject(err));
    proc.on('exit', (code) => {
      if (code !== null && code !== 0) reject(new Error(`App exited with code ${code}: ${errOutput.slice(0, 200)}`));
    });

    try {
      await waitForPort(port, 15000);
      resolve({ proc, port });
    } catch (err) {
      proc.kill('SIGTERM');
      reject(err);
    }
  });
}

// --- Scripted simulation ---

async function runScriptedSimulation(page, baseUrl) {
  const log = [];

  // Step 1: Explore the homepage
  log.push({ step: 1, action: 'navigate', detail: 'Opened the app homepage', finding: null });

  // Step 2: Find and catalog interactive elements
  const inputs = await page.$$('input, textarea, select');
  const buttons = await page.$$('button, input[type="submit"]');
  const links = await page.$$('a[href]');
  log.push({
    step: 2, action: 'inspect',
    detail: `Found ${inputs.length} input fields, ${buttons.length} buttons, ${links.length} links`,
    finding: null,
  });

  // Step 3: XSS test — type payload into first input and submit
  const xssPayload = '<script>alert("xss")</script>';
  const firstInput = await page.$('input[type="text"], input:not([type]), textarea');
  if (firstInput) {
    await firstInput.type(xssPayload);
    log.push({ step: 3, action: 'type', detail: `Typed XSS payload into input field: ${xssPayload}`, finding: null });

    // Try to submit
    const submitBtn = await page.$('button[type="submit"], button, input[type="submit"]');
    if (submitBtn) {
      await submitBtn.click().catch(() => {});
      await new Promise(r => setTimeout(r, 1500));
      log.push({ step: 4, action: 'click', detail: 'Clicked submit button', finding: null });
    }

    // Check if XSS payload appears unescaped in the DOM
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    if (bodyHtml.includes(xssPayload)) {
      log.push({
        step: 5, action: 'finding',
        detail: 'XSS payload was reflected unescaped in the page DOM — Cross-Site Scripting vulnerability confirmed',
        finding: { severity: 'CRITICAL', title: 'XSS Vulnerability — Reflected Script Injection' },
      });
    }
  } else {
    log.push({ step: 3, action: 'skip', detail: 'No text input fields found to test XSS', finding: null });
  }

  // Step 5: SQL injection test
  const sqlPayload = "' OR 1=1 --";
  const sqlInput = await page.$('input[type="text"], input:not([type])');
  if (sqlInput) {
    await sqlInput.click({ clickCount: 3 }).catch(() => {});
    await sqlInput.type(sqlPayload);
    const submitBtn = await page.$('button[type="submit"], button');
    if (submitBtn) {
      await submitBtn.click().catch(() => {});
      await new Promise(r => setTimeout(r, 1000));
    }
    log.push({ step: 6, action: 'type', detail: `Typed SQL injection payload: ${sqlPayload}`, finding: null });
  }

  // Step 6: Click through all buttons to trigger errors
  const allButtons = await page.$$('button, a');
  let clickCount = 0;
  for (const btn of allButtons.slice(0, 5)) {
    try {
      await btn.click();
      clickCount++;
      await new Promise(r => setTimeout(r, 500));
    } catch {}
  }
  if (clickCount > 0) {
    log.push({ step: 7, action: 'click', detail: `Clicked ${clickCount} interactive elements looking for crashes`, finding: null });
  }

  // Step 7: Try navigating to API endpoints (only flag 500s, not 404s)
  for (const route of ['/api', '/api/users', '/api/admin']) {
    try {
      const resp = await page.goto(baseUrl + route, { waitUntil: 'domcontentloaded', timeout: 5000 });
      const status = resp?.status() || 0;
      if (status >= 500) {
        log.push({
          step: log.length + 1, action: 'finding',
          detail: `Server error (HTTP ${status}) at ${route} — unhandled exception`,
          finding: { severity: 'HIGH', title: `Server Error ${status} at ${route}` },
        });
      }
    } catch {}
  }

  // Navigate back to homepage for final state check
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});

  return log;
}

// --- AI-guided simulation ---

async function runAISimulation(page, baseUrl) {
  const client = new Anthropic();
  const log = [];
  const pastActions = [];

  log.push({ step: 1, action: 'navigate', detail: 'Opened the app homepage', finding: null });

  for (let step = 2; step <= 5; step++) {
    try {
      const screenshot = await page.screenshot({ encoding: 'base64', fullPage: false, timeout: 15000 });
      const currentUrl = page.url();
      const historyStr = pastActions.length > 0
        ? `\n\nACTIONS ALREADY TAKEN (do NOT repeat these):\n${pastActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
        : '';

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshot } },
            {
              type: 'text',
              text: `You are a QA security tester. URL: ${currentUrl}${historyStr}

Do something DIFFERENT from what you've already done. Pick ONE action and reply with ONLY JSON:

{"action":"click","selector":"CSS","why":"reason"}
{"action":"type","selector":"CSS","value":"payload","why":"reason"}
{"action":"goto","path":"/route","why":"reason"}
{"action":"done","summary":"what you found"}

Test ideas: XSS payloads, SQL injection, empty form submission, clicking delete buttons, navigating to /api endpoints visible in the UI, testing edge cases. Each step must be DIFFERENT.`
            }
          ]
        }]
      });

      const text = response.content[0].text;
      let action;
      try {
        // More robust JSON extraction
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0];
        action = JSON.parse(jsonStr);
      } catch {
        continue;
      }

      if (action.action === 'done') {
        log.push({ step, action: 'done', detail: action.summary || 'AI finished testing', finding: null });
        break;
      }

      const why = action.why || '';

      if (action.action === 'click') {
        const el = await page.$(action.selector);
        if (el) {
          await el.click().catch(() => {});
          const desc = `Clicked ${action.selector}${why ? ' — ' + why : ''}`;
          log.push({ step, action: 'click', detail: desc, finding: null });
          pastActions.push(desc);
        }
      } else if (action.action === 'type') {
        const el = await page.$(action.selector);
        if (el) {
          await el.click({ clickCount: 3 }).catch(() => {});
          await el.type(action.value || '');
          const desc = `Typed "${(action.value || '').slice(0, 50)}" into ${action.selector}${why ? ' — ' + why : ''}`;
          log.push({ step, action: 'type', detail: desc, finding: null });
          pastActions.push(desc);

          // After typing, try to submit
          const btn = await page.$('button[type="submit"], button');
          if (btn) await btn.click().catch(() => {});
        }
      } else if (action.action === 'goto') {
        const targetUrl = action.path?.startsWith('http') ? action.path : baseUrl + (action.path || '/');
        const resp = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null);
        const status = resp?.status() || 0;
        const navDesc = `Navigated to ${action.path}${why ? ' — ' + why : ''} (HTTP ${status})`;
        log.push({ step, action: 'navigate', detail: navDesc, finding: null });
        pastActions.push(navDesc);
        if (status >= 500) {
          log.push({
            step, action: 'finding',
            detail: `Server crashed with HTTP ${status} at ${action.path}`,
            finding: { severity: 'HIGH', title: `Server Error ${status} at ${action.path}` },
          });
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      log.push({ step, action: 'error', detail: `Step failed: ${err.message}`, finding: null });
    }
  }

  return log;
}

// --- Main simulate function ---

async function simulate(repoPath) {
  const issues = [];
  const log = [];
  let proc = null;
  let browser = null;

  try {
    // Start the app
    const app = await startApp(repoPath);
    proc = app.proc;
    const baseUrl = `http://localhost:${app.port}`;

    // Launch browser
    browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Auto-dismiss any alert/confirm/prompt dialogs (XSS payloads trigger these)
    page.on('dialog', async (dialog) => {
      log.push({
        step: log.length + 1, action: 'finding',
        detail: `JavaScript alert() triggered: "${dialog.message()}" — XSS payload executed successfully`,
        finding: { severity: 'CRITICAL', title: 'XSS Confirmed — alert() Executed' },
      });
      await dialog.dismiss();
    });

    // Collect console errors (deduplicated)
    const consoleErrorSet = new Set();
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrorSet.add(msg.text());
    });
    page.on('pageerror', (err) => consoleErrorSet.add(err.message));

    // Navigate to app
    try {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (err) {
      return {
        issues: [{
          scanner: 'simulation',
          severity: 'CRITICAL',
          title: 'App Failed to Load',
          description: `The app could not be loaded at ${baseUrl}: ${err.message}`,
          filePath: null, lineNumber: null, codeSnippet: null,
          fixSuggestion: 'Check that the app starts correctly and listens on the expected port.',
        }],
        log: [{ step: 1, action: 'error', detail: `App failed to load: ${err.message}`, finding: null }],
        mode: 'failed',
      };
    }

    // Run simulation
    // AI mode uses Claude Sonnet to guide the simulation
    const useAI = process.env.ANTHROPIC_API_KEY && Anthropic;
    const simLog = useAI
      ? await runAISimulation(page, baseUrl)
      : await runScriptedSimulation(page, baseUrl);

    log.push(...simLog);

    // Convert findings from log to issues
    for (const entry of simLog) {
      if (entry.finding) {
        issues.push({
          scanner: 'simulation',
          severity: entry.finding.severity,
          title: entry.finding.title,
          description: entry.detail,
          filePath: null, lineNumber: null, codeSnippet: null,
          fixSuggestion: 'Fix the vulnerability found during runtime simulation.',
        });
      }
    }

    // Convert deduplicated console errors to issues
    for (const err of consoleErrorSet) {
      // Skip noisy browser resource errors
      if (err.includes('favicon.ico') || err.includes('manifest.json')) continue;
      issues.push({
        scanner: 'simulation',
        severity: 'HIGH',
        title: 'Runtime Error Caught',
        description: `Console error during simulation: ${err}`,
        filePath: null, lineNumber: null,
        codeSnippet: err.substring(0, 200),
        fixSuggestion: 'Investigate and fix the runtime error. Check for undefined variables, failed API calls, or missing DOM elements.',
      });
    }

    // Summary log entry
    if (issues.length === 0) {
      log.push({
        step: log.length + 1, action: 'done',
        detail: `Simulation complete — no runtime errors or vulnerabilities detected. App appears stable.`,
        finding: null,
      });
      issues.push({
        scanner: 'simulation',
        severity: 'LOW',
        title: 'Simulation Complete — App Stable',
        description: `AI simulation completed ${log.length} test steps with no issues. Mode: ${useAI ? 'AI-guided' : 'scripted'}.`,
        filePath: null, lineNumber: null, codeSnippet: null,
        fixSuggestion: 'No action needed. App appears stable under testing.',
      });
    } else {
      log.push({
        step: log.length + 1, action: 'done',
        detail: `Simulation complete — found ${issues.length} issue(s) during ${log.length} test steps.`,
        finding: null,
      });
    }

    return { issues, log, mode: useAI ? 'ai-guided' : 'scripted' };
  } catch (err) {
    return {
      issues: [{
        scanner: 'simulation',
        severity: 'MEDIUM',
        title: 'Simulation Could Not Run',
        description: `Failed to simulate: ${err.message}`,
        filePath: null, lineNumber: null, codeSnippet: null,
        fixSuggestion: 'Ensure the app can be started with npm start or node server.js.',
      }],
      log: [{ step: 1, action: 'error', detail: `Simulation failed: ${err.message}`, finding: null }],
      mode: 'failed',
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (proc) {
      proc.kill('SIGTERM');
      setTimeout(() => { try { proc.kill('SIGKILL'); } catch {} }, 2000);
    }
  }
}

module.exports = { simulate };

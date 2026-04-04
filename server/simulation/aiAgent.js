const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch { Anthropic = null; }

const SCRIPTED_TESTS = [
  { name: 'XSS in search', action: 'type', selector: 'input', value: '<script>alert("xss")</script>' },
  { name: 'XSS in form', action: 'type', selector: 'input[type="text"]', value: '"><img src=x onerror=alert(1)>' },
  { name: 'SQL injection', action: 'type', selector: 'input', value: "' OR 1=1 --" },
  { name: 'Navigate /admin', action: 'goto', path: '/admin' },
  { name: 'Navigate /api', action: 'goto', path: '/api' },
  { name: 'Navigate /login', action: 'goto', path: '/login' },
  { name: 'Navigate /dashboard', action: 'goto', path: '/dashboard' },
  { name: 'Click all buttons', action: 'click', selector: 'button' },
  { name: 'Click all links', action: 'click', selector: 'a' },
  { name: 'Submit empty form', action: 'click', selector: 'button[type="submit"], input[type="submit"]' },
];

function detectStartCommand(repoPath) {
  const pkgPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.scripts?.start) return { cmd: 'npm', args: ['start'], cwd: repoPath };
      if (pkg.scripts?.dev) return { cmd: 'npm', args: ['run', 'dev'], cwd: repoPath };
      if (pkg.main) return { cmd: 'node', args: [pkg.main], cwd: repoPath };
    } catch {}
  }
  if (fs.existsSync(path.join(repoPath, 'app.py'))) return { cmd: 'python3', args: ['app.py'], cwd: repoPath };
  if (fs.existsSync(path.join(repoPath, 'server.js'))) return { cmd: 'node', args: ['server.js'], cwd: repoPath };
  if (fs.existsSync(path.join(repoPath, 'index.js'))) return { cmd: 'node', args: ['index.js'], cwd: repoPath };
  return null;
}

function startApp(repoPath) {
  return new Promise((resolve, reject) => {
    const startInfo = detectStartCommand(repoPath);
    if (!startInfo) return reject(new Error('Cannot detect how to start the app'));

    const port = 4000 + Math.floor(Math.random() * 1000);
    const env = { ...process.env, PORT: String(port) };
    const proc = spawn(startInfo.cmd, startInfo.args, { cwd: startInfo.cwd, env, stdio: 'pipe' });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) { started = true; resolve({ proc, port }); }
    }, 5000);

    proc.stdout.on('data', (data) => {
      const out = data.toString();
      if (!started && (out.includes('listening') || out.includes('running') || out.includes('started') || out.includes('port'))) {
        started = true;
        clearTimeout(timeout);
        setTimeout(() => resolve({ proc, port }), 1000);
      }
    });

    proc.stderr.on('data', () => {});
    proc.on('error', (err) => { if (!started) { started = true; reject(err); } });
  });
}

async function runScriptedSimulation(page, baseUrl, consoleErrors) {
  const results = [];

  for (const test of SCRIPTED_TESTS) {
    try {
      if (test.action === 'goto') {
        const url = baseUrl + test.path;
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null);
        const status = response?.status() || 0;
        if (status >= 400) {
          results.push({ test: test.name, result: 'error', detail: `HTTP ${status} at ${test.path}` });
        }
      } else if (test.action === 'type') {
        const el = await page.$(test.selector);
        if (el) {
          await el.type(test.value);
          const form = await page.$('form');
          if (form) await form.evaluate(f => f.submit()).catch(() => {});
          await page.waitForTimeout(1000);
        }
      } else if (test.action === 'click') {
        const els = await page.$$(test.selector);
        for (const el of els.slice(0, 3)) {
          await el.click().catch(() => {});
          await page.waitForTimeout(500);
        }
      }
    } catch {}
  }

  return results;
}

async function runAISimulation(page, baseUrl, consoleErrors) {
  const client = new Anthropic();
  const results = [];
  const maxSteps = 10;

  for (let step = 0; step < maxSteps; step++) {
    try {
      const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
      const currentUrl = page.url();

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshot } },
            { type: 'text', text: `You are testing a web app for bugs. Current URL: ${currentUrl}\n\nLook at this screenshot and decide what to test next. Reply with EXACTLY one JSON action:\n{"action": "click", "selector": "CSS selector"}\n{"action": "type", "selector": "CSS selector", "value": "test input including XSS/SQLi payloads"}\n{"action": "goto", "url": "relative path like /admin"}\n{"action": "done", "summary": "what you found"}\n\nFocus on: XSS, broken forms, error pages, auth bypasses, missing validation. Be aggressive.` }
          ]
        }]
      });

      const text = response.content[0].text;
      let action;
      try {
        const jsonMatch = text.match(/\{[^}]+\}/);
        action = JSON.parse(jsonMatch[0]);
      } catch {
        continue;
      }

      if (action.action === 'done') {
        results.push({ step, action: 'done', detail: action.summary });
        break;
      }

      if (action.action === 'click') {
        const el = await page.$(action.selector);
        if (el) await el.click().catch(() => {});
        results.push({ step, action: 'click', detail: `Clicked ${action.selector}` });
      } else if (action.action === 'type') {
        const el = await page.$(action.selector);
        if (el) { await el.type(action.value); }
        results.push({ step, action: 'type', detail: `Typed "${action.value}" into ${action.selector}` });
      } else if (action.action === 'goto') {
        await page.goto(baseUrl + action.url, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
        results.push({ step, action: 'goto', detail: `Navigated to ${action.url}` });
      }

      await page.waitForTimeout(1000);
    } catch (err) {
      results.push({ step, action: 'error', detail: err.message });
    }
  }

  return results;
}

async function simulate(repoPath) {
  const issues = [];
  let proc = null;
  let browser = null;

  try {
    // Start the app
    const app = await startApp(repoPath);
    proc = app.proc;
    const baseUrl = `http://localhost:${app.port}`;

    // Launch browser
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Collect console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    // Navigate to app
    try {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (err) {
      issues.push({
        scanner: 'simulation',
        severity: 'CRITICAL',
        title: 'App Failed to Load',
        description: `The app could not be loaded at ${baseUrl}: ${err.message}`,
        filePath: null,
        lineNumber: null,
        codeSnippet: null,
        fixSuggestion: 'Check that the app starts correctly and listens on the expected port.',
      });
      return issues;
    }

    // Run simulation
    const useAI = process.env.ANTHROPIC_API_KEY && Anthropic;
    const results = useAI
      ? await runAISimulation(page, baseUrl, consoleErrors)
      : await runScriptedSimulation(page, baseUrl, consoleErrors);

    // Convert console errors to issues
    for (const err of consoleErrors) {
      issues.push({
        scanner: 'simulation',
        severity: 'HIGH',
        title: 'Runtime Console Error',
        description: `Console error caught during simulation: ${err}`,
        filePath: null,
        lineNumber: null,
        codeSnippet: err.substring(0, 200),
        fixSuggestion: 'Investigate and fix the runtime error. Check for undefined variables, failed API calls, or missing DOM elements.',
      });
    }

    // Convert scripted test results to issues
    for (const r of results) {
      if (r.result === 'error') {
        issues.push({
          scanner: 'simulation',
          severity: 'MEDIUM',
          title: `Simulation: ${r.test || 'AI Test'}`,
          description: r.detail,
          filePath: null,
          lineNumber: null,
          codeSnippet: null,
          fixSuggestion: 'Review the endpoint and add proper error handling or access controls.',
        });
      }
    }

    // Add simulation metadata
    if (issues.length === 0) {
      issues.push({
        scanner: 'simulation',
        severity: 'LOW',
        title: 'Simulation Complete — No Runtime Errors',
        description: `AI simulation completed ${results.length} test steps with no runtime errors detected. Mode: ${useAI ? 'AI-guided' : 'scripted'}.`,
        filePath: null,
        lineNumber: null,
        codeSnippet: null,
        fixSuggestion: 'No action needed. App appears stable under basic testing.',
      });
    }

    return issues;
  } catch (err) {
    issues.push({
      scanner: 'simulation',
      severity: 'MEDIUM',
      title: 'Simulation Could Not Run',
      description: `Failed to simulate: ${err.message}`,
      filePath: null,
      lineNumber: null,
      codeSnippet: null,
      fixSuggestion: 'Ensure the app can be started with npm start or node server.js.',
    });
    return issues;
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (proc) { proc.kill('SIGTERM'); setTimeout(() => proc.kill('SIGKILL'), 2000); }
  }
}

module.exports = { simulate };

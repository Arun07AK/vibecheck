const fs = require('fs');
const path = require('path');

const PII_PATTERNS = [
  {
    name: 'Email Address',
    regex: /['"`]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})['"`]/g,
    severity: 'MEDIUM',
    fix: 'Remove hardcoded email addresses. Use environment variables or a config file not tracked in git.',
  },
  {
    name: 'Phone Number',
    regex: /['"`](\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})['"`]/g,
    severity: 'MEDIUM',
    fix: 'Remove hardcoded phone numbers from source code.',
  },
  {
    name: 'Aadhaar Number',
    regex: /\b(\d{4}\s?\d{4}\s?\d{4})\b/g,
    severity: 'CRITICAL',
    fix: 'Remove Aadhaar numbers immediately. This is a violation of Indian data protection laws.',
  },
  {
    name: 'SSN (US)',
    regex: /\b(\d{3}-\d{2}-\d{4})\b/g,
    severity: 'CRITICAL',
    fix: 'Remove Social Security Numbers immediately. This is a serious privacy violation.',
  },
  {
    name: 'Credit Card Number',
    regex: /\b(\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/g,
    severity: 'CRITICAL',
    fix: 'Remove credit card numbers. Use a payment processor like Stripe — never handle card numbers directly.',
  },
  {
    name: 'Console Logging Sensitive Data',
    regex: /console\.log\s*\([^)]*(?:password|secret|token|key|auth|credit|ssn|aadhaar)[^)]*\)/gi,
    severity: 'HIGH',
    fix: 'Remove console.log statements that expose sensitive data. Use a proper logging library with redaction.',
  },
];

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv', '.venv']);
const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.env', '.json', '.yml', '.yaml', '.rb', '.go', '.java', '.php']);

function getFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(fullPath, files);
    } else if (CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function scan(repoPath) {
  const issues = [];
  const files = getFiles(repoPath);

  for (const filePath of files) {
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch { continue; }

    const lines = content.split('\n');
    const relPath = path.relative(repoPath, filePath);

    for (const pattern of PII_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        pattern.regex.lastIndex = 0;
        const match = pattern.regex.exec(lines[i]);
        if (match) {
          issues.push({
            scanner: 'pii',
            severity: pattern.severity,
            title: `${pattern.name} Exposed`,
            description: `Found potential ${pattern.name.toLowerCase()} in source code. Personal data should never be hardcoded.`,
            filePath: relPath,
            lineNumber: i + 1,
            codeSnippet: lines[i].trim().substring(0, 200),
            fixSuggestion: pattern.fix,
          });
        }
      }
    }
  }

  return issues;
}

module.exports = { scan };

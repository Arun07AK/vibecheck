const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'CRITICAL' },
  { name: 'AWS Secret Key', regex: /(?:aws_secret_access_key|AWS_SECRET)\s*[=:]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/g, severity: 'CRITICAL' },
  { name: 'GitHub Token', regex: /gh[ps]_[A-Za-z0-9_]{36}/g, severity: 'CRITICAL' },
  { name: 'OpenAI API Key', regex: /sk-[A-Za-z0-9]{20,}/g, severity: 'CRITICAL' },
  { name: 'Stripe Live Key', regex: /sk_live_[A-Za-z0-9]{24,}/g, severity: 'CRITICAL' },
  { name: 'Stripe Publishable', regex: /pk_live_[A-Za-z0-9]{24,}/g, severity: 'HIGH' },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/g, severity: 'CRITICAL' },
  { name: 'Slack Token', regex: /xox[bpors]-[A-Za-z0-9\-]+/g, severity: 'CRITICAL' },
  { name: 'JWT Token', regex: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*/g, severity: 'HIGH' },
  { name: 'Private Key', regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, severity: 'CRITICAL' },
  { name: 'Generic Password', regex: /(password|passwd|pwd)\s*[=:]\s*['"][^'"]{4,}['"]/gi, severity: 'HIGH' },
  { name: 'Generic Secret', regex: /(secret|token|api_key)\s*[=:]\s*['"][^'"]{4,}['"]/gi, severity: 'HIGH' },
  { name: 'Generic Key', regex: /(ACCESS_KEY|SECRET_KEY|API_SECRET)\s*[=:]\s*['"][^'"]{4,}['"]/gi, severity: 'HIGH' },
  { name: 'Database URL', regex: /(mysql|postgres|mongodb):\/\/[^\s'"]+/g, severity: 'CRITICAL' },
  { name: 'Hardcoded IP Address', regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g, severity: 'LOW' },
  { name: 'Basic Auth in URL', regex: /https?:\/\/[^/\s]+:[^/\s]+@/g, severity: 'CRITICAL' },
  { name: 'SendGrid Key', regex: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g, severity: 'CRITICAL' },
  { name: 'Twilio Key', regex: /SK[a-f0-9]{32}/g, severity: 'HIGH' },
  { name: 'Mailgun Key', regex: /key-[A-Za-z0-9]{32}/g, severity: 'HIGH' },
  { name: 'Firebase Key', regex: /AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}/g, severity: 'HIGH' },
];

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv', '.venv']);
const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.env', '.json', '.yml', '.yaml', '.toml', '.cfg', '.conf', '.sh', '.bash', '.rb', '.go', '.java', '.php', '.rs']);

function getFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(fullPath, files);
    } else if (CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) || entry.name.startsWith('.env')) {
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

    for (const pattern of SECRET_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        // Reset regex lastIndex
        pattern.regex.lastIndex = 0;
        const match = pattern.regex.exec(lines[i]);
        if (match) {
          issues.push({
            scanner: 'secrets',
            severity: pattern.severity,
            title: `${pattern.name} Detected`,
            description: `Found potential ${pattern.name.toLowerCase()} in source code. This should never be committed to version control.`,
            filePath: relPath,
            lineNumber: i + 1,
            codeSnippet: lines[i].trim().substring(0, 200),
            fixSuggestion: `Move this ${pattern.name.toLowerCase()} to an environment variable. Add the file to .gitignore and use process.env.${pattern.name.toUpperCase().replace(/\s+/g, '_')} instead.`,
          });
        }
      }
    }
  }

  return issues;
}

module.exports = { scan };

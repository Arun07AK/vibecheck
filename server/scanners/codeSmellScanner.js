const fs = require('fs');
const path = require('path');

const CODE_SMELL_PATTERNS = [
  {
    name: 'eval() Usage',
    regex: /\beval\s*\(/g,
    severity: 'CRITICAL',
    description: 'eval() executes arbitrary code and is a major security risk. Attackers can inject malicious code through user input.',
    fix: 'Replace eval() with JSON.parse() for JSON data, or use a proper parser/interpreter for expressions.',
  },
  {
    name: 'Empty Catch Block',
    regex: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    severity: 'MEDIUM',
    description: 'Empty catch blocks silently swallow errors, making bugs invisible and debugging impossible.',
    fix: 'Log the error at minimum: catch(err) { console.error(err); }. Better: handle the error appropriately or re-throw it.',
  },
  {
    name: 'innerHTML Assignment (XSS Risk)',
    regex: /\.innerHTML\s*=/g,
    severity: 'HIGH',
    description: 'Direct innerHTML assignment can lead to Cross-Site Scripting (XSS) attacks if the content includes user input.',
    fix: 'Use textContent for plain text, or use a sanitization library like DOMPurify before setting innerHTML.',
  },
  {
    name: 'document.write (XSS Risk)',
    regex: /document\.write\s*\(/g,
    severity: 'HIGH',
    description: 'document.write() can be exploited for XSS attacks and interferes with page rendering.',
    fix: 'Use DOM manipulation methods like createElement/appendChild instead.',
  },
  {
    name: 'SQL Injection Risk',
    regex: /(?:query|execute|exec)\s*\(\s*[`'"].*\$\{|(?:query|execute|exec)\s*\(\s*['"].*\+/g,
    severity: 'CRITICAL',
    description: 'String concatenation in SQL queries allows SQL injection attacks. An attacker could read, modify, or delete your entire database.',
    fix: 'Use parameterized queries or prepared statements. Never concatenate user input into SQL strings.',
  },
  {
    name: 'Hardcoded localhost/127.0.0.1',
    regex: /['"`]https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/g,
    severity: 'LOW',
    description: 'Hardcoded localhost URLs will break in production. The app won\'t work when deployed.',
    fix: 'Use environment variables for API URLs: process.env.API_URL || "http://localhost:3000"',
  },
  {
    name: 'Console.log in Production Code',
    regex: /console\.log\s*\(/g,
    severity: 'LOW',
    description: 'Console.log statements left in production code can leak sensitive information and clutter the console.',
    fix: 'Remove console.log or use a proper logging library with log levels (debug, info, warn, error).',
  },
  {
    name: 'Disabled Security (CORS *)',
    regex: /(?:cors\(\)|Access-Control-Allow-Origin.*\*)/g,
    severity: 'MEDIUM',
    description: 'Wildcard CORS allows any website to make requests to your API, potentially exposing data.',
    fix: 'Restrict CORS to specific trusted origins: cors({ origin: "https://yourdomain.com" })',
  },
  {
    name: 'No Input Validation',
    regex: /req\.body\.\w+(?!\s*(?:&&|\|\||\.trim|\.length|\?\.))/g,
    severity: 'MEDIUM',
    description: 'Using request body values without validation can lead to unexpected behavior or security issues.',
    fix: 'Validate and sanitize all user input. Use a library like Joi, Zod, or express-validator.',
  },
  {
    name: 'Synchronous File I/O in Server',
    regex: /(?:readFileSync|writeFileSync|appendFileSync|existsSync)\s*\(/g,
    severity: 'LOW',
    description: 'Synchronous file operations block the event loop, causing the server to freeze during I/O.',
    fix: 'Use async versions: fs.promises.readFile(), fs.promises.writeFile(), etc.',
  },
];

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv', '.venv']);
const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.go', '.java', '.php']);

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

    for (const pattern of CODE_SMELL_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(lines[i])) {
          issues.push({
            scanner: 'code-smells',
            severity: pattern.severity,
            title: pattern.name,
            description: pattern.description,
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

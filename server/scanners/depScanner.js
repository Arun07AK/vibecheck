const fs = require('fs');
const path = require('path');

// Known hallucinated/non-existent packages that AI often suggests
const HALLUCINATED_PACKAGES = new Set([
  'weather-api-pro-v3', 'react-native-advanced-charts', 'express-auth-middleware',
  'mongo-easy-connect', 'ai-text-analyzer', 'smart-form-validator',
  'auto-api-generator', 'react-3d-charts', 'node-ml-toolkit',
  'easy-blockchain', 'quantum-css', 'neural-router', 'auto-test-gen',
  'react-native-ar-kit', 'serverless-ai-deploy', 'crypto-utils-pro',
  'ml-image-processor', 'auto-graphql-gen', 'smart-cache-manager',
  'ai-code-reviewer', 'deep-search-engine',
]);

async function checkOSV(packageName, version, ecosystem = 'npm') {
  try {
    const response = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package: { name: packageName, ecosystem },
        version: version?.replace(/[\^~>=<]/g, '') || undefined,
      }),
    });
    const data = await response.json();
    return data.vulns || [];
  } catch {
    return [];
  }
}

async function scan(repoPath) {
  const issues = [];

  // Check package.json
  const pkgPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      const checks = Object.entries(allDeps || {}).map(async ([name, version]) => {
        // Check for hallucinated packages
        if (HALLUCINATED_PACKAGES.has(name)) {
          issues.push({
            scanner: 'dependencies',
            severity: 'CRITICAL',
            title: `Hallucinated Package: ${name}`,
            description: `The package "${name}" does not exist on npm. This is likely an AI hallucination — the LLM invented a package name that sounds useful but doesn't exist. Installing it could lead to a supply chain attack (slopsquatting).`,
            filePath: 'package.json',
            lineNumber: null,
            codeSnippet: `"${name}": "${version}"`,
            fixSuggestion: `Remove "${name}" from package.json. Search npm for a real package that provides this functionality. Verify the package exists before adding it.`,
          });
          return;
        }

        // Check OSV for known vulnerabilities
        const vulns = await checkOSV(name, version);
        for (const vuln of vulns.slice(0, 3)) {
          const severity = vuln.database_specific?.severity || 'HIGH';
          issues.push({
            scanner: 'dependencies',
            severity: severity === 'CRITICAL' ? 'CRITICAL' : severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
            title: `Vulnerable Dependency: ${name} (${vuln.id})`,
            description: vuln.summary || `Known vulnerability in ${name}@${version}`,
            filePath: 'package.json',
            lineNumber: null,
            codeSnippet: `"${name}": "${version}"`,
            fixSuggestion: `Update ${name} to the latest patched version. Run: npm audit fix or npm update ${name}`,
          });
        }
      });

      await Promise.all(checks);
    } catch { /* ignore parse errors */ }
  }

  // Check requirements.txt
  const reqPath = path.join(repoPath, 'requirements.txt');
  if (fs.existsSync(reqPath)) {
    try {
      const content = fs.readFileSync(reqPath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;
        const [name, version] = line.split(/[=><]+/);
        if (!name) continue;

        const vulns = await checkOSV(name.trim(), version?.trim(), 'PyPI');
        for (const vuln of vulns.slice(0, 3)) {
          issues.push({
            scanner: 'dependencies',
            severity: 'HIGH',
            title: `Vulnerable Dependency: ${name.trim()} (${vuln.id})`,
            description: vuln.summary || `Known vulnerability in ${name.trim()}`,
            filePath: 'requirements.txt',
            lineNumber: i + 1,
            codeSnippet: line,
            fixSuggestion: `Update ${name.trim()} to the latest patched version.`,
          });
        }
      }
    } catch { /* ignore */ }
  }

  return issues;
}

module.exports = { scan };

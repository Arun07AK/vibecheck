import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

function generateYAML() {
  return `name: VibeCheck Audit
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  vibecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install VibeCheck
        run: |
          git clone https://github.com/Arun07AK/vibecheck.git /tmp/vibecheck
          cd /tmp/vibecheck/server && npm install --production
      - name: Run Scan
        run: |
          cd /tmp/vibecheck/server && node -e "
            const s1=require('./scanners/secretScanner'),s2=require('./scanners/depScanner'),s3=require('./scanners/piiScanner'),s4=require('./scanners/codeSmellScanner');
            (async()=>{const p=process.env.GITHUB_WORKSPACE;const issues=[].concat(...await Promise.all([s1.scan(p),s2.scan(p),s3.scan(p),s4.scan(p)]));
            let score=100;issues.forEach(i=>{score-=i.severity==='CRITICAL'?15:i.severity==='HIGH'?8:i.severity==='MEDIUM'?3:1});score=Math.max(0,score);
            console.log('VibeCheck:',score+'/100 —',score>=70?'GO':score>=40?'WARNING':'NO-GO');
            console.log(issues.length,'issues');issues.forEach(i=>console.log('['+i.severity+']',i.title,'—',(i.filePath||'N/A')));
            if(score<40){console.log('FAILED');process.exit(1)}})();"`;
}

function ProtectRepo({ repoUrl }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const yaml = generateYAML();

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan" strokeWidth={1.5} />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">Protect This Repo</h3>
          <p className="text-[10px] text-dim">GitHub Action — auto-audit every push</p>
        </div>
        <button onClick={() => setShow(!show)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${show ? 'border border-cyan text-cyan' : 'bg-cyan text-bg hover:bg-cyan/90'}`}>
          {show ? 'Hide' : 'Get GitHub Action'}
        </button>
      </div>
      {show && (
        <div className="mt-4 space-y-3 fade-in">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-dim flex-1">Save as <code className="text-cyan font-mono">.github/workflows/vibecheck.yml</code></span>
            <button onClick={() => { navigator.clipboard.writeText(yaml); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className={`px-3 py-1 border rounded text-[9px] font-semibold uppercase tracking-wider transition-colors ${copied ? 'border-cyan text-cyan' : 'border-border text-dim hover:text-white hover:border-cyan'}`}>
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={() => { const b = new Blob([yaml], { type: 'text/yaml' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'vibecheck.yml'; a.click(); }}
              className="px-3 py-1 border border-border rounded text-[9px] font-semibold uppercase tracking-wider text-dim hover:text-white hover:border-cyan transition-colors">
              Download
            </button>
          </div>
          <pre className="bg-terminal border border-border rounded-lg p-3 text-[10px] text-dim overflow-x-auto max-h-64 overflow-y-auto font-mono">{yaml}</pre>
        </div>
      )}
    </div>
  );
}

export default ProtectRepo;

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

function PeekingBuddy() {
  const [visible, setVisible] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [typed, setTyped] = useState(0);

  const messages = [
    "Hey! Just add me to your GitHub...",
    "I'll guard every commit you push!",
    "No more bugs slipping to production!",
  ];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const msg = messages[msgIdx];
    if (typed < msg.length) {
      const t = setTimeout(() => setTyped(s => s + 1), 35);
      return () => clearTimeout(t);
    }
    // Pause then next message
    const t = setTimeout(() => {
      setMsgIdx(i => (i + 1) % messages.length);
      setTyped(0);
    }, 2500);
    return () => clearTimeout(t);
  }, [visible, typed, msgIdx]);

  return (
    <div className={`flex items-end gap-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Robot peeking from bottom-left */}
      <div className="flex-shrink-0 relative" style={{ marginBottom: '-4px' }}>
        <svg width="48" height="52" viewBox="0 0 48 52">
          {/* Body hidden below */}
          <rect x="10" y="36" width="28" height="16" rx="4" fill="#0E0E14" stroke="#00E5C0" strokeWidth="1" />
          {/* Head peeking up */}
          <rect x="6" y="8" width="36" height="30" rx="8" fill="#0E0E14" stroke="#00E5C0" strokeWidth="1.5" />
          {/* Eyes — looking right at the text */}
          <circle cx="18" cy="22" r="3.5" fill="#00E5C0" opacity="0.9">
            <animate attributeName="cy" values="22;20;22" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="22" r="3.5" fill="#00E5C0" opacity="0.9">
            <animate attributeName="cy" values="22;20;22" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Wink */}
          <animate attributeName="opacity" values="1" dur="3s" repeatCount="indefinite" />
          {/* Smile */}
          <path d="M18 30 Q24 35 30 30" fill="none" stroke="#00E5C0" strokeWidth="1.5" strokeLinecap="round" />
          {/* Antenna */}
          <line x1="24" y1="8" x2="24" y2="2" stroke="#00E5C0" strokeWidth="1.2" />
          <circle cx="24" cy="2" r="2" fill="#00E5C0">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Waving hand */}
          <g>
            <line x1="38" y1="30" x2="46" y2="22" stroke="#00E5C0" strokeWidth="1.5" strokeLinecap="round">
              <animate attributeName="y2" values="22;18;22" dur="0.6s" repeatCount="indefinite" />
            </line>
            <circle cx="46" cy="22" r="2" fill="#00E5C0">
              <animate attributeName="cy" values="22;18;22" dur="0.6s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      {/* Speech bubble */}
      <div className="glass rounded-xl rounded-bl-none px-4 py-3 max-w-sm relative mb-2">
        <div className="text-xs text-[#00E5C0] font-mono leading-relaxed">
          {messages[msgIdx].slice(0, typed)}
          <span className="animate-pulse text-[#00E5C0]/50">|</span>
        </div>
      </div>
    </div>
  );
}

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
    <div className="glass rounded-2xl p-6 space-y-4">
      {/* Peeking buddy */}
      <PeekingBuddy />

      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#00E5C0]" strokeWidth={1.5} />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">Protect This Repo</h3>
          <p className="text-[10px] text-dim">GitHub Action — auto-audit every push</p>
        </div>
        <button onClick={() => setShow(!show)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            show ? 'border border-[#00E5C0] text-[#00E5C0]'
              : 'bg-gradient-to-r from-[#00E5C0] to-[#00C6FF] text-[#0A0A0F] hover:shadow-[0_0_30px_rgba(0,229,192,0.3)]'
          }`}>
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

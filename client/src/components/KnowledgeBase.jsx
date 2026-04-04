import { useState, useEffect } from 'react';
import { Lock, Package, UserCheck, Code2, Bot, Brain, Loader2 } from 'lucide-react';

const SCANNERS = { 'Secrets': Lock, 'Dependencies': Package, 'PII': UserCheck, 'Code Smells': Code2, 'Simulation': Bot };

function classifyPattern(name) {
  if (name.includes('Vulnerable Dependency') || name.includes('Hallucinated')) return 'Dependencies';
  if (name.includes('Email') || name.includes('Phone') || name.includes('Aadhaar') || name.includes('SSN') || name.includes('Credit Card') || name.includes('Console Logging Sensitive') || name.includes('PII')) return 'PII';
  if (name.includes('Key') || name.includes('Secret') || name.includes('Password') || name.includes('Token') || name.includes('Database URL') || name.includes('IP Address') || name.includes('JWT')) return 'Secrets';
  if (name.includes('Simulation') || name.includes('Runtime') || name.includes('XSS Confirmed')) return 'Simulation';
  return 'Code Smells';
}

function KnowledgeBase({ onBack }) {
  const [patterns, setPatterns] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/patterns').then(r => r.json()), fetch('/api/history').then(r => r.json())])
      .then(([p, h]) => { setPatterns(p); setHistory(h); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20"><Loader2 className="w-6 h-6 text-cyan mx-auto mb-3 animate-spin" /><p className="text-dim text-sm">Loading...</p></div>;

  const totalIssues = history.reduce((sum, s) => sum + (s.issue_count || 0), 0);
  const topPatterns = patterns.slice(0, 15);
  const maxFreq = topPatterns[0]?.frequency || 1;
  const groups = {};
  for (const p of patterns) { const t = classifyPattern(p.error_type); if (!groups[t]) groups[t] = { count: 0, freq: 0 }; groups[t].count++; groups[t].freq += p.frequency; }

  return (
    <div className="fade-in space-y-6">
      <div className="text-center">
        <Brain className="w-8 h-8 text-cyan mx-auto mb-2" strokeWidth={1} />
        <h2 className="text-2xl font-bold text-white tracking-tight">Knowledge Base</h2>
        <p className="text-dim text-sm mt-1">What AI-generated code gets wrong most often.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[{ label: 'Repos Scanned', value: history.length }, { label: 'Patterns', value: patterns.length }, { label: 'Total Issues', value: totalIssues.toLocaleString() }, { label: 'Top Freq', value: `${maxFreq}x` }].map(s => (
          <div key={s.label} className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-cyan font-mono">{s.value}</div>
            <div className="text-[9px] text-dim mt-1 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-[10px] font-semibold text-dim uppercase tracking-widest mb-3">By Category</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(SCANNERS).map(([type, Icon]) => {
            const d = groups[type] || { count: 0, freq: 0 };
            return (
              <div key={type} className="text-center">
                <Icon className="w-4 h-4 mx-auto mb-1 text-cyan" strokeWidth={1.5} />
                <div className="text-lg font-bold text-white font-mono">{d.freq}</div>
                <div className="text-[9px] text-dim">{type}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-[10px] font-semibold text-dim uppercase tracking-widest mb-4">Most Common AI Mistakes</h3>
        <div className="space-y-2.5">
          {topPatterns.map((p, i) => {
            const width = Math.max((p.frequency / maxFreq) * 100, 4);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-dim w-5 text-right font-mono">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white font-medium truncate">{p.error_type.replace('Detected', '').replace('Exposed', '').trim()}</span>
                    <span className="text-[8px] text-dim bg-terminal px-1.5 py-0.5 rounded font-mono">{classifyPattern(p.error_type)}</span>
                  </div>
                  <div className="h-1.5 bg-terminal rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-cyan transition-all duration-700" style={{ width: `${width}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan w-14 text-right font-mono">{p.frequency}x</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="px-5 py-2 border border-border text-dim rounded-lg hover:text-white hover:border-cyan transition-colors text-xs uppercase tracking-wider">Back to Scanner</button>
      </div>
    </div>
  );
}

export default KnowledgeBase;

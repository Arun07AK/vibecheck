import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SEV_COLORS = {
  CRITICAL: { bg: 'rgba(255,59,48,0.08)', border: '#FF3B30', text: 'text-critical' },
  HIGH: { bg: 'rgba(255,149,0,0.06)', border: '#FF9500', text: 'text-high' },
  MEDIUM: { bg: 'rgba(255,214,10,0.05)', border: '#FFD60A', text: 'text-medium' },
  LOW: { bg: 'rgba(136,136,136,0.05)', border: '#888', text: 'text-dim' },
};

function FileHeatmap({ file }) {
  const [expanded, setExpanded] = useState(false);
  const lines = file.content.split('\n');
  const lineMap = {};
  for (const issue of file.issues) { if (issue.lineNumber) { if (!lineMap[issue.lineNumber]) lineMap[issue.lineNumber] = []; lineMap[issue.lineNumber].push(issue); } }
  const sevOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const worst = file.issues.reduce((w, i) => (sevOrder[i.severity] < sevOrder[w]) ? i.severity : w, 'LOW');

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SEV_COLORS[worst].border }} />
        <span className="font-mono text-xs text-cyan flex-1">{file.path}</span>
        <span className="text-[10px] text-dim">{file.issues.length} issues</span>
        <ChevronDown className={`w-3.5 h-3.5 text-dim transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {expanded && (
        <div className="border-t border-border overflow-x-auto">
          {file.issues.filter(i => !i.lineNumber).length > 0 && (
            <div className="px-4 py-2 space-y-1 border-b border-border bg-terminal">
              {file.issues.filter(i => !i.lineNumber).map((iss, j) => (
                <div key={j} className="flex items-center gap-2 text-[10px]" style={{ color: SEV_COLORS[iss.severity]?.border }}>
                  <span className="font-semibold">{iss.severity}</span>
                  <span className="text-dim">{iss.title} — {iss.description}</span>
                </div>
              ))}
            </div>
          )}
          <pre className="text-[10px] leading-relaxed font-mono">
            {lines.map((line, i) => {
              const num = i + 1; const issues = lineMap[num]; const has = !!issues;
              const sev = has ? issues.reduce((w, iss) => (sevOrder[iss.severity] < sevOrder[w]) ? iss.severity : w, 'LOW') : null;
              const col = sev ? SEV_COLORS[sev] : null;
              return (
                <div key={i}>
                  <div className="flex" style={has ? { backgroundColor: col.bg } : undefined}>
                    <span className="select-none text-[#444] text-right w-10 pr-2 flex-shrink-0" style={has ? { borderRight: `2px solid ${col.border}`, marginRight: '8px' } : { borderRight: '1px solid #333', marginRight: '8px' }}>{num}</span>
                    <code className={has ? 'text-white/70' : 'text-[#555]'}>{line || ' '}</code>
                    {has && <span className={`flex-shrink-0 px-2 text-[8px] font-semibold self-center ${col.text}`}>{issues.map(iss => iss.title).join(', ')}</span>}
                  </div>
                  {has && issues.map((iss, j) => (
                    <div key={j} className="flex pl-14 py-0.5 text-[9px]" style={{ backgroundColor: col.bg }}>
                      <span className="font-semibold mr-2" style={{ color: col.border, opacity: 0.7 }}>{iss.severity}</span>
                      <span className="text-dim">{iss.description}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}

function CodeHeatmap({ scanId }) {
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const loadFiles = async () => {
    if (files) { setVisible(!visible); return; }
    setLoading(true);
    try { const res = await fetch(`/api/scan/${scanId}/files`); const data = await res.json(); setFiles(data.files); setVisible(true); } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <button onClick={loadFiles}
          className={`px-4 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${visible ? 'border-cyan text-cyan' : 'border-border text-dim hover:text-white hover:border-cyan'}`}>
          {loading ? 'Loading...' : visible ? 'Hide Heatmap' : 'View Code Heatmap'}
        </button>
        {files && <span className="text-[10px] text-dim">{files.length} file{files.length !== 1 ? 's' : ''} with issues</span>}
      </div>
      {visible && files && (
        <div className="space-y-2 fade-in">
          <div className="flex gap-3 text-[9px] text-dim">
            {Object.entries(SEV_COLORS).map(([sev, col]) => (
              <div key={sev} className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ backgroundColor: col.border }} /><span>{sev}</span></div>
            ))}
          </div>
          {files.map((file, i) => <FileHeatmap key={i} file={file} />)}
        </div>
      )}
    </div>
  );
}

export default CodeHeatmap;

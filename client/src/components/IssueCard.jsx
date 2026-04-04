import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SEV = {
  CRITICAL: { badge: 'bg-critical text-white', border: 'border-l-critical' },
  HIGH: { badge: 'bg-high text-bg', border: 'border-l-high' },
  MEDIUM: { badge: 'bg-medium text-bg', border: 'border-l-medium' },
  LOW: { badge: 'bg-[#555] text-white', border: 'border-l-[#555]' },
};

const LABELS = { secrets: 'Secrets', dependencies: 'Dependencies', pii: 'PII', 'code-smells': 'Code Smells', simulation: 'Simulation' };

function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const s = SEV[issue.severity] || SEV.MEDIUM;

  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden cursor-pointer border-l-2 ${s.border}`} onClick={() => setExpanded(!expanded)}>
      <div className="px-4 py-2.5 flex items-center gap-3">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${s.badge}`}>{issue.severity}</span>
        <span className="text-sm font-medium text-white flex-1">{issue.title}</span>
        <span className="text-[9px] text-[#555] bg-terminal px-2 py-0.5 rounded font-mono">{LABELS[issue.scanner] || issue.scanner}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#555] transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-border pt-2">
          <p className="text-xs text-dim">{issue.description}</p>
          {issue.filePath && (
            <div className="text-[10px] text-[#555]">
              <span className="text-cyan font-mono">{issue.filePath}</span>
              {issue.lineNumber && <span> : line {issue.lineNumber}</span>}
            </div>
          )}
          {issue.codeSnippet && (
            <pre className="bg-terminal rounded p-2 text-[10px] text-dim overflow-x-auto font-mono border border-border">{issue.codeSnippet}</pre>
          )}
          {issue.fixSuggestion && (
            <div className="bg-terminal border border-cyan/20 rounded p-2">
              <div className="text-[9px] font-bold text-cyan mb-1 uppercase tracking-wider">Fix</div>
              <p className="text-xs text-dim">{issue.fixSuggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueCard;

import { useState } from 'react';

const SEVERITY_STYLES = {
  CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
  HIGH: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400' },
  MEDIUM: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
  LOW: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
};

const SCANNER_LABELS = {
  secrets: 'Secrets',
  dependencies: 'Dependencies',
  pii: 'PII',
  'code-smells': 'Code Smells',
};

function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.MEDIUM;

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-xl overflow-hidden transition-all cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${style.badge}`}>
          {issue.severity}
        </span>
        <span className="text-sm font-medium text-white flex-1">{issue.title}</span>
        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
          {SCANNER_LABELS[issue.scanner] || issue.scanner}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/30 pt-3">
          <p className="text-sm text-slate-300">{issue.description}</p>

          {issue.filePath && (
            <div className="text-xs text-slate-400">
              <span className="text-slate-500">File:</span>{' '}
              <span className="text-teal font-mono">{issue.filePath}</span>
              {issue.lineNumber && (
                <span className="text-slate-500"> : line {issue.lineNumber}</span>
              )}
            </div>
          )}

          {issue.codeSnippet && (
            <pre className="bg-slate-900 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto font-mono">
              {issue.codeSnippet}
            </pre>
          )}

          {issue.fixSuggestion && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
              <div className="text-xs font-bold text-green-400 mb-1">Fix Suggestion</div>
              <p className="text-sm text-slate-300">{issue.fixSuggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueCard;

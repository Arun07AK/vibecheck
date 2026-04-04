const ACTION_ICONS = {
  navigate: '🧭',
  inspect: '🔍',
  type: '⌨️',
  click: '👆',
  finding: '🚨',
  skip: '⏭️',
  done: '✅',
  error: '❌',
};

const ACTION_COLORS = {
  navigate: 'border-blue-500/30 bg-blue-500/5',
  inspect: 'border-slate-500/30 bg-slate-500/5',
  type: 'border-yellow-500/30 bg-yellow-500/5',
  click: 'border-teal/30 bg-teal/5',
  finding: 'border-red-500/30 bg-red-500/10',
  skip: 'border-slate-600/30 bg-slate-600/5',
  done: 'border-green-500/30 bg-green-500/5',
  error: 'border-red-500/30 bg-red-500/5',
};

function SimulationResults({ simulation }) {
  if (!simulation) return null;

  const { log, mode, issueCount } = simulation;
  if (!log || log.length === 0) return null;

  const modeLabel = mode === 'ai-guided' ? 'AI-Guided (Claude Sonnet 4.6)' : mode === 'scripted' ? 'Scripted Tests' : 'Failed';
  const modeColor = mode === 'ai-guided' ? 'text-teal' : mode === 'scripted' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-surface rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="text-white font-bold">AI Simulation</h3>
            <span className={`text-xs ${modeColor}`}>{modeLabel}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">{log.length} steps</div>
          <div className={`text-xs ${issueCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {issueCount > 0 ? `${issueCount} issue${issueCount !== 1 ? 's' : ''} found` : 'No issues found'}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 space-y-0">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-700/50" />

        {log.map((entry, i) => {
          const icon = ACTION_ICONS[entry.action] || '•';
          const colorClass = ACTION_COLORS[entry.action] || ACTION_COLORS.inspect;

          return (
            <div key={i} className="relative pb-3">
              {/* Dot on the line */}
              <div className="absolute -left-8 top-2 w-[11px] h-[11px] rounded-full bg-slate-700 border-2 border-slate-500 z-10"
                style={entry.finding ? { backgroundColor: '#ef4444', borderColor: '#ef4444' } : undefined}
              />

              <div className={`border rounded-lg px-3 py-2 ${colorClass}`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${entry.finding ? 'text-red-300 font-medium' : 'text-slate-300'}`}>
                      {entry.detail}
                    </p>
                    {entry.finding && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                        {entry.finding.severity} — {entry.finding.title}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 flex-shrink-0">Step {entry.step}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SimulationResults;

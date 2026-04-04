import { Compass, Search, Keyboard, MousePointer, AlertTriangle, CheckCircle2, XCircle, Bot, Eye, Terminal, Globe, MessageSquare, Layers, X, ShieldAlert, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const ACTION_MAP = {
  navigate:          { Icon: Globe,          label: 'Navigate' },
  snapshot:          { Icon: Eye,            label: 'Snapshot' },
  click:             { Icon: MousePointer,   label: 'Click' },
  type:              { Icon: Keyboard,       label: 'Type' },
  fill:              { Icon: Keyboard,       label: 'Fill' },
  evaluate:          { Icon: Terminal,        label: 'Evaluate' },
  console_messages:  { Icon: MessageSquare,  label: 'Console' },
  handle_dialog:     { Icon: AlertTriangle,  label: 'Dialog' },
  tabs:              { Icon: Layers,         label: 'Tabs' },
  close:             { Icon: X,              label: 'Close' },
  inspect:           { Icon: Search,         label: 'Inspect' },
  finding:           { Icon: ShieldAlert,    label: 'Finding' },
  done:              { Icon: CheckCircle2,   label: 'Done' },
  error:             { Icon: XCircle,        label: 'Error' },
};

function SimulationResults({ simulation }) {
  if (!simulation) return null;
  const { log, mode, issueCount } = simulation;
  if (!log || log.length === 0) return null;
  const [showActions, setShowActions] = useState(false);

  const modeLabel = mode === 'mcp' ? 'MCP (Playwright + Claude Sonnet 4.6)' : mode === 'ai-guided' ? 'AI-Guided (Claude Sonnet 4.6)' : mode === 'scripted' ? 'Scripted Tests' : 'Failed';

  // Separate findings from actions
  const findings = log.filter(e => e.finding);
  const actions = log.filter(e => !e.finding);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-white/40" strokeWidth={1.5} />
            <div>
              <h3 className="text-white font-semibold">AI Simulation</h3>
              <span className="text-xs text-white/30">{modeLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <div className="text-sm text-white/40">{actions.length} actions</div>
            </div>
            <div>
              <div className={`text-sm font-semibold ${findings.length > 0 ? 'text-[#ff3b30]' : 'text-white/30'}`}>
                {findings.length} breakpoint{findings.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BREAKPOINTS FOUND */}
      {findings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#ff3b30]/60 uppercase tracking-widest px-1">Breakpoints Found</h4>
          {findings.map((entry, i) => {
            const mapped = ACTION_MAP[entry.action] || ACTION_MAP.finding;
            const IconComponent = mapped.Icon;
            return (
              <div key={i} className="glass rounded-xl px-5 py-4 border-l-2 border-l-[#ff3b30]/50 bg-[#ff3b30]/[0.02]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconComponent className="w-4 h-4 text-[#ff3b30]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#ff3b30] bg-[#ff3b30]/10 px-2 py-0.5 rounded">
                        {entry.finding.severity}
                      </span>
                      <span className="text-sm font-semibold text-white/90">{entry.finding.title}</span>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">{entry.detail}</p>
                  </div>
                  <span className="text-[9px] text-white/15 flex-shrink-0">Step {entry.step}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No breakpoints */}
      {findings.length === 0 && (
        <div className="glass rounded-xl px-5 py-4 border-l-2 border-l-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white/30" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm text-white/50">No breakpoints found</p>
              <p className="text-xs text-white/25">App remained stable through all simulation tests</p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIONS TAKEN — collapsible */}
      <div className="space-y-2">
        <button
          onClick={() => setShowActions(!showActions)}
          className="flex items-center gap-2 text-xs font-semibold text-white/25 uppercase tracking-widest px-1 hover:text-white/40 transition-colors"
        >
          <span>Actions Taken ({actions.length})</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showActions ? 'rotate-180' : ''}`} />
        </button>

        {showActions && (
          <div className="glass rounded-xl overflow-hidden divide-y divide-white/[0.03]">
            {actions.map((entry, i) => {
              const actionKey = entry.action || 'inspect';
              const mapped = ACTION_MAP[actionKey] || { Icon: Search, label: actionKey };
              const IconComponent = mapped.Icon;
              const isDone = actionKey === 'done';

              return (
                <div key={i} className={`px-4 py-2.5 flex items-center gap-3 ${isDone ? 'bg-white/[0.02]' : ''}`}>
                  <IconComponent className="w-3.5 h-3.5 text-white/20 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold text-white/15 uppercase tracking-wider w-16 flex-shrink-0">
                    {mapped.label}
                  </span>
                  <p className={`text-sm flex-1 truncate ${isDone ? 'text-white/40' : 'text-white/35'}`}>
                    {entry.detail}
                  </p>
                  <span className="text-[9px] text-white/10 flex-shrink-0">{entry.step}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulationResults;

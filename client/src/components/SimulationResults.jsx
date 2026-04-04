import { Compass, Search, Keyboard, MousePointer, AlertTriangle, CheckCircle2, XCircle, Bot, Eye, Terminal, Globe, MessageSquare, Layers, X, ShieldAlert, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const ACTION_MAP = {
  navigate: { Icon: Globe, label: 'NAV' }, snapshot: { Icon: Eye, label: 'SNAP' },
  click: { Icon: MousePointer, label: 'CLICK' }, type: { Icon: Keyboard, label: 'TYPE' },
  fill: { Icon: Keyboard, label: 'FILL' }, evaluate: { Icon: Terminal, label: 'EVAL' },
  console_messages: { Icon: MessageSquare, label: 'LOG' }, handle_dialog: { Icon: AlertTriangle, label: 'DIALOG' },
  tabs: { Icon: Layers, label: 'TAB' }, close: { Icon: X, label: 'CLOSE' },
  inspect: { Icon: Search, label: 'SCAN' }, finding: { Icon: ShieldAlert, label: 'VULN' },
  done: { Icon: CheckCircle2, label: 'DONE' }, error: { Icon: XCircle, label: 'ERR' },
};

function SimulationResults({ simulation }) {
  const [showLog, setShowLog] = useState(false);
  if (!simulation) return null;
  const { log, mode, issueCount } = simulation;
  if (!log || log.length === 0) return null;

  const modeLabel = mode === 'mcp' ? 'Playwright MCP + Claude Sonnet 4.6' : mode === 'scripted' ? 'Scripted Tests' : 'Failed';
  const findings = log.filter(e => e.finding);
  const actions = log.filter(e => !e.finding && e.action !== 'done');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-cyan" strokeWidth={1.5} />
            <div>
              <h3 className="text-white font-semibold text-sm">Multi-Agent Swarm Simulation</h3>
              <span className="text-[10px] text-dim">{modeLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{actions.length}</div>
              <div className="text-[8px] text-dim uppercase tracking-widest">Steps</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${findings.length > 0 ? 'text-critical' : 'text-cyan'}`}>{findings.length}</div>
              <div className="text-[8px] text-dim uppercase tracking-widest">Vulns</div>
            </div>
          </div>
        </div>
        <div className="bg-terminal rounded-lg px-3 py-2 text-[10px] text-dim font-mono">
          AI launched a headless browser, navigated the target app, injected attack payloads, and verified vulnerabilities in real-time.
        </div>
      </div>

      {/* Breakpoints */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-semibold text-critical uppercase tracking-widest px-1 flex items-center gap-2">
          <ShieldAlert className="w-3 h-3" /> Breakpoints Found
        </h4>
        {findings.length > 0 ? findings.map((entry, i) => (
          <div key={i} className="bg-surface border border-critical/20 rounded-lg px-4 py-3 border-l-2 border-l-critical">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded bg-critical/10 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-3.5 h-3.5 text-critical" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold text-white bg-critical px-2 py-0.5 rounded">{entry.finding.severity}</span>
                  <span className="text-sm font-semibold text-white">{entry.finding.title}</span>
                </div>
                <p className="text-xs text-dim">{entry.detail}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-surface border border-border rounded-lg px-4 py-3 border-l-2 border-l-cyan">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-cyan" strokeWidth={2} />
              <div>
                <p className="text-sm text-white">No breakpoints found</p>
                <p className="text-[10px] text-dim">App remained stable through all attack simulations</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Log — Terminal style */}
      <div className="space-y-2">
        <button onClick={() => setShowLog(!showLog)}
          className="flex items-center gap-2 text-[10px] font-semibold text-dim uppercase tracking-widest px-1 hover:text-white transition-colors">
          <Terminal className="w-3 h-3" />
          <span>swarm_stream.log ({actions.length} entries)</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showLog ? 'rotate-180' : ''}`} />
        </button>

        {showLog && (
          <div className="bg-terminal border border-border rounded-lg p-3 max-h-80 overflow-y-auto font-mono text-[11px]">
            {actions.map((entry, i) => {
              const mapped = ACTION_MAP[entry.action] || { label: entry.action?.toUpperCase() || '?' };
              const isInteraction = ['click', 'type', 'fill', 'handle_dialog'].includes(entry.action);
              return (
                <div key={i} className="flex gap-2 py-0.5">
                  <span className="text-[#555] w-5 text-right flex-shrink-0">{entry.step}</span>
                  <span className={`w-12 flex-shrink-0 ${isInteraction ? 'text-cyan' : 'text-dim'}`}>[{mapped.label}]</span>
                  <span className={isInteraction ? 'text-white/70' : 'text-dim'}>{entry.detail}</span>
                </div>
              );
            })}
            <div className="flex gap-2 py-0.5 text-cyan">
              <span className="text-[#555] w-5 text-right flex-shrink-0">*</span>
              <span>[DONE]</span>
              <span>Simulation complete — {findings.length} vulnerability(s) detected.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulationResults;

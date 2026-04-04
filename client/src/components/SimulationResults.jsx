import { Compass, Search, Keyboard, MousePointer, AlertTriangle, CheckCircle2, XCircle, Bot, Eye, Terminal, Globe, MessageSquare, Layers, X, ShieldAlert, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const NODE_COLORS = {
  navigate: '#7B61FF', snapshot: '#555', click: '#FFB84D', type: '#FFB84D',
  fill: '#FFB84D', evaluate: '#2BB6FF', console_messages: '#555',
  handle_dialog: '#FF4ECD', finding: '#FF4ECD', done: '#00E5C0', error: '#FF3B30',
  inspect: '#888', tabs: '#555', close: '#555',
};

function AttackGraph({ log }) {
  const [visibleCount, setVisibleCount] = useState(0);

  // Filter to meaningful actions only
  const nodes = log
    .filter(e => e.action !== 'done' && e.detail)
    .map((e, i) => ({
      id: i,
      action: e.action,
      label: (ACTION_MAP[e.action]?.label || e.action?.toUpperCase() || '?').slice(0, 5),
      detail: e.detail?.slice(0, 40) || '',
      isFinding: !!e.finding,
      color: e.finding ? '#FF4ECD' : (NODE_COLORS[e.action] || '#555'),
    }));

  // Animate nodes appearing
  useEffect(() => {
    if (visibleCount >= nodes.length) return;
    const t = setTimeout(() => setVisibleCount(c => c + 1), 150);
    return () => clearTimeout(t);
  }, [visibleCount, nodes.length]);

  // Layout: center + circular
  const cx = 300, cy = 160, radius = 120;
  const positions = nodes.map((_, i) => {
    const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const r = radius + (i % 3) * 15; // slight variation
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height: '340px', background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.03) 0%, transparent 70%)' }}>
      <svg width="100%" height="340" viewBox="0 0 600 340">
        {/* Background grid dots */}
        {Array.from({ length: 20 }).map((_, i) =>
          Array.from({ length: 10 }).map((_, j) => (
            <circle key={`g-${i}-${j}`} cx={30 * i + 15} cy={34 * j + 5} r="0.5" fill="#333" />
          ))
        )}

        {/* Edges — animated dashed lines */}
        {nodes.map((node, i) => {
          if (i >= visibleCount || i === 0) return null;
          const from = i === 1 ? { x: cx, y: cy } : positions[i - 1];
          const to = positions[i];
          return (
            <line key={`e-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={node.isFinding ? '#FF4ECD' : '#00F0FF'} strokeWidth="1" opacity="0.3"
              strokeDasharray="4 4"
              style={{ transition: 'all 0.5s ease' }}>
              <animate attributeName="stroke-dashoffset" values="0;-8" dur="1.5s" repeatCount="indefinite" />
            </line>
          );
        })}

        {/* Center "App" node */}
        <circle cx={cx} cy={cy} r="22" fill="rgba(0,240,255,0.08)" stroke="#00F0FF" strokeWidth="1.5">
          <animate attributeName="r" values="22;24;22" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r="14" fill="rgba(0,240,255,0.15)" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          className="fill-cyan text-[9px] font-mono font-bold">APP</text>

        {/* Connection lines from center to first ring */}
        {nodes.slice(0, Math.min(visibleCount, 6)).map((_, i) => (
          <line key={`c-${i}`} x1={cx} y1={cy} x2={positions[i]?.x} y2={positions[i]?.y}
            stroke="#00F0FF" strokeWidth="0.5" opacity="0.1" />
        ))}

        {/* Action nodes */}
        {nodes.map((node, i) => {
          if (i >= visibleCount) return null;
          const pos = positions[i];
          const r = node.isFinding ? 16 : 10;

          return (
            <g key={`n-${i}`} style={{ transition: 'opacity 0.4s ease', opacity: 1 }}>
              {/* Glow for findings */}
              {node.isFinding && (
                <circle cx={pos.x} cy={pos.y} r={r + 8} fill="none" stroke="#FF4ECD" strokeWidth="1" opacity="0.2">
                  <animate attributeName="r" values={`${r + 6};${r + 12};${r + 6}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Node circle */}
              <circle cx={pos.x} cy={pos.y} r={r}
                fill={node.isFinding ? 'rgba(255,78,205,0.15)' : 'rgba(14,14,20,0.9)'}
                stroke={node.color} strokeWidth={node.isFinding ? 2 : 1} />

              {/* Label */}
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={node.isFinding ? 7 : 6} fontFamily="JetBrains Mono, monospace" fontWeight="600"
                fill={node.color}>
                {node.label}
              </text>

              {/* Detail below */}
              <text x={pos.x} y={pos.y + r + 10} textAnchor="middle"
                fontSize="5" fill="#555" fontFamily="JetBrains Mono, monospace">
                {node.detail}
              </text>

              {/* Floating animation */}
              <animateTransform attributeName="transform" type="translate"
                values={`0,0; 0,${node.isFinding ? -3 : -1.5}; 0,0`}
                dur={`${2.5 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(10, 310)">
          {[['Action', '#00F0FF'], ['Interaction', '#FFB84D'], ['Analysis', '#2BB6FF'], ['Vulnerability', '#FF4ECD']].map(([label, color], i) => (
            <g key={label} transform={`translate(${i * 140}, 0)`}>
              <circle cx="4" cy="4" r="3" fill={color} opacity="0.6" />
              <text x="12" y="7" fontSize="7" fill="#555" fontFamily="JetBrains Mono, monospace">{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

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

      {/* Attack Surface Graph */}
      <AttackGraph log={log} />

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

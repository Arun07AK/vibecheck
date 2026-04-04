import { useState, useEffect } from 'react';
import { ScanSearch } from 'lucide-react';

function WinkingBuddy() {
  const [winking, setWinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWinking(true);
      setTimeout(() => setWinking(false), 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto mb-5">
      {/* Head */}
      <rect x="15" y="10" width="50" height="45" rx="12" fill="#0E0E14" stroke="#00F0FF" strokeWidth="1.5" />
      {/* Antenna */}
      <line x1="40" y1="10" x2="40" y2="2" stroke="#00F0FF" strokeWidth="1.5" />
      <circle cx="40" cy="2" r="2.5" fill="#00F0FF" className="animate-pulse" />
      {/* Left eye */}
      <circle cx="30" cy="30" r="5" fill="#00F0FF" opacity="0.9">
        <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Right eye — winks */}
      {winking ? (
        <line x1="45" y1="30" x2="55" y2="30" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <circle cx="50" cy="30" r="5" fill="#00F0FF" opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Mouth — small smile */}
      <path d="M 32 42 Q 40 48 48 42" fill="none" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body */}
      <rect x="25" y="57" width="30" height="15" rx="5" fill="#0E0E14" stroke="#00F0FF" strokeWidth="1" />
      {/* Arms */}
      <line x1="25" y1="62" x2="15" y2="68" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y2" values="68;65;68" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="55" y1="62" x2="65" y2="68" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="y2" values="68;65;68" dur="2s" repeatCount="indefinite" begin="0.5s" />
      </line>
      {/* Screen lines on body */}
      <line x1="30" y1="62" x2="42" y2="62" stroke="#00F0FF" strokeWidth="1" opacity="0.4" />
      <line x1="30" y1="65" x2="38" y2="65" stroke="#00F0FF" strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="68" x2="45" y2="68" stroke="#00F0FF" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function ScanInput({ onScan }) {
  const [mode, setMode] = useState('url');
  const [url, setUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [enableSimulation, setEnableSimulation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'url' && !url.trim()) return;
    if (mode === 'local' && !localPath.trim()) return;
    onScan({ url: mode === 'url' ? url.trim() : null, localPath: mode === 'local' ? localPath.trim() : null, enableSimulation });
  };

  return (
    <div className="max-w-2xl mx-auto py-16 fade-in">
      <div className="text-center mb-10">
        <WinkingBuddy />
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
          Audit Your<br />
          <span className="text-cyan">Vibe-Coded App</span>
        </h2>
        <p className="text-dim text-sm max-w-md mx-auto">
          Scan for secrets, vulnerabilities, PII leaks, and code smells. Score it 0-100.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mode toggle — glass pill */}
        <div className="glass rounded-2xl p-1.5 flex gap-1.5">
          <button type="button" onClick={() => setMode('url')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
              mode === 'url'
                ? 'bg-gradient-to-r from-cyan to-[#00C6FF] text-[#0A0A0F] shadow-[0_0_30px_rgba(0,240,255,0.3)]'
                : 'text-dim hover:text-white hover:bg-white/5'
            }`}>
            GitHub URL
          </button>
          <button type="button" onClick={() => setMode('local')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
              mode === 'local'
                ? 'bg-gradient-to-r from-cyan to-[#00C6FF] text-[#0A0A0F] shadow-[0_0_30px_rgba(0,240,255,0.3)]'
                : 'text-dim hover:text-white hover:bg-white/5'
            }`}>
            Local Path
          </button>
        </div>

        {/* Input — glowing border on focus */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan/0 via-cyan/0 to-cyan/0 group-focus-within:from-cyan/20 group-focus-within:via-cyan/40 group-focus-within:to-cyan/20 rounded-xl blur-sm transition-all duration-500" />
          <input type="text"
            value={mode === 'url' ? url : localPath}
            onChange={(e) => mode === 'url' ? setUrl(e.target.value) : setLocalPath(e.target.value)}
            placeholder={mode === 'url' ? 'https://github.com/user/repo' : '/path/to/your/project'}
            className="relative w-full glass rounded-xl px-5 py-4 text-white placeholder-[#444] focus:outline-none text-sm font-mono bg-[#0E0E14]"
          />
        </div>

        {/* Simulation toggle — refined */}
        <label className="flex items-center gap-3 text-dim cursor-pointer hover:text-white/70 transition-colors group">
          <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
            enableSimulation
              ? 'bg-gradient-to-r from-cyan to-[#00C6FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-[#1a1a24] border border-[rgba(244,246,255,0.08)]'
          }`}>
            <div className={`w-4 h-4 rounded-full absolute top-1 transition-all duration-300 ${
              enableSimulation ? 'translate-x-[22px] bg-[#0A0A0F]' : 'translate-x-1 bg-dim'
            }`} />
          </div>
          <input type="checkbox" checked={enableSimulation} onChange={(e) => setEnableSimulation(e.target.checked)} className="sr-only" />
          <span className="text-xs">Enable AI Simulation <span className="text-[#444]">(Playwright MCP + Claude)</span></span>
        </label>

        {/* Submit — gradient with glow + hover effect */}
        <button type="submit"
          className="relative w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest overflow-hidden transition-all duration-300 group
            bg-gradient-to-r from-cyan to-[#00C6FF] text-[#0A0A0F]
            hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] hover:scale-[1.01] active:scale-[0.99]">
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L12 22M2 12L22 12" className="group-hover:animate-spin" style={{ transformOrigin: 'center', animationDuration: '2s' }} />
              <circle cx="12" cy="12" r="9" />
            </svg>
            Scan Repository
          </span>
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </form>

      {/* Stats — glass cards with glow accent */}
      <div className="mt-12 grid grid-cols-4 gap-3 text-center">
        {[{ label: 'Scanners', value: '4' }, { label: 'Secret Patterns', value: '20+' }, { label: 'CVE Database', value: 'OSV.dev' }, { label: 'AI Agents', value: '5' }].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 hover:border-cyan/20 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-xl font-bold text-cyan font-mono group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">{stat.value}</div>
            <div className="text-[9px] text-dim mt-1 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScanInput;

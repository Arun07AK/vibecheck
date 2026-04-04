import { useState } from 'react';
import { ScanSearch } from 'lucide-react';

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
        <ScanSearch className="w-10 h-10 text-cyan mx-auto mb-4" strokeWidth={1} />
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
          Audit Your<br />
          <span className="text-cyan">Vibe-Coded App</span>
        </h2>
        <p className="text-dim text-sm max-w-md mx-auto">
          Scan for secrets, vulnerabilities, PII leaks, and code smells. Score it 0-100.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface border border-border rounded-lg p-1 flex gap-1">
          <button type="button" onClick={() => setMode('url')}
            className={`flex-1 py-2 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-all ${mode === 'url' ? 'bg-cyan text-bg' : 'text-dim hover:text-white'}`}>
            GitHub URL
          </button>
          <button type="button" onClick={() => setMode('local')}
            className={`flex-1 py-2 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-all ${mode === 'local' ? 'bg-cyan text-bg' : 'text-dim hover:text-white'}`}>
            Local Path
          </button>
        </div>

        <input type="text"
          value={mode === 'url' ? url : localPath}
          onChange={(e) => mode === 'url' ? setUrl(e.target.value) : setLocalPath(e.target.value)}
          placeholder={mode === 'url' ? 'https://github.com/user/repo' : '/path/to/your/project'}
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-cyan text-sm font-mono"
        />

        <label className="flex items-center gap-3 text-dim cursor-pointer hover:text-white/60 transition-colors">
          <div className={`w-9 h-5 rounded-full relative transition-colors ${enableSimulation ? 'bg-cyan' : 'bg-[#333]'}`}>
            <div className={`w-3.5 h-3.5 rounded-full absolute top-[3px] transition-transform ${enableSimulation ? 'translate-x-[18px] bg-bg' : 'translate-x-[3px] bg-dim'}`} />
          </div>
          <input type="checkbox" checked={enableSimulation} onChange={(e) => setEnableSimulation(e.target.checked)} className="sr-only" />
          <span className="text-xs">Enable AI Simulation (Playwright MCP + Claude)</span>
        </label>

        <button type="submit" className="w-full py-3 bg-cyan text-bg font-bold text-sm rounded-lg hover:bg-cyan/90 transition-colors uppercase tracking-wider">
          Scan Repository
        </button>
      </form>

      <div className="mt-10 grid grid-cols-4 gap-3 text-center">
        {[{ label: 'Scanners', value: '4' }, { label: 'Secret Patterns', value: '20+' }, { label: 'CVE Database', value: 'OSV.dev' }, { label: 'AI Agents', value: '5' }].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-lg p-3">
            <div className="text-lg font-bold text-cyan font-mono">{stat.value}</div>
            <div className="text-[10px] text-dim mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScanInput;

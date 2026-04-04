import { useState } from 'react';

function ScanInput({ onScan }) {
  const [mode, setMode] = useState('url'); // url | local
  const [url, setUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [enableSimulation, setEnableSimulation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'url' && !url.trim()) return;
    if (mode === 'local' && !localPath.trim()) return;
    onScan({
      url: mode === 'url' ? url.trim() : null,
      localPath: mode === 'local' ? localPath.trim() : null,
      enableSimulation,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-16 fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-3">
          Audit Your Vibe-Coded App
        </h2>
        <p className="text-slate-400 text-lg">
          Paste a GitHub URL or local path. We'll scan for secrets, vulnerabilities,
          PII leaks, and code smells — then score it 0-100.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2 bg-surface rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'url'
                ? 'bg-teal/20 text-teal'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            GitHub URL
          </button>
          <button
            type="button"
            onClick={() => setMode('local')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'local'
                ? 'bg-teal/20 text-teal'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Local Path
          </button>
        </div>

        {/* Input */}
        <div className="relative">
          {mode === 'url' ? (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full bg-surface border border-slate-600 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal text-lg"
            />
          ) : (
            <input
              type="text"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              placeholder="/path/to/your/project"
              className="w-full bg-surface border border-slate-600 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal text-lg"
            />
          )}
        </div>

        {/* Simulation toggle */}
        <label className="flex items-center gap-3 text-slate-400 cursor-pointer hover:text-slate-300">
          <div className={`w-10 h-6 rounded-full relative transition-colors ${enableSimulation ? 'bg-teal' : 'bg-slate-600'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableSimulation ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <input
            type="checkbox"
            checked={enableSimulation}
            onChange={(e) => setEnableSimulation(e.target.checked)}
            className="sr-only"
          />
          <span className="text-sm">Enable AI Simulation (Puppeteer + Claude)</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 bg-teal text-bg font-bold text-lg rounded-xl hover:bg-teal/90 transition-colors"
        >
          Scan Repository
        </button>
      </form>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-4 gap-4 text-center">
        {[
          { label: 'Scanners', value: '4' },
          { label: 'Secret Patterns', value: '20+' },
          { label: 'CVE Database', value: 'OSV.dev' },
          { label: 'AI Agents', value: '5' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl p-4">
            <div className="text-2xl font-bold text-teal">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScanInput;

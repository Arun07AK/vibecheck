import { useState } from 'react';

const DOMAIN_COLORS = {
  security: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  ux: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  performance: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  scalability: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  production: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
};

function AgentCard({ agent }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const colors = DOMAIN_COLORS[agent.domain] || DOMAIN_COLORS.security;

  // Extract the copy-paste prompt from the analysis
  const promptMatch = agent.analysis.match(/```\n?([\s\S]*?)```/);
  const copyPrompt = promptMatch ? promptMatch[1].trim() : '';

  const handleCopy = (e) => {
    e.stopPropagation();
    if (copyPrompt) {
      navigator.clipboard.writeText(copyPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-xl overflow-hidden transition-all cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-5 py-4 flex items-center gap-3">
        <span className="text-2xl">{agent.icon}</span>
        <div className="flex-1">
          <h3 className="text-white font-medium">{agent.name}</h3>
          <span className={`text-xs ${colors.text}`}>
            {agent.mode === 'ai' ? 'AI Analysis' : 'Template Analysis'}
          </span>
        </div>
        {copyPrompt && (
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            {copied ? 'Copied!' : 'Copy Fix Prompt'}
          </button>
        )}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-700/30 pt-4">
          <div className="prose prose-invert prose-sm max-w-none">
            {agent.analysis.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h3 key={i} className={`text-lg font-bold ${colors.text} mt-4 mb-2`}>{line.replace('## ', '')}</h3>;
              }
              if (line.startsWith('```')) return null;
              if (line.startsWith('- [ ]')) {
                return <div key={i} className="flex items-center gap-2 text-sm text-slate-300 ml-2"><input type="checkbox" className="rounded" readOnly /><span>{line.replace('- [ ] ', '')}</span></div>;
              }
              if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                return <p key={i} className="text-sm text-slate-300 ml-2">{line}</p>;
              }
              if (line.trim() === '') return <div key={i} className="h-2" />;
              return <p key={i} className="text-sm text-slate-300">{line}</p>;
            })}
          </div>

          {copyPrompt && (
            <div className="mt-4 bg-slate-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal">Copy-Paste Fix Prompt</span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">{copyPrompt}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentResults({ agents, loading, onRun }) {
  if (!agents && !loading) {
    return (
      <div className="bg-surface rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">&#129302;</div>
        <h3 className="text-xl font-bold text-white mb-2">AI Agent Analysis</h3>
        <p className="text-slate-400 mb-6 text-sm">
          5 specialized AI agents will analyze your code and generate copy-paste fix prompts
          for your AI coding assistant.
        </p>
        <button
          onClick={onRun}
          className="px-6 py-3 bg-teal text-bg font-bold rounded-xl hover:bg-teal/90 transition-colors"
        >
          Run AI Agents
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl p-8 text-center">
        <div className="inline-block animate-spin text-4xl mb-4">&#9881;</div>
        <h3 className="text-xl font-bold text-white mb-2">Agents Analyzing...</h3>
        <p className="text-slate-400 text-sm">5 AI agents are reviewing your codebase</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">AI Agent Analysis</h3>
      {agents.map((agent, i) => (
        <AgentCard key={i} agent={agent} />
      ))}
    </div>
  );
}

export default AgentResults;

import { Lock, Skull, Flame, Syringe, FileWarning, EyeOff, Drama, Sparkles, Shield, Gem } from 'lucide-react';

const BADGE_RULES = [
  {
    id: 'secret-keeper',
    name: 'Secret Keeper',
    Icon: Lock,
    description: 'Hardcoded secrets found in source code',
    check: (data) => data.scannerCounts.secrets > 0,
    color: 'from-red-500/20 to-red-900/20 border-red-500/30 text-red-400',
  },
  {
    id: 'eval-explorer',
    name: 'Eval Explorer',
    Icon: Skull,
    description: 'eval() detected — the nuclear option',
    check: (data) => data.issues.some(i => i.title === 'eval() Usage'),
    color: 'from-red-500/20 to-orange-900/20 border-red-500/30 text-red-400',
  },
  {
    id: 'dependency-hell',
    name: 'Dependency Hell',
    Icon: Flame,
    description: 'Vulnerable or hallucinated dependencies',
    check: (data) => data.scannerCounts.dependencies > 0,
    color: 'from-orange-500/20 to-red-900/20 border-orange-500/30 text-orange-400',
  },
  {
    id: 'sql-survivor',
    name: 'SQL Injection',
    Icon: Syringe,
    description: 'SQL injection risk detected',
    check: (data) => data.issues.some(i => i.title === 'SQL Injection Risk'),
    color: 'from-purple-500/20 to-red-900/20 border-purple-500/30 text-purple-400',
  },
  {
    id: 'pii-leaker',
    name: 'PII Leaker',
    Icon: FileWarning,
    description: 'Personal data exposed in source code',
    check: (data) => data.scannerCounts.pii > 0,
    color: 'from-yellow-500/20 to-orange-900/20 border-yellow-500/30 text-yellow-400',
  },
  {
    id: 'silent-catcher',
    name: 'Silent Catcher',
    Icon: EyeOff,
    description: 'Empty catch blocks swallowing errors',
    check: (data) => data.issues.some(i => i.title === 'Empty Catch Block'),
    color: 'from-yellow-500/20 to-yellow-900/20 border-yellow-500/30 text-yellow-400',
  },
  {
    id: 'xss-artist',
    name: 'XSS Risk',
    Icon: Drama,
    description: 'innerHTML or document.write without sanitization',
    check: (data) => data.issues.some(i => i.title.includes('innerHTML') || i.title.includes('document.write')),
    color: 'from-pink-500/20 to-purple-900/20 border-pink-500/30 text-pink-400',
  },
  {
    id: 'clean-room',
    name: 'Clean Room',
    Icon: Sparkles,
    description: 'Zero critical or high severity issues',
    check: (data) => data.severityCounts.CRITICAL === 0 && data.severityCounts.HIGH === 0,
    color: 'from-green-500/20 to-teal-900/20 border-green-500/30 text-green-400',
  },
  {
    id: 'fortress',
    name: 'Fort Knox',
    Icon: Shield,
    description: 'No secrets leaked — vault is sealed',
    check: (data) => data.scannerCounts.secrets === 0,
    color: 'from-green-500/20 to-emerald-900/20 border-green-500/30 text-green-400',
  },
  {
    id: 'perfect-score',
    name: 'Flawless',
    Icon: Gem,
    description: 'Score 95+ — production-ready',
    check: (data) => data.score >= 95,
    color: 'from-cyan-500/20 to-blue-900/20 border-cyan-500/30 text-cyan-400',
  },
];

function Badges({ data }) {
  const earned = BADGE_RULES.filter(b => b.check(data));

  if (earned.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Achievement Badges</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {earned.map((badge) => (
          <div
            key={badge.id}
            className={`bg-gradient-to-br ${badge.color} border rounded-xl p-3 text-center transition-transform hover:scale-105`}
          >
            <badge.Icon className="w-6 h-6 mx-auto mb-1.5" strokeWidth={1.5} />
            <div className="text-xs font-bold text-white">{badge.name}</div>
            <div className="text-[10px] text-slate-400 mt-1">{badge.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Badges;

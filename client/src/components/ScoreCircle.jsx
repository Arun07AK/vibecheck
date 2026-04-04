import { useState, useEffect } from 'react';

function getLetterGrade(score) {
  if (score >= 97) return 'A+'; if (score >= 93) return 'A'; if (score >= 90) return 'A-';
  if (score >= 87) return 'B+'; if (score >= 83) return 'B'; if (score >= 80) return 'B-';
  if (score >= 77) return 'C+'; if (score >= 73) return 'C'; if (score >= 70) return 'C-';
  if (score >= 60) return 'D'; if (score >= 40) return 'E'; return 'F';
}

function ScoreCircle({ score, verdict, verdictColor }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showGrade, setShowGrade] = useState(false);

  useEffect(() => {
    let start = 0;
    const stepTime = Math.max(1500 / (score || 1), 10);
    const timer = setInterval(() => {
      start++;
      setDisplayScore(start);
      if (start >= score) { clearInterval(timer); setTimeout(() => setShowGrade(true), 300); }
    }, stepTime);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const grade = getLetterGrade(score);

  const colors = {
    green: { stroke: '#00F0FF', badge: 'bg-cyan text-bg', text: 'text-cyan' },
    yellow: { stroke: '#FF9500', badge: 'bg-high text-bg', text: 'text-high' },
    red: { stroke: '#FF3B30', badge: 'bg-critical text-white', text: 'text-critical' },
  };
  const c = colors[verdictColor] || colors.red;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="180" height="180" className="-rotate-90">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#333" strokeWidth="6" />
          <circle cx="90" cy="90" r={radius} fill="none" stroke={c.stroke} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out', filter: `drop-shadow(0 0 8px ${c.stroke}40)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white font-mono">{displayScore}</span>
          <span className="text-xs text-dim">/ 100</span>
        </div>
      </div>

      {showGrade && (
        <div className={`mt-2 text-5xl font-black grade-pop ${c.text}`}>{grade}</div>
      )}

      <div className={`mt-2 px-5 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider ${c.badge}`}>
        {verdict === 'NO-GO' ? 'NO-GO \u2014 Blocks Merge' : verdict === 'WARNING' ? 'WARNING' : 'GO \u2014 Safe to Ship'}
      </div>
    </div>
  );
}

export default ScoreCircle;

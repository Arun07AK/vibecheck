import { useState, useEffect } from 'react';

function ScoreCircle({ score, verdict, verdictColor }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = duration / score;
    const timer = setInterval(() => {
      start++;
      setDisplayScore(start);
      if (start >= score) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  const colorMap = {
    green: { stroke: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', text: 'text-green-400' },
    yellow: { stroke: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', text: 'text-yellow-400' },
    red: { stroke: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', text: 'text-red-400' },
  };
  const colors = colorMap[verdictColor] || colorMap.red;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="200" height="200" className="-rotate-90">
          <circle
            cx="100" cy="100" r={radius}
            fill="none" stroke="#1e293b" strokeWidth="12"
          />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-white">{displayScore}</span>
          <span className="text-sm text-slate-400">/100</span>
        </div>
      </div>
      <div
        className={`mt-4 px-6 py-2 rounded-full font-bold text-lg ${colors.text}`}
        style={{ background: colors.bg }}
      >
        {verdict}
      </div>
    </div>
  );
}

export default ScoreCircle;

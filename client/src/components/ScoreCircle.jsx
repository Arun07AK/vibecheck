import { useState, useEffect } from 'react';

function getLetterGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

function ScoreCircle({ score, verdict, verdictColor }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showGrade, setShowGrade] = useState(false);
  const [gradeScale, setGradeScale] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = Math.max(duration / (score || 1), 10);
    const timer = setInterval(() => {
      start++;
      setDisplayScore(start);
      if (start >= score) {
        clearInterval(timer);
        setTimeout(() => {
          setShowGrade(true);
          setTimeout(() => setGradeScale(1), 50);
        }, 300);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const grade = getLetterGrade(score);

  const colorMap = {
    green: { stroke: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', text: 'text-green-400', gradeBg: 'rgba(74, 222, 128, 0.15)' },
    yellow: { stroke: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', text: 'text-yellow-400', gradeBg: 'rgba(251, 191, 36, 0.15)' },
    red: { stroke: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', text: 'text-red-400', gradeBg: 'rgba(248, 113, 113, 0.15)' },
  };
  const colors = colorMap[verdictColor] || colorMap.red;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ filter: `drop-shadow(0 0 15px ${colors.stroke}30)` }}>
        <svg width="220" height="220" className="-rotate-90">
          <circle
            cx="110" cy="110" r={radius}
            fill="none" stroke="#1e293b" strokeWidth="14"
          />
          <circle
            cx="110" cy="110" r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-white">{displayScore}</span>
          <span className="text-sm text-slate-400 font-medium">/100</span>
        </div>
      </div>

      {/* Letter Grade */}
      {showGrade && (
        <div
          className={`mt-3 text-7xl font-black grade-pop ${colors.text}`}
          style={{ textShadow: `0 0 50px ${colors.stroke}50` }}
        >
          {grade}
        </div>
      )}

      <div
        className={`mt-3 px-8 py-2.5 rounded-full font-extrabold text-xl tracking-wider ${colors.text}`}
        style={{ background: colors.bg }}
      >
        {verdict}
      </div>
    </div>
  );
}

export default ScoreCircle;

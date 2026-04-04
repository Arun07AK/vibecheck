import { useState, useEffect } from 'react';

const STAGES = [
  { label: 'Cloning repository...', icon: '&#128230;', duration: 1500 },
  { label: 'Scanning for secrets...', icon: '&#128273;', duration: 1200 },
  { label: 'Checking dependencies...', icon: '&#128230;', duration: 1000 },
  { label: 'Detecting PII exposure...', icon: '&#128101;', duration: 800 },
  { label: 'Analyzing code smells...', icon: '&#129514;', duration: 1000 },
  { label: 'Calculating score...', icon: '&#127919;', duration: 500 },
];

function ScanProgress() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (currentStage < STAGES.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStage((s) => s + 1);
      }, STAGES[currentStage].duration);
      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  return (
    <div className="max-w-lg mx-auto py-20 fade-in">
      <div className="text-center mb-10">
        <div className="inline-block animate-spin text-4xl mb-4">&#9881;</div>
        <h2 className="text-2xl font-bold text-white">Scanning...</h2>
      </div>

      <div className="space-y-3">
        {STAGES.map((stage, i) => (
          <div
            key={stage.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              i < currentStage
                ? 'bg-green-500/10 text-green-400'
                : i === currentStage
                ? 'bg-teal/10 text-teal'
                : 'bg-surface text-slate-500'
            }`}
          >
            <span
              className="text-xl"
              dangerouslySetInnerHTML={{
                __html:
                  i < currentStage
                    ? '&#10003;'
                    : i === currentStage
                    ? stage.icon
                    : '&#9679;',
              }}
            />
            <span className="text-sm font-medium">{stage.label}</span>
            {i === currentStage && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScanProgress;

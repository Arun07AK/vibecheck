import { useState, useEffect } from 'react';
import { GitBranch, Lock, Package, UserCheck, Code2, Target, Loader2, Check, Circle } from 'lucide-react';

const STAGES = [
  { label: 'Cloning repository...', Icon: GitBranch, duration: 1500 },
  { label: 'Scanning for secrets...', Icon: Lock, duration: 1200 },
  { label: 'Checking dependencies...', Icon: Package, duration: 1000 },
  { label: 'Detecting PII exposure...', Icon: UserCheck, duration: 800 },
  { label: 'Analyzing code smells...', Icon: Code2, duration: 1000 },
  { label: 'Calculating score...', Icon: Target, duration: 500 },
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
        <Loader2 className="w-10 h-10 text-teal mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-white">Scanning...</h2>
      </div>

      <div className="space-y-3">
        {STAGES.map((stage, i) => {
          const StageIcon = stage.Icon;
          const done = i < currentStage;
          const active = i === currentStage;

          return (
            <div
              key={stage.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                done
                  ? 'bg-green-500/10 text-green-400'
                  : active
                  ? 'bg-teal/10 text-teal'
                  : 'bg-surface text-slate-500'
              }`}
            >
              {done ? (
                <Check className="w-5 h-5" />
              ) : active ? (
                <StageIcon className="w-5 h-5" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{stage.label}</span>
              {active && (
                <div className="ml-auto">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScanProgress;

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
      const timer = setTimeout(() => setCurrentStage(s => s + 1), STAGES[currentStage].duration);
      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  return (
    <div className="max-w-lg mx-auto py-20 fade-in">
      <div className="text-center mb-8">
        <Loader2 className="w-6 h-6 text-cyan mx-auto mb-3 animate-spin" />
        <h2 className="text-xl font-bold text-white">Scanning...</h2>
      </div>
      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const StageIcon = stage.Icon;
          return (
            <div key={stage.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
              i < currentStage ? 'bg-surface border border-border text-cyan' :
              i === currentStage ? 'bg-surface border border-cyan/30 text-white' :
              'text-[#555]'
            }`}>
              {i < currentStage ? <Check className="w-4 h-4 text-cyan" /> :
               i === currentStage ? <StageIcon className="w-4 h-4" /> :
               <Circle className="w-3 h-3" />}
              <span className="text-xs font-medium">{stage.label}</span>
              {i === currentStage && <Loader2 className="w-3 h-3 animate-spin ml-auto text-cyan" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScanProgress;

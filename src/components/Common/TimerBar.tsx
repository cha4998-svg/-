import React, { useEffect, useState } from 'react';
import { soundManager } from '../../utils/sound';

interface TimerBarProps {
  startTime: number;
  timeLimitSec: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  startTime,
  timeLimitSec,
  onTimeUp,
  isPaused = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    if (!startTime || isPaused) return;

    let timeUpCalled = false;
    let lastSecondTick = Math.ceil(timeLimitSec);

    const interval = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, timeLimitSec - elapsedSec);
      const pct = Math.max(0, (remaining / timeLimitSec) * 100);

      setTimeLeft(remaining);
      setPercent(pct);

      const currentSecond = Math.ceil(remaining);
      if (currentSecond !== lastSecondTick && currentSecond > 0 && currentSecond <= 5) {
        lastSecondTick = currentSecond;
        soundManager.playUrgentTick();
      }

      if (remaining <= 0 && !timeUpCalled) {
        timeUpCalled = true;
        clearInterval(interval);
        if (onTimeUp) onTimeUp();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [startTime, timeLimitSec, isPaused, onTimeUp]);

  // Color changes from green -> amber -> red
  const getColorClass = () => {
    if (percent > 50) return 'from-emerald-500 to-green-500';
    if (percent > 20) return 'from-amber-400 to-orange-500';
    return 'from-rose-500 to-red-600 animate-pulse';
  };

  const getBorderColor = () => {
    if (percent > 50) return 'border-emerald-500/30';
    if (percent > 20) return 'border-amber-500/30';
    return 'border-rose-500/50';
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${percent <= 20 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
          제한시간
        </span>
        <span className={`font-mono text-base font-bold ${percent <= 20 ? 'text-rose-400 font-extrabold animate-bounce' : 'text-slate-200'}`}>
          {timeLeft.toFixed(1)}s
        </span>
      </div>

      <div className={`w-full h-3.5 sm:h-4.5 bg-slate-800/90 rounded-full p-0.5 border ${getBorderColor()} shadow-inner overflow-hidden`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColorClass()} transition-all duration-75 ease-linear shadow-sm`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

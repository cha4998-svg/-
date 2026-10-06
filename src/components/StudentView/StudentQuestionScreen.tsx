import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { StudentRoomState } from '../../types/quiz';
import { TimerBar } from '../Common/TimerBar';
import { soundManager } from '../../utils/sound';
import { speakEnglish } from '../../utils/tts';

interface StudentQuestionScreenProps {
  roomState: StudentRoomState;
  onSubmit: (optionIndex: number, responseTimeMs: number) => void;
}

const OPTION_STYLES = [
  {
    bg: 'bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border-rose-400 active:ring-4 active:ring-rose-400/50',
    icon: '▲',
    label: '1번',
  },
  {
    bg: 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-blue-400 active:ring-4 active:ring-blue-400/50',
    icon: '◆',
    label: '2번',
  },
  {
    bg: 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-amber-300 active:ring-4 active:ring-amber-300/50 text-slate-950',
    icon: '●',
    label: '3번',
  },
  {
    bg: 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-400 active:ring-4 active:ring-emerald-400/50',
    icon: '■',
    label: '4번',
  },
];

export const StudentQuestionScreen: React.FC<StudentQuestionScreenProps> = ({
  roomState,
  onSubmit,
}) => {
  const currentQ = roomState.currentQuestion;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!currentQ) return null;

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return; // Already clicked

    const elapsedMs = Math.max(10, Date.now() - roomState.questionStartTime);
    setSelectedOption(idx);
    soundManager.playClick();

    // Haptic feedback if available on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (_) {}
    }

    onSubmit(idx, elapsedMs);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakEnglish(currentQ.word);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 px-3 py-4 sm:py-6">
      {/* Question Header & Timer */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-mono font-bold">
            문제 {roomState.currentQuestionIndex + 1} / {roomState.totalQuestions}
          </span>
          <span className="text-slate-400 text-xs">
            제출 {roomState.totalSubmitted} / {roomState.totalConnected}명
          </span>
        </div>

        {/* Big Word Card */}
        <div className="text-center py-2 relative">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-wide drop-shadow">
              {currentQ.word}
            </h1>
            <button
              onClick={handleSpeak}
              className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-sky-400 active:scale-95 transition-all"
              title="원어민 발음 듣기"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            {currentQ.partOfSpeech} {currentQ.phonetic}
          </div>
        </div>

        {/* Timer Bar */}
        <TimerBar
          startTime={roomState.questionStartTime}
          timeLimitSec={roomState.timeLimit}
        />
      </div>

      {/* 4 Large Touch Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {currentQ.options.map((opt, idx) => {
          const style = OPTION_STYLES[idx];
          const isChosen = selectedOption === idx;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selectedOption !== null}
              className={`min-h-[105px] sm:min-h-[125px] p-4 rounded-2xl border-2 text-white font-bold text-left flex items-center gap-4 transition-all transform shadow-lg active:scale-95 cursor-pointer ${
                style.bg
              } ${
                isChosen
                  ? 'ring-4 ring-white shadow-2xl scale-[1.02]'
                  : selectedOption !== null
                  ? 'opacity-40 cursor-not-allowed'
                  : ''
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center text-2xl font-mono font-black flex-shrink-0 shadow-inner">
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] uppercase tracking-wider block opacity-75 font-semibold">
                  {style.label}
                </span>
                <span className="text-lg sm:text-xl font-extrabold truncate block">
                  {opt}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

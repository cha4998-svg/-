import React, { useEffect } from 'react';
import { Volume2, CheckCircle2, Users, Eye } from 'lucide-react';
import { TeacherRoomState } from '../../types/quiz';
import { TimerBar } from '../Common/TimerBar';
import { speakEnglish } from '../../utils/tts';

interface TeacherQuestionScreenProps {
  roomState: TeacherRoomState;
  onRevealAnswer: () => void;
  onTriggerBots: () => void;
}

const OPTION_THEMES = [
  { bg: 'bg-rose-600/20 border-rose-500/40 text-rose-200', badge: 'bg-rose-500 text-white', icon: '▲', label: '1번' },
  { bg: 'bg-blue-600/20 border-blue-500/40 text-blue-200', badge: 'bg-blue-500 text-white', icon: '◆', label: '2번' },
  { bg: 'bg-amber-600/20 border-amber-500/40 text-amber-200', badge: 'bg-amber-500 text-slate-900', icon: '●', label: '3번' },
  { bg: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-200', badge: 'bg-emerald-500 text-white', icon: '■', label: '4번' },
];

export const TeacherQuestionScreen: React.FC<TeacherQuestionScreenProps> = ({
  roomState,
  onRevealAnswer,
  onTriggerBots,
}) => {
  const currentQ = roomState.currentQuestion;
  const questionNumber = roomState.currentQuestionIndex + 1;
  const totalQuestions = roomState.totalQuestions;

  // Auto trigger bot answers and TTS speak on mount
  useEffect(() => {
    if (currentQ?.word) {
      speakEnglish(currentQ.word);
    }
    // Simulate bot answers
    onTriggerBots();
  }, [currentQ?.id, onTriggerBots]);

  if (!currentQ) {
    return <div className="text-center p-12 text-slate-300">문제를 불러오는 중...</div>;
  }

  const submittedRatio = roomState.totalConnected > 0
    ? Math.round((roomState.totalSubmitted / roomState.totalConnected) * 100)
    : 0;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakEnglish(currentQ.word);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header / Progress */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 font-mono font-bold text-sm">
            QUESTION {questionNumber} / {totalQuestions}
          </span>
          <span className="text-slate-400 text-xs sm:text-sm font-medium">
            {roomState.selectedUnitTitle}
          </span>
        </div>

        {/* Live Submission Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-slate-200">
            <Users className="w-4 h-4 text-sky-400" />
            <span>제출 현황:</span>
            <span className="text-sky-400 font-bold text-sm">
              {roomState.totalSubmitted} / {roomState.totalConnected}명
            </span>
            <span className="text-slate-400 font-mono">({submittedRatio}%)</span>
          </div>

          <button
            onClick={onRevealAnswer}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            정답 및 랭킹 공개
          </button>
        </div>
      </div>

      {/* Main Question Display Card (Projector View) */}
      <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-2 border-indigo-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-lg text-center relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Part of Speech & Phonetics Badge */}
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700/80 text-sky-300 border border-slate-600">
            {currentQ.partOfSpeech}
          </span>
          {currentQ.phonetic && (
            <span className="text-slate-400 font-mono text-sm">
              {currentQ.phonetic}
            </span>
          )}
        </div>

        {/* Giant English Word */}
        <div className="relative inline-flex items-center justify-center gap-4 my-2">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-wide font-['Outfit'] drop-shadow-lg">
            {currentQ.word}
          </h1>
          <button
            onClick={handleSpeak}
            className="p-3.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/50 text-indigo-200 transition-all active:scale-90 shadow-md"
            title="원어민 발음 듣기"
          >
            <Volume2 className="w-7 h-7 text-indigo-300 animate-pulse" />
          </button>
        </div>

        <p className="text-slate-300 text-base sm:text-lg mt-3 font-medium">
          위 단어의 올바른 뜻을 선택하세요!
        </p>

        {/* Timer Bar */}
        <div className="max-w-xl mx-auto mt-8">
          <TimerBar
            startTime={roomState.questionStartTime}
            timeLimitSec={roomState.timeLimit}
            onTimeUp={onRevealAnswer}
          />
        </div>
      </div>

      {/* 4 Options Grid (Display View for Projector) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQ.options.map((option, idx) => {
          const theme = OPTION_THEMES[idx];
          return (
            <div
              key={idx}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${theme.bg} shadow-md`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl font-mono shadow-sm flex-shrink-0 ${theme.badge}`}>
                {theme.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs uppercase tracking-wider font-semibold opacity-75">
                  {theme.label}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white truncate">
                  {option}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        모든 학생이 답변을 제출하거나 타이머가 종료되면 자동으로 정답이 공개됩니다.
      </div>
    </div>
  );
};

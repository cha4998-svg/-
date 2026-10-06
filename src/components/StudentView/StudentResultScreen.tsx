import React, { useEffect } from 'react';
import { Check, X, Award, Flame, Volume2, Sparkles } from 'lucide-react';
import { StudentRoomState } from '../../types/quiz';
import { soundManager } from '../../utils/sound';
import { speakEnglish } from '../../utils/tts';

interface StudentResultScreenProps {
  roomState: StudentRoomState;
}

export const StudentResultScreen: React.FC<StudentResultScreenProps> = ({ roomState }) => {
  const me = roomState.myStudent;
  const currentQ = roomState.currentQuestion;
  const submission = roomState.mySubmission;
  const isCorrect = submission?.isCorrect ?? false;
  const scoreEarned = submission?.scoreEarned ?? 0;
  const rank = roomState.myRank;

  useEffect(() => {
    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
  }, [isCorrect]);

  const handleSpeak = () => {
    if (currentQ?.word) {
      speakEnglish(currentQ.word);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-5">
      {/* O / X Feedback Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-center border-2 shadow-2xl backdrop-blur-md transition-all ${
          isCorrect
            ? 'bg-gradient-to-b from-emerald-900/60 to-slate-900/90 border-emerald-400/60 ring-2 ring-emerald-500/20'
            : 'bg-gradient-to-b from-rose-900/60 to-slate-900/90 border-rose-500/60 ring-2 ring-rose-500/20'
        }`}
      >
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl mb-3 ${
            isCorrect
              ? 'bg-emerald-500 text-white animate-bounce'
              : 'bg-rose-500 text-white'
          }`}
        >
          {isCorrect ? <Check className="w-12 h-12 stroke-[3]" /> : <X className="w-12 h-12 stroke-[3]" />}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {isCorrect ? '정답입니다! 🎉' : '아쉬워요! 다음 기회에 💪'}
        </h2>

        {isCorrect ? (
          <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-base">
            <Sparkles className="w-4 h-4 text-amber-300" />
            +{scoreEarned.toLocaleString()} pts 획득!
          </div>
        ) : (
          <div className="mt-2 text-xs text-rose-300 font-semibold">
            정답은 <span className="font-bold underline text-white">{currentQ?.meaning}</span> 였습니다.
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-700/80">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 text-left">
            <div className="text-[11px] text-slate-400 font-semibold">내 현재 점수</div>
            <div className="font-mono font-black text-amber-300 text-lg mt-0.5">
              {me?.score.toLocaleString()} <span className="text-xs text-slate-400 font-normal">pts</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 text-left">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>내 현재 순위</span>
              {me && me.streak >= 2 && (
                <span className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 fill-orange-400" />
                  {me.streak}연승
                </span>
              )}
            </div>
            <div className="font-mono font-black text-sky-400 text-lg mt-0.5 flex items-center gap-1">
              <Award className="w-4 h-4" />
              {rank ? `${rank}위` : '-'}
              <span className="text-xs text-slate-400 font-normal">/ {roomState.totalConnected}명</span>
            </div>
          </div>
        </div>
      </div>

      {/* Word Review Card */}
      {currentQ && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              단어 복습 (Vocabulary Review)
            </span>
            <button
              onClick={handleSpeak}
              className="p-1.5 text-sky-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              title="발음 듣기"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-white font-['Outfit']">
              {currentQ.word}
            </span>
            <span className="text-lg font-bold text-emerald-400">
              = {currentQ.meaning}
            </span>
          </div>

          {currentQ.exampleEn && (
            <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <p className="text-slate-200 font-medium">"{currentQ.exampleEn}"</p>
              <p className="text-slate-400">"{currentQ.exampleKo}"</p>
            </div>
          )}
        </div>
      )}

      {/* Footer wait message */}
      <div className="text-center text-xs text-slate-400 py-1">
        선생님이 다음 문제로 이동할 때까지 잠시 대기해 주세요...
      </div>
    </div>
  );
};

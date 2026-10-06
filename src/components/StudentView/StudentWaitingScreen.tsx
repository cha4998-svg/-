import React from 'react';
import { Loader2, Flame, Award, BookOpen } from 'lucide-react';
import { StudentRoomState } from '../../types/quiz';

interface StudentWaitingScreenProps {
  roomState: StudentRoomState;
}

export const StudentWaitingScreen: React.FC<StudentWaitingScreenProps> = ({ roomState }) => {
  const me = roomState.myStudent;
  const rank = roomState.myRank;

  return (
    <div className="max-w-md mx-auto py-8 px-4 text-center space-y-6">
      {/* Student Badge Card */}
      {me && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1 bg-slate-900 rounded-xl border border-slate-700">
              {me.avatar}
            </span>
            <div className="text-left">
              <div className="font-bold text-white text-base flex items-center gap-1.5">
                {me.name}
                {me.streak >= 2 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-400 font-extrabold bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/30">
                    <Flame className="w-3 h-3 fill-orange-400" />
                    {me.streak}연속
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {me.grade}학년 {me.classNum}반 {me.studentNum}번
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">내 현재 점수</div>
            <div className="font-mono font-extrabold text-amber-300 text-lg">
              {me.score.toLocaleString()} <span className="text-xs text-slate-400 font-normal">pts</span>
            </div>
            {rank && (
              <div className="text-[11px] text-sky-400 font-semibold flex items-center justify-end gap-1">
                <Award className="w-3 h-3" />
                현재 {rank}위 / {roomState.totalConnected}명
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Waiting Card */}
      <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-2 border-indigo-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md space-y-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-400/30 flex items-center justify-center mx-auto text-4xl animate-pulse">
            ⏳
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 rounded-full border-2 border-slate-900 shadow-md">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            선생님이 다음 문제를<br />준비 중입니다...
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            선생님이 문제를 시작하면 태블릿 화면에 보기가 바로 나타납니다.
          </p>
        </div>

        {/* Current Unit Badge */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-left flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-sky-400 uppercase">
              진행 중인 퀴즈
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
              {roomState.selectedUnitTitle}
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="text-[11px] text-slate-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
          💡 <span className="font-semibold text-slate-300">꿀팁:</span> 정답을 정확하고 빠르게 누를수록 최고 500점의 스피드 보너스가 추가됩니다!
        </div>
      </div>
    </div>
  );
};

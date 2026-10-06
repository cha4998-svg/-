import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Flame, BookCheck } from 'lucide-react';
import { StudentRoomState } from '../../types/quiz';
import { soundManager } from '../../utils/sound';

interface StudentFinalScreenProps {
  roomState: StudentRoomState;
}

export const StudentFinalScreen: React.FC<StudentFinalScreenProps> = ({ roomState }) => {
  const me = roomState.myStudent;
  const rank = roomState.myRank;
  const isTop3 = rank !== null && rank <= 3;

  useEffect(() => {
    if (isTop3) {
      soundManager.playFanfare();
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
      });
    } else {
      soundManager.playCorrect();
    }
  }, [isTop3]);

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6 text-center">
      <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-2 border-indigo-500/40 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="text-5xl sm:text-6xl animate-bounce">
          {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎉'}
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/20">
            Game Over • 최종 결과
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            수고하셨습니다!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            {roomState.selectedUnitTitle} 퀴즈 완료
          </p>
        </div>

        {/* My Card */}
        {me && (
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">{me.avatar}</span>
              <div className="text-left">
                <div className="font-extrabold text-white text-lg">
                  {me.name}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {me.grade}학년 {me.classNum}반 {me.studentNum}번
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-left">
              <div className="p-2.5 rounded-xl bg-slate-800/80">
                <span className="text-[11px] text-slate-400 block">최종 순위</span>
                <span className="text-xl font-black text-amber-300 font-mono flex items-center gap-1 mt-0.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {rank ? `${rank}위` : '-'}
                  <span className="text-xs text-slate-400 font-normal">/ {roomState.totalConnected}명</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80">
                <span className="text-[11px] text-slate-400 block">최종 점수</span>
                <span className="text-xl font-black text-sky-400 font-mono mt-0.5 block">
                  {me.score.toLocaleString()} <span className="text-xs text-slate-400 font-normal">pts</span>
                </span>
              </div>
            </div>

            {me.streak >= 3 && (
              <div className="text-xs text-orange-400 font-bold flex items-center justify-center gap-1.5 bg-orange-500/10 py-1.5 rounded-lg border border-orange-500/20">
                <Flame className="w-4 h-4 fill-orange-400" />
                최대 {me.streak}문제 연속 정답 스트릭 달성!
              </div>
            )}
          </div>
        )}

        {/* Top 3 Podium preview for student */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            우리 반 TOP 3
          </div>
          <div className="space-y-1.5">
            {roomState.leaderboard.slice(0, 3).map((st, i) => (
              <div
                key={st.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-white font-semibold">{st.name}</span>
                </div>
                <span className="font-mono text-amber-300 font-bold">
                  {st.score.toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <BookCheck className="w-4 h-4 text-emerald-400" />
          선생님이 새 게임을 시작하면 자동으로 대기실로 이동합니다.
        </div>
      </div>
    </div>
  );
};

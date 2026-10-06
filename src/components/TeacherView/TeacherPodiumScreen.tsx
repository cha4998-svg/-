import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Download, RotateCcw, Medal, CloudCheck, Loader2 } from 'lucide-react';
import { TeacherRoomState } from '../../types/quiz';
import { soundManager } from '../../utils/sound';
import { saveQuizReportToFirebase } from '../../firebase/quizService';

interface TeacherPodiumScreenProps {
  roomState: TeacherRoomState;
  onResetToLobby: () => void;
}

export const TeacherPodiumScreen: React.FC<TeacherPodiumScreenProps> = ({
  roomState,
  onResetToLobby,
}) => {
  const leaderboard = roomState.leaderboard || [];
  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];
  const [firebaseStatus, setFirebaseStatus] = useState<'saving' | 'saved' | 'idle'>('saving');

  useEffect(() => {
    soundManager.playFanfare();

    // Trigger confetti cannon
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
    }, 250);

    // Auto-save to Firebase Firestore
    if (leaderboard.length > 0) {
      saveQuizReportToFirebase(roomState.selectedUnitTitle, roomState.totalQuestions, leaderboard)
        .then(() => setFirebaseStatus('saved'))
        .catch(() => setFirebaseStatus('idle'));
    } else {
      setFirebaseStatus('idle');
    }

    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    if (!leaderboard.length) return;
    const header = ['순위,학번,이름,총점수,최종연승\n'];
    const rows = leaderboard.map(
      (st) => `${st.rank},"${st.grade}-${st.classNum}-${st.studentNum.toString().padStart(2, '0')}",${st.name},${st.score},${st.streak}`
    );
    const csvContent = '\uFEFF' + header.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `영어단어퀴즈_${roomState.selectedUnitTitle}_결과.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-bold shadow-md">
            <Award className="w-4 h-4 text-amber-400" />
            Quiz Completed! 최종 결과 발표
          </div>

          {firebaseStatus === 'saving' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30 text-xs font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              Firebase 저장 중...
            </div>
          )}

          {firebaseStatus === 'saved' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-semibold animate-pulse">
              <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              Firebase Firestore에 안전하게 저장됨
            </div>
          )}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          명예의 전당 (Top 3 Podium)
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          모든 문제가 종료되었습니다! 가장 높은 점수와 빠른 속도를 기록한 주인공들을 축하해 주세요!
        </p>
      </div>

      {/* Podium Visualization */}
      <div className="pt-8 pb-4 flex items-end justify-center gap-3 sm:gap-6 max-w-3xl mx-auto px-4">
        {/* 2nd Place */}
        {second ? (
          <div className="flex-1 flex flex-col items-center">
            <div className="text-3xl sm:text-4xl mb-1 animate-bounce">{second.avatar}</div>
            <div className="font-bold text-white text-xs sm:text-sm text-center truncate max-w-[120px]">
              {second.name}
            </div>
            <div className="text-[11px] text-slate-300 font-mono mb-2">
              {second.score.toLocaleString()} pts
            </div>
            <div className="w-full h-36 sm:h-44 rounded-t-2xl bg-gradient-to-t from-slate-700 to-slate-500 border-t-4 border-slate-300 shadow-xl flex flex-col items-center justify-center p-3 text-white">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono">2</span>
              <span className="text-[11px] font-bold text-slate-200 mt-1">SILVER</span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* 1st Place */}
        {first && (
          <div className="flex-1 flex flex-col items-center -mt-6">
            <div className="text-4xl sm:text-6xl mb-1 filter drop-shadow-md animate-bounce">
              👑
            </div>
            <div className="text-3xl sm:text-5xl mb-1">{first.avatar}</div>
            <div className="font-extrabold text-amber-300 text-sm sm:text-lg text-center truncate max-w-[140px]">
              {first.name}
            </div>
            <div className="text-xs sm:text-sm text-amber-200 font-mono font-bold mb-2">
              {first.score.toLocaleString()} pts
            </div>
            <div className="w-full h-48 sm:h-60 rounded-t-2xl bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-400 border-t-4 border-amber-200 shadow-2xl flex flex-col items-center justify-center p-3 text-slate-950">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-900 fill-amber-950" />
              <span className="text-3xl sm:text-5xl font-black font-mono">1</span>
              <span className="text-xs font-black tracking-widest text-amber-950 mt-1">CHAMPION</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third ? (
          <div className="flex-1 flex flex-col items-center">
            <div className="text-3xl sm:text-4xl mb-1 animate-bounce">{third.avatar}</div>
            <div className="font-bold text-white text-xs sm:text-sm text-center truncate max-w-[120px]">
              {third.name}
            </div>
            <div className="text-[11px] text-slate-300 font-mono mb-2">
              {third.score.toLocaleString()} pts
            </div>
            <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-700 border-t-4 border-amber-600 shadow-xl flex flex-col items-center justify-center p-3 text-white">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono">3</span>
              <span className="text-[11px] font-bold text-amber-200 mt-1">BRONZE</span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-semibold transition-all active:scale-95 shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4 text-sky-400" />
          성적표 CSV 다운로드
        </button>

        <button
          onClick={onResetToLobby}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer ring-2 ring-indigo-400/40"
        >
          <RotateCcw className="w-4 h-4" />
          새 퀴즈 시작 (대기실로 이동)
        </button>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
            <Medal className="w-5 h-5 text-amber-400" />
            전체 학생 순위표 ({leaderboard.length}명)
          </div>
          <span className="text-xs text-slate-400">
            총 {roomState.totalQuestions}문제 완료
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">순위</th>
                <th className="py-3 px-4">학번</th>
                <th className="py-3 px-4">이름</th>
                <th className="py-3 px-4 text-right">점수</th>
                <th className="py-3 px-4 text-center">최고 연승</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {leaderboard.map((st, idx) => (
                <tr
                  key={st.id}
                  className={`hover:bg-slate-700/40 transition-colors ${
                    idx < 3 ? 'bg-indigo-950/20 font-bold' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    {idx === 0 ? '🥇 1위' : idx === 1 ? '🥈 2위' : idx === 2 ? '🥉 3위' : `${idx + 1}위`}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                    {st.grade}학년 {st.classNum}반 {st.studentNum}번
                  </td>
                  <td className="py-3 px-4 text-white flex items-center gap-2">
                    <span className="text-xl">{st.avatar}</span>
                    <span>{st.name}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                    {st.score.toLocaleString()} pts
                  </td>
                  <td className="py-3 px-4 text-center text-xs font-mono text-slate-300">
                    {st.streak}연속
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { Trophy, Volume2, ArrowRight, CheckCircle, Flame } from 'lucide-react';
import { TeacherRoomState } from '../../types/quiz';
import { speakEnglish } from '../../utils/tts';
import { soundManager } from '../../utils/sound';

interface TeacherReviewScreenProps {
  roomState: TeacherRoomState;
  onNextQuestion: () => void;
  onEndGame: () => void;
}

const OPTION_LABELS = ['1번 ▲', '2번 ◆', '3번 ●', '4번 ■'];

export const TeacherReviewScreen: React.FC<TeacherReviewScreenProps> = ({
  roomState,
  onNextQuestion,
  onEndGame,
}) => {
  const currentQ = roomState.currentQuestion;
  const isLastQuestion = roomState.currentQuestionIndex + 1 >= roomState.totalQuestions;

  useEffect(() => {
    soundManager.playCorrect();
  }, []);

  if (!currentQ) return null;

  const totalSubs = roomState.totalSubmitted || 1;
  const topStudents = roomState.leaderboard.slice(0, 5);

  const handleSpeakExample = () => {
    speakEnglish(currentQ.exampleEn);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
            라운드 결과 & 정답 해설
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Question {roomState.currentQuestionIndex + 1} 결과 분석
          </h2>
        </div>

        <div>
          {isLastQuestion ? (
            <button
              onClick={onEndGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer ring-2 ring-amber-400/50"
            >
              <Trophy className="w-5 h-5" />
              최종 시상식 결과 보기
            </button>
          ) : (
            <button
              onClick={onNextQuestion}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer ring-2 ring-indigo-400/40"
            >
              다음 문제로 이동
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Answer Details & Option Distribution */}
        <div className="lg:col-span-7 space-y-6">
          {/* Answer Card */}
          <div className="bg-slate-800/90 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                정답: {currentQ.correctIndex + 1}번 {currentQ.options[currentQ.correctIndex]}
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {currentQ.partOfSpeech} {currentQ.phonetic}
              </span>
            </div>

            <div className="flex items-baseline gap-4 pt-2">
              <h3 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
                {currentQ.word}
              </h3>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-300">
                = {currentQ.meaning}
              </span>
            </div>

            {/* Example sentence box */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 space-y-1.5 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  교과서 예문 (Example Sentence)
                </span>
                <button
                  onClick={handleSpeakExample}
                  className="flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200 transition-colors p-1"
                  title="예문 발음 듣기"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  예문 듣기
                </button>
              </div>
              <p className="text-white text-base sm:text-lg font-medium">
                "{currentQ.exampleEn}"
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">
                "{currentQ.exampleKo}"
              </p>
            </div>
          </div>

          {/* Option Distribution Chart */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3">
            <h4 className="text-sm font-bold text-slate-300 flex items-center justify-between">
              <span>학생 응답 분포 (Choice Distribution)</span>
              <span className="text-xs text-slate-400">총 {roomState.totalSubmitted}명 응답</span>
            </h4>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const count = roomState.optionCounts?.[idx] || 0;
                const ratio = Math.round((count / totalSubs) * 100);
                const isCorrect = idx === currentQ.correctIndex;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={`flex items-center gap-2 ${isCorrect ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                        <span>{OPTION_LABELS[idx]}</span>
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/30">
                            정답
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-slate-400">
                        {count}명 ({ratio}%)
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCorrect
                            ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Top 5 Leaderboard */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  실시간 TOP 5 랭킹
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                정답 + 속도 점수 합산
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {topStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  아직 순위 데이터가 없습니다.
                </div>
              ) : (
                topStudents.map((st, idx) => {
                  const rankIcons = ['🥇', '🥈', '🥉', '4위', '5위'];
                  const isTop3 = idx < 3;

                  return (
                    <div
                      key={st.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        idx === 0
                          ? 'bg-amber-500/15 border-amber-400/40 ring-1 ring-amber-400/30'
                          : idx === 1
                          ? 'bg-slate-700/60 border-slate-500/40'
                          : idx === 2
                          ? 'bg-amber-900/30 border-amber-700/40'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-bold font-mono text-sm sm:text-base w-7 text-center ${isTop3 ? 'text-amber-300' : 'text-slate-400'}`}>
                          {rankIcons[idx]}
                        </span>
                        <span className="text-2xl">{st.avatar}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                            {st.name}
                            {st.streak >= 2 && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-400 font-extrabold bg-orange-500/10 px-1 rounded border border-orange-500/20">
                                <Flame className="w-3 h-3 fill-orange-400" />
                                {st.streak}연승
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {st.grade}-{st.classNum}-{st.studentNum.toString().padStart(2, '0')}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-amber-300 font-mono">
                          {st.score.toLocaleString()} <span className="text-xs font-normal text-slate-400">pts</span>
                        </div>
                        {st.lastScoreEarned > 0 && (
                          <div className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                            +{st.lastScoreEarned}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/80 text-center">
            <span className="text-xs text-slate-400">
              ⚡ 정답을 빠르게 맞힐수록 속도 보너스가 더 많이 지급됩니다!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

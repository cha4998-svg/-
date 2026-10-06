import React from 'react';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { StudentRoomState } from '../../types/quiz';

interface StudentSubmittedScreenProps {
  roomState: StudentRoomState;
}

const OPTION_ICONS = ['▲ 1번', '◆ 2번', '● 3번', '■ 4번'];

export const StudentSubmittedScreen: React.FC<StudentSubmittedScreenProps> = ({ roomState }) => {
  const submission = roomState.mySubmission;
  const currentQ = roomState.currentQuestion;

  const chosenOptionIndex = submission?.optionIndex ?? -1;
  const chosenOptionText = (currentQ?.options && chosenOptionIndex >= 0)
    ? currentQ.options[chosenOptionIndex]
    : '';

  const responseTimeSec = submission
    ? (submission.responseTimeMs / 1000).toFixed(2)
    : '0.00';

  return (
    <div className="max-w-md mx-auto py-8 px-4 text-center space-y-6">
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">
            답변 제출 완료!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            선생님이 정답을 공개할 때까지 잠시만 기다려주세요.
          </p>
        </div>

        {/* Selected Answer Card */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 text-left space-y-3">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              내가 선택한 답변:
            </div>
            <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <span className="text-sky-400 font-mono text-sm">
                {OPTION_ICONS[chosenOptionIndex] || ''}
              </span>
              <span className="text-emerald-300 truncate">{chosenOptionText}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              내 응답 속도:
            </span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {responseTimeSec}초 ({submission?.responseTimeMs.toLocaleString()} ms)
            </span>
          </div>
        </div>

        {/* Live Submission Progress */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          <span>전체 {roomState.totalConnected}명 중 {roomState.totalSubmitted}명 제출 완료</span>
        </div>
      </div>
    </div>
  );
};

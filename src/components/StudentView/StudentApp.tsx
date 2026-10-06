import React, { useState, useEffect } from 'react';
import { useQuizSocket } from '../../hooks/useQuizSocket';
import { StudentJoinScreen } from './StudentJoinScreen';
import { StudentWaitingScreen } from './StudentWaitingScreen';
import { StudentQuestionScreen } from './StudentQuestionScreen';
import { StudentSubmittedScreen } from './StudentSubmittedScreen';
import { StudentResultScreen } from './StudentResultScreen';
import { StudentFinalScreen } from './StudentFinalScreen';
import { Wifi, WifiOff, LogOut } from 'lucide-react';

interface StudentInfo {
  studentKey: string;
  name: string;
  grade: number;
  classNum: number;
  studentNum: number;
  avatar: string;
  pin: string;
}

const STORAGE_KEY = 'quiz_student_profile_v1';

export const StudentApp: React.FC = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Extract initial PIN from URL params if present
  const queryPin = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('pin') || '7392'
    : '7392';

  const {
    isConnected,
    studentState,
    errorMsg,
    isKicked,
    submitAnswer,
  } = useQuizSocket('student', studentInfo);

  const handleJoin = (info: StudentInfo) => {
    setStudentInfo(info);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch (_) {}
  };

  const handleLogout = () => {
    setStudentInfo(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  if (!studentInfo || isKicked) {
    return (
      <StudentJoinScreen
        initialPin={studentInfo?.pin || queryPin}
        onJoin={handleJoin}
        errorMsg={isKicked ? '선생님에 의해 퇴장되었습니다.' : errorMsg}
      />
    );
  }

  const status = studentState?.status || 'lobby';
  const hasSubmitted = !!studentState?.mySubmission;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Status Bar for Student */}
      <header className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">{studentInfo.avatar}</span>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span>{studentInfo.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({studentInfo.studentKey})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">실시간 연결됨</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-medium text-[11px] animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">연결 재시도 중...</span>
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="나가기 (로그아웃)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 flex flex-col justify-center">
        {!studentState ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            게임 방에 연결하는 중...
          </div>
        ) : status === 'lobby' ? (
          <StudentWaitingScreen roomState={studentState} />
        ) : status === 'question' ? (
          hasSubmitted ? (
            <StudentSubmittedScreen roomState={studentState} />
          ) : (
            <StudentQuestionScreen
              roomState={studentState}
              onSubmit={submitAnswer}
            />
          )
        ) : status === 'review' ? (
          <StudentResultScreen roomState={studentState} />
        ) : status === 'ended' ? (
          <StudentFinalScreen roomState={studentState} />
        ) : (
          <StudentWaitingScreen roomState={studentState} />
        )}
      </main>

      {/* Bottom Subtle Watermark */}
      <footer className="py-2 text-center text-[11px] text-slate-500 font-medium">
        중1 영어 실시간 단어 퀴즈 • 학생 화면
      </footer>
    </div>
  );
};

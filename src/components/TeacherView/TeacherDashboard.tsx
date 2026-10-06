import React, { useState, useEffect } from 'react';
import { useQuizSocket } from '../../hooks/useQuizSocket';
import { TeacherLobby } from './TeacherLobby';
import { TeacherQuestionScreen } from './TeacherQuestionScreen';
import { TeacherReviewScreen } from './TeacherReviewScreen';
import { TeacherPodiumScreen } from './TeacherPodiumScreen';
import { TeacherCustomModal } from './TeacherCustomModal';
import { TeacherReportsModal } from './TeacherReportsModal';
import { VocabularyUnit } from '../../types/quiz';
import { VOCABULARY_UNITS } from '../../data/vocabularySets';
import { testFirestoreConnection } from '../../firebase/config';
import { Lock, Maximize2, Minimize2, Wifi, WifiOff, ShieldCheck, Database } from 'lucide-react';

const TEACHER_AUTH_KEY = 'quiz_teacher_auth_token_v1';
const DEFAULT_PASSWORD = 'teacher1234'; // Easy default for classroom use

export const TeacherDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(TEACHER_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  // Test Firestore connection on mount
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });
  }, []);

  const {
    isConnected,
    teacherState,
    setUnitAndQuestions,
    startGame,
    nextQuestion,
    revealAnswer,
    endGame,
    resetToLobby,
    kickStudent,
    clearAllStudents,
    addBotStudents,
    triggerBotAnswers,
  } = useQuizSocket('teacher');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === DEFAULT_PASSWORD || passwordInput === '1234') {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(TEACHER_AUTH_KEY, 'true');
      } catch (_) {}
      setAuthError(null);
    } else {
      setAuthError(`비밀번호가 올바르지 않습니다. (기본 비밀번호: ${DEFAULT_PASSWORD})`);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(TEACHER_AUTH_KEY);
    } catch (_) {}
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // If unit is not set yet on server, initialize with unit 1
  React.useEffect(() => {
    if (teacherState && (!teacherState.questions || teacherState.questions.length === 0)) {
      const defaultUnit = VOCABULARY_UNITS[0];
      setUnitAndQuestions(
        defaultUnit.id,
        defaultUnit.title,
        defaultUnit.questions,
        15,
        teacherState.pin || '7392'
      );
    }
  }, [teacherState, setUnitAndQuestions]);

  const handleSetUnit = (unit: VocabularyUnit, timeLimit: number) => {
    setUnitAndQuestions(
      unit.id,
      unit.title,
      unit.questions,
      timeLimit,
      teacherState?.pin || '7392'
    );
  };

  const handleSaveCustomUnit = (unit: VocabularyUnit) => {
    setUnitAndQuestions(
      unit.id,
      unit.title,
      unit.questions,
      teacherState?.timeLimit || 15,
      teacherState?.pin || '7392'
    );
  };

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto text-indigo-400">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              교사 관리자 접속 (Teacher View)
            </h2>
            <p className="text-xs text-slate-400">
              퀴즈 진행 및 메인 디스플레이 제어를 위해 교사 비밀번호를 입력하세요.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={`기본 비밀번호: ${DEFAULT_PASSWORD}`}
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none transition-all"
                autoFocus
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                * 최초 실행 기본값: <span className="font-mono text-indigo-400 font-bold">{DEFAULT_PASSWORD}</span>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              대시보드 로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  const status = teacherState?.status || 'lobby';

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header Bar for Teacher */}
      <header className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <div className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <span>중1 영어 실시간 단어 퀴즈</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                교사용 메인 화면
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Room PIN: <span className="text-sky-400 font-bold">{teacherState?.pin || '7392'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Firebase Firestore Cloud Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-amber-300 font-medium">
              {isFirestoreConnected ? 'Firebase 연동됨' : 'Firebase 연결 중'}
            </span>
          </div>

          {/* Past Reports Button */}
          <button
            onClick={() => setIsReportsModalOpen(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
            title="파이어베이스에 저장된 과거 퀴즈 결과 확인"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">퀴즈 기록</span>
          </button>

          {/* Realtime Socket Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">실시간 연동 정상</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-medium animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">서버 재연결 중...</span>
              </span>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="프로젝터 전체화면 토글"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="text-xs px-2.5 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 flex flex-col justify-center">
        {!teacherState ? (
          <div className="text-center py-20 text-slate-400">
            대시보드 데이터를 불러오는 중...
          </div>
        ) : status === 'lobby' ? (
          <TeacherLobby
            roomState={teacherState}
            onSetUnit={handleSetUnit}
            onStartGame={startGame}
            onAddBots={addBotStudents}
            onKickStudent={kickStudent}
            onClearAll={clearAllStudents}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
          />
        ) : status === 'question' ? (
          <TeacherQuestionScreen
            roomState={teacherState}
            onRevealAnswer={revealAnswer}
            onTriggerBots={triggerBotAnswers}
          />
        ) : status === 'review' ? (
          <TeacherReviewScreen
            roomState={teacherState}
            onNextQuestion={nextQuestion}
            onEndGame={endGame}
          />
        ) : status === 'ended' ? (
          <TeacherPodiumScreen
            roomState={teacherState}
            onResetToLobby={resetToLobby}
          />
        ) : null}
      </main>

      {/* Custom Word Modal */}
      <TeacherCustomModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSaveCustomUnit={handleSaveCustomUnit}
      />

      {/* Firebase Past Reports Modal */}
      <TeacherReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  );
};

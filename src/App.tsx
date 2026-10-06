import { useState, useEffect } from 'react';
import { TeacherDashboard } from './components/TeacherView/TeacherDashboard';
import { StudentApp } from './components/StudentView/StudentApp';
import { Monitor, Smartphone } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<'landing' | 'teacher' | 'student'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'teacher' || urlRole === 'student') {
        return urlRole;
      }
      const saved = sessionStorage.getItem('quiz_preferred_role');
      if (saved === 'teacher' || saved === 'student') {
        return saved;
      }
    }
    return 'landing';
  });

  const selectRole = (newRole: 'teacher' | 'student') => {
    setRole(newRole);
    try {
      sessionStorage.setItem('quiz_preferred_role', newRole);
      const url = new URL(window.location.href);
      url.searchParams.set('role', newRole);
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'teacher' || urlRole === 'student') {
        setRole(urlRole);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Noto_Sans_KR',sans-serif]">
      {/* Floating Role Quick Switcher Pill (always accessible at the top corner) */}
      <div className="fixed top-2.5 right-3 z-50 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-full p-1 shadow-lg backdrop-blur-md">
        <button
          onClick={() => selectRole('teacher')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            role === 'teacher'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="교사 프로젝터 화면으로 전환"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">교사 화면</span>
        </button>

        <button
          onClick={() => selectRole('student')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            role === 'student'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="학생 태블릿 화면으로 전환"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">학생 화면</span>
        </button>
      </div>

      {role === 'landing' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-xl w-full text-center space-y-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
            {/* Logo / Badge */}
            <div className="space-y-3">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 p-0.5 shadow-xl flex items-center justify-center text-4xl">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                  🎯
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                중1 영어 실시간 단어 퀴즈
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                교사 메인 화면(프로젝터)과 학생 태블릿이 실시간으로 동기화되어<br className="hidden sm:inline" />
                정답률과 응답 속도에 따른 랭킹을 실시간으로 산출합니다.
              </p>
            </div>

            {/* Role Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => selectRole('teacher')}
                className="group p-6 rounded-2xl bg-gradient-to-b from-slate-800 to-indigo-950/40 border-2 border-indigo-500/40 hover:border-indigo-400 transition-all text-left space-y-3 shadow-lg hover:shadow-indigo-500/10 cursor-pointer active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                    교사용 화면 (Display)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    프로젝터/전자칠판용 메인 화면. 단원 선택, 문제 진행 및 실시간 랭킹 제어
                  </p>
                </div>
                <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 pt-1">
                  교사 대시보드 열기 →
                </div>
              </button>

              <button
                onClick={() => selectRole('student')}
                className="group p-6 rounded-2xl bg-gradient-to-b from-slate-800 to-sky-950/40 border-2 border-sky-500/40 hover:border-sky-400 transition-all text-left space-y-3 shadow-lg hover:shadow-sky-500/10 cursor-pointer active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-600/30 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                    학생용 화면 (Tablet)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    학생 개인 태블릿/스마트폰용 화면. 학번-이름 입력 후 즉시 문제 풀이
                  </p>
                </div>
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1 pt-1">
                  학생 참여 화면 열기 →
                </div>
              </button>
            </div>

            <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
              💡 팁: 새 탭에서 학생 화면을 열어 1대의 기기에서도 교사와 학생 화면을 동시에 테스트할 수 있습니다.
            </div>
          </div>
        </div>
      ) : role === 'teacher' ? (
        <TeacherDashboard />
      ) : (
        <StudentApp />
      )}
    </div>
  );
}

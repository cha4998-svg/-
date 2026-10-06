import React, { useState } from 'react';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface StudentJoinScreenProps {
  initialPin?: string;
  onJoin: (info: {
    studentKey: string;
    name: string;
    grade: number;
    classNum: number;
    studentNum: number;
    avatar: string;
    pin: string;
  }) => void;
  errorMsg?: string | null;
}

const AVATARS = ['🐱', '🐶', '🐰', '🦊', '🐼', '🦁', '🐯', '🦄', '🐸', '🦉'];

export const StudentJoinScreen: React.FC<StudentJoinScreenProps> = ({
  initialPin = '7392',
  onJoin,
  errorMsg,
}) => {
  const [pin, setPin] = useState(initialPin);
  const [grade, setGrade] = useState(1);
  const [classNum, setClassNum] = useState(2);
  const [studentNum, setStudentNum] = useState(5);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🐱');
  const [localError, setLocalError] = useState<string | null>(null);

  const studentKey = `2026-${grade}-${classNum}-${studentNum.toString().padStart(2, '0')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('이름을 입력해 주세요.');
      return;
    }
    if (!pin.trim()) {
      setLocalError('방 PIN 번호를 입력해 주세요.');
      return;
    }

    setLocalError(null);
    soundManager.playClick();
    onJoin({
      studentKey,
      name: name.trim(),
      grade: Number(grade),
      classNum: Number(classNum),
      studentNum: Number(studentNum),
      avatar,
      pin: pin.trim(),
    });
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <div className="bg-slate-800/90 border border-slate-700/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-400/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            학생 참여 입장 (Student Join)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            영어 단어 퀴즈 접속
          </h2>
          <p className="text-xs text-slate-400">
            회원가입 없이 학년, 반, 번호, 이름만 입력하고 즉시 입장하세요!
          </p>
        </div>

        {/* Error notification */}
        {(errorMsg || localError) && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg || localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Room PIN (선생님 화면의 번호)
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-sky-500 rounded-xl px-4 py-2.5 text-center text-xl font-mono font-black text-sky-400 tracking-widest focus:outline-none transition-all"
              placeholder="예: 7392"
              required
            />
          </div>

          {/* Grade, Class, Number Selector */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                학년
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-sm font-semibold focus:outline-none focus:border-sky-500"
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                반
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={classNum}
                onChange={(e) => setClassNum(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center text-white text-sm font-semibold focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                번호
              </label>
              <input
                type="number"
                min={1}
                max={45}
                value={studentNum}
                onChange={(e) => setStudentNum(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center text-white text-sm font-semibold focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          {/* Student Key display */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">생성된 학생 식별키:</span>
            <span className="font-mono font-bold text-sky-400">{studentKey}</span>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              이름 (실명 또는 닉네임)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              maxLength={10}
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-sky-500 rounded-xl px-4 py-2.5 text-white text-base font-bold focus:outline-none transition-all"
              required
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              내 캐릭터 아바타 선택
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'bg-sky-500/30 border-2 border-sky-400 scale-105 shadow-md shadow-sky-500/20'
                      : 'bg-slate-900/70 border border-slate-700 hover:bg-slate-700/60'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-lg shadow-sky-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            게임 방 입장하기
          </button>
        </form>
      </div>
    </div>
  );
};

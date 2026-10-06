import React, { useState } from 'react';
import { Play, Users, Clock, BookOpen, UserPlus, Trash2, PlusCircle, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { VocabularyUnit, TeacherRoomState } from '../../types/quiz';
import { VOCABULARY_UNITS } from '../../data/vocabularySets';
import { QRCodeCard } from '../Common/QRCodeCard';
import { soundManager } from '../../utils/sound';

interface TeacherLobbyProps {
  roomState: TeacherRoomState;
  onSetUnit: (unit: VocabularyUnit, timeLimit: number) => void;
  onStartGame: () => void;
  onAddBots: (count: number) => void;
  onKickStudent: (id: string) => void;
  onClearAll: () => void;
  onOpenCustomModal: () => void;
}

export const TeacherLobby: React.FC<TeacherLobbyProps> = ({
  roomState,
  onSetUnit,
  onStartGame,
  onAddBots,
  onKickStudent,
  onClearAll,
  onOpenCustomModal,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState(roomState.selectedUnitId || VOCABULARY_UNITS[0].id);
  const [timeLimit, setTimeLimit] = useState(roomState.timeLimit || 15);
  const [soundOn, setSoundOn] = useState(soundManager.isEnabled());

  const handleUnitSelect = (unit: VocabularyUnit) => {
    setSelectedUnitId(unit.id);
    onSetUnit(unit, timeLimit);
    soundManager.playClick();
  };

  const handleTimeChange = (sec: number) => {
    setTimeLimit(sec);
    const unit = VOCABULARY_UNITS.find(u => u.id === selectedUnitId) || VOCABULARY_UNITS[0];
    onSetUnit(unit, sec);
    soundManager.playClick();
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.setEnabled(next);
    if (next) soundManager.playCorrect();
  };

  const currentUnit = VOCABULARY_UNITS.find(u => u.id === selectedUnitId) || VOCABULARY_UNITS[0];
  const students = Object.values(roomState.students || {});
  const connectedCount = students.filter(s => s.connected).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-5 rounded-2xl shadow-lg backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            중1 영어 교과 단어 퀴즈 (교사용 메인 디스플레이)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            대기실 (Lobby)
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            학생들이 태블릿으로 입장할 때까지 대기한 후, 단원을 선택하고 게임을 시작하세요.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
              soundOn
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title="효과음 토글"
          >
            {soundOn ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden sm:inline">{soundOn ? '효과음 켜짐' : '효과음 꺼짐'}</span>
          </button>

          <button
            onClick={onStartGame}
            disabled={connectedCount === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base shadow-xl transition-all transform active:scale-95 ${
              connectedCount > 0
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white shadow-emerald-500/25 cursor-pointer ring-2 ring-emerald-400/50 animate-pulse'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            게임 시작 ({connectedCount}명 접속 중)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: QR and Unit Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room PIN & QR Component */}
          <QRCodeCard pin={roomState.pin} />

          {/* Unit Selection Section */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <BookOpen className="w-5 h-5 text-sky-400" />
                단원 및 어휘 세트 선택
              </div>
              <button
                onClick={onOpenCustomModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 text-xs font-semibold transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                직접 단어 등록 / 수정
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {VOCABULARY_UNITS.map((unit) => {
                const isSelected = unit.id === selectedUnitId;
                return (
                  <div
                    key={unit.id}
                    onClick={() => handleUnitSelect(unit)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative overflow-hidden ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-400 ring-2 ring-indigo-400/30 shadow-md'
                        : 'bg-slate-900/60 border-slate-700/80 hover:bg-slate-800/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{unit.icon}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
                        {unit.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{unit.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{unit.description}</p>
                    <div className="mt-3 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>{unit.gradeLevel}</span>
                      <span className="text-sky-400">{unit.questions.length} 문제</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Limit Setting */}
            <div className="pt-2 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                <Clock className="w-4 h-4 text-amber-400" />
                문제당 제한시간:
              </div>
              <div className="flex items-center gap-1.5">
                {[10, 15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleTimeChange(sec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      timeLimit === sec
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {sec}초
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Connected Students List */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-base">
                접속 학생 목록
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {connectedCount}명
              </span>
            </div>

            {students.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
                title="학생 목록 전체 비우기"
              >
                <Trash2 className="w-3.5 h-3.5" />
                전체 퇴장
              </button>
            )}
          </div>

          {/* Student items grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {students.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Users className="w-12 h-12 text-slate-600 stroke-[1.5] mb-2 animate-bounce" />
                <p className="font-semibold text-sm text-slate-300">아직 접속한 학생이 없습니다</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  학생 태블릿에서 PIN <span className="font-mono text-sky-400 font-bold">{roomState.pin}</span>을 입력하고 입장하도록 안내해 주세요.
                </p>
              </div>
            ) : (
              students.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/80 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl flex-shrink-0">{st.avatar || '🐱'}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                        {st.name}
                        {st.isBot && (
                          <span className="text-[10px] font-normal bg-purple-900/60 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/40">
                            BOT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {st.grade}학년 {st.classNum}반 {st.studentNum}번 ({st.studentKey})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        st.connected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-500'
                      }`}
                      title={st.connected ? '접속 중' : '접속 종료'}
                    />
                    <button
                      onClick={() => onKickStudent(st.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="학생 내보내기"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Demo Bot Generator for Teacher test */}
          <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              혼자 테스트할 때:
            </span>
            <button
              onClick={() => onAddBots(5)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 text-xs font-semibold rounded-lg transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              가상 학생 5명 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

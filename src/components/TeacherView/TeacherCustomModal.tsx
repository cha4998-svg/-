import React, { useState } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { Question, VocabularyUnit } from '../../types/quiz';

interface TeacherCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomUnit: (unit: VocabularyUnit) => void;
}

export const TeacherCustomModal: React.FC<TeacherCustomModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomUnit,
}) => {
  const [unitTitle, setUnitTitle] = useState('우리 반 맞춤 영단어 퀴즈');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'custom-1',
      word: 'challenge',
      phonetic: '[ˈtʃælɪndʒ]',
      partOfSpeech: '명사 / 동사',
      meaning: '도전, 도전하다',
      options: ['도전하다', '포기하다', '실패하다', '경고하다'],
      correctIndex: 0,
      exampleEn: 'Take on the new challenge!',
      exampleKo: '새로운 도전에 맞서 보세요!',
    },
    {
      id: 'custom-2',
      word: 'celebrate',
      phonetic: '[ˈselɪbreɪt]',
      partOfSpeech: '동사',
      meaning: '축하하다, 기념하다',
      options: ['슬퍼하다', '축하하다', '참석하다', '조사하다'],
      correctIndex: 1,
      exampleEn: 'We celebrated my birthday together.',
      exampleKo: '우리는 내 생일을 함께 축하했다.',
    },
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `custom-${Date.now()}`,
      word: '',
      phonetic: '',
      partOfSpeech: '명사',
      meaning: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      exampleEn: '',
      exampleKo: '',
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleUpdateQ = (idx: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    const opts = [...updated[qIdx].options];
    opts[optIdx] = text;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setQuestions(updated);
  };

  const handleSave = () => {
    const validQuestions = questions.filter(q => q.word.trim() && q.options.every(o => o.trim()));
    if (validQuestions.length === 0) {
      alert('최소 1개 이상의 유효한 단어와 4개 보기를 작성해 주세요.');
      return;
    }

    const customUnit: VocabularyUnit = {
      id: `custom-${Date.now()}`,
      title: unitTitle.trim() || '선생님 맞춤 단어장',
      description: '선생님이 직접 등록한 단어 목록',
      gradeLevel: '중1 맞춤',
      badge: '선생님 출제',
      icon: '✍️',
      questions: validQuestions,
    };

    onSaveCustomUnit(customUnit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-850">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✍️</span> 맞춤 단어장 출제 및 편집
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              원하는 단어와 보기, 예문을 직접 입력하여 퀴즈를 즉석 생성합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              단원 / 세트 이름
            </label>
            <input
              type="text"
              value={unitTitle}
              onChange={(e) => setUnitTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="예: 3단원 형성평가 단어 테스트"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200">
                문제 목록 ({questions.length}개)
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300"
              >
                <Plus className="w-3.5 h-3.5" />
                문제 추가
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400">
                    문제 {qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="영어 단어 (예: classmate)"
                      value={q.word}
                      onChange={(e) => handleUpdateQ(qIdx, 'word', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="한국어 뜻 (예: 같은 반 친구)"
                      value={q.meaning}
                      onChange={(e) => handleUpdateQ(qIdx, 'meaning', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 4 Choices */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    4지선다 보기 (라디오 버튼으로 정답을 지정하세요):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                          q.correctIndex === optIdx
                            ? 'bg-emerald-500/10 border-emerald-500/50'
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => handleUpdateQ(qIdx, 'correctIndex', optIdx)}
                          className="accent-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-slate-400">{optIdx + 1}번:</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          placeholder={`보기 ${optIdx + 1}`}
                          className="flex-1 bg-transparent text-white text-xs focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example sentence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="영어 예문 (선택)"
                    value={q.exampleEn}
                    onChange={(e) => handleUpdateQ(qIdx, 'exampleEn', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="예문 한국어 해석 (선택)"
                    value={q.exampleKo}
                    onChange={(e) => handleUpdateQ(qIdx, 'exampleKo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
          >
            <Check className="w-4 h-4" />
            단어 세트 등록 및 적용
          </button>
        </div>
      </div>
    </div>
  );
};

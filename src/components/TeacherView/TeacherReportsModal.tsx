import React, { useEffect, useState } from 'react';
import { X, Calendar, Download, RefreshCw, Trophy, Users } from 'lucide-react';
import { getRecentQuizReportsFromFirebase, SavedQuizReport } from '../../firebase/quizService';

interface TeacherReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherReportsModal: React.FC<TeacherReportsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [reports, setReports] = useState<SavedQuizReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SavedQuizReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getRecentQuizReportsFromFirebase();
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadReportCSV = (rep: SavedQuizReport) => {
    const header = ['순위,학번,이름,총점수,최종연승\n'];
    const rows = rep.leaderboard.map(
      (st) => `${st.rank},"${st.grade}-${st.classNum}-${st.studentNum.toString().padStart(2, '0')}",${st.name},${st.score},${st.streak}`
    );
    const csvContent = '\uFEFF' + header.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `파이어베이스_${rep.unitTitle}_${rep.completedAt.slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Firebase Firestore 퀴즈 성적표 이력
              </h2>
              <p className="text-xs text-slate-400">
                파이어베이스 클라우드 데이터베이스에 보관된 이전 퀴즈 성적표 및 순위 데이터
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReports}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* List of Reports */}
          <div className="w-full md:w-5/12 space-y-2 border-r border-slate-800 pr-0 md:pr-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              저장된 퀴즈 세션 ({reports.length}개)
            </div>

            {loading && reports.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Firebase에서 데이터를 불러오는 중...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-800/40 rounded-xl p-4">
                아직 저장된 완료 퀴즈가 없습니다.<br />퀴즈를 1회 이상 완료하면 자동으로 기록됩니다.
              </div>
            ) : (
              reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 shadow-md ring-1 ring-indigo-400/30'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-white text-sm truncate">
                      {rep.unitTitle}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                      <Calendar className="w-3 h-3 text-sky-400" />
                      {new Date(rep.completedAt).toLocaleString('ko-KR')}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        {rep.totalStudents}명 참가
                      </span>
                      <span className="text-amber-300 font-bold">
                        1위: {rep.topScorer.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details & Leaderboard */}
          <div className="w-full md:w-7/12 flex flex-col justify-between">
            {selectedReport ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {selectedReport.unitTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      총 {selectedReport.totalQuestions}문제 • 참가 {selectedReport.totalStudents}명 • 최고점 {selectedReport.topScore}점
                    </p>
                  </div>
                  <button
                    onClick={() => downloadReportCSV(selectedReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV 다운로드
                  </button>
                </div>

                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/90 text-slate-400 uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">순위</th>
                        <th className="py-2 px-3">학번</th>
                        <th className="py-2 px-3">이름</th>
                        <th className="py-2 px-3 text-right">점수</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedReport.leaderboard.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-bold text-amber-300">
                            {st.rank === 1 ? '🥇 1위' : st.rank === 2 ? '🥈 2위' : st.rank === 3 ? '🥉 3위' : `${st.rank}위`}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-400">
                            {st.grade}-{st.classNum}-{st.studentNum.toString().padStart(2, '0')}
                          </td>
                          <td className="py-2 px-3 text-white font-medium flex items-center gap-1.5">
                            <span>{st.avatar}</span>
                            <span>{st.name}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-sky-400">
                            {st.score.toLocaleString()} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                왼쪽에서 퀴즈 세션을 선택해 주세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

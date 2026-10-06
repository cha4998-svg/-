import { doc, setDoc, getDocs, collection, query, limit } from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './error';
import { LeaderboardEntry } from '../types/quiz';

export interface SavedQuizReport {
  id: string;
  unitTitle: string;
  totalQuestions: number;
  totalStudents: number;
  completedAt: string;
  topScorer: string;
  topScore: number;
  leaderboard: LeaderboardEntry[];
}

export async function saveQuizReportToFirebase(
  unitTitle: string,
  totalQuestions: number,
  leaderboard: LeaderboardEntry[]
): Promise<string> {
  const reportId = `report_${Date.now()}`;
  const path = `quizReports/${reportId}`;

  const top = leaderboard[0];
  const reportData = {
    reportId,
    unitTitle,
    totalQuestions,
    totalStudents: leaderboard.length,
    completedAt: new Date().toISOString(),
    topScorer: top ? `${top.name} (${top.grade}-${top.classNum}-${top.studentNum})` : '없음',
    topScore: top ? top.score : 0,
    leaderboard: leaderboard.map((st) => ({
      rank: st.rank,
      id: st.id,
      name: st.name,
      avatar: st.avatar,
      score: st.score,
      grade: st.grade,
      classNum: st.classNum,
      studentNum: st.studentNum,
      streak: st.streak,
    })),
  };

  try {
    await setDoc(doc(db, 'quizReports', reportId), reportData);
    console.log(`[Firebase] Quiz report saved successfully: ${reportId}`);
    return reportId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getRecentQuizReportsFromFirebase(): Promise<SavedQuizReport[]> {
  const path = 'quizReports';
  try {
    const q = query(collection(db, path), limit(10));
    const snapshot = await getDocs(q);
    const reports: SavedQuizReport[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      reports.push({
        id: d.id,
        unitTitle: data.unitTitle,
        totalQuestions: data.totalQuestions,
        totalStudents: data.totalStudents,
        completedAt: data.completedAt,
        topScorer: data.topScorer,
        topScore: data.topScore,
        leaderboard: data.leaderboard || [],
      });
    });
    // Sort descending by completion date
    return reports.sort((a, b) => (b.completedAt > a.completedAt ? 1 : -1));
  } catch (error) {
    console.warn('[Firebase] Could not fetch past reports:', error);
    return [];
  }
}

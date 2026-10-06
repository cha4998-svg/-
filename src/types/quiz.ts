export interface Question {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  meaning: string;
  options: string[];
  correctIndex: number;
  exampleEn: string;
  exampleKo: string;
}

export interface VocabularyUnit {
  id: string;
  title: string;
  description: string;
  gradeLevel: string;
  badge: string;
  icon: string;
  questions: Question[];
}

export interface StudentSubmission {
  optionIndex: number;
  responseTimeMs: number;
  isCorrect: boolean;
  scoreEarned: number;
  submittedAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  score: number;
  grade: number;
  classNum: number;
  studentNum: number;
  streak: number;
  lastScoreEarned: number;
  lastIsCorrect?: boolean;
  connected?: boolean;
  isBot?: boolean;
}

export interface TeacherRoomState {
  roomId: string;
  pin: string;
  status: 'lobby' | 'question' | 'review' | 'ended';
  selectedUnitId: string;
  selectedUnitTitle: string;
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  totalQuestions: number;
  timeLimit: number;
  questionStartTime: number;
  totalConnected: number;
  totalSubmitted: number;
  optionCounts: number[];
  leaderboard: LeaderboardEntry[];
  students: Record<string, any>;
  submissions: Record<string, StudentSubmission>;
}

export interface StudentRoomState {
  roomId: string;
  pin: string;
  status: 'lobby' | 'question' | 'review' | 'ended';
  selectedUnitId: string;
  selectedUnitTitle: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  currentQuestion: {
    id: string;
    word: string;
    phonetic?: string;
    partOfSpeech: string;
    options: string[];
    meaning?: string;
    correctIndex?: number;
    exampleEn?: string;
    exampleKo?: string;
  } | null;
  timeLimit: number;
  questionStartTime: number;
  totalConnected: number;
  totalSubmitted: number;
  mySubmission: StudentSubmission | null;
  myStudent: {
    id: string;
    studentKey: string;
    name: string;
    grade: number;
    classNum: number;
    studentNum: number;
    avatar: string;
    score: number;
    streak: number;
    lastScoreEarned: number;
    lastIsCorrect?: boolean;
  } | null;
  myRank: number | null;
  leaderboard: LeaderboardEntry[];
}

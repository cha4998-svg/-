import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export interface StudentSubmission {
  optionIndex: number;
  responseTimeMs: number;
  isCorrect: boolean;
  scoreEarned: number;
  submittedAt: number;
}

export interface Student {
  id: string;
  studentKey: string; // e.g. 2026-1-2-05
  name: string;
  grade: number;
  classNum: number;
  studentNum: number;
  avatar: string;
  score: number;
  streak: number;
  lastScoreEarned: number;
  lastIsCorrect?: boolean;
  connected: boolean;
  isBot?: boolean;
  answers: Record<string, StudentSubmission>;
}

export interface RoomState {
  roomId: string;
  pin: string;
  status: 'lobby' | 'question' | 'review' | 'ended';
  selectedUnitId: string;
  selectedUnitTitle: string;
  questions: Question[];
  currentQuestionIndex: number;
  timeLimit: number; // in seconds
  questionStartTime: number; // timestamp ms
  students: Record<string, Student>;
  submissions: Record<string, StudentSubmission>; // studentId -> submission for current question
}

// In-memory room storage (Single active room by default or keyed by PIN)
const DEFAULT_PIN = '7392';
let roomState: RoomState = {
  roomId: 'MAIN_ROOM',
  pin: DEFAULT_PIN,
  status: 'lobby',
  selectedUnitId: 'unit-1',
  selectedUnitTitle: 'Lesson 1. School Life & Friends (학교 생활과 친구들)',
  questions: [],
  currentQuestionIndex: 0,
  timeLimit: 15,
  questionStartTime: 0,
  students: {},
  submissions: {},
};

// WebSocket connection tracking
const teacherSockets = new Set<WebSocket>();
const studentSockets = new Map<string, WebSocket>(); // studentId -> ws
const socketToStudentId = new Map<WebSocket, string>();

function calculateScore(isCorrect: boolean, responseTimeMs: number, timeLimitSec: number, currentStreak: number): number {
  if (!isCorrect) return 0;
  const basePoints = 500;
  const maxTimeMs = timeLimitSec * 1000;
  const clampedTime = Math.min(Math.max(responseTimeMs, 0), maxTimeMs);
  // Speed bonus up to 500 points
  const speedBonus = Math.round(500 * (1 - clampedTime / maxTimeMs));
  // Streak bonus: 50 points per streak up to 200
  const streakBonus = Math.min(currentStreak * 50, 200);
  return basePoints + speedBonus + streakBonus;
}

function getSanitizedRoomStateForStudent(studentId?: string) {
  const currentQ = roomState.questions[roomState.currentQuestionIndex];
  let safeQuestion: any = null;

  if (currentQ && (roomState.status === 'question' || roomState.status === 'review')) {
    if (roomState.status === 'question') {
      safeQuestion = {
        id: currentQ.id,
        word: currentQ.word,
        phonetic: currentQ.phonetic,
        partOfSpeech: currentQ.partOfSpeech,
        options: currentQ.options,
        // Do NOT send correctIndex or meaning in question state
      };
    } else {
      // review state: reveal full details
      safeQuestion = currentQ;
    }
  }

  // Calculate student ranks
  const sortedStudents = Object.values(roomState.students)
    .sort((a, b) => b.score - a.score);

  const studentRankMap: Record<string, number> = {};
  sortedStudents.forEach((st, idx) => {
    studentRankMap[st.id] = idx + 1;
  });

  const totalConnected = Object.values(roomState.students).filter(s => s.connected).length;
  const totalSubmitted = Object.keys(roomState.submissions).length;

  return {
    roomId: roomState.roomId,
    pin: roomState.pin,
    status: roomState.status,
    selectedUnitId: roomState.selectedUnitId,
    selectedUnitTitle: roomState.selectedUnitTitle,
    totalQuestions: roomState.questions.length,
    currentQuestionIndex: roomState.currentQuestionIndex,
    currentQuestion: safeQuestion,
    timeLimit: roomState.timeLimit,
    questionStartTime: roomState.questionStartTime,
    totalConnected,
    totalSubmitted,
    mySubmission: studentId ? roomState.submissions[studentId] || null : null,
    myStudent: studentId ? roomState.students[studentId] || null : null,
    myRank: studentId ? (studentRankMap[studentId] || null) : null,
    leaderboard: sortedStudents.slice(0, 10).map((st, i) => ({
      rank: i + 1,
      id: st.id,
      name: st.name,
      avatar: st.avatar,
      score: st.score,
      grade: st.grade,
      classNum: st.classNum,
      studentNum: st.studentNum,
      streak: st.streak,
      lastScoreEarned: st.lastScoreEarned,
      lastIsCorrect: st.lastIsCorrect,
    })),
  };
}

function getTeacherRoomState() {
  const currentQ = roomState.questions[roomState.currentQuestionIndex] || null;
  const sortedStudents = Object.values(roomState.students).sort((a, b) => b.score - a.score);
  const totalConnected = Object.values(roomState.students).filter(s => s.connected).length;
  const totalSubmitted = Object.keys(roomState.submissions).length;

  // Calculate option distribution for review
  const optionCounts = [0, 0, 0, 0];
  Object.values(roomState.submissions).forEach((sub) => {
    if (sub.optionIndex >= 0 && sub.optionIndex < 4) {
      optionCounts[sub.optionIndex]++;
    }
  });

  return {
    ...roomState,
    currentQuestion: currentQ,
    totalQuestions: roomState.questions.length,
    totalConnected,
    totalSubmitted,
    optionCounts,
    leaderboard: sortedStudents.map((st, i) => ({
      rank: i + 1,
      id: st.id,
      name: st.name,
      studentKey: st.studentKey,
      avatar: st.avatar,
      score: st.score,
      grade: st.grade,
      classNum: st.classNum,
      studentNum: st.studentNum,
      streak: st.streak,
      connected: st.connected,
      isBot: st.isBot,
      lastScoreEarned: st.lastScoreEarned,
      lastIsCorrect: st.lastIsCorrect,
    })),
  };
}

function broadcastToAll() {
  const teacherPayload = JSON.stringify({ type: 'TEACHER_STATE', data: getTeacherRoomState() });
  teacherSockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(teacherPayload);
    }
  });

  studentSockets.forEach((ws, studentId) => {
    if (ws.readyState === WebSocket.OPEN) {
      const studentPayload = JSON.stringify({
        type: 'STUDENT_STATE',
        data: getSanitizedRoomStateForStudent(studentId),
      });
      ws.send(studentPayload);
    }
  });
}

const app = express();
app.use(express.json());

// API Endpoints for REST sync/polling fallback
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

app.get('/api/state/teacher', (req, res) => {
  res.json(getTeacherRoomState());
});

app.get('/api/state/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  res.json(getSanitizedRoomStateForStudent(studentId));
});

// Create HTTP and WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  let registeredRole: 'teacher' | 'student' | null = null;
  let registeredStudentId: string | null = null;

  ws.on('message', (message: string) => {
    try {
      const event = JSON.parse(message.toString());

      switch (event.type) {
        case 'REGISTER_TEACHER': {
          registeredRole = 'teacher';
          teacherSockets.add(ws);
          ws.send(JSON.stringify({ type: 'TEACHER_STATE', data: getTeacherRoomState() }));
          break;
        }

        case 'REGISTER_STUDENT': {
          const { studentKey, name, grade, classNum, studentNum, avatar, pin } = event.data;
          // Validate PIN if provided
          if (pin && pin.trim() !== roomState.pin) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'PIN 번호가 일치하지 않습니다. (선생님 화면의 PIN을 확인하세요)' }));
            return;
          }

          registeredRole = 'student';
          // Use studentKey as unique student ID
          const existingStudent = roomState.students[studentKey];
          if (existingStudent) {
            existingStudent.connected = true;
            existingStudent.name = name;
            existingStudent.avatar = avatar || existingStudent.avatar;
          } else {
            roomState.students[studentKey] = {
              id: studentKey,
              studentKey,
              name,
              grade: Number(grade) || 1,
              classNum: Number(classNum) || 1,
              studentNum: Number(studentNum) || 1,
              avatar: avatar || '🐱',
              score: 0,
              streak: 0,
              lastScoreEarned: 0,
              connected: true,
              answers: {},
            };
          }

          registeredStudentId = studentKey;
          studentSockets.set(studentKey, ws);
          socketToStudentId.set(ws, studentKey);

          ws.send(JSON.stringify({
            type: 'REGISTER_SUCCESS',
            student: roomState.students[studentKey],
          }));

          broadcastToAll();
          break;
        }

        case 'SUBMIT_ANSWER': {
          if (!registeredStudentId || roomState.status !== 'question') return;
          const { optionIndex, responseTimeMs } = event.data;
          const student = roomState.students[registeredStudentId];
          const currentQ = roomState.questions[roomState.currentQuestionIndex];
          if (!student || !currentQ) return;

          // Prevent re-submission for the same question
          if (roomState.submissions[registeredStudentId]) return;

          const isCorrect = optionIndex === currentQ.correctIndex;
          const scoreEarned = calculateScore(isCorrect, responseTimeMs, roomState.timeLimit, student.streak);

          const submission: StudentSubmission = {
            optionIndex,
            responseTimeMs,
            isCorrect,
            scoreEarned,
            submittedAt: Date.now(),
          };

          roomState.submissions[registeredStudentId] = submission;
          student.answers[currentQ.id] = submission;

          // Update real-time counts to teacher
          broadcastToAll();

          // Auto-advance check: if all active connected students submitted, inform teacher
          const activeConnectedStudents = Object.values(roomState.students).filter(s => s.connected);
          if (Object.keys(roomState.submissions).length >= activeConnectedStudents.length && activeConnectedStudents.length > 0) {
            // All submitted!
            teacherSockets.forEach((tws) => {
              if (tws.readyState === WebSocket.OPEN) {
                tws.send(JSON.stringify({ type: 'ALL_STUDENTS_SUBMITTED' }));
              }
            });
          }
          break;
        }

        // Teacher Actions
        case 'SET_UNIT_AND_QUESTIONS': {
          if (registeredRole !== 'teacher') return;
          const { unitId, unitTitle, questions, timeLimit, pin } = event.data;
          roomState.selectedUnitId = unitId;
          roomState.selectedUnitTitle = unitTitle;
          roomState.questions = questions;
          if (timeLimit) roomState.timeLimit = timeLimit;
          if (pin) roomState.pin = pin;
          roomState.currentQuestionIndex = 0;
          roomState.submissions = {};
          broadcastToAll();
          break;
        }

        case 'START_GAME': {
          if (registeredRole !== 'teacher') return;
          if (!roomState.questions || roomState.questions.length === 0) return;
          // Reset scores
          Object.values(roomState.students).forEach(st => {
            st.score = 0;
            st.streak = 0;
            st.lastScoreEarned = 0;
            st.lastIsCorrect = undefined;
            st.answers = {};
          });
          roomState.currentQuestionIndex = 0;
          roomState.status = 'question';
          roomState.questionStartTime = Date.now();
          roomState.submissions = {};

          broadcastToAll();
          break;
        }

        case 'NEXT_QUESTION': {
          if (registeredRole !== 'teacher') return;
          const nextIndex = roomState.currentQuestionIndex + 1;
          if (nextIndex >= roomState.questions.length) {
            roomState.status = 'ended';
          } else {
            roomState.currentQuestionIndex = nextIndex;
            roomState.status = 'question';
            roomState.questionStartTime = Date.now();
            roomState.submissions = {};
          }
          broadcastToAll();
          break;
        }

        case 'REVEAL_ANSWER': {
          if (registeredRole !== 'teacher') return;
          roomState.status = 'review';
          const currentQ = roomState.questions[roomState.currentQuestionIndex];
          if (currentQ) {
            // Apply scores and streak to all students who submitted
            Object.values(roomState.students).forEach((st) => {
              const sub = roomState.submissions[st.id];
              if (sub) {
                if (sub.isCorrect) {
                  st.score += sub.scoreEarned;
                  st.streak += 1;
                  st.lastScoreEarned = sub.scoreEarned;
                  st.lastIsCorrect = true;
                } else {
                  st.streak = 0;
                  st.lastScoreEarned = 0;
                  st.lastIsCorrect = false;
                }
              } else {
                // Didn't submit
                st.streak = 0;
                st.lastScoreEarned = 0;
                st.lastIsCorrect = false;
              }
            });
          }
          broadcastToAll();
          break;
        }

        case 'END_GAME': {
          if (registeredRole !== 'teacher') return;
          roomState.status = 'ended';
          broadcastToAll();
          break;
        }

        case 'RESET_TO_LOBBY': {
          if (registeredRole !== 'teacher') return;
          roomState.status = 'lobby';
          roomState.currentQuestionIndex = 0;
          roomState.submissions = {};
          broadcastToAll();
          break;
        }

        case 'KICK_STUDENT': {
          if (registeredRole !== 'teacher') return;
          const { studentId } = event.data;
          if (roomState.students[studentId]) {
            delete roomState.students[studentId];
            delete roomState.submissions[studentId];
            const targetWs = studentSockets.get(studentId);
            if (targetWs) {
              targetWs.send(JSON.stringify({ type: 'KICKED' }));
              studentSockets.delete(studentId);
            }
            broadcastToAll();
          }
          break;
        }

        case 'CLEAR_ALL_STUDENTS': {
          if (registeredRole !== 'teacher') return;
          roomState.students = {};
          roomState.submissions = {};
          studentSockets.forEach((sWs) => {
            sWs.send(JSON.stringify({ type: 'KICKED' }));
          });
          studentSockets.clear();
          broadcastToAll();
          break;
        }

        case 'ADD_BOT_STUDENTS': {
          if (registeredRole !== 'teacher') return;
          const count = event.data?.count || 5;
          const botNames = ['김민준', '이서연', '박도윤', '최지우', '정예준', '강하은', '조시우', '윤서아', '임도현', '한지민'];
          const avatars = ['🐯', '🦊', '🐼', '🦁', '🐨', '🐰', '🐸', '🦄', '🐶', '🦉'];

          for (let i = 0; i < count; i++) {
            const classNum = 2;
            const studentNum = 10 + i;
            const botKey = `2026-1-${classNum}-${studentNum.toString().padStart(2, '0')}`;
            const name = botNames[i % botNames.length];
            const avatar = avatars[i % avatars.length];

            roomState.students[botKey] = {
              id: botKey,
              studentKey: botKey,
              name,
              grade: 1,
              classNum,
              studentNum,
              avatar,
              score: 0,
              streak: 0,
              lastScoreEarned: 0,
              connected: true,
              isBot: true,
              answers: {},
            };
          }
          broadcastToAll();
          break;
        }

        case 'TRIGGER_BOT_ANSWERS': {
          // Internal or teacher trigger: simulate bots answering in question mode
          if (roomState.status !== 'question') return;
          const currentQ = roomState.questions[roomState.currentQuestionIndex];
          if (!currentQ) return;

          Object.values(roomState.students).filter(s => s.isBot && s.connected).forEach((bot) => {
            if (roomState.submissions[bot.id]) return;
            // 75% accuracy
            const willBeCorrect = Math.random() < 0.8;
            const chosenOption = willBeCorrect
              ? currentQ.correctIndex
              : (currentQ.correctIndex + 1 + Math.floor(Math.random() * 3)) % 4;
            // Random reaction time between 1.5s and 8.5s
            const delay = 1500 + Math.random() * 6500;
            const scoreEarned = calculateScore(willBeCorrect, delay, roomState.timeLimit, bot.streak);

            setTimeout(() => {
              if (roomState.status === 'question' && !roomState.submissions[bot.id]) {
                roomState.submissions[bot.id] = {
                  optionIndex: chosenOption,
                  responseTimeMs: Math.round(delay),
                  isCorrect: willBeCorrect,
                  scoreEarned,
                  submittedAt: Date.now(),
                };
                bot.answers[currentQ.id] = roomState.submissions[bot.id];
                broadcastToAll();
              }
            }, Math.min(delay, 4000));
          });
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    if (registeredRole === 'teacher') {
      teacherSockets.delete(ws);
    } else if (registeredStudentId) {
      studentSockets.delete(registeredStudentId);
      socketToStudentId.delete(ws);
      if (roomState.students[registeredStudentId]) {
        roomState.students[registeredStudentId].connected = false;
      }
      broadcastToAll();
    }
  });
});

// Setup Vite or static serving
const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[QuizServer] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

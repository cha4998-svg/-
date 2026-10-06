import { useEffect, useRef, useState, useCallback } from 'react';
import { TeacherRoomState, StudentRoomState, Question } from '../types/quiz';

type Role = 'teacher' | 'student';

export function useQuizSocket(role: Role, studentInfo?: {
  studentKey: string;
  name: string;
  grade: number;
  classNum: number;
  studentNum: number;
  avatar: string;
  pin: string;
} | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [teacherState, setTeacherState] = useState<TeacherRoomState | null>(null);
  const [studentState, setStudentState] = useState<StudentRoomState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isKicked, setIsKicked] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const studentInfoRef = useRef(studentInfo);

  useEffect(() => {
    studentInfoRef.current = studentInfo;
  }, [studentInfo]);

  const send = useCallback((type: string, data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Clear any previous reconnection timer
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setErrorMsg(null);

        // Register based on role
        if (role === 'teacher') {
          ws.send(JSON.stringify({ type: 'REGISTER_TEACHER' }));
        } else if (role === 'student' && studentInfoRef.current) {
          ws.send(JSON.stringify({
            type: 'REGISTER_STUDENT',
            data: studentInfoRef.current,
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'TEACHER_STATE') {
            setTeacherState(msg.data);
          } else if (msg.type === 'STUDENT_STATE') {
            setStudentState(msg.data);
          } else if (msg.type === 'REGISTER_SUCCESS') {
            // Student registration accepted
            setErrorMsg(null);
          } else if (msg.type === 'ERROR') {
            setErrorMsg(msg.message);
          } else if (msg.type === 'KICKED') {
            setIsKicked(true);
            setErrorMsg('선생님에 의해 퇴장 조치되었습니다.');
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 1.5s
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 1500);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2000);
    }
  }, [role]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  // Re-register student if studentInfo changes while connected
  useEffect(() => {
    if (role === 'student' && studentInfo && isConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'REGISTER_STUDENT',
        data: studentInfo,
      }));
    }
  }, [studentInfo, isConnected, role]);

  // Teacher Helper Actions
  const setUnitAndQuestions = useCallback((unitId: string, unitTitle: string, questions: Question[], timeLimit?: number, pin?: string) => {
    send('SET_UNIT_AND_QUESTIONS', { unitId, unitTitle, questions, timeLimit, pin });
  }, [send]);

  const startGame = useCallback(() => {
    send('START_GAME');
  }, [send]);

  const nextQuestion = useCallback(() => {
    send('NEXT_QUESTION');
  }, [send]);

  const revealAnswer = useCallback(() => {
    send('REVEAL_ANSWER');
  }, [send]);

  const endGame = useCallback(() => {
    send('END_GAME');
  }, [send]);

  const resetToLobby = useCallback(() => {
    send('RESET_TO_LOBBY');
  }, [send]);

  const kickStudent = useCallback((studentId: string) => {
    send('KICK_STUDENT', { studentId });
  }, [send]);

  const clearAllStudents = useCallback(() => {
    send('CLEAR_ALL_STUDENTS');
  }, [send]);

  const addBotStudents = useCallback((count = 5) => {
    send('ADD_BOT_STUDENTS', { count });
  }, [send]);

  const triggerBotAnswers = useCallback(() => {
    send('TRIGGER_BOT_ANSWERS');
  }, [send]);

  // Student Helper Actions
  const submitAnswer = useCallback((optionIndex: number, responseTimeMs: number) => {
    send('SUBMIT_ANSWER', { optionIndex, responseTimeMs });
  }, [send]);

  return {
    isConnected,
    teacherState,
    studentState,
    errorMsg,
    isKicked,
    send,
    // Teacher functions
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
    // Student functions
    submitAnswer,
  };
}

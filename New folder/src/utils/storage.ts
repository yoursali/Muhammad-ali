import {
  QuizResult,
  StudyNote,
  Flashcard,
  StudySession,
  UserSettings,
  Achievement,
  DashboardStats
} from '../types';
import { INITIAL_QUESTIONS } from '../data/questionsData';
import { INITIAL_FLASHCARDS } from '../data/flashcardsData';
import { INITIAL_NOTES } from '../data/defaultNotes';

const STORAGE_KEYS = {
  QUIZ_HISTORY: 'studymate_quiz_history_v1',
  FLASHCARDS: 'studymate_flashcards_v1',
  NOTES: 'studymate_notes_v1',
  SESSIONS: 'studymate_sessions_v1',
  SETTINGS: 'studymate_settings_v1',
  LAST_ACTIVE: 'studymate_last_active_v1',
  STREAK: 'studymate_streak_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  accentColor: 'cyan',
  soundEnabled: true,
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  instantFeedback: true,
};

// Safe localStorage JSON getter
function getJson<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val) as T;
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err);
    return fallback;
  }
}

// Safe localStorage JSON setter
function setJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to localStorage for key ${key}:`, err);
  }
}

// ----------------- QUIZ RESULTS -----------------
export function getQuizHistory(): QuizResult[] {
  return getJson<QuizResult[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
}

export function saveQuizResult(result: QuizResult): void {
  const history = getQuizHistory();
  const updated = [result, ...history];
  setJson(STORAGE_KEYS.QUIZ_HISTORY, updated);
  updateDailyStreak();
}

// ----------------- FLASHCARDS -----------------
export function getFlashcards(): Flashcard[] {
  return getJson<Flashcard[]>(STORAGE_KEYS.FLASHCARDS, INITIAL_FLASHCARDS);
}

export function saveFlashcards(cards: Flashcard[]): void {
  setJson(STORAGE_KEYS.FLASHCARDS, cards);
}

export function updateFlashcardMastery(cardId: string, mastery: Flashcard['mastery']): Flashcard[] {
  const cards = getFlashcards();
  const updated = cards.map(c =>
    c.id === cardId ? { ...c, mastery, lastReviewed: new Date().toISOString() } : c
  );
  saveFlashcards(updated);
  return updated;
}

export function addCustomFlashcard(card: Omit<Flashcard, 'id'>): Flashcard {
  const cards = getFlashcards();
  const newCard: Flashcard = {
    ...card,
    id: `custom-fc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isUserCreated: true,
    lastReviewed: new Date().toISOString()
  };
  saveFlashcards([newCard, ...cards]);
  return newCard;
}

export function deleteFlashcard(cardId: string): Flashcard[] {
  const cards = getFlashcards().filter(c => c.id !== cardId);
  saveFlashcards(cards);
  return cards;
}

// ----------------- STUDY NOTES -----------------
export function getNotes(): StudyNote[] {
  return getJson<StudyNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
}

export function saveNotes(notes: StudyNote[]): void {
  setJson(STORAGE_KEYS.NOTES, notes);
}

export function addNote(note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>): StudyNote {
  const notes = getNotes();
  const now = new Date().toISOString();
  const newNote: StudyNote = {
    ...note,
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    updatedAt: now
  };
  saveNotes([newNote, ...notes]);
  return newNote;
}

export function updateNote(updatedNote: StudyNote): StudyNote[] {
  const notes = getNotes();
  const updated = notes.map(n =>
    n.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : n
  );
  saveNotes(updated);
  return updated;
}

export function deleteNote(noteId: string): StudyNote[] {
  const notes = getNotes().filter(n => n.id !== noteId);
  saveNotes(notes);
  return notes;
}

// ----------------- SESSIONS / POMODORO -----------------
export function getStudySessions(): StudySession[] {
  return getJson<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
}

export function logStudySession(session: Omit<StudySession, 'id'>): void {
  const sessions = getStudySessions();
  const newSession: StudySession = {
    ...session,
    id: `session-${Date.now()}`
  };
  setJson(STORAGE_KEYS.SESSIONS, [newSession, ...sessions]);
  updateDailyStreak();
}

// ----------------- SETTINGS -----------------
export function getUserSettings(): UserSettings {
  return getJson<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveUserSettings(settings: UserSettings): void {
  setJson(STORAGE_KEYS.SETTINGS, settings);
}

// ----------------- STREAKS -----------------
export function getStreak(): number {
  return getJson<number>(STORAGE_KEYS.STREAK, 1);
}

export function updateDailyStreak(): number {
  const lastActiveStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
  const now = new Date();
  const todayStr = now.toDateString();

  let streak = getStreak();

  if (lastActiveStr) {
    const lastActiveDate = new Date(lastActiveStr);
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (lastActiveDate.toDateString() === todayStr) {
      // Already active today, streak remains unchanged
      return streak;
    } else if (lastActiveDate.toDateString() === yesterday.toDateString()) {
      // Consecutive day!
      streak += 1;
    } else {
      // Missed a day or more, reset streak to 1
      streak = 1;
    }
  } else {
    streak = 1;
  }

  setJson(STORAGE_KEYS.STREAK, streak);
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, todayStr);
  return streak;
}

// ----------------- DASHBOARD METRICS -----------------
export function getDashboardStats(): DashboardStats {
  const quizHistory = getQuizHistory();
  const flashcards = getFlashcards();
  const sessions = getStudySessions();
  const streak = getStreak();

  const totalQuizzes = quizHistory.length;
  const averageScore = totalQuizzes > 0
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
    : 0;

  // Track unique completed topics (quizzes with >= 60%)
  const completedTopicsSet = new Set<string>();
  quizHistory.forEach(q => {
    if (q.percentage >= 60) {
      completedTopicsSet.add(`${q.subject}:${q.topic}`);
    }
  });

  // Calculate study minutes from pomodoro focus sessions
  const focusMinutes = sessions
    .filter(s => s.completed && s.mode === 'focus')
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Add time spent on quizzes (each quiz timeTakenSeconds converted to minutes)
  const quizMinutes = Math.round(
    quizHistory.reduce((acc, q) => acc + (q.timeTakenSeconds || 0), 0) / 60
  );
  const totalStudyMinutes = focusMinutes + quizMinutes;

  const masteredFlashcardsCount = flashcards.filter(f => f.mastery === 'mastered').length;

  let totalQuestionsAnswered = 0;
  const accuracyBySubject: Record<string, { total: number; correct: number; percent: number }> = {};

  quizHistory.forEach(q => {
    if (!accuracyBySubject[q.subject]) {
      accuracyBySubject[q.subject] = { total: 0, correct: 0, percent: 0 };
    }
    accuracyBySubject[q.subject].total += q.totalQuestions;
    accuracyBySubject[q.subject].correct += q.score;
    totalQuestionsAnswered += q.totalQuestions;
  });

  Object.keys(accuracyBySubject).forEach(subj => {
    const item = accuracyBySubject[subj];
    item.percent = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
  });

  return {
    totalQuizzes,
    averageScore,
    completedTopicsCount: completedTopicsSet.size,
    totalStudyMinutes,
    currentStreak: streak,
    masteredFlashcardsCount,
    totalQuestionsAnswered,
    accuracyBySubject
  };
}

// ----------------- ACHIEVEMENTS -----------------
export function getAchievements(): Achievement[] {
  const stats = getDashboardStats();
  const notes = getNotes();

  return [
    {
      id: 'first-quiz',
      title: 'First Step',
      description: 'Complete your first practice quiz',
      icon: 'Target',
      progress: Math.min(stats.totalQuizzes, 1),
      maxProgress: 1,
      unlockedAt: stats.totalQuizzes >= 1 ? 'Unlocked' : undefined
    },
    {
      id: 'quiz-master',
      title: 'Quiz Prodigy',
      description: 'Complete 10 quizzes with passing grades',
      icon: 'Award',
      progress: Math.min(stats.totalQuizzes, 10),
      maxProgress: 10,
      unlockedAt: stats.totalQuizzes >= 10 ? 'Unlocked' : undefined
    },
    {
      id: 'study-hour',
      title: 'Deep Diver',
      description: 'Accumulate at least 60 minutes of study focus',
      icon: 'Clock',
      progress: Math.min(stats.totalStudyMinutes, 60),
      maxProgress: 60,
      unlockedAt: stats.totalStudyMinutes >= 60 ? 'Unlocked' : undefined
    },
    {
      id: 'flashcard-pro',
      title: 'Memory Master',
      description: 'Master 10 distinct flashcard concepts',
      icon: 'Brain',
      progress: Math.min(stats.masteredFlashcardsCount, 10),
      maxProgress: 10,
      unlockedAt: stats.masteredFlashcardsCount >= 10 ? 'Unlocked' : undefined
    },
    {
      id: 'note-scholar',
      title: 'Knowledge Curator',
      description: 'Create or maintain 3 detailed study notes',
      icon: 'BookOpen',
      progress: Math.min(notes.length, 3),
      maxProgress: 3,
      unlockedAt: notes.length >= 3 ? 'Unlocked' : undefined
    },
    {
      id: 'streak-fire',
      title: 'Relentless Momentum',
      description: 'Maintain a study streak of 3 consecutive days',
      icon: 'Flame',
      progress: Math.min(stats.currentStreak, 3),
      maxProgress: 3,
      unlockedAt: stats.currentStreak >= 3 ? 'Unlocked' : undefined
    }
  ];
}

// ----------------- EXPORT / IMPORT / RESET -----------------
export function exportAllData(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    quizHistory: getQuizHistory(),
    flashcards: getFlashcards(),
    notes: getNotes(),
    sessions: getStudySessions(),
    settings: getUserSettings(),
    streak: getStreak()
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.quizHistory) setJson(STORAGE_KEYS.QUIZ_HISTORY, data.quizHistory);
    if (data.flashcards) setJson(STORAGE_KEYS.FLASHCARDS, data.flashcards);
    if (data.notes) setJson(STORAGE_KEYS.NOTES, data.notes);
    if (data.sessions) setJson(STORAGE_KEYS.SESSIONS, data.sessions);
    if (data.settings) setJson(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.streak) setJson(STORAGE_KEYS.STREAK, data.streak);
    return true;
  } catch (err) {
    console.error('Failed to parse import data', err);
    return false;
  }
}

export function resetAllDataToDefaults(): void {
  localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.FLASHCARDS);
  localStorage.removeItem(STORAGE_KEYS.NOTES);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.STREAK);
  localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE);
}

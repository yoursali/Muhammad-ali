export type Subject =
  | 'Math'
  | 'Science'
  | 'English'
  | 'Computer Science'
  | 'History'
  | 'General Knowledge';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType = 'mcq' | 'true-false' | 'fill-blank';

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string | number; // option text or option index
  explanation: string;
  codeSnippet?: string;
  formula?: string;
}

export type MasteryLevel = 'new' | 'learning' | 'mastered';

export interface Flashcard {
  id: string;
  subject: Subject;
  topic: string;
  front: string;
  back: string;
  hint?: string;
  mastery: MasteryLevel;
  isUserCreated?: boolean;
  lastReviewed?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: Subject;
  topic: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptAnswer {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResult {
  id: string;
  date: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  totalQuestions: number;
  score: number;
  percentage: number;
  timeTakenSeconds: number;
  answers: QuizAttemptAnswer[];
}

export interface StudySession {
  id: string;
  date: string;
  durationMinutes: number;
  mode: 'focus' | 'short-break' | 'long-break';
  taskLabel?: string;
  subject?: Subject;
  completed: boolean;
}

export type AccentTheme = 'cyan' | 'purple' | 'emerald' | 'amber';

export interface UserSettings {
  accentColor: AccentTheme;
  soundEnabled: boolean;
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  instantFeedback: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface DashboardStats {
  totalQuizzes: number;
  averageScore: number;
  completedTopicsCount: number;
  totalStudyMinutes: number;
  currentStreak: number;
  masteredFlashcardsCount: number;
  totalQuestionsAnswered: number;
  accuracyBySubject: Record<string, { total: number; correct: number; percent: number }>;
}


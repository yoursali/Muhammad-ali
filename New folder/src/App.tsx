import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { QuizGeneratorView } from './components/QuizGeneratorView';
import { MCQPracticeView } from './components/MCQPracticeView';
import { FlashcardsView } from './components/FlashcardsView';
import { NotesView } from './components/NotesView';
import { QuestionLabView } from './components/QuestionLabView';
import { StudyTimerView } from './components/StudyTimerView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';
import { SmartSearchModal } from './components/SmartSearchModal';
import { QuizReviewModal } from './components/QuizReviewModal';

import {
  Question,
  Subject,
  Difficulty,
  QuizResult,
  UserSettings,
  DashboardStats,
  Flashcard,
  StudyNote,
} from './types';
import { INITIAL_QUESTIONS } from './data/questionsData';
import {
  getDashboardStats,
  getQuizHistory,
  getUserSettings,
  saveUserSettings,
  getStreak,
  updateDailyStreak,
} from './utils/storage';
import { soundManager } from './utils/sound';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [streak, setStreak] = useState<number>(getStreak());
  const [stats, setStats] = useState<DashboardStats>(getDashboardStats());
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>(getQuizHistory());

  // Active quiz state
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[] | null>(null);
  const [activeQuizSubject, setActiveQuizSubject] = useState<Subject | 'All'>('All');
  const [activeQuizTopic, setActiveQuizTopic] = useState<string>('All');
  const [activeQuizDifficulty, setActiveQuizDifficulty] = useState<Difficulty | 'All'>('All');
  const [activeQuizTimed, setActiveQuizTimed] = useState<boolean>(false);
  const [activeQuizTimePerQ, setActiveQuizTimePerQ] = useState<number>(30);

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [reviewingQuiz, setReviewingQuiz] = useState<QuizResult | null>(null);

  // Refresh dynamic state
  const refreshStats = useCallback(() => {
    setStats(getDashboardStats());
    setRecentQuizzes(getQuizHistory());
    setStreak(getStreak());
  }, []);

  useEffect(() => {
    updateDailyStreak();
    refreshStats();
  }, [refreshStats]);

  // Global keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    saveUserSettings(updated);
    if (updated.soundEnabled) {
      soundManager.playCorrect();
    }
  };

  // Launch a new quiz from generator or dashboard
  const handleStartQuiz = (config: {
    questions: Question[];
    subject: Subject | 'All';
    topic: string;
    difficulty: Difficulty | 'All';
    timed: boolean;
    timePerQuestion: number;
  }) => {
    setActiveQuizQuestions(config.questions);
    setActiveQuizSubject(config.subject);
    setActiveQuizTopic(config.topic);
    setActiveQuizDifficulty(config.difficulty);
    setActiveQuizTimed(config.timed);
    setActiveQuizTimePerQ(config.timePerQuestion);
    setCurrentTab('practice');
  };

  // Quick subject launcher from Dashboard
  const handleLaunchSubjectQuiz = (subjectName: string) => {
    const matching = INITIAL_QUESTIONS.filter((q) => q.subject === subjectName);
    const shuffled = [...matching].sort(() => Math.random() - 0.5).slice(0, 5);
    handleStartQuiz({
      questions: shuffled.length > 0 ? shuffled : INITIAL_QUESTIONS.slice(0, 5),
      subject: subjectName as Subject,
      topic: 'Core Practice',
      difficulty: 'All',
      timed: false,
      timePerQuestion: 30,
    });
  };

  // Retake a previously finished quiz
  const handleRetakeQuiz = (quiz: QuizResult) => {
    // Lookup questions or reconstruct
    const matchingIds = quiz.answers.map((a) => a.questionId);
    let matched = INITIAL_QUESTIONS.filter((q) => matchingIds.includes(q.id));
    if (matched.length === 0) {
      matched = INITIAL_QUESTIONS.filter((q) => q.subject === quiz.subject).slice(0, quiz.totalQuestions);
    }
    if (matched.length === 0) {
      matched = INITIAL_QUESTIONS.slice(0, 5);
    }

    handleStartQuiz({
      questions: matched,
      subject: quiz.subject,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      timed: false,
      timePerQuestion: 30,
    });
  };

  // Exit active quiz
  const handleExitQuiz = () => {
    setActiveQuizQuestions(null);
    setCurrentTab('dashboard');
    refreshStats();
  };

  // Smart search jump triggers
  const handleSearchQuestionSelect = (q: Question) => {
    handleStartQuiz({
      questions: [q],
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      timed: false,
      timePerQuestion: 30,
    });
  };

  const handleSearchFlashcardSelect = (_fc: Flashcard) => {
    setCurrentTab('flashcards');
  };

  const handleSearchNoteSelect = (_n: StudyNote) => {
    setCurrentTab('notes');
  };

  // Render current active view
  const renderCurrentView = () => {
    // If active quiz is running and current tab is practice
    if (currentTab === 'practice') {
      if (activeQuizQuestions && activeQuizQuestions.length > 0) {
        return (
          <MCQPracticeView
            questions={activeQuizQuestions}
            subject={activeQuizSubject}
            topic={activeQuizTopic}
            difficulty={activeQuizDifficulty}
            timed={activeQuizTimed}
            timePerQuestion={activeQuizTimePerQ}
            onExit={handleExitQuiz}
            onRetake={() => {
              // Reshuffle current questions
              setActiveQuizQuestions([...activeQuizQuestions].sort(() => Math.random() - 0.5));
            }}
          />
        );
      }
      // If no active questions set, pick a standard practice set
      const defaultQuestions = [...INITIAL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
      return (
        <MCQPracticeView
          questions={defaultQuestions}
          subject="All"
          topic="Daily Practice"
          difficulty="Medium"
          timed={false}
          onExit={handleExitQuiz}
          onRetake={() => {
            setActiveQuizQuestions([...INITIAL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5));
          }}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            stats={stats}
            recentQuizzes={recentQuizzes}
            onNavigate={(tab) => {
              setCurrentTab(tab);
            }}
            onLaunchSubjectQuiz={handleLaunchSubjectQuiz}
            onReviewQuiz={(quiz) => setReviewingQuiz(quiz)}
          />
        );

      case 'generator':
        return <QuizGeneratorView onStartQuiz={handleStartQuiz} />;

      case 'flashcards':
        return <FlashcardsView />;

      case 'notes':
        return <NotesView />;

      case 'procedural':
        return <QuestionLabView />;

      case 'timer':
        return <StudyTimerView />;

      case 'progress':
        return (
          <ProgressView
            onReviewQuiz={(quiz) => setReviewingQuiz(quiz)}
          />
        );

      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSet) => setSettings(newSet)}
            onResetAllData={() => {
              setSettings(getUserSettings());
              refreshStats();
              setCurrentTab('dashboard');
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          // If leaving active quiz, reset questions
          if (currentTab === 'practice' && tab !== 'practice') {
            setActiveQuizQuestions(null);
            refreshStats();
          }
          setCurrentTab(tab);
        }}
        streak={streak}
        settings={settings}
        onToggleSound={handleToggleSound}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderCurrentView()}
      </main>

      {/* Universal Search Modal */}
      <SmartSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectQuestion={handleSearchQuestionSelect}
        onSelectFlashcard={handleSearchFlashcardSelect}
        onSelectNote={handleSearchNoteSelect}
      />

      {/* Previous Quiz Review Modal */}
      <QuizReviewModal
        quiz={reviewingQuiz}
        onClose={() => setReviewingQuiz(null)}
        onRetake={handleRetakeQuiz}
      />
    </div>
  );
}

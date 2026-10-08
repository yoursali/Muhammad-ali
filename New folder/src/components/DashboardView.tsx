import React from 'react';
import {
  HelpCircle,
  Layers,
  Timer,
  BookOpen,
  Trophy,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  RotateCcw
} from 'lucide-react';
import { DashboardStats, QuizResult } from '../types';
import { NavTab } from './Navigation';
import { soundManager } from '../utils/sound';

interface DashboardViewProps {
  stats: DashboardStats;
  recentQuizzes: QuizResult[];
  onNavigate: (tab: NavTab) => void;
  onLaunchSubjectQuiz: (subject: string) => void;
  onReviewQuiz: (quiz: QuizResult) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentQuizzes,
  onNavigate,
  onLaunchSubjectQuiz,
  onReviewQuiz,
}) => {
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const subjectList = [
    { name: 'Math', color: 'from-blue-500 to-indigo-600', text: 'text-blue-400', border: 'border-blue-500/30' },
    { name: 'Science', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    { name: 'Computer Science', color: 'from-cyan-500 to-blue-600', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    { name: 'English', color: 'from-purple-500 to-pink-600', text: 'text-purple-400', border: 'border-purple-500/30' },
    { name: 'History', color: 'from-amber-500 to-orange-600', text: 'text-amber-400', border: 'border-amber-500/30' },
    { name: 'General Knowledge', color: 'from-rose-500 to-red-600', text: 'text-rose-400', border: 'border-rose-500/30' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800/80 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Adaptive Study Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back to StudyMate AI
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your autonomous study dashboard. All quizzes, procedural problems, flashcard decks, and focus sessions run securely directly in your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('generator');
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Launch Quiz</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('timer');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium border border-slate-700/80 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Timer className="w-4 h-4 text-purple-400" />
              <span>Start Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quizzes */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Quizzes</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
            {stats.totalQuizzes}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.totalQuestionsAnswered} questions solved
          </div>
        </div>

        {/* Average Score */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
            {stats.averageScore}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.averageScore >= 80 ? 'Mastery tier' : stats.averageScore >= 60 ? 'Passing tier' : 'Active review'}
          </div>
        </div>

        {/* Study Time */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Study Focus</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
            {formatTime(stats.totalStudyMinutes)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Logged across sessions
          </div>
        </div>

        {/* Daily Streak */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums">
            {stats.currentStreak} <span className="text-base font-normal text-slate-400">days</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.masteredFlashcardsCount} cards mastered
          </div>
        </div>
      </div>

      {/* Main Grid: Subject Mastery & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Subject Accuracy & Launchers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Subject Mastery & Practice
            </h2>
            <span className="text-xs text-slate-400">
              Click any subject to practice
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjectList.map((sub) => {
              const accuracy = stats.accuracyBySubject[sub.name]?.percent ?? 0;
              const answered = stats.accuracyBySubject[sub.name]?.total ?? 0;
              return (
                <div
                  key={sub.name}
                  onClick={() => {
                    soundManager.playClick();
                    onLaunchSubjectQuiz(sub.name);
                  }}
                  className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:translate-y-[-2px] group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {sub.name}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      {answered > 0 ? `${accuracy}% acc` : 'Untested'}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full bg-gradient-to-r ${sub.color} transition-all duration-500`}
                      style={{ width: `${Math.max(answered > 0 ? accuracy : 4, 4)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>{answered} questions taken</span>
                    <span className="flex items-center gap-1 group-hover:text-white transition-colors">
                      Practice <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Study Hub Cards */}
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Quick Study Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('flashcards');
                }}
                className="glass-panel p-4 rounded-xl border border-slate-800 text-left hover:border-purple-500/40 transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Flashcard Decks
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Active recall with 3D flip study cards and spaced rating.
                </p>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('procedural');
                }}
                className="glass-panel p-4 rounded-xl border border-slate-800 text-left hover:border-cyan-500/40 transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Question Lab
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Procedural question generator with mathematical parameters.
                </p>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('notes');
                }}
                className="glass-panel p-4 rounded-xl border border-slate-800 text-left hover:border-emerald-500/40 transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Study Notes
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Markdown notes, categorized by subject and tagged for search.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Quizzes Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Recent Quizzes
            </h2>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All History
            </button>
          </div>

          {recentQuizzes.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-300 font-medium">No quizzes taken yet</p>
              <p className="text-xs text-slate-400">
                Test your knowledge by taking your first customizable practice quiz.
              </p>
              <button
                onClick={() => onNavigate('generator')}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition-colors inline-block mt-2 cursor-pointer"
              >
                Start First Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentQuizzes.slice(0, 5).map((quiz) => (
                <div
                  key={quiz.id}
                  className="glass-panel p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">
                      {quiz.subject}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {quiz.topic} · {quiz.totalQuestions} questions
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(quiz.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-sm font-bold font-mono tabular-nums px-2 py-0.5 rounded ${
                        quiz.percentage >= 80
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : quiz.percentage >= 60
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {quiz.percentage}%
                    </span>
                    <button
                      onClick={() => onReviewQuiz(quiz)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

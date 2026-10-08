import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Trophy,
  Flame,
  Clock,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Calendar,
  X
} from 'lucide-react';
import {
  getDashboardStats,
  getQuizHistory,
  getAchievements,
  exportAllData,
  importAllData,
  resetAllDataToDefaults,
} from '../utils/storage';
import { DashboardStats, QuizResult, Achievement } from '../types';
import { soundManager } from '../utils/sound';

interface ProgressViewProps {
  onReviewQuiz: (quiz: QuizResult) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ onReviewQuiz }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const loadData = () => {
    setStats(getDashboardStats());
    setHistory(getQuizHistory());
    setAchievements(getAchievements());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = () => {
    soundManager.playClick();
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studymate_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    const success = importAllData(importJson);
    if (success) {
      setImportStatus('Backup restored successfully!');
      loadData();
      setTimeout(() => {
        setImportModalOpen(false);
        setImportStatus(null);
        setImportJson('');
      }, 1200);
    } else {
      setImportStatus('Invalid JSON format. Please verify file.');
    }
  };

  if (!stats) return null;

  const filteredHistory = history.filter((q) => {
    if (selectedSubjectFilter !== 'All' && q.subject !== selectedSubjectFilter) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Academic Performance Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Progress & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track quiz scores, subject accuracy, study streaks, and unlock academic badges.
          </p>
        </div>

        {/* Data Backup / Restore Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Restore Backup</span>
          </button>
        </div>
      </div>

      {/* High-Level Stat Indicators (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Quizzes</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {stats.totalQuizzes}
          </span>
          <span className="text-xs text-cyan-400 block mt-1">
            {stats.totalQuestionsAnswered} questions solved
          </span>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Average Accuracy</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {stats.averageScore}%
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            {stats.completedTopicsCount} topics mastered
          </span>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Study Time</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono tabular-nums">
            {Math.floor(stats.totalStudyMinutes / 60)}h {stats.totalStudyMinutes % 60}m
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Logged focus & drills
          </span>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Active Streak</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums flex items-center gap-1">
            <Flame className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span>{stats.currentStreak} Days</span>
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Consecutive study
          </span>
        </div>
      </div>

      {/* Subject Performance Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight">
          Subject Accuracy Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.accuracyBySubject).length === 0 ? (
            <p className="text-xs text-slate-400 col-span-3">
              Take quizzes to generate subject-specific accuracy reports.
            </p>
          ) : (
            (Object.entries(stats.accuracyBySubject) as [string, { total: number; correct: number; percent: number }][]).map(([subject, data]) => (
              <div
                key={subject}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{subject}</span>
                  <span className="font-mono font-bold text-cyan-400 tabular-nums">
                    {data.percent}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.max(data.percent, 4)}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{data.correct} correct</span>
                  <span>{data.total} total</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Achievements / Badges Grid */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Academic Badges & Milestones
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Unlock badges as you complete quizzes, build streaks, and curate notes.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-400 font-semibold">
            {achievements.filter((a) => a.unlockedAt).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-purple-950/20 to-slate-900/80 border-purple-500/40'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-65'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-white truncate">
                        {ach.title}
                      </span>
                      {isUnlocked && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold shrink-0">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {ach.description}
                    </p>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          isUnlocked ? 'bg-purple-500' : 'bg-slate-700'
                        }`}
                        style={{
                          width: `${Math.round((ach.progress / ach.maxProgress) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz History Log Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white tracking-tight">
            Complete Quiz History Log
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="All">All Subjects</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="General Knowledge">General Knowledge</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No quiz records found. Take a quiz to populate your history log!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(q.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{q.subject}</td>
                    <td className="py-3 px-4 text-slate-400">{q.topic}</td>
                    <td className="py-3 px-4">{q.difficulty}</td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {q.score} / {q.totalQuestions}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          q.percentage >= 80
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : q.percentage >= 60
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {q.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onReviewQuiz(q)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restore Backup Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-elevated w-full max-w-lg rounded-2xl p-6 border border-slate-700/80 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Restore JSON Backup</span>
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <p className="text-xs text-slate-300">
                Paste the exported StudyMate JSON text below to restore your questions, notes, and study progress.
              </p>

              <textarea
                rows={6}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{"version": "1.0", "quizHistory": ...}'
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono resize-none focus:outline-none focus:border-cyan-500"
              />

              {importStatus && (
                <div
                  className={`text-xs p-2.5 rounded-lg ${
                    importStatus.includes('success')
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {importStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold hover:opacity-95"
                >
                  Restore Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

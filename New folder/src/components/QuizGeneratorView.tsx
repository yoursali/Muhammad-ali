import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Clock,
  Sparkles,
  Zap,
  Sliders,
  Play
} from 'lucide-react';
import { Question, Subject, Difficulty, QuestionType } from '../types';
import { INITIAL_QUESTIONS, SUBJECTS, TOPICS_BY_SUBJECT } from '../data/questionsData';
import { generateCustomQuestions } from '../utils/questionGenerator';
import { soundManager } from '../utils/sound';

interface QuizGeneratorViewProps {
  onStartQuiz: (config: {
    questions: Question[];
    subject: Subject | 'All';
    topic: string;
    difficulty: Difficulty | 'All';
    timed: boolean;
    timePerQuestion: number;
  }) => void;
}

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({ onStartQuiz }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [questionTypeFilter, setQuestionTypeFilter] = useState<QuestionType | 'all'>('all');
  const [includeProcedural, setIncludeProcedural] = useState<boolean>(true);
  const [isTimed, setIsTimed] = useState<boolean>(false);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(30); // 30s per question

  // Compute available topics based on selected subject
  const availableTopics = useMemo(() => {
    if (selectedSubject === 'All') {
      const all = Object.values(TOPICS_BY_SUBJECT).flat();
      return Array.from(new Set(all));
    }
    return TOPICS_BY_SUBJECT[selectedSubject] || [];
  }, [selectedSubject]);

  // Compute pool of matching questions from static bank
  const matchingQuestions = useMemo(() => {
    return INITIAL_QUESTIONS.filter((q) => {
      if (selectedSubject !== 'All' && q.subject !== selectedSubject) return false;
      if (selectedTopic !== 'All' && q.topic !== selectedTopic) return false;
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
      if (questionTypeFilter !== 'all' && q.type !== questionTypeFilter) return false;
      return true;
    });
  }, [selectedSubject, selectedTopic, selectedDifficulty, questionTypeFilter]);

  const handleLaunch = () => {
    soundManager.playClick();

    // Pool questions and shuffle
    let pool = [...matchingQuestions].sort(() => Math.random() - 0.5);

    // If procedural questions are enabled and user wants more or variety, generate fresh algorithmic questions
    if (includeProcedural || pool.length < questionCount) {
      const needed = questionCount - pool.length;
      const genSubject = selectedSubject === 'All' ? undefined : selectedSubject;
      const procedurals = generateCustomQuestions(Math.max(needed, 2), genSubject);
      pool = [...pool, ...procedurals].sort(() => Math.random() - 0.5);
    }

    const finalQuestions = pool.slice(0, questionCount);

    onStartQuiz({
      questions: finalQuestions,
      subject: selectedSubject,
      topic: selectedTopic,
      difficulty: selectedDifficulty,
      timed: isTimed,
      timePerQuestion,
    });
  };

  // Quick Preset Clickers
  const applyPreset = (preset: {
    subject: Subject | 'All';
    topic: string;
    diff: Difficulty | 'All';
    count: number;
    timed: boolean;
  }) => {
    soundManager.playClick();
    setSelectedSubject(preset.subject);
    setSelectedTopic(preset.topic);
    setSelectedDifficulty(preset.diff);
    setQuestionCount(preset.count);
    setIsTimed(preset.timed);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Interactive Quiz Builder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Quiz Generator
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Customize your practice parameters. Generate targeted questions from our comprehensive question bank or integrate algorithmic problems.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Fast Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() =>
              applyPreset({ subject: 'All', topic: 'All', diff: 'All', count: 5, timed: false })
            }
            className="glass-panel p-3.5 rounded-xl border border-slate-800 text-left hover:border-cyan-500/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                Quick 5-Min Warmup
              </span>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-[11px] text-slate-400">
              5 Random Questions · Mixed Subjects · Untimed
            </div>
          </button>

          <button
            onClick={() =>
              applyPreset({ subject: 'Math', topic: 'All', diff: 'Medium', count: 10, timed: true })
            }
            className="glass-panel p-3.5 rounded-xl border border-slate-800 text-left hover:border-blue-500/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-blue-300">
                Math Speed Challenge
              </span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-[11px] text-slate-400">
              10 Math Questions · Timed 30s · Medium
            </div>
          </button>

          <button
            onClick={() =>
              applyPreset({ subject: 'Computer Science', topic: 'All', diff: 'Hard', count: 10, timed: false })
            }
            className="glass-panel p-3.5 rounded-xl border border-slate-800 text-left hover:border-purple-500/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-purple-300">
                CS Deep Dive
              </span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-[11px] text-slate-400">
              10 CS Questions · Algorithms & Data Structures · Hard
            </div>
          </button>

          <button
            onClick={() =>
              applyPreset({ subject: 'Science', topic: 'All', diff: 'All', count: 15, timed: false })
            }
            className="glass-panel p-3.5 rounded-xl border border-slate-800 text-left hover:border-emerald-500/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                Science Marathon
              </span>
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400">
              15 Questions · Physics, Chem & Bio · All
            </div>
          </button>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800/90 space-y-7 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value as Subject | 'All');
                setSelectedTopic('All');
              }}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Subjects (Comprehensive Mix)</option>
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Topics</option>
              {availableTopics.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Question Count
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    questionCount === count
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Filters: Timed & Procedural */}
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Timed Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-slate-200">Timed Mode</div>
              <div className="text-xs text-slate-400">
                {isTimed ? `${timePerQuestion}s countdown per question` : 'Untimed self-paced practice'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isTimed}
                onChange={(e) => setIsTimed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Procedural Template Synthesis Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-slate-200">Procedural Generator</div>
              <div className="text-xs text-slate-400">
                Synthesize fresh mathematical & algorithmic challenges
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeProcedural}
                onChange={(e) => setIncludeProcedural(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        {/* Launch Button Banner */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Matching bank: <span className="font-mono text-cyan-400 font-semibold">{matchingQuestions.length}</span> verified questions ready
          </div>

          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Generate & Start Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Clock,
  Sparkles,
  Trophy,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Question, Subject, Difficulty, QuizResult, QuizAttemptAnswer } from '../types';
import { soundManager } from '../utils/sound';
import { saveQuizResult } from '../utils/storage';

interface MCQPracticeViewProps {
  questions: Question[];
  subject: Subject | 'All';
  topic: string;
  difficulty: Difficulty | 'All';
  timed: boolean;
  timePerQuestion?: number;
  onExit: () => void;
  onRetake: () => void;
}

export const MCQPracticeView: React.FC<MCQPracticeViewProps> = ({
  questions,
  subject,
  topic,
  difficulty,
  timed,
  timePerQuestion = 30,
  onExit,
  onRetake,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [startTime] = useState<number>(Date.now());
  const [totalTimeTaken, setTotalTimeTaken] = useState<number>(0);
  const [quizSaved, setQuizSaved] = useState(false);

  // Review screen filter
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'bookmarked'>('all');

  const currentQ = questions[currentIndex] || questions[0];

  // Timer countdown hook for timed mode
  useEffect(() => {
    if (!timed || isCompleted) return;

    setTimeLeft(timePerQuestion);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question, advance or lock
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, timed, isCompleted, timePerQuestion]);

  const handleTimeExpire = () => {
    if (!selectedAnswers[currentIndex]) {
      // Mark unanswered
      handleSelectOption('__TIMED_OUT__');
    }
  };

  const handleSelectOption = (option: string) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // already answered

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const toggleBookmark = () => {
    soundManager.playClick();
    setBookmarked((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const finishQuiz = useCallback(() => {
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    setTotalTimeTaken(elapsedSeconds);
    setIsCompleted(true);

    // Calculate score
    let score = 0;
    const answersRecord: QuizAttemptAnswer[] = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] || 'Unanswered';
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        questionId: q.id,
        questionText: q.question,
        selectedAnswer: selected,
        correctAnswer: String(q.correctAnswer),
        isCorrect,
        explanation: q.explanation,
      };
    });

    const percentage = Math.round((score / questions.length) * 100);

    // Confetti on good score
    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981'],
      });
    }

    // Save to storage
    if (!quizSaved) {
      const result: QuizResult = {
        id: `quiz-${Date.now()}`,
        date: new Date().toISOString(),
        subject: (subject === 'All' ? questions[0]?.subject || 'General Knowledge' : subject) as Subject,
        topic: topic === 'All' ? 'Mixed Concepts' : topic,
        difficulty: (difficulty === 'All' ? 'Medium' : difficulty) as Difficulty,
        totalQuestions: questions.length,
        score,
        percentage,
        timeTakenSeconds: elapsedSeconds,
        answers: answersRecord,
      };
      saveQuizResult(result);
      setQuizSaved(true);
    }
  }, [questions, selectedAnswers, startTime, quizSaved, subject, topic, difficulty]);

  if (!currentQ) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-400">No questions found matching your filter criteria.</p>
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm"
        >
          Return to Generator
        </button>
      </div>
    );
  }

  const answeredCurrent = selectedAnswers[currentIndex] !== undefined;
  const currentSelected = selectedAnswers[currentIndex];
  const isCurrentCorrect = currentSelected === currentQ.correctAnswer;

  // Compute final score tally
  const totalCorrect = Object.entries(selectedAnswers).filter(
    ([idx, ans]) => ans === questions[Number(idx)]?.correctAnswer
  ).length;
  const scorePercent = Math.round((totalCorrect / questions.length) * 100);

  // Review filtered list
  const filteredReviewIndices = questions
    .map((_, i) => i)
    .filter((idx) => {
      const ans = selectedAnswers[idx];
      const isRight = ans === questions[idx]?.correctAnswer;
      if (reviewFilter === 'wrong') return !isRight;
      if (reviewFilter === 'bookmarked') return !!bookmarked[idx];
      return true;
    });

  // ================= RENDER RESULTS VIEW =================
  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Results Hero Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 text-center relative overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-cyan-500/25">
              {scorePercent >= 80 ? (
                <Trophy className="w-8 h-8 text-amber-300" />
              ) : (
                <Award className="w-8 h-8 text-cyan-200" />
              )}
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Quiz Evaluation
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                {scorePercent >= 80
                  ? 'Outstanding Mastery!'
                  : scorePercent >= 60
                  ? 'Solid Performance!'
                  : 'Review & Reinforce'}
              </h2>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="text-center">
                <div className="text-4xl font-extrabold font-mono text-cyan-400 tabular-nums">
                  {scorePercent}%
                </div>
                <div className="text-xs text-slate-400 mt-1">Accuracy Score</div>
              </div>

              <div className="h-10 w-px bg-slate-800" />

              <div className="text-center">
                <div className="text-4xl font-extrabold font-mono text-white tabular-nums">
                  {totalCorrect} <span className="text-lg text-slate-400 font-normal">/ {questions.length}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Correct Answers</div>
              </div>

              <div className="h-10 w-px bg-slate-800" />

              <div className="text-center">
                <div className="text-4xl font-extrabold font-mono text-purple-400 tabular-nums">
                  {Math.round(totalTimeTaken)}s
                </div>
                <div className="text-xs text-slate-400 mt-1">Duration</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={onRetake}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-95 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onExit}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Back to Generator
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown / Review Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Question-by-Question Review
            </h3>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setReviewFilter('wrong')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'wrong'
                    ? 'bg-slate-800 text-rose-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mistakes ({questions.length - totalCorrect})
              </button>
              <button
                onClick={() => setReviewFilter('bookmarked')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'bookmarked'
                    ? 'bg-slate-800 text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bookmarked ({Object.values(bookmarked).filter(Boolean).length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviewIndices.map((idx) => {
              const q = questions[idx];
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={`glass-panel p-5 rounded-xl border transition-all ${
                    isCorrect
                      ? 'border-emerald-500/25 bg-emerald-950/10'
                      : 'border-rose-500/25 bg-rose-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono font-semibold text-slate-300">
                          Q{idx + 1}
                        </span>
                        <span>·</span>
                        <span>{q.subject}</span>
                        <span>·</span>
                        <span>{q.topic}</span>
                        {bookmarked[idx] && (
                          <span className="text-amber-400 flex items-center gap-0.5 text-[11px]">
                            <Bookmark className="w-3 h-3 fill-amber-400" /> Bookmarked
                          </span>
                        )}
                      </div>

                      <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                        {q.question}
                      </div>

                      {q.codeSnippet && (
                        <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto my-2">
                          {q.codeSnippet}
                        </pre>
                      )}

                      {q.formula && (
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-xs text-indigo-300 my-2">
                          {q.formula}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <span className="text-slate-400 block mb-0.5">Your Answer:</span>
                          <span
                            className={`font-semibold ${
                              isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {userAns || 'No Answer'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <span className="text-slate-400 block mb-0.5">Correct Answer:</span>
                          <span className="font-semibold text-emerald-400">
                            {q.correctAnswer}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300 mt-2 leading-relaxed">
                        <span className="font-semibold text-cyan-400 block mb-1">
                          Explanation:
                        </span>
                        {q.explanation}
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER ACTIVE QUIZ VIEW =================
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Quiz Header Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800/90 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Quiz"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-slate-400">
              {currentQ.subject} · {currentQ.topic}
            </div>
            <div className="text-sm font-bold text-white">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {timed && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono tabular-nums">
              <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
              <span className={timeLeft <= 5 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                {timeLeft}s
              </span>
            </div>
          )}

          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-colors border ${
              bookmarked[currentIndex]
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Bookmark this question"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked[currentIndex] ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Active Question Box */}
      <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-slate-800/90 space-y-6 shadow-2xl">
        {/* Difficulty Badge */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold tracking-wider uppercase text-cyan-400">
            {currentQ.difficulty} Tier
          </span>
          <span className="font-mono text-slate-400">
            Score: {totalCorrect} / {Object.keys(selectedAnswers).length}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {currentQ.question}
        </h2>

        {/* Code Snippet Box */}
        {currentQ.codeSnippet && (
          <pre className="p-4 rounded-xl bg-[#070b12] border border-slate-800/80 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto leading-relaxed">
            {currentQ.codeSnippet}
          </pre>
        )}

        {/* Formula Box */}
        {currentQ.formula && (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-sm text-indigo-300 text-center tracking-wide">
            {currentQ.formula}
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = currentSelected === option;
            const isAnswerKey = option === currentQ.correctAnswer;

            let buttonStyle = 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60';

            if (answeredCurrent) {
              if (isAnswerKey) {
                // Correct answer glows green
                buttonStyle = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md shadow-emerald-500/15';
              } else if (isSelected && !isAnswerKey) {
                // Chosen wrong answer glows red
                buttonStyle = 'bg-rose-950/40 border-rose-500/80 text-rose-300 shadow-md shadow-rose-500/15';
              } else {
                // Other options muted
                buttonStyle = 'bg-slate-900/40 border-slate-800/50 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={answeredCurrent}
                onClick={() => handleSelectOption(option)}
                className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xs font-mono text-slate-300 shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{option}</span>
                </div>

                {answeredCurrent && isAnswerKey && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {answeredCurrent && isSelected && !isAnswerKey && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback Explanation Drawer */}
        {answeredCurrent && (
          <div
            className={`p-4 rounded-xl border transition-all text-xs sm:text-sm leading-relaxed ${
              isCurrentCorrect
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1.5">
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Incorrect. Correct answer is: {currentQ.correctAnswer}</span>
                </>
              )}
            </div>
            <p className="text-slate-300 text-xs sm:text-sm">{currentQ.explanation}</p>
          </div>
        )}

        {/* Nav Controls */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentIndex === 0
                ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {answeredCurrent && currentIndex < questions.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {answeredCurrent && currentIndex === questions.length - 1 && (
              <button
                type="button"
                onClick={finishQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Finish & View Score</span>
                <Trophy className="w-3.5 h-3.5" />
              </button>
            )}

            {!answeredCurrent && (
              <span className="text-xs text-slate-400">Select an answer above</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

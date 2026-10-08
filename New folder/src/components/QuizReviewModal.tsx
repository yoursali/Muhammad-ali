import React from 'react';
import { X, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { QuizResult } from '../types';

interface QuizReviewModalProps {
  quiz: QuizResult | null;
  onClose: () => void;
  onRetake: (quiz: QuizResult) => void;
}

export const QuizReviewModal: React.FC<QuizReviewModalProps> = ({
  quiz,
  onClose,
  onRetake,
}) => {
  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel-elevated w-full max-w-3xl rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">
              {quiz.subject} · {quiz.topic} · {quiz.difficulty}
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Quiz Results Review ({quiz.score}/{quiz.totalQuestions} - {quiz.percentage}%)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRetake(quiz);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {quiz.answers.map((ans, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2.5 ${
                ans.isCorrect
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-white">
                  <span className="font-mono text-slate-400 mr-2">Q{idx + 1}.</span>
                  {ans.questionText}
                </div>
                {ans.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Your selection:</span>
                  <span className={`font-semibold ${ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ans.selectedAnswer}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Correct answer:</span>
                  <span className="font-semibold text-emerald-400">
                    {ans.correctAnswer}
                  </span>
                </div>
              </div>

              {ans.explanation && (
                <div className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                  <span className="font-semibold text-cyan-400 mr-1">Explanation:</span>
                  {ans.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

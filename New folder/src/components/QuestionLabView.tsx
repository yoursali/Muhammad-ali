import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { QUESTION_TEMPLATES, TemplateDefinition } from '../utils/questionGenerator';
import { Question } from '../types';
import { soundManager } from '../utils/sound';

export const QuestionLabView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(QUESTION_TEMPLATES[0]);
  const [generatedQuestion, setGeneratedQuestion] = useState<Question>(QUESTION_TEMPLATES[0].generate());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleSelectTemplate = (tpl: TemplateDefinition) => {
    soundManager.playClick();
    setSelectedTemplate(tpl);
    const newQ = tpl.generate();
    setGeneratedQuestion(newQ);
    setSelectedAnswer(null);
  };

  const handleGenerateFresh = () => {
    soundManager.playClick();
    const newQ = selectedTemplate.generate();
    setGeneratedQuestion(newQ);
    setSelectedAnswer(null);
  };

  const handleChooseOption = (opt: string) => {
    if (selectedAnswer !== null) return;
    const isCorrect = opt === generatedQuestion.correctAnswer;
    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    setSelectedAnswer(opt);
  };

  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === generatedQuestion.correctAnswer;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          <Cpu className="w-4 h-4" />
          <span>Procedural Question Laboratory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Algorithmic Template Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Generate infinite algorithmic practice problems on-demand from predefined templates. Every generation computes random coefficients, verified answers, and rationales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Template Catalog (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Available Problem Templates
          </div>

          <div className="space-y-2">
            {QUESTION_TEMPLATES.map((tpl) => {
              const isSelected = tpl.id === selectedTemplate.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-cyan-400">{tpl.subject}</span>
                    <span className="text-[11px] text-slate-400">{tpl.difficulty}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{tpl.name}</div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Interactive Sandbox (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 font-semibold">
                  {selectedTemplate.topic} · {selectedTemplate.difficulty}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedTemplate.name}
                </h3>
              </div>

              <button
                onClick={handleGenerateFresh}
                className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate Variables</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              {generatedQuestion.question}
            </div>

            {/* Code Snippet Box */}
            {generatedQuestion.codeSnippet && (
              <pre className="p-4 rounded-xl bg-[#070b12] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                {generatedQuestion.codeSnippet}
              </pre>
            )}

            {/* Formula Box */}
            {generatedQuestion.formula && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-indigo-300 text-center">
                {generatedQuestion.formula}
              </div>
            )}

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {generatedQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                const isAnswerKey = opt === generatedQuestion.correctAnswer;

                let optClass = 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700';

                if (isAnswered) {
                  if (isAnswerKey) {
                    optClass = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300';
                  } else if (isSelected && !isAnswerKey) {
                    optClass = 'bg-rose-950/40 border-rose-500/80 text-rose-300';
                  } else {
                    optClass = 'bg-slate-900/30 border-slate-800/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleChooseOption(opt)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${optClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-xs shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswered && isAnswerKey && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isAnswerKey && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Breakdown Drawer */}
            {isAnswered && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                  isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Exact Match! Verified Solution</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Not quite. Verified Answer: {generatedQuestion.correctAnswer}</span>
                    </>
                  )}
                </div>
                <p className="text-slate-300 text-xs sm:text-sm">
                  {generatedQuestion.explanation}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={handleGenerateFresh}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Algorithmic Variation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

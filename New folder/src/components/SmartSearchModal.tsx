import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  HelpCircle,
  Layers,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Question, Flashcard, StudyNote } from '../types';
import { INITIAL_QUESTIONS } from '../data/questionsData';
import { getFlashcards, getNotes } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface SmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: Question) => void;
  onSelectFlashcard: (flashcard: Flashcard) => void;
  onSelectNote: (note: StudyNote) => void;
}

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectQuestion,
  onSelectFlashcard,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'question' | 'flashcard' | 'note'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFlashcards(getFlashcards());
      setNotes(getNotes());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search Results
  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Suggest top starter items
      return {
        questions: INITIAL_QUESTIONS.slice(0, 3),
        flashcards: flashcards.slice(0, 3),
        notes: notes.slice(0, 3),
        total: 9,
      };
    }

    const matchedQuestions = INITIAL_QUESTIONS.filter(
      (q) =>
        q.question.toLowerCase().includes(trimmed) ||
        q.topic.toLowerCase().includes(trimmed) ||
        q.subject.toLowerCase().includes(trimmed) ||
        q.explanation.toLowerCase().includes(trimmed)
    ).slice(0, 6);

    const matchedFlashcards = flashcards.filter(
      (f) =>
        f.front.toLowerCase().includes(trimmed) ||
        f.back.toLowerCase().includes(trimmed) ||
        f.topic.toLowerCase().includes(trimmed) ||
        f.subject.toLowerCase().includes(trimmed)
    ).slice(0, 6);

    const matchedNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(trimmed) ||
        n.content.toLowerCase().includes(trimmed) ||
        n.topic.toLowerCase().includes(trimmed) ||
        n.subject.toLowerCase().includes(trimmed) ||
        n.tags.some((t) => t.toLowerCase().includes(trimmed))
    ).slice(0, 6);

    return {
      questions: matchedQuestions,
      flashcards: matchedFlashcards,
      notes: matchedNotes,
      total: matchedQuestions.length + matchedFlashcards.length + matchedNotes.length,
    };
  }, [query, flashcards, notes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-elevated w-full max-w-2xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, flashcards, notes, formulas..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-xs">
          {(
            [
              { id: 'all', label: 'All Items' },
              { id: 'question', label: 'Questions' },
              { id: 'flashcard', label: 'Flashcards' },
              { id: 'note', label: 'Study Notes' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterType === t.id
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {results.total === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching questions or notes found for "{query}".
            </div>
          ) : (
            <>
              {/* Questions Section */}
              {(filterType === 'all' || filterType === 'question') && results.questions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Practice Questions</span>
                  </div>
                  {results.questions.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectQuestion(q);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs text-slate-400">
                          {q.subject} · {q.topic} · {q.difficulty}
                        </div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                          {q.question}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* Flashcards Section */}
              {(filterType === 'all' || filterType === 'flashcard') && results.flashcards.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Flashcards</span>
                  </div>
                  {results.flashcards.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectFlashcard(f);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs text-slate-400">
                          {f.subject} · {f.topic}
                        </div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors truncate">
                          {f.front}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* Notes Section */}
              {(filterType === 'all' || filterType === 'note') && results.notes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Study Notes</span>
                  </div>
                  {results.notes.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectNote(n);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs text-slate-400">
                          {n.subject} · {n.topic}
                        </div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                          {n.title}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Search in-memory database and notes</span>
          <span>Click any item to open</span>
        </div>
      </div>
    </div>
  );
};

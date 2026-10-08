import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  RotateCw,
  Plus,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  HelpCircle,
  Trash2,
  X,
  Volume2
} from 'lucide-react';
import { Flashcard, Subject, MasteryLevel } from '../types';
import { SUBJECTS } from '../data/questionsData';
import { soundManager } from '../utils/sound';
import {
  getFlashcards,
  updateFlashcardMastery,
  addCustomFlashcard,
  deleteFlashcard,
} from '../utils/storage';

export const FlashcardsView: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [masteryFilter, setMasteryFilter] = useState<MasteryLevel | 'all'>('all');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newSubject, setNewSubject] = useState<Subject>('Computer Science');
  const [newTopic, setNewTopic] = useState('General Concepts');

  // Load cards from localStorage
  useEffect(() => {
    setCards(getFlashcards());
  }, []);

  // Filter cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (selectedSubject !== 'All' && c.subject !== selectedSubject) return false;
      if (masteryFilter !== 'all' && c.mastery !== masteryFilter) return false;
      return true;
    });
  }, [cards, selectedSubject, masteryFilter]);

  // Ensure currentIndex stays within bounds
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
    setShowHint(false);
  }, [filteredCards.length, selectedSubject, masteryFilter]);

  const currentCard = filteredCards[currentIndex];

  const handleFlip = useCallback(() => {
    soundManager.playClick();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    soundManager.playClick();
    setIsFlipped(false);
    setShowHint(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex, filteredCards.length]);

  const handlePrev = useCallback(() => {
    soundManager.playClick();
    setIsFlipped(false);
    setShowHint(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  }, [currentIndex, filteredCards.length]);

  const handleShuffle = () => {
    soundManager.playClick();
    setIsFlipped(false);
    setShowHint(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleRateMastery = (mastery: MasteryLevel) => {
    if (!currentCard) return;
    if (mastery === 'mastered') {
      soundManager.playCorrect();
    } else {
      soundManager.playClick();
    }

    const updated = updateFlashcardMastery(currentCard.id, mastery);
    setCards(updated);

    // Auto advance
    setTimeout(() => {
      handleNext();
    }, 200);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '1') {
        handleRateMastery('learning');
      } else if (e.key === '2') {
        handleRateMastery('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  // Speech reader for accessibility
  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Create Custom Flashcard
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    soundManager.playClick();
    const created = addCustomFlashcard({
      front: newFront.trim(),
      back: newBack.trim(),
      hint: newHint.trim() || undefined,
      subject: newSubject,
      topic: newTopic.trim() || 'General',
      mastery: 'new',
    });

    setCards([created, ...cards]);
    setShowCreateModal(false);
    setNewFront('');
    setNewBack('');
    setNewHint('');
    setCurrentIndex(0);
  };

  const handleDeleteCard = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    const updated = deleteFlashcard(cardId);
    setCards(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Active Recall Deck</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Flashcards
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Flip to reveal concepts, test your recall, and categorize cards by mastery level.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:opacity-95 transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Flashcard</span>
        </button>
      </div>

      {/* Filters & Mastery Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-slate-800">
        {/* Subject Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubject === 'All'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            All Subjects
          </button>
          {SUBJECTS.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Mastery State Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs shrink-0">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'new', label: 'New' },
              { id: 'learning', label: 'Review' },
              { id: 'mastered', label: 'Mastered' },
            ] as const
          ).map((tier) => (
            <button
              key={tier.id}
              onClick={() => setMasteryFilter(tier.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                masteryFilter === tier.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No flashcards in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your filters or create a custom card for this subject.
          </p>
          <button
            onClick={() => {
              setSelectedSubject('All');
              setMasteryFilter('all');
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-cyan-400 hover:bg-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deck Counter Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="font-mono tabular-nums">
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Space to flip · Arrow keys to navigate
              </span>
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:text-white transition-colors cursor-pointer"
                title="Shuffle Cards"
              >
                <Shuffle className="w-3 h-3 text-cyan-400" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>

          {/* 3D Flippable Card Stage */}
          <div
            onClick={handleFlip}
            className="w-full h-80 sm:h-96 perspective-1000 cursor-pointer select-none"
          >
            <div
              className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-500 rounded-3xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 backface-hidden glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-slate-800 flex flex-col justify-between shadow-2xl hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-purple-400">
                      {currentCard.subject}
                    </span>
                    <span>·</span>
                    <span className="text-slate-400">{currentCard.topic}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        currentCard.mastery === 'mastered'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : currentCard.mastery === 'learning'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {currentCard.mastery === 'mastered'
                        ? 'Mastered'
                        : currentCard.mastery === 'learning'
                        ? 'Needs Review'
                        : 'New'}
                    </span>

                    <button
                      onClick={(e) => handleSpeak(currentCard.front, e)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {currentCard.isUserCreated && (
                      <button
                        onClick={(e) => handleDeleteCard(currentCard.id, e)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Prompt Text */}
                <div className="text-center px-4 my-auto">
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Concept / Question
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                    {currentCard.front}
                  </h3>
                </div>

                {/* Card Footer: Hint or flip prompt */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <div>
                    {currentCard.hint && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(!showHint);
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{showHint ? currentCard.hint : 'Reveal Hint'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <RotateCw className="w-3 h-3 text-purple-400" />
                    <span>Click to flip</span>
                  </div>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0e1628] rounded-3xl p-6 sm:p-10 border border-purple-500/40 flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                    Answer / Key Insight
                  </span>
                  <button
                    onClick={(e) => handleSpeak(currentCard.back, e)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Answer Content */}
                <div className="text-center px-4 my-auto">
                  <p className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed font-sans">
                    {currentCard.back}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-3">
                  Rate your recall below to organize this card
                </div>
              </div>
            </div>
          </div>

          {/* Self-Rating Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Left Nav */}
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Previous Card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Next Card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Rating Buttons */}
            <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
              <button
                onClick={() => handleRateMastery('learning')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Needs Practice [1]</span>
              </button>

              <button
                onClick={() => handleRateMastery('mastered')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mastered [2]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Flashcard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-elevated w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-slate-700/80 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Plus className="w-5 h-5 text-purple-400" />
                <span>Create Flashcard</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as Subject)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Kinematics"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Front (Question or Concept)</label>
                <textarea
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the First Law of Thermodynamics?"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Back (Answer or Explanation)</label>
                <textarea
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Energy cannot be created or destroyed; ΔU = Q - W"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Hint (Optional)</label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder="e.g. Relates to conservation of energy"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold hover:opacity-95"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

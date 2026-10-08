import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Pin,
  Trash2,
  Copy,
  Download,
  Search,
  Eye,
  Edit3,
  Check,
  Tag,
  Clock
} from 'lucide-react';
import { StudyNote, Subject } from '../types';
import { SUBJECTS } from '../data/questionsData';
import { soundManager } from '../utils/sound';
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from '../utils/storage';

export const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<Subject | 'All'>('All');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Active note editor state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('Computer Science');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Load notes on mount
  useEffect(() => {
    const loaded = getNotes();
    setNotes(loaded);
    if (loaded.length > 0 && !selectedNoteId) {
      selectNote(loaded[0]);
    }
  }, []);

  const selectNote = (note: StudyNote) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setSubject(note.subject);
    setTopic(note.topic);
    setContent(note.content);
    setTagsInput(note.tags.join(', '));
    setIsPreviewMode(false);
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (subjectFilter !== 'All' && n.subject !== subjectFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchContent = n.content.toLowerCase().includes(q);
          const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, subjectFilter, searchQuery]);

  const activeNote = notes.find((n) => n.id === selectedNoteId);

  // Auto-save changes with debounce or on edit
  const handleSaveActiveNote = (updates: Partial<StudyNote>) => {
    if (!selectedNoteId || !activeNote) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: StudyNote = {
      ...activeNote,
      title: updates.title !== undefined ? updates.title : title,
      subject: updates.subject !== undefined ? updates.subject : subject,
      topic: updates.topic !== undefined ? updates.topic : topic,
      content: updates.content !== undefined ? updates.content : content,
      tags: updates.tags !== undefined ? updates.tags : tagsArray,
      updatedAt: new Date().toISOString(),
    };

    const newNotes = updateNote(updated);
    setNotes(newNotes);
  };

  const handleCreateNewNote = () => {
    soundManager.playClick();
    const created = addNote({
      title: 'Untitled Note',
      subject: subjectFilter === 'All' ? 'Computer Science' : subjectFilter,
      topic: 'General Topic',
      content: '# Untitled Note\n\nWrite your concepts, lecture takeaways, or cheat sheet formulas here...',
      tags: ['Study'],
      isPinned: false,
    });

    setNotes([created, ...notes]);
    selectNote(created);
  };

  const handleDeleteActiveNote = () => {
    if (!selectedNoteId) return;
    soundManager.playClick();
    const updated = deleteNote(selectedNoteId);
    setNotes(updated);
    if (updated.length > 0) {
      selectNote(updated[0]);
    } else {
      setSelectedNoteId(null);
    }
  };

  const togglePin = () => {
    if (!activeNote) return;
    soundManager.playClick();
    const updated: StudyNote = {
      ...activeNote,
      isPinned: !activeNote.isPinned,
    };
    const newNotes = updateNote(updated);
    setNotes(newNotes);
  };

  const handleCopy = () => {
    if (!content) return;
    soundManager.playClick();
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    soundManager.playClick();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to render markdown preview simply & cleanly without heavy external parsers
  const renderSimpleMarkdown = (md: string) => {
    const lines = md.split('\n');
    return (
      <div className="space-y-3 font-sans text-slate-200 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-xl sm:text-2xl font-bold text-white pt-2 border-b border-slate-800 pb-1">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg font-bold text-cyan-300 pt-2">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-semibold text-purple-300">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('```')) {
            return null; // Handle fences
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-2 border-cyan-500 pl-3 py-1 my-2 italic text-slate-300 bg-slate-900/40 rounded-r">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-300">
                {line.substring(2)}
              </li>
            );
          }
          if (line.trim().length === 0) {
            return <div key={idx} className="h-2" />;
          }
          return (
            <p key={idx} className="text-slate-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Curated Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Study Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Capture, synthesize, and tag your personal revision notes. Full offline persistence.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs sm:text-sm font-semibold hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* LEFT COLUMN: Note Directory (4 Cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col gap-4">
          {/* Search bar inside notes */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in notes..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSubjectFilter('All')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                subjectFilter === 'All'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  subjectFilter === s
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Note List Scrollable */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No matching notes found.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === selectedNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/80 border-cyan-500/40 text-white shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold truncate leading-tight">
                        {note.title || 'Untitled Note'}
                      </span>
                      {note.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span className="text-emerald-400">{note.subject}</span>
                      <span>·</span>
                      <span className="truncate">{note.topic}</span>
                    </div>

                    <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {note.content.replace(/[#*`>-]/g, '').trim()}
                    </div>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-900/90 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Note Editor / Reader (8 Cols) */}
        <div className="lg:col-span-8 glass-panel-elevated rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          {!activeNote ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600" />
              <p className="text-sm text-slate-400">Select a note or create a new one to begin editing.</p>
              <button
                onClick={handleCreateNewNote}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold"
              >
                Create Note
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-4">
              {/* Note Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePin}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      activeNote.isPinned
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                    title={activeNote.isPinned ? 'Unpin Note' : 'Pin to Top'}
                  >
                    <Pin className={`w-4 h-4 ${activeNote.isPinned ? 'fill-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      isPreviewMode
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {isPreviewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isPreviewMode ? 'Edit Mode' : 'Preview'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy Note Text"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Export Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDeleteActiveNote}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    handleSaveActiveNote({ title: e.target.value });
                  }}
                  placeholder="Note Title..."
                  className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Metadata Row: Subject, Topic, Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      const newSub = e.target.value as Subject;
                      setSubject(newSub);
                      handleSaveActiveNote({ subject: newSub });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      handleSaveActiveNote({ topic: e.target.value });
                    }}
                    placeholder="Topic..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Tags (comma separated)</label>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                    <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => {
                        setTagsInput(e.target.value);
                        const arr = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                        handleSaveActiveNote({ tags: arr });
                      }}
                      placeholder="e.g. Exam, Formula, Q1"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Editor / Markdown Preview Area */}
              <div className="flex-1 min-h-[340px] pt-2">
                {isPreviewMode ? (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 h-full overflow-y-auto">
                    {renderSimpleMarkdown(content)}
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      handleSaveActiveNote({ content: e.target.value });
                    }}
                    placeholder="Type in markdown format (# Heading, - List, > Quote)..."
                    className="w-full h-full min-h-[340px] bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 font-mono resize-none focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                  />
                )}
              </div>

              {/* Footer Stat Ticker */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last edited {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>

                <span className="font-mono tabular-nums">
                  {wordCount} words · {charCount} chars
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

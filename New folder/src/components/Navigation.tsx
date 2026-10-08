import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  CheckSquare,
  Layers,
  BookOpen,
  Cpu,
  Timer,
  BarChart3,
  Settings,
  Search,
  Volume2,
  VolumeX,
  Flame,
  Menu,
  X
} from 'lucide-react';
import { UserSettings } from '../types';
import { soundManager } from '../utils/sound';

export type NavTab =
  | 'dashboard'
  | 'generator'
  | 'practice'
  | 'flashcards'
  | 'notes'
  | 'procedural'
  | 'timer'
  | 'progress'
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  streak: number;
  settings: UserSettings;
  onToggleSound: () => void;
  onOpenSearch: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  streak,
  settings,
  onToggleSound,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Quiz Generator', icon: HelpCircle },
    { id: 'practice', label: 'MCQ Practice', icon: CheckSquare },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'notes', label: 'My Notes', icon: BookOpen },
    { id: 'procedural', label: 'Question Lab', icon: Cpu },
    { id: 'timer', label: 'Study Timer', icon: Timer },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (tab: NavTab) => {
    soundManager.playClick();
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20">
            S
          </div>
          <span className="text-base font-bold text-white tracking-tight">StudyMate AI</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-[#090d16]/98 backdrop-blur-2xl border-b border-slate-800 z-40 p-4 space-y-1 shadow-2xl">
          <div className="flex items-center justify-between px-3 py-2 mb-2 bg-slate-900/60 rounded-lg text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Flame className="w-4 h-4 fill-amber-400" /> {streak} Day Streak
            </span>
            <button
              onClick={onToggleSound}
              className="flex items-center gap-1 text-slate-300 hover:text-white"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{settings.soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-[#0d1322]/80 backdrop-blur-xl border-r border-slate-800/80 p-5 shrink-0 select-none z-30">
        {/* Brand Lockup */}
        <div className="flex items-center justify-between pb-6 mb-4 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-cyan-500/20">
              S
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-none">
                StudyMate AI
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">
                Futuristic Learning
              </div>
            </div>
          </div>
        </div>

        {/* Universal Search trigger */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 mb-5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors group"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span>Search questions, notes...</span>
          </span>
          <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700/60 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-3 pb-1">
            Study Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="pt-4 mt-auto border-t border-slate-800/80 space-y-3">
          {/* Daily streak card */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-xs text-amber-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Study Streak</span>
            </span>
            <span className="font-bold tabular-nums text-amber-300">{streak} Days</span>
          </div>

          {/* Quick Sound Toggle */}
          <div className="flex items-center justify-between px-3 text-xs text-slate-400">
            <span>Audio FX</span>
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title={settings.soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

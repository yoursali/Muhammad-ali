import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Palette,
  Timer,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  HardDrive
} from 'lucide-react';
import { UserSettings, AccentTheme } from '../types';
import { saveUserSettings, resetAllDataToDefaults } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [accent, setAccent] = useState<AccentTheme>(settings.accentColor);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [instantFeedback, setInstantFeedback] = useState(settings.instantFeedback);
  const [focusMins, setFocusMins] = useState(settings.pomodoroFocusMinutes);
  const [breakMins, setBreakMins] = useState(settings.pomodoroBreakMinutes);
  const [longBreakMins, setLongBreakMins] = useState(settings.pomodoroLongBreakMinutes);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = () => {
    soundManager.playClick();
    const updated: UserSettings = {
      accentColor: accent,
      soundEnabled,
      instantFeedback,
      pomodoroFocusMinutes: focusMins,
      pomodoroBreakMinutes: breakMins,
      pomodoroLongBreakMinutes: longBreakMins,
    };
    saveUserSettings(updated);
    onUpdateSettings(updated);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleTestChime = () => {
    soundManager.playCorrect();
  };

  const handleConfirmReset = () => {
    soundManager.playClick();
    resetAllDataToDefaults();
    setConfirmResetOpen(false);
    onResetAllData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span>System Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Customize your study workspace aesthetic, offline sound effects, and Pomodoro presets.
        </p>
      </div>

      {savedAlert && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-8 shadow-xl">
        {/* Accent Color Palette */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>Futuristic Neon Accent</span>
          </div>
          <p className="text-xs text-slate-400">
            Select the primary neon aura across dashboards, metrics, and progress dials.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { id: 'cyan', label: 'Electric Cyan', color: 'bg-cyan-500', ring: 'border-cyan-400' },
              { id: 'purple', label: 'Cyber Purple', color: 'bg-purple-500', ring: 'border-purple-400' },
              { id: 'emerald', label: 'Matrix Emerald', color: 'bg-emerald-500', ring: 'border-emerald-400' },
              { id: 'amber', label: 'Solar Amber', color: 'bg-amber-500', ring: 'border-amber-400' },
            ].map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setAccent(th.id as AccentTheme)}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  accent === th.id
                    ? 'bg-slate-800/80 border-cyan-400/80 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${th.color} shrink-0`} />
                <span className="text-xs font-semibold">{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio FX Section */}
        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Audio Feedback Synthesis</span>
              </div>
              <p className="text-xs text-slate-400">
                Play subtle Web Audio synthesized tones for correct answers and timer transitions.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {soundEnabled && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestChime}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Audio Chime</span>
              </button>
            </div>
          )}
        </div>

        {/* Pomodoro Timer Defaults */}
        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Timer className="w-4 h-4 text-purple-400" />
            <span>Pomodoro Interval Presets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Focus Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={focusMins}
                onChange={(e) => setFocusMins(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Short Break (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={breakMins}
                onChange={(e) => setBreakMins(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                Long Break (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={45}
                value={longBreakMins}
                onChange={(e) => setLongBreakMins(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Save Preferences
          </button>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="pt-6 border-t border-rose-900/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Danger Zone</span>
          </div>
          <p className="text-xs text-slate-400">
            Reset all user study notes, quiz scores, and streak data back to factory defaults.
          </p>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-all text-xs font-bold cursor-pointer"
          >
            Reset All Application Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-elevated w-full max-w-md rounded-2xl p-6 border border-rose-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Reset</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reset all stored progress, flashcard mastery states, custom notes, and quiz histories? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

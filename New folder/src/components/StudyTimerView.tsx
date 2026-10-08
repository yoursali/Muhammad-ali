import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle,
  Plus,
  Minus,
  Radio
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { getUserSettings, logStudySession, getStudySessions } from '../utils/storage';
import { StudySession } from '../types';

type TimerMode = 'focus' | 'short-break' | 'long-break';

export const StudyTimerView: React.FC = () => {
  const settings = getUserSettings();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [taskName, setTaskName] = useState('Deep Study Session');
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'off' | 'focus-binaural' | 'white-noise' | 'rain'>('off');

  // Minute durations
  const [focusMinutes, setFocusMinutes] = useState(settings.pomodoroFocusMinutes || 25);
  const [breakMinutes, setBreakMinutes] = useState(settings.pomodoroBreakMinutes || 5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.pomodoroLongBreakMinutes || 15);

  const getTargetSeconds = (m: TimerMode) => {
    if (m === 'focus') return focusMinutes * 60;
    if (m === 'short-break') return breakMinutes * 60;
    return longBreakMinutes * 60;
  };

  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(focusMinutes * 60);

  const [completedSessions, setCompletedSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    setCompletedSessions(getStudySessions().slice(0, 5));
  }, []);

  // Update totalSeconds when mode or minutes change
  const setTimerForMode = (newMode: TimerMode) => {
    soundManager.playClick();
    setIsRunning(false);
    setMode(newMode);
    const secs = getTargetSeconds(newMode);
    setTotalSeconds(secs);
    setTimeLeft(secs);
  };

  // Timer Tick Interval
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, taskName]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    soundManager.playTimerFinish();
    soundManager.stopAmbient();
    setAmbientSound('off');

    // Log completed session to storage
    const durationMins = Math.round(totalSeconds / 60);
    logStudySession({
      date: new Date().toISOString(),
      durationMinutes: durationMins,
      mode,
      taskLabel: taskName,
      completed: true,
    });

    setCompletedSessions(getStudySessions().slice(0, 5));

    // Auto transition suggestion
    if (mode === 'focus') {
      setTimerForMode('short-break');
    } else {
      setTimerForMode('focus');
    }
  };

  const handleTogglePlay = () => {
    soundManager.playClick();
    if (!isRunning) {
      setIsRunning(true);
      if (ambientSound !== 'off') {
        soundManager.startAmbient(ambientSound);
      }
    } else {
      setIsRunning(false);
      soundManager.stopAmbient();
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    setIsRunning(false);
    soundManager.stopAmbient();
    setTimeLeft(totalSeconds);
  };

  const adjustMinutes = (delta: number) => {
    soundManager.playClick();
    setIsRunning(false);
    if (mode === 'focus') {
      const next = Math.max(1, focusMinutes + delta);
      setFocusMinutes(next);
      setTotalSeconds(next * 60);
      setTimeLeft(next * 60);
    } else if (mode === 'short-break') {
      const next = Math.max(1, breakMinutes + delta);
      setBreakMinutes(next);
      setTotalSeconds(next * 60);
      setTimeLeft(next * 60);
    } else {
      const next = Math.max(1, longBreakMinutes + delta);
      setLongBreakMinutes(next);
      setTotalSeconds(next * 60);
      setTimeLeft(next * 60);
    }
  };

  const handleToggleAmbient = (soundType: 'off' | 'focus-binaural' | 'white-noise' | 'rain') => {
    soundManager.playClick();
    setAmbientSound(soundType);
    if (soundType === 'off') {
      soundManager.stopAmbient();
    } else {
      soundManager.startAmbient(soundType);
    }
  };

  // Format MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // SVG circular progress calculation
  const progressPercent = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeRadius = 130;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          <Timer className="w-4 h-4" />
          <span>Cognitive Rhythm Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Study Focus Timer
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Targeted study intervals paired with synthesized focus tones to maximize concentration.
        </p>
      </div>

      {/* Main Timer Dial Card */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-8">
          <button
            onClick={() => setTimerForMode('focus')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Focus ({focusMinutes}m)
          </button>
          <button
            onClick={() => setTimerForMode('short-break')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'short-break'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Short Break ({breakMinutes}m)
          </button>
          <button
            onClick={() => setTimerForMode('long-break')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'long-break'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Long Break ({longBreakMinutes}m)
          </button>
        </div>

        {/* Task Input */}
        <div className="max-w-sm mx-auto mb-6">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="What are you focusing on?"
            className="w-full text-center bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
          />
        </div>

        {/* Circular SVG Gauge */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
            {/* Background track circle */}
            <circle
              cx="150"
              cy="150"
              r={strokeRadius}
              className="text-slate-800/80"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Active progress stroke */}
            <circle
              cx="150"
              cy="150"
              r={strokeRadius}
              className={`transition-all duration-1000 ${
                mode === 'focus'
                  ? 'text-cyan-400'
                  : mode === 'short-break'
                  ? 'text-emerald-400'
                  : 'text-purple-400'
              }`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tight tabular-nums select-none">
              {timeFormatted}
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 mt-2 font-semibold">
              {isRunning ? (mode === 'focus' ? 'Session in progress' : 'Break in progress') : 'Paused'}
            </span>
          </div>
        </div>

        {/* Control Buttons (Play, Pause, Reset, Adjust) */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => adjustMinutes(-5)}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="-5 Minutes"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-8 py-4 rounded-2xl text-white font-bold text-base flex items-center gap-2.5 transition-all shadow-xl cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 shadow-cyan-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Clock"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => adjustMinutes(5)}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="+5 Minutes"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Sound Matrix */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 max-w-lg mx-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Offline Ambient Soundscape (Web Audio)</span>
            </span>
            <span className="text-[11px] text-slate-400">Pure procedural synthesis</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'off', label: 'Muted', icon: VolumeX },
              { id: 'focus-binaural', label: 'Gamma 40Hz', icon: Sparkles },
              { id: 'rain', label: 'Rain Waves', icon: Volume2 },
              { id: 'white-noise', label: 'Focus Air', icon: Volume2 },
            ].map((snd) => {
              const Icon = snd.icon;
              const active = ambientSound === snd.id;
              return (
                <button
                  key={snd.id}
                  onClick={() => handleToggleAmbient(snd.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{snd.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Completed Sessions Log */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Recently Logged Focus Sessions</span>
        </h3>

        {completedSessions.length === 0 ? (
          <p className="text-xs text-slate-400">
            No completed study sessions recorded yet. Finish a timer cycle to log focus minutes!
          </p>
        ) : (
          <div className="space-y-2">
            {completedSessions.map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sess.mode === 'focus' ? 'bg-cyan-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="font-semibold text-slate-200">
                    {sess.taskLabel || 'Study Session'}
                  </span>
                  <span className="text-slate-400 font-mono">
                    ({sess.durationMinutes} mins)
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(sess.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

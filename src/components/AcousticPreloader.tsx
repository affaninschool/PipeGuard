import React, { useState, useEffect } from 'react';
import { PipeGuardLogo } from './PipeGuardLogo';
import { Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AcousticPreloaderProps {
  onComplete: () => void;
}

const FORMAL_STAGES = [
  { threshold: 25, label: 'Initializing acoustic monitoring modules...' },
  { threshold: 55, label: 'Loading pipeline sensor telemetry...' },
  { threshold: 85, label: 'Calibrating baseline acoustic parameters...' },
  { threshold: 100, label: 'System ready.' },
];

export const AcousticPreloader: React.FC<AcousticPreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      // Smooth, natural progress curve (~2 seconds total duration)
      const delta = currentProgress < 30 ? 2.0 : currentProgress < 75 ? 1.7 : 2.2;
      currentProgress = Math.min(100, currentProgress + delta);
      setProgress(Math.floor(currentProgress));

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          handleExit();
        }, 400);
      }
    }, 38);

    return () => clearInterval(interval);
  }, []);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  // Keyboard shortcuts for convenience and accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeStage = FORMAL_STAGES.find((s) => progress <= s.threshold) || FORMAL_STAGES[FORMAL_STAGES.length - 1];

  // Dynamic color transitions as the loader line fulfills:
  // Phase 1 (0-29%): Warm Amber / Gold (Initialization)
  // Phase 2 (30-64%): Electric Sky Blue (Telemetry loading)
  // Phase 3 (65-89%): Vivid Cyan-Teal (Acoustic Calibration)
  // Phase 4 (90-100%): Crisp Emerald Green (Ready & Verified)
  const getLoaderStyle = (p: number) => {
    if (p < 30) {
      return {
        background: 'linear-gradient(90deg, #f59e0b 0%, #fb923c 100%)',
        boxShadow: '0 0 12px rgba(245, 158, 11, 0.55)',
      };
    }
    if (p < 65) {
      return {
        background: 'linear-gradient(90deg, #f59e0b 0%, #0ea5e9 50%, #06b6d4 100%)',
        boxShadow: '0 0 14px rgba(14, 165, 233, 0.6)',
      };
    }
    if (p < 90) {
      return {
        background: 'linear-gradient(90deg, #0ea5e9 0%, #06b6d4 40%, #14b8a6 100%)',
        boxShadow: '0 0 16px rgba(6, 182, 212, 0.65)',
      };
    }
    return {
      background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 55%, #34d399 100%)',
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.75)',
    };
  };

  const getAccentColor = (p: number) => {
    if (p < 30) return '#f59e0b'; // Amber
    if (p < 65) return '#0ea5e9'; // Sky
    if (p < 90) return '#06b6d4'; // Cyan
    return '#10b981'; // Emerald
  };

  const accentColor = getAccentColor(progress);

  return (
    <div
      role="dialog"
      aria-label="Loading PipeGuard"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-slate-950 text-slate-100 p-6 sm:p-10 select-none transition-opacity duration-500 ease-in-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar: Formal Project Classification & Discreet Skip */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-mono uppercase tracking-wider text-[11px] text-slate-300">
            INSPIRE-MANAK National Science Project
          </span>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* Center: Clean, Formal Identity & Dynamic Color-Changing Progress Indicator */}
      <div className="w-full max-w-md flex flex-col items-center text-center my-auto space-y-6">
        {/* Emblem with subtle dynamic accent aura */}
        <div className="relative flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-lg transition-shadow duration-500"
            style={{
              boxShadow: `0 8px 24px -4px ${accentColor}25`,
            }}
          >
            <PipeGuardLogo className="w-10 h-10" />
          </div>
        </div>

        {/* Project Branding */}
        <div className="space-y-1.5">
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-wide text-white">
            PIPEGUARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Non-Invasive Acoustic Pipeline Leak Detection &amp; Localization System
          </p>
        </div>

        {/* Dynamic Color Progress Bar */}
        <div className="w-full max-w-sm space-y-3 pt-2">
          {/* Track container */}
          <div className="relative w-full h-2 sm:h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800/90 shadow-inner">
            {/* The fulfilling loader line with smooth color transitions */}
            <div
              className="h-full rounded-full transition-all duration-150 ease-out relative"
              style={{
                width: `${progress}%`,
                ...getLoaderStyle(progress),
              }}
            >
              {/* Highlight shimmer on the leading edge */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 rounded-full blur-[1px]" />
            </div>
          </div>

          {/* Status Label & Synchronized Colored Percentage */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 transition-all duration-200 text-slate-300">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block transition-colors duration-300"
                style={{ backgroundColor: accentColor }}
              />
              <span>{activeStage.label}</span>
            </span>

            <span
              className="font-bold tabular-nums ml-2 shrink-0 transition-colors duration-300 flex items-center gap-1"
              style={{ color: accentColor }}
            >
              {progress >= 100 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Institutional Attribution */}
      <div className="w-full max-w-4xl text-center border-t border-slate-900 pt-4">
        <p className="text-[11px] text-slate-500 font-mono">
          Department of Science &amp; Technology • Innovation in Science Pursuit for Inspired Research
        </p>
      </div>
    </div>
  );
};

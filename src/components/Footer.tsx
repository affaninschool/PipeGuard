import React from 'react';
import { TabType } from '../types';
import { Shield, Award, ArrowUpRight } from 'lucide-react';
import { PipeGuardLogo } from './PipeGuardLogo';

interface FooterProps {
  onSelectTab: (tab: TabType) => void;
  onOpenInspireBrief?: () => void;
  onReplayPreloader?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectTab, 
  onOpenInspireBrief,
  onReplayPreloader 
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Project Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <PipeGuardLogo className="w-9 h-9" />
              <span className="font-display font-bold text-xl tracking-tight text-white">
                PIPEGUARD
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Low-Cost External Water-Pipe Leak Detection & Localization System. Investigating non-invasive vibration and acoustic signature analysis for sustainable municipal water conservation.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                INSPIRE-MANAK Project
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Non-Destructive Sensing
              </span>
            </div>
          </div>

          {/* Site Navigation */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onSelectTab('home')}
                  className="text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('research')}
                  className="text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  Research & Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium flex items-center gap-1"
                >
                  Live Monitor Dashboard
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('team')}
                  className="text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  Creator & Team
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('next')}
                  className="text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  Roadmap: What's Next
                </button>
              </li>
            </ul>
          </div>

          {/* Research Spec Summary & INSPIRE-MANAK Action */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Research Details
            </h4>
            <div className="space-y-2.5 text-xs font-mono text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-800">
                <div className="text-slate-200 font-medium">Affan Adil</div>
                <div className="text-[11px] text-slate-400">Student Researcher / Innovator</div>
              </div>
              <button
                type="button"
                onClick={onOpenInspireBrief}
                className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-400 text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between font-medium text-amber-300 group-hover:text-amber-200">
                  <div className="flex items-center gap-1.5 font-sans font-bold text-xs tracking-wide">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>INSPIRE-MANAK Brief</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Click to open project scope &amp; pillars
                </div>
              </button>

              {onReplayPreloader && (
                <button
                  type="button"
                  onClick={onReplayPreloader}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between group cursor-pointer text-[11px] font-mono"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>View Welcome Screen</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} PIPEGUARD Innovation. Built for INSPIRE-MANAK Water Conservation Initiative.
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>External Vibration Sensing</span>
            <span>•</span>
            <span>Adaptive Baseline Algorithm</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

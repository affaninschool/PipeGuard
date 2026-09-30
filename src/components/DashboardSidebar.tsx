import React from 'react';
import { 
  Compass, 
  Crosshair, 
  Activity, 
  GitBranch, 
  Zap, 
  Cpu
} from 'lucide-react';
import { PipeGuardLogo } from './PipeGuardLogo';

export type DashboardSection = 
  | 'overview'
  | 'leak-lab'
  | 'live-monitor'
  | 'pipeline'
  | 'vibration-scan'
  | 'devices-api';

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  onBackToHome?: () => void;
}

interface NavItem {
  id: DashboardSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'leak-lab', label: 'Interactive Leak Lab', icon: Crosshair },
  { id: 'live-monitor', label: 'Live Monitor', icon: Activity },
  { id: 'pipeline', label: 'Pipeline Network', icon: GitBranch },
  { id: 'vibration-scan', label: 'Vibration Scan', icon: Zap },
  { id: 'devices-api', label: 'Devices & API', icon: Cpu },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection,
  onSelectSection,
  onBackToHome,
}) => {
  return (
    <aside className="w-full lg:w-64 bg-[#F8FAFC] lg:min-h-screen border-r border-slate-200 flex flex-col justify-between p-4 sm:p-5 shrink-0 select-none">
      <div className="space-y-6">
        {/* Logo & Brand Header -> Click leads back to home */}
        <div className="space-y-3">
          <button 
            type="button"
            onClick={onBackToHome}
            className="w-full flex items-center gap-3 px-2 text-left cursor-pointer group hover:opacity-90 transition-all"
            title="Return to PipeGuard Home"
          >
            <PipeGuardLogo className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <div>
              <div className="font-display font-bold text-base tracking-tight text-slate-900 leading-tight">
                PIPEGUARD
              </div>
              <div className="text-[10px] font-mono font-semibold tracking-wider text-sky-600 uppercase">
                INSPIRE-MANAK
              </div>
            </div>
          </button>

          {/* Quick Return Button */}
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-900 border border-slate-200 text-[11px] font-mono text-slate-600 transition-colors cursor-pointer"
            >
              <span>← Back to Website</span>
            </button>
          )}
        </div>

        {/* Vertical Nav Items with soft water-blue pill indicator */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-sky-100 text-sky-950 font-semibold shadow-2xs border border-sky-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'leak-lab' && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                    LAB
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer (Affan Adil & Team / Institutional acknowledgement) */}
      <div className="pt-6 border-t border-slate-200 px-2 text-[11px] font-mono text-slate-500 space-y-1">
        <div className="font-bold text-slate-800">Affan Adil &amp; Team</div>
        <div className="text-[10px] text-sky-700 font-semibold leading-tight">
          INSPIRE-MANAK
        </div>
      </div>
    </aside>
  );
};

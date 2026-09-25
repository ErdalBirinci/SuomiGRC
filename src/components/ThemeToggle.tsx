import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Eye } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={toggleTheme}
        className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
          isLight
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-cyan-500/40'
        }`}
        title={
          isLight
            ? 'Current: Light / High Contrast (Auditor Mode). Click to switch to Obsidian Dark.'
            : 'Current: Obsidian Dark Tactical. Click to switch to Light / High Contrast Mode for Auditors.'
        }
        aria-label={
          isLight
            ? 'Switch to Obsidian Dark theme'
            : 'Switch to Light High Contrast Auditor theme'
        }
      >
        {isLight ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-600 animate-spin-slow shrink-0" />
            <span className="font-mono text-[11px] font-bold">
              {showLabel ? 'Light Mode' : 'Light'}
            </span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-mono text-[11px] font-bold">
              {showLabel ? 'Obsidian' : 'Dark'}
            </span>
          </>
        )}
      </button>
    </div>
  );
};

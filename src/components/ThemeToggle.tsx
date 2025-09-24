import { useEffect, useState } from 'react';
import { applyTheme, getSavedTheme, type Theme } from '../lib/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme());
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === 'dark';
  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' as Theme : 'dark' as Theme)}
      className="relative h-8 w-14 rounded-full border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 theme-transition"
    >
      <span className={`absolute inset-y-0 left-1 my-auto h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-100 transform transition-transform duration-300 ${isDark ? 'translate-x-6' : ''}`}></span>
      {/* sun icon */}
      <svg className={`absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 ${isDark ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l1.41-1.41M15.66 7.05l1.41-1.41"></path>
      </svg>
      {/* moon icon */}
      <svg className={`absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
  );
}



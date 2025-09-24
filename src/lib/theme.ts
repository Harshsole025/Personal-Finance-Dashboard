const THEME_KEY = 'pf_theme_v1';

export type Theme = 'light' | 'dark';

export function getSavedTheme(): Theme {
  const t = localStorage.getItem(THEME_KEY);
  return (t === 'dark' || t === 'light') ? t : 'light';
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  localStorage.setItem(THEME_KEY, theme);
}


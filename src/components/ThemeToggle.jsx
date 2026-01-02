import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored ? stored === 'dark' : prefersDark;
    setDark(initial);
    document.documentElement.classList.toggle('dark', initial);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    const themeValue = next ? 'dark' : 'light';
    localStorage.setItem('theme', themeValue);
    // Emitir evento para que otros componentes (ej. ToastContainer) puedan sincronizar
    try {
      window.dispatchEvent(new CustomEvent('theme-change', { detail: themeValue }));
    } catch (e) {
      // no crítico
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
    >
      {dark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 0010.586 10.586z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.22a1 1 0 010 1.415l-.707.707a1 1 0 11-1.414-1.414l.707-.708a1 1 0 011.414 0zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM4 9a1 1 0 100 2H3a1 1 0 100-2h1zM6.343 4.343a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm6.657-1.657a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM6.343 15.657a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" />
        </svg>
      )}
      <span>{dark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

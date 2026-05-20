import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:scale-105 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
      title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
    >
      {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-blue-400" />}
    </button>
  );
};

import React from 'react';
import { Download, LayoutDashboard, Zap, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  totalRegistros: number;
  onExport: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  totalRegistros, onExport, darkMode, toggleTheme, onMenuToggle 
}) => {
  return (
    <header className="h-20 md:h-24 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md z-20 transition-colors duration-300">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl md:hidden text-cyan-500 border border-slate-200 dark:border-slate-800"
        >
          <Menu size={20} />
        </button>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hidden md:flex items-center justify-center text-cyan-500 shadow-inner">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h2 className="text-slate-900 dark:text-white font-black text-sm md:text-xl tracking-tight flex items-center gap-2">
            Matriz <span className="hidden sm:inline">de Controle</span> <Zap size={14} className="text-amber-400 fill-amber-400 md:w-[18px] md:h-[18px]" />
          </h2>
          <p className="text-[8px] md:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">
            {totalRegistros.toLocaleString('pt-BR')} <span className="hidden xs:inline">Registros</span>
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
        <button 
          onClick={onExport}
          className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black transition-all shadow-lg active:scale-95 group"
        >
          <Download size={14} className="md:w-[16px] md:h-[16px] group-hover:translate-y-0.5 transition-transform" /> 
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>
    </header>
  );
};

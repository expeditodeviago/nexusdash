import React from 'react';
import { Download, LayoutDashboard, Zap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  totalRegistros: number;
  onExport: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  totalRegistros, onExport, darkMode, toggleTheme 
}) => {
  return (
    <header className="h-24 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md z-20 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hidden md:flex items-center justify-center text-cyan-500 shadow-inner">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h2 className="text-slate-900 dark:text-white font-black text-xl tracking-tight flex items-center gap-2">
            Matriz de Controle <Zap size={18} className="text-amber-400 fill-amber-400" />
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">
            {totalRegistros.toLocaleString('pt-BR')} Registros Identificados
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
        <button 
          onClick={onExport}
          className="flex items-center gap-3 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl text-xs font-black transition-all shadow-[0_10px_20px_rgba(6,182,212,0.2)] active:scale-95 group"
        >
          <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> 
          Exportar Relatório PDF
        </button>
      </div>
    </header>
  );
};

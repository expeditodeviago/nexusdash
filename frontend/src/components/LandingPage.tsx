import React from 'react';
import { Rocket, ShieldCheck, Zap, Globe, Database, Cpu } from 'lucide-react';

interface LandingPageProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onFileUpload, loading }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 shadow-xl animate-in">
          <Cpu size={14} className="animate-pulse" /> Matriz de Inteligência v3.0
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-none mb-6 animate-in">
          NEXUS<span className="text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">DASH</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-in">
          Sincronize sua base de dados com nossa engine de alta performance e gere relatórios estatísticos com precisão rigorosa.
        </p>

        <div className="flex flex-col items-center gap-8 animate-in">
          <label className="cursor-pointer group relative">
            <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative px-12 py-7 bg-cyan-500 hover:bg-cyan-600 rounded-2xl text-white font-black text-xl transition-all shadow-2xl flex items-center gap-4 hover:scale-[1.02] active:scale-95">
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processando Matriz...
                </>
              ) : (
                <>
                  <Database size={24} /> Injetar Base de Dados
                </>
              )}
            </div>
            <input type="file" className="hidden" onChange={onFileUpload} accept=".csv,.xlsx" disabled={loading} />
          </label>
          
          <div className="flex items-center gap-10 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2 group cursor-default">
              <ShieldCheck size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" /> 
              Matemática Auditada
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <Zap size={16} className="text-amber-500 group-hover:scale-110 transition-transform" /> 
              BI Ultrarrápido
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <Globe size={16} className="text-blue-500 group-hover:scale-110 transition-transform" /> 
              100% Local & Seguro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

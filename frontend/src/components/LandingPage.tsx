import React from 'react';
import { Database, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';
import { NetworkBackground } from './NetworkBackground';

interface LandingPageProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onFileUpload, loading }) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center w-full overflow-hidden font-sans bg-[#020617]">
      
      {/* 1. Teia Neural Dinâmica e Brilhante (Plexus) */}
      <NetworkBackground />

      {/* 2. Conteúdo Centralizado Perfeitamente */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-6 max-w-5xl animate-fade-in w-full">
        
        {/* Badge de Versão */}
        <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 bg-black/40 border border-emerald-500/30 rounded-full text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 md:mb-12 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-xl">
          <Cpu size={14} className="animate-pulse text-amber-400" /> Matriz Nexus Dash v4.0 Ativa
        </div>
        
        {/* Título Principal */}
        <div className="relative mb-8 md:mb-14">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[12rem] font-black tracking-tighter text-white leading-none select-none animate-title">
            NEXUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 drop-shadow-[0_0_50px_rgba(16,185,129,0.5)]">DASH</span>
          </h1>
          <div className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 w-32 md:w-64 h-1 md:h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full shadow-[0_0_30px_rgba(16,185,129,0.8)] opacity-50"></div>
        </div>
        
        {/* Subtítulo */}
        <p className="text-sm md:text-xl lg:text-2xl text-slate-400 max-w-xs md:max-w-3xl mx-auto mb-12 md:mb-20 font-medium leading-relaxed px-4 md:px-0">
          A convergência definitiva de dados. Conecte sua base e visualize insights processados por nossa rede neural em tempo real.
        </p>

        {/* Botão de Upload / Status de Processamento */}
        <div className="flex flex-col items-center gap-8 md:gap-12 w-full px-4">
          <label className="cursor-pointer group relative w-full max-w-xs md:max-w-none">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 rounded-2xl md:rounded-3xl blur-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="relative px-6 md:px-16 py-6 md:py-9 bg-[#050a14]/80 border border-white/10 group-hover:border-emerald-500/50 rounded-2xl md:rounded-3xl text-white font-black text-xl md:text-3xl transition-all shadow-2xl flex items-center justify-center gap-4 md:gap-6 hover:scale-[1.03] active:scale-95 backdrop-blur-md">
              {loading ? (
                <>
                  <div className="w-6 md:w-10 h-6 md:h-10 border-3 md:border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-400 text-sm md:text-3xl">Processando...</span>
                </>
              ) : (
                <>
                  <Database size={24} className="text-emerald-400 group-hover:rotate-12 transition-transform duration-500 md:w-[32px] md:h-[32px]" /> 
                  <span className="tracking-tighter">Injetar Matriz</span>
                </>
              )}
            </div>
            <input type="file" className="hidden" onChange={onFileUpload} accept=".csv,.xlsx" disabled={loading} />
          </label>
          
          {/* Badges de Recurso */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 md:gap-16 text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">
            <div className="flex items-center gap-2 md:gap-4 group">
              <ShieldCheck size={16} className="text-emerald-500 group-hover:scale-125 transition-transform md:w-[20px] md:h-[20px]" /> 
              Algoritmo Auditado
            </div>
            <div className="flex items-center gap-2 md:gap-4 group">
              <Zap size={16} className="text-amber-500 group-hover:scale-125 transition-transform md:w-[20px] md:h-[20px]" /> 
              Fluxo Real-Time
            </div>
            <div className="flex items-center gap-2 md:gap-4 group">
              <Globe size={16} className="text-cyan-500 group-hover:scale-125 transition-transform md:w-[20px] md:h-[20px]" /> 
              Interface Neural
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-title { animation: title-float 8s infinite alternate ease-in-out; }
        @keyframes title-float {
          from { transform: translateY(0px) scale(1); }
          to { transform: translateY(-15px) scale(1.02); }
        }

        .animate-fade-in { animation: fade-in 1.2s ease-out; }
        @keyframes fade-in { 
          from { opacity: 0; transform: translateY(30px); filter: blur(10px); } 
          to { opacity: 1; transform: translateY(0); filter: blur(0); } 
        }
      `}</style>
    </div>
  );
};

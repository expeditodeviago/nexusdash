import React from 'react';
import { 
  Rocket, Sigma, Filter, Layers, Trash2, LayoutDashboard, Image as ImageIcon, X, ChevronDown
} from 'lucide-react';

interface SidebarProps {
  data: any;
  activeCharts: { col: string, type: string, isNumeric: boolean }[];
  activeFilters: Record<string, string>;
  toggleChart: (col: string, isNumeric: boolean) => void;
  setActiveFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onGoHome: () => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  data, activeCharts, activeFilters, toggleChart, setActiveFilters, onGoHome, logo, setLogo, isOpen, onClose 
}) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:relative top-0 left-0 h-full w-[280px] md:w-[320px] 
        bg-white dark:bg-[#0a0e1a] border-r border-slate-200 dark:border-slate-800 
        p-6 md:p-8 flex flex-col z-50 md:z-30 overflow-y-auto transition-all duration-300
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={onGoHome}>
            <div className="p-3 bg-cyan-500 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:scale-110 transition-transform">
              <Rocket className="text-white" size={20} />
            </div>
            <h1 className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter uppercase">Nexus<span className="text-cyan-500">Dash</span></h1>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 p-2">
            <X size={24} />
          </button>
        </div>

        {/* IDENTIDADE VISUAL */}
        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[1.5rem]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2 font-sans">
            <ImageIcon size={14} /> Marca da Empresa
          </p>
          {logo ? (
            <div className="relative group">
              <img src={logo} alt="Logo" className="max-h-16 w-full object-contain mb-2 px-2" />
              <button 
                  onClick={() => setLogo(null)} 
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Remover Logo"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group">
              <ImageIcon className="text-slate-300 dark:text-slate-700 mb-2 group-hover:text-cyan-500 transition-colors" size={24} />
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-600 uppercase text-center px-2">Carregar Logo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          )}
        </div>

        {/* COLUNAS ATIVAS */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
            <LayoutDashboard size={14} /> Variáveis da Matriz
          </p>
          <div className="flex flex-wrap gap-2">
            {data?.metricas?.colunas_numericas?.map((col: string) => (
              <button 
                key={col} 
                onClick={() => toggleChart(col, true)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${activeCharts.find(c => c.col === col) ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400 dark:hover:border-slate-600'}`}
              >
                <Sigma size={12} /> {col}
              </button>
            ))}
            {data?.metricas?.colunas_categoricas?.map((col: string) => (
              <button 
                key={col} 
                onClick={() => toggleChart(col, false)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${activeCharts.find(c => c.col === col) ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400 dark:hover:border-slate-600'}`}
              >
                <Filter size={12} /> {col}
              </button>
            ))}
          </div>
        </div>

        {/* FILTROS DINÂMICOS */}
        {data?.filtros?.length > 0 && (
          <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <Layers size={14} /> Filtros de Segmentação
            </p>
            <div className="space-y-4 pb-8">
              {data.filtros.map((f: any, i: number) => (
                <div key={i} className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1">{f.coluna}</label>
                  <div className="relative group">
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                      value={activeFilters[f.coluna] || 'Todos'}
                      onChange={(e) => setActiveFilters(prev => ({...prev, [f.coluna]: e.target.value}))}
                    >
                      <option value="Todos">Todos os Registros</option>
                      {f.opcoes.map((op: string, idx: number) => <option key={idx} value={op}>{op}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setActiveFilters({})} 
                className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

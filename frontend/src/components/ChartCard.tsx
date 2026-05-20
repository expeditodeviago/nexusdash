import React, { useRef, useState } from 'react';
import { 
  BarChart as BarIcon, PieChart as PieIcon, X, 
  ChevronDown, Download, Target, HelpCircle, Info
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ChartRenderer } from './ChartRenderer';

interface ChartCardProps {
  title: string;
  type: string;
  isNumeric: boolean;
  data: any[];
  allNumericCols?: string[];
  scatterCol?: string;
  onTypeChange: (type: string) => void;
  onScatterColChange?: (col: string) => void;
  onRemove: () => void;
  index: number;
}

const INSIGHTS: Record<string, string> = {
  bar: "Gráfico de Barras: Ideal para comparar valores entre diferentes categorias.",
  pie: "Gráfico de Pizza: Mostra a proporção de cada categoria em relação ao total.",
  area: "Gráfico de Área: Bom para visualizar tendências e volumes ao longo do tempo.",
  line: "Gráfico de Linha: Excelente para identificar padrões e flutuações em séries numéricas.",
  histogram: "Histograma: Mostra a distribuição e concentração dos dados em faixas numéricas.",
  ogiva: "Ogiva: Representa a frequência acumulada, útil para entender percentis e totais crescentes.",
  scatter: "Dispersão: Analisa a correlação entre duas variáveis numéricas.",
  radar: "Radar: Compara múltiplas variáveis em relação a um ponto central.",
  composed: "Composto: Combina barras e linhas para mostrar diferentes métricas juntas."
};

export const ChartCard: React.FC<ChartCardProps> = ({ 
  title, type, isNumeric, data, allNumericCols, scatterCol, onTypeChange, onScatterColChange, onRemove, index 
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const exportAsImage = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { 
      backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    });
    const link = document.createElement('a');
    link.download = `NexusDash_${title.substring(0, 15)}_${type}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div ref={cardRef} id={`chart-card-${index}`} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 h-[520px] flex flex-col hover:shadow-2xl hover:border-cyan-500/30 transition-all group backdrop-blur-sm shadow-sm relative overflow-hidden animate-in">
      
      {/* Header do Card */}
      <div className="flex justify-between items-start mb-4 z-10 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-cyan-500 group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
            {type === 'pie' ? <PieIcon size={18}/> : type === 'scatter' ? <Target size={18}/> : <BarIcon size={18}/>}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h4 
                className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight truncate cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {title}
              </h4>
              <button onClick={() => setShowInfo(!showInfo)} className="text-slate-400 hover:text-cyan-500 transition-colors flex-shrink-0">
                <HelpCircle size={14} />
              </button>
            </div>
            
            {/* Tooltip do Título */}
            {showTooltip && title.length > 15 && (
              <div className="absolute top-14 left-16 z-50 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl max-w-[200px] border border-slate-700 font-bold">
                {title}
              </div>
            )}
            
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{isNumeric ? 'Dados Numéricos' : 'Dados Categóricos'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Seletor do Eixo Y (Apenas Scatter) */}
          {type === 'scatter' && allNumericCols && (
            <div className="relative group/select">
              <select 
                className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-[10px] font-black text-cyan-600 uppercase outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                value={scatterCol || ''}
                onChange={(e) => onScatterColChange?.(e.target.value)}
              >
                <option value="">Eixo Y...</option>
                {allNumericCols.filter(c => c !== title).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400" />
            </div>
          )}

          {/* Menu de Tipos de Gráficos (Sempre visível conforme solicitado) */}
          <div className="relative group/select">
            <select 
              className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
            >
              <option value="bar">Barras</option>
              <option value="pie">Pizza</option>
              <option value="line">Linhas</option>
              <option value="area">Área</option>
              <option value="histogram">Histograma</option>
              <option value="ogiva">Ogiva</option>
              <option value="scatter">Dispersão</option>
              <option value="radar">Radar</option>
              <option value="composed">Composto</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          <button onClick={exportAsImage} className="bg-slate-50 dark:bg-slate-950 text-emerald-500 border border-slate-200 dark:border-slate-800 transition-all p-2 rounded-xl hover:bg-emerald-500 hover:text-white" title="Baixar PNG">
            <Download size={16}/>
          </button>
          
          <button onClick={onRemove} className="bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-800 transition-all p-2 rounded-xl">
            <X size={16}/>
          </button>
        </div>
      </div>

      {/* Insight Info Panel */}
      {showInfo && (
        <div className="mb-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/50 p-3 rounded-2xl animate-in flex gap-2 items-start">
          <Info size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] font-medium text-cyan-800 dark:text-cyan-300">
            {INSIGHTS[type] || "Visualização analítica de dados."}
          </p>
        </div>
      )}

      {/* Renderizador de Gráfico */}
      <ChartRenderer 
        type={type}
        data={data}
        title={title}
        isNumeric={isNumeric}
        scatterCol={scatterCol}
        index={index}
      />
    </div>
  );
};

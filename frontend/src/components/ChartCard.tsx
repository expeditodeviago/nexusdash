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
  insight?: string;
  allNumericCols?: string[];
  scatterCol?: string;
  onTypeChange: (type: string) => void;
  onScatterColChange?: (col: string) => void;
  onRemove: () => void;
  index: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
  title, type, isNumeric, data, insight, allNumericCols, scatterCol, onTypeChange, onScatterColChange, onRemove, index 
}) => {
  const [showInfo, setShowInfo] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const exportAsImage = async () => {
    if (!cardRef.current) return;
    
    // 1. Criar um CLONE do card para exportação perfeita sem cortes
    const clone = cardRef.current.cloneNode(true) as HTMLElement;
    
    // Estilizar o clone explicitamente
    Object.assign(clone.style, {
      position: 'fixed',
      top: '0',
      left: '-10000px', // Fora da tela
      width: '900px',  // Largura fixa para garantir proporção
      height: 'auto',
      minHeight: '650px',
      padding: '40px', // Padding extra para evitar cortes nas bordas
      backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      borderRadius: '2.5rem',
      zIndex: '-9999',
      display: 'flex',
      flexDirection: 'column'
    });

    // Ajustar elementos internos do clone
    const titleEl = clone.querySelector('h4');
    if (titleEl) {
      titleEl.style.whiteSpace = 'normal';
      titleEl.style.wordBreak = 'break-word';
      titleEl.style.fontSize = '24px'; // Título maior para PNG
      titleEl.style.marginBottom = '10px';
    }

    // Remover controles de interface no clone
    const controls = clone.querySelector('.card-controls');
    if (controls) controls.remove();

    // Garantir que o insight apareça e não quebre
    const insightBox = clone.querySelector('.insight-box');
    if (insightBox) {
      (insightBox as HTMLElement).style.marginBottom = '30px';
      (insightBox as HTMLElement).style.padding = '20px';
    }

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, { 
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        scale: 3, // Resolução ultra-alta
        useCORS: true,
        logging: false,
        windowWidth: 900
      });

      const link = document.createElement('a');
      link.download = `NexusDash_Chart_${title.substring(0, 15)}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error("Erro ao exportar PNG:", err);
    } finally {
      document.body.removeChild(clone);
    }
  };

  return (
    <div ref={cardRef} id={`chart-card-${index}`} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 h-[550px] md:h-[620px] flex flex-col hover:shadow-2xl hover:border-emerald-500/30 transition-all group backdrop-blur-sm shadow-sm relative overflow-hidden animate-in">
      
      {/* Header do Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 md:mb-6 z-10 gap-4">
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 w-full">
          <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/80 rounded-[1rem] md:rounded-[1.2rem] text-emerald-500 group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
            {type === 'pie' ? <PieIcon size={18}/> : type === 'scatter' ? <Target size={18}/> : <BarIcon size={18}/>}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 
                className="text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-tight truncate cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {title}
              </h4>
              <button onClick={() => setShowInfo(!showInfo)} className="text-slate-400 hover:text-emerald-500 transition-colors flex-shrink-0">
                <HelpCircle size={14} />
              </button>
            </div>
            
            <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{isNumeric ? 'Matriz Numérica' : 'Matriz Categórica'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 card-controls w-full sm:w-auto justify-end">
          {type === 'scatter' && allNumericCols && (
            <div className="relative group/select flex-1 sm:flex-none">
              <select 
                className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg md:rounded-xl px-3 md:px-4 py-2 pr-8 md:pr-10 text-[8px] md:text-[10px] font-black text-emerald-600 uppercase outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                value={scatterCol || ''}
                onChange={(e) => onScatterColChange?.(e.target.value)}
              >
                <option value="">Eixo Y...</option>
                {allNumericCols.filter(c => c !== title).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400" />
            </div>
          )}

          <div className="relative group/select flex-1 sm:flex-none">
            <select 
              className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg md:rounded-xl px-3 md:px-4 py-2 pr-8 md:pr-10 text-[8px] md:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase outline-none focus:border-emerald-500/50 transition-all cursor-pointer"
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
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          <button onClick={exportAsImage} className="bg-slate-50 dark:bg-slate-950 text-emerald-500 border border-slate-200 dark:border-slate-800 transition-all p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-emerald-500 hover:text-white" title="Baixar PNG">
            <Download size={16}/>
          </button>
          
          <button onClick={onRemove} className="bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-800 transition-all p-2 md:p-2.5 rounded-lg md:rounded-xl">
            <X size={16}/>
          </button>
        </div>
      </div>

      {/* Insight Info Panel */}
      {showInfo && insight && (
        <div className="insight-box mb-4 md:mb-6 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] animate-in flex gap-2 md:gap-3 items-start backdrop-blur-sm">
          <div className="p-1 bg-emerald-500 rounded text-white flex-shrink-0">
            <Info size={12} />
          </div>
          <p className="text-[10px] md:text-[12px] font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
            {insight}
          </p>
        </div>
      )}

      {/* Renderizador de Gráfico */}
      <div className="flex-1 min-h-0 w-full">
        {console.log(`Dados para o gráfico ${title}:`, data)}
        <ChartRenderer 
          type={type}
          data={data}
          title={title}
          isNumeric={isNumeric}
          scatterCol={scatterCol}
          index={index}
        />
      </div>
    </div>
  );
};

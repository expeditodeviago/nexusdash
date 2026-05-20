import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';

// Componentes
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChartCard } from './components/ChartCard';
import { LandingPage } from './components/LandingPage';

// Utilitários
import { exportDashboardToPDF } from './utils/pdfExporter';

export default function App() {
  const [appState, setAppState] = useState<'landing' | 'dashboard'>('landing');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [activeCharts, setActiveCharts] = useState<{col: string, type: string, isNumeric: boolean, scatterCol?: string}[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [logo, setLogo] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // --- CONTROLE DE TEMA ---
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // --- LÓGICA DE UPLOAD ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://nexusdash-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.sucesso) {
        setData(result);
        setAppState('dashboard');
        // Sugestões Iniciais
        const sugestoes = [];
        if (result.metricas.colunas_categoricas?.length > 0) {
          sugestoes.push({ col: result.metricas.colunas_categoricas[0], type: 'bar', isNumeric: false });
        }
        if (result.metricas.colunas_numericas?.length > 0) {
          sugestoes.push({ col: result.metricas.colunas_numericas[0], type: 'histogram', isNumeric: true });
        }
        setActiveCharts(sugestoes);
      } else {
        alert("Erro no servidor: " + result.erro);
      }
    } catch (error) {
      alert("Erro de conexão com o servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTRAGEM (PRESERVANDO INTEGRIDADE) ---
  const filteredData = useMemo(() => {
    if (!data?.dados_preview) return [];
    const filterEntries = Object.entries(activeFilters);
    if (filterEntries.length === 0) return data.dados_preview;

    return data.dados_preview.filter((row: any) => {
      return filterEntries.every(([c, v]) => v === 'Todos' || String(row[c]) === v);
    });
  }, [data, activeFilters]);

  // --- ENGINE DE AGREGAÇÃO (RESILIENTE E PRECISA) ---
  const getChartData = (col: string, type: string, isNumeric: boolean, scatterCol?: string) => {
    const hasActiveFilters = Object.values(activeFilters).some(v => v !== 'Todos');

    // 1. Dispersão (Scatter) - Sempre dinâmico
    if (type === 'scatter') {
      if (!scatterCol) return [];
      return filteredData
        .map((row: any) => ({
          x: Number(row[col]),
          y: Number(row[scatterCol]),
          name: row[col]
        }))
        .filter(d => !isNaN(d.x) && !isNaN(d.y))
        .slice(0, 200);
    }

    // 2. Se não houver filtro, usa a agregação pronta do backend (mais rápida e exata)
    if (!hasActiveFilters && data?.series?.[col]) {
      const series = data.series[col];
      if (type === 'histogram') return series.histogram;
      if (type === 'ogiva') return series.ogiva;
      
      // Mapeia name/value para faixa/frequencia para consistência se for histogram/ogiva, 
      // mas para os outros mantém name/value
      return series.base;
    }

    // 3. Se houver filtro ou tipo específico, agrega no frontend
    // Para Categóricos ou gráficos de barras/pizza em numéricos
    if (!isNumeric || ['bar', 'pie', 'radar', 'composed', 'line', 'area'].includes(type)) {
      const counts: Record<string, number> = {};
      filteredData.forEach((row: any) => {
        const val = String(row[col] || 'N/A');
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);
    }

    // 4. Histograma/Ogiva real para dados filtrados (Recalculado no frontend)
    if (isNumeric && (type === 'histogram' || type === 'ogiva')) {
      const values = filteredData.map((row: any) => Number(row[col])).filter(v => !isNaN(v));
      if (values.length === 0) return [];

      const min = Math.min(...values);
      const max = Math.max(...values);
      const numBins = 10;
      const binSize = max === min ? 1 : (max - min) / numBins;
      
      const bins = new Array(numBins).fill(0);
      values.forEach(v => {
        const idx = Math.min(Math.floor((v - min) / binSize), numBins - 1);
        if (idx >= 0) bins[idx]++;
      });

      const histData = bins.map((count, i) => ({
        faixa: `${(min + i * binSize).toFixed(1)} a ${(min + (i + 1) * binSize).toFixed(1)}`,
        frequencia: count,
        max: min + (i + 1) * binSize
      }));

      if (type === 'ogiva') {
        let acc = 0;
        return histData.map(d => {
          acc += d.frequencia;
          return { faixa: `Até ${d.max.toFixed(1)}`, frequencia: acc };
        });
      }
      return histData;
    }

    return [];
  };

  // --- FUNÇÕES DE CONTROLE ---
  const toggleChart = (col: string) => {
    const isNum = data?.metricas?.colunas_numericas?.includes(col);
    setActiveCharts(prev => {
      const exists = prev.find(c => c.col === col);
      if (exists) return prev.filter(c => c.col !== col);
      return [...prev, { col, type: isNum ? 'histogram' : 'bar', isNumeric: !!isNum }];
    });
  };

  const updateChartType = (index: number, type: string) => {
    setActiveCharts(prev => prev.map((c, i) => i === index ? { ...c, type } : c));
  };

  const updateScatterCol = (index: number, scatterCol: string) => {
    setActiveCharts(prev => prev.map((c, i) => i === index ? { ...c, scatterCol } : c));
  };

  const removeChart = (index: number) => {
    setActiveCharts(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setLoading(true);
    try {
      await exportDashboardToPDF({
        element: dashboardRef.current,
        logo,
        totalRegistros: filteredData.length,
        darkMode
      });
    } catch (e) {
      alert("Falha ao gerar relatório PDF.");
    } finally {
      setLoading(false);
    }
  };

  if (appState === 'landing') {
    return <LandingPage onFileUpload={handleFileUpload} loading={loading} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-300 font-sans overflow-hidden transition-colors duration-300">
      <Sidebar 
        data={data}
        activeCharts={activeCharts}
        activeFilters={activeFilters}
        toggleChart={toggleChart}
        setActiveFilters={setActiveFilters}
        onGoHome={() => setAppState('landing')}
        logo={logo}
        setLogo={setLogo}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header 
          totalRegistros={filteredData.length}
          onExport={handleExportPDF}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        <div id="nexus-dashboard-container" className="flex-1 overflow-y-auto p-10 custom-scrollbar" ref={dashboardRef}>
          {activeCharts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 opacity-40 select-none">
              <div className="relative mb-8">
                <LayoutDashboard size={100} className="animate-pulse" />
                <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20"></div>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-[0.3em]">Painel Vazio</h3>
              <p className="text-sm font-bold uppercase tracking-widest mt-4">Ative variáveis na barra lateral para iniciar a análise.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
              {activeCharts.map((cfg, idx) => {
                const isNumeric = data?.series?.[cfg.col]?.is_numeric ?? cfg.isNumeric;
                return (
                  <ChartCard 
                    key={`${cfg.col}-${idx}`}
                    title={cfg.col}
                    type={cfg.type}
                    isNumeric={isNumeric}
                    data={getChartData(cfg.col, cfg.type, isNumeric, cfg.scatterCol)}
                    allNumericCols={data?.metricas?.colunas_numericas}
                    scatterCol={cfg.scatterCol}
                    onTypeChange={(type) => updateChartType(idx, type)}
                    onScatterColChange={(col) => updateScatterCol(idx, col)}
                    onRemove={() => removeChart(idx)}
                    index={idx}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #22d3ee; }
      `}</style>
    </div>
  );
}

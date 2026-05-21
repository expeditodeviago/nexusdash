import React from 'react';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, LineChart, Line, ScatterChart, Scatter, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ComposedChart
} from 'recharts';
import { AlertCircle } from 'lucide-react';

const COLORS = ['#22d3ee', '#8b5cf6', '#3b82f6', '#d946ef', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b'];

interface ChartRendererProps {
  type: string;
  data: any[];
  title: string;
  isNumeric: boolean;
  scatterCol?: string;
  index: number;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ type, data, title, isNumeric, scatterCol, index }) => {
  // Verificação de compatibilidade
  const needsNumeric = ['histogram', 'ogiva', 'scatter'].includes(type);
  const isDataIncompatible = needsNumeric && !isNumeric;

  if (isDataIncompatible) {
    return (
      <div className="w-full h-80 min-h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center animate-in">
        <AlertCircle size={40} className="mb-4 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-500">Aviso de Compatibilidade</p>
        <p className="text-[10px] mt-2 max-w-[200px] font-medium">
          Este gráfico ({type}) foi projetado para dados numéricos. 
          As variáveis de texto foram processadas como contagem de frequência para manter a visualização ativa.
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    console.log(`[Recharts] Nenhum dado para ${title}`);
    return (
      <div className="w-full h-80 min-h-[300px] flex items-center justify-center text-slate-400 opacity-20 p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sem dados disponíveis para este gráfico.</p>
      </div>
    );
  }

  // Debug log para verificar estrutura dos dados
  console.log(`[Recharts] Renderizando ${title} (${type}) com ${data.length} registros:`, data);

  // Detectar as chaves dinamicamente
  const xKey = data[0]?.faixa ? 'faixa' : (data[0]?.x ? 'x' : 'name');
  const yKey = data[0]?.frequencia !== undefined ? 'frequencia' : (data[0]?.y ? 'y' : 'value');

  console.log(`Chaves detectadas para ${title}: x=${xKey}, y=${yKey}. Registros: ${data.length}`);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{label || 'Registro'}</p>
          {payload.map((p: any, i: number) => {
            let labelName = p.name;
            if (labelName === 'value' || labelName === 'frequencia') labelName = 'Quantidade';
            if (labelName === 'x') labelName = title;
            if (labelName === 'y') labelName = scatterCol || 'Variável Y';
            
            return (
              <p key={i} className="text-sm font-black text-slate-900 dark:text-white">
                {labelName}: 
                <span className="text-cyan-500 ml-1">
                  {typeof p.value === 'number' ? Math.round(p.value).toLocaleString('pt-BR') : p.value}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const commonProps = {
    data,
    margin: { top: 10, right: 30, left: -20, bottom: 0 }
  };

  const renderContent = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart>
            <Pie 
              data={data} 
              outerRadius={100} 
              paddingAngle={2}
              dataKey={yKey}
              stroke="none"
              nameKey={xKey}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{value}</span>}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis type="number" dataKey="x" name={title} unit="" fontSize={10} tick={{fill: '#64748b'}} allowDecimals={false} />
            <YAxis type="number" dataKey="y" name={scatterCol} unit="" fontSize={10} tick={{fill: '#64748b'}} allowDecimals={false} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Scatter name="Correlação" data={data} fill={COLORS[index % COLORS.length]} />
            <Legend formatter={() => <span className="text-[10px] font-bold text-slate-500 uppercase">Correlação: {title} vs {scatterCol}</span>} />
          </ScatterChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <PolarAngleAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#64748b' }} />
            <PolarRadiusAxis fontSize={10} tick={{fill: '#64748b'}} allowDecimals={false} />
            <Radar name="Frequência" dataKey={yKey} stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} fillOpacity={0.6} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey={xKey} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={yKey} name="Volume" fill={COLORS[index % COLORS.length]} radius={[6, 6, 0, 0]} barSize={30} />
            <Line type="monotone" dataKey={yKey} name="Tendência" stroke="#f43f5e" strokeWidth={3} dot={false} />
            <Legend formatter={(val) => <span className="text-[10px] font-bold text-slate-500 uppercase">{val}</span>} />
          </ComposedChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey={xKey} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={yKey} name="Intensidade" stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} fillOpacity={0.2} strokeWidth={3} />
          </AreaChart>
        );
      case 'line':
      case 'ogiva':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey={xKey} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={yKey} name="Evolução" stroke={COLORS[index % COLORS.length]} strokeWidth={4} dot={{ r: 4, fill: COLORS[index % COLORS.length], strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
          </LineChart>
        );
      case 'histogram':
        return (
          <BarChart {...commonProps} barCategoryGap={0} barGap={0}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey="faixa" fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
                dataKey="frequencia" 
                name="Frequência" 
                fill={COLORS[index % COLORS.length]} 
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1}
                radius={[0, 0, 0, 0]} 
            />
          </BarChart>
        );
      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey={xKey} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} fontSize={10} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
                dataKey={yKey} 
                name="Contagem" 
                fill={COLORS[index % COLORS.length]} 
                radius={[6, 6, 0, 0]} 
                barSize={30}
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-80 min-h-[300px] flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        {renderContent()}
      </ResponsiveContainer>
    </div>
  );
};

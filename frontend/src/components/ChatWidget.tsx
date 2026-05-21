import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface ChatWidgetProps {
  fileId: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ fileId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !fileId || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://nexusdash-api.onrender.com';
      const response = await fetch(`${API_URL}/api/nexus/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: input, file_id: fileId }),
      });
      
      const data = await response.json();
      if (data.sucesso) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.resposta }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${data.erro}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Erro de conexão com o NEXUS." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!fileId) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      {/* Janela de Chat */}
      <div className={`absolute bottom-20 right-0 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
      } ${isMaximized ? 'w-[85vw] h-[85vh] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'w-[320px] h-[500px]'}`}>
        
        {/* Header Estilizado */}
        <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-900 p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] animate-pulse-slow">
                <Bot size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">NEXUS AI</h3>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Analista Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMaximized(!isMaximized)} className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Área de Mensagens com Prose para Formatação */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20 dark:bg-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-700">
                <MessageSquare size={40} />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Inicie a Análise</h4>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed uppercase">
                Pergunte sobre tendências, médias ou comportamentos específicos detectados no seu arquivo.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                <div className={`max-w-[88%] p-5 rounded-[1.8rem] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500 text-white rounded-tr-none shadow-emerald-500/20' 
                    : 'bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none backdrop-blur-sm'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-50 text-[9px] font-black uppercase tracking-[0.15em]">
                    {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                    {msg.role === 'user' ? 'Você' : 'NEXUS'}
                  </div>
                  <div className="whitespace-pre-wrap break-words prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start animate-in">
              <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-5 rounded-[1.8rem] rounded-tl-none flex items-center gap-4">
                <Loader2 size={18} className="animate-spin text-emerald-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Consultando Matriz de Dados...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Input de Alta Fidelidade */}
        <div className="p-6 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800/50">
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua pergunta analítica..."
              className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-6 pr-16 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-4 rounded-xl transition-all ${
                input.trim() && !loading 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95' 
                  : 'text-slate-300 dark:text-slate-700'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="mt-3 text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest">
            Powered by Nexus Intelligence Matrix v3.1
          </p>
        </div>
      </div>

      {/* Botão de Gatilho Principal */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 pr-6 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:border-emerald-500/50 transition-all group relative ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-500 relative">
          <Bot size={28} />
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assistente</p>
          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Chat Nexus</p>
        </div>
        <div className="ml-2 w-2 h-2 bg-emerald-500 rounded-full"></div>
      </button>

      <style>{`
        .animate-pulse-slow { animation: pulse-slow 4s infinite; }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-in { animation: slide-up 0.4s ease-out; }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, CheckCircle2, Circle, 
  Trash2, MessageSquare, User, Calendar as CalendarIcon,
  ChevronLeft, LayoutGrid, List, SquarePen, Share,
  CalendarDays, Filter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

const AdminTarefas = () => {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const selectedTask = tarefas.find(t => t.id === selectedTaskId);

  const load = async () => {
    setLoading(true);
    const { data: tData } = await supabase
      .from("tarefas")
      .select("*, leads(nome)")
      .order("created_at", { ascending: false });
    
    const { data: lData } = await supabase.from("leads").select("id, nome").order("nome");
    
    setTarefas(tData ?? []);
    setLeads(lData ?? []);
    
    if (tData && tData.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tData[0].id);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createNewTask = async () => {
    const newTask = {
      titulo: "Nova Nota",
      descricao: "",
      data_vencimento: date ? date.toISOString() : new Date().toISOString(),
      concluida: false
    };

    const { data, error } = await supabase.from("tarefas").insert(newTask).select().single();
    
    if (error) {
      toast({ title: "Erro ao criar nota", variant: "destructive" });
    } else {
      setTarefas([data, ...tarefas]);
      setSelectedTaskId(data.id);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    setSaving(true);
    const { error } = await supabase.from("tarefas").update(updates).eq("id", id);
    if (!error) {
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
    setSaving(false);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteTask = async (id: string) => {
    if (!id) return;

    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      toast({ title: "Clique novamente para confirmar", description: "A nota será excluída permanentemente." });
      // Reset after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    
    setSaving(true);
    const { error } = await supabase.from("tarefas").delete().eq("id", id);
    
    if (error) {
      console.error("Delete error:", error);
      toast({ title: "Erro ao excluir nota", description: error.message, variant: "destructive" });
    } else {
      setTarefas(prev => {
        const nextList = prev.filter(t => t.id !== id);
        if (selectedTaskId === id) {
          setSelectedTaskId(nextList.length > 0 ? nextList[0].id : null);
        }
        return nextList;
      });
      toast({ title: "Nota excluída com sucesso" });
      setConfirmDeleteId(null);
    }
    setSaving(false);
  };

  const filteredTarefas = tarefas.filter(t => {
    const matchSearch = t.titulo.toLowerCase().includes(search.toLowerCase()) || 
                       t.descricao?.toLowerCase().includes(search.toLowerCase());
    
    const matchDate = !date || (t.data_vencimento && new Date(t.data_vencimento).toDateString() === date.toDateString());
    
    return matchSearch && matchDate;
  });

  return (
    <>
      <Helmet><title>Agenda & Notas | HLJ DEV</title></Helmet>
      
      <div className="flex h-screen bg-[#000000] text-[#ffffff] font-sans overflow-hidden">
        
        {/* Sidebar (Note List) */}
        <aside className="w-[320px] border-r border-[#1a1a1a] flex flex-col bg-[#000000]">
          {/* Sidebar Header */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Agenda & Notas
              </span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowCalendar(!showCalendar)} 
                  className={`transition-colors ${showCalendar ? 'text-primary' : 'text-zinc-500 hover:text-white'}`}
                  title="Mostrar Calendário"
                >
                  <CalendarIcon size={18} />
                </button>
                <button onClick={createNewTask} className="text-primary hover:scale-110 transition-transform">
                  <SquarePen size={20} />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                type="text"
                placeholder="Buscar em Elite Notas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111111] border border-[#1a1a1a] rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50 text-[#ffffff] placeholder-zinc-600 transition-all"
              />
            </div>

            <AnimatePresence>
              {showCalendar && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    className="p-2"
                    classNames={{
                      head_cell: "text-zinc-600 rounded-md w-8 font-black text-[9px] uppercase tracking-widest",
                      day_selected: "bg-primary text-black font-black hover:bg-primary hover:text-black focus:bg-primary focus:text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]",
                      day_today: "border border-primary/30 text-primary font-bold",
                      day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-xs text-white hover:bg-zinc-900 transition-colors",
                      nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 text-white"
                    }}
                  />
                  {date && (
                    <button 
                      onClick={() => setDate(undefined)}
                      className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-t border-[#1a1a1a] hover:text-primary transition-colors"
                    >
                      Limpar Filtro
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-10">
            {date && (
              <div className="px-4 py-2 mb-4 bg-primary/5 border-y border-primary/10 flex items-center justify-between rounded-lg">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                  {format(date, "d 'de' MMM", { locale: ptBR })}
                </span>
                <span className="text-[8px] font-bold text-primary/40">{filteredTarefas.length} Resultados</span>
              </div>
            )}
            
            {loading ? (
              <div className="p-10 text-center animate-pulse text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando...</div>
            ) : filteredTarefas.length === 0 ? (
              <div className="p-10 text-center text-zinc-700 space-y-4">
                <Filter size={32} className="mx-auto opacity-10" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Vazio por aqui</p>
              </div>
            ) : filteredTarefas.map((t) => (
              <div 
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                className={`p-4 rounded-2xl cursor-pointer mb-2 transition-all relative overflow-hidden group border ${
                  selectedTaskId === t.id 
                    ? "bg-primary text-[#000000] border-primary shadow-[0_0_20px_rgba(204,255,0,0.15)]" 
                    : "hover:bg-[#0a0a0a] text-[#ffffff] border-transparent hover:border-[#1a1a1a]"
                }`}
              >
                <h3 className={`text-sm font-black truncate mb-1 ${selectedTaskId === t.id ? "text-black" : "text-white"}`}>
                  {t.titulo || "Nota sem título"}
                </h3>
                <div className={`flex items-center gap-2 text-[10px] ${selectedTaskId === t.id ? "text-black/60 font-bold" : "text-zinc-500"}`}>
                  <span className="font-bold opacity-80">
                    {format(new Date(t.created_at), "HH:mm")}
                  </span>
                  <span className="truncate opacity-60">
                    {t.descricao ? t.descricao.substring(0, 35) : "Sem conteúdo..."}
                  </span>
                </div>
                {t.concluida && (
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${selectedTaskId === t.id ? "text-black" : "text-primary"}`}>
                    <CheckCircle2 size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content (Editor) */}
        <main className="flex-1 flex flex-col bg-[#050505] relative">
          <AnimatePresence mode="wait">
            {selectedTask ? (
              <motion.div 
                key={selectedTask.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col h-full"
              >
                {/* Editor Header / Toolbar */}
                <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 shrink-0 bg-[#050505]">
                  <div className="flex items-center gap-4 text-zinc-500">
                    <button onClick={() => updateTask(selectedTask.id, { concluida: !selectedTask.concluida })} className="hover:text-primary transition-colors">
                      {selectedTask.concluida ? <CheckCircle2 className="text-primary" size={20} /> : <Circle size={20} />}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(selectedTask.id);
                      }} 
                      className={`transition-colors p-2 -m-2 ${confirmDeleteId === selectedTask.id ? 'text-red-500 scale-125' : 'hover:text-red-400'}`}
                      title={confirmDeleteId === selectedTask.id ? "Confirmar Exclusão" : "Excluir Nota"}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
                      <LayoutGrid size={16} className="text-zinc-600 hover:text-white transition-colors cursor-pointer" />
                      <div className="w-[1px] h-3 bg-zinc-800 mx-1" />
                      <Share size={16} className="text-zinc-600 hover:text-white transition-colors cursor-pointer" />
                    </div>
                    {saving && <span className="text-[9px] uppercase font-black text-primary animate-pulse tracking-[0.2em]">Sincronizando...</span>}
                  </div>
                </header>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full custom-scrollbar">
                  <div className="text-center mb-10">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] bg-[#0a0a0a] px-4 py-1.5 rounded-full border border-[#1a1a1a]">
                      {format(new Date(selectedTask.data_vencimento), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                    </span>
                  </div>

                  <input 
                    type="text"
                    value={selectedTask.titulo}
                    onChange={(e) => updateTask(selectedTask.id, { titulo: e.target.value })}
                    className="w-full bg-transparent text-4xl font-black text-white focus:outline-none mb-8 placeholder-zinc-800 tracking-tighter"
                    placeholder="Título da Nota"
                  />

                  <textarea 
                    value={selectedTask.descricao || ""}
                    onChange={(e) => updateTask(selectedTask.id, { descricao: e.target.value })}
                    className="w-full bg-transparent text-lg text-zinc-400 leading-relaxed focus:outline-none resize-none h-[calc(100vh-400px)] placeholder-zinc-800 font-medium"
                    placeholder="Comece o protocolo de escrita..."
                  />
                  
                  {/* Footer Settings */}
                  <div className="mt-16 pt-12 border-t border-[#1a1a1a] grid grid-cols-1 md:grid-cols-2 gap-10 pb-32">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <User size={12} className="text-primary" /> Lead Vinculado
                      </label>
                      <select 
                        value={selectedTask.lead_id || ""}
                        onChange={(e) => updateTask(selectedTask.id, { lead_id: e.target.value || null })}
                        className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-primary/30 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Nenhum lead vinculado</option>
                        {leads.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <CalendarIcon size={12} className="text-primary" /> Data de Vencimento
                      </label>
                      <input 
                        type="datetime-local"
                        value={selectedTask.data_vencimento ? selectedTask.data_vencimento.substring(0, 16) : ""}
                        onChange={(e) => updateTask(selectedTask.id, { data_vencimento: new Date(e.target.value).toISOString() })}
                        className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-primary/30 outline-none transition-all cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] md:col-span-2 group hover:border-primary/20 transition-all">
                      <div className={`p-4 rounded-2xl transition-colors ${selectedTask.alerta_whatsapp ? 'bg-primary/20 text-primary' : 'bg-zinc-900 text-zinc-600'}`}>
                        <MessageSquare size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-black uppercase tracking-tight text-white mb-1">Alerta WhatsApp Elite</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">Disparo automático via Evolution API no momento do vencimento.</p>
                      </div>
                      <button 
                        onClick={() => updateTask(selectedTask.id, { alerta_whatsapp: !selectedTask.alerta_whatsapp })}
                        className={`w-14 h-7 rounded-full relative transition-all duration-300 ${selectedTask.alerta_whatsapp ? 'bg-primary shadow-[0_0_15px_rgba(204,255,0,0.2)]' : 'bg-zinc-800'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${selectedTask.alerta_whatsapp ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-800 bg-[#000000]">
                <SquarePen size={120} strokeWidth={0.5} className="opacity-10" />
                <p className="mt-8 font-black uppercase tracking-[0.4em] text-[10px] text-zinc-600">Protocolo de Notas HLJ DEV</p>
                <button 
                  onClick={createNewTask}
                  className="mt-10 px-10 py-3 bg-[#0a0a0a] border border-[#1a1a1a] text-zinc-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-black hover:border-primary transition-all shadow-xl active:scale-95"
                >
                  Iniciar Nova Nota
                </button>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CCFF00;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(1.5);
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default AdminTarefas;

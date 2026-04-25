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
      setTarefas(tarefas.map(t => t.id === id ? { ...t, ...updates } : t));
    }
    setSaving(false);
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Excluir esta nota permanentemente?")) return;
    const { error } = await supabase.from("tarefas").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      toast({ title: "Erro ao excluir nota", description: error.message, variant: "destructive" });
    } else {
      const nextList = tarefas.filter(t => t.id !== id);
      setTarefas(nextList);
      setSelectedTaskId(nextList.length > 0 ? nextList[0].id : null);
      toast({ title: "Nota excluída" });
    }
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
      
      <div className="flex h-screen bg-[#1c1c1e] text-[#ffffff] font-sans overflow-hidden">
        
        {/* Sidebar (Note List) */}
        <aside className="w-[320px] border-r border-[#38383a] flex flex-col bg-[#1c1c1e]">
          {/* Sidebar Header */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#a2a2a7] font-semibold text-xs uppercase tracking-widest flex items-center gap-2">
                <CalendarDays size={14} className="text-primary" /> Agenda & Notas
              </span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowCalendar(!showCalendar)} 
                  className={`transition-colors ${showCalendar ? 'text-primary' : 'text-[#a2a2a7] hover:text-white'}`}
                  title="Mostrar Calendário"
                >
                  <CalendarIcon size={18} />
                </button>
                <button onClick={createNewTask} className="text-primary hover:opacity-80 transition-opacity">
                  <SquarePen size={20} />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a2a2a7]" size={14} />
              <input 
                type="text"
                placeholder="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#2c2c2e] rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-[#ffffff] placeholder-[#a2a2a7]"
              />
            </div>

            <AnimatePresence>
              {showCalendar && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[#2c2c2e] rounded-2xl border border-[#38383a]"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    className="p-2"
                    classNames={{
                      head_cell: "text-[#a2a2a7] rounded-md w-8 font-black text-[9px] uppercase",
                      day_selected: "bg-primary text-black font-black hover:bg-primary hover:text-black focus:bg-primary focus:text-black",
                      day_today: "bg-[#38383a] text-white font-bold",
                      day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-xs",
                      nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 text-white"
                    }}
                  />
                  {date && (
                    <button 
                      onClick={() => setDate(undefined)}
                      className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-[#a2a2a7] border-t border-[#38383a] hover:text-white transition-colors"
                    >
                      Limpar Filtro de Data
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-10">
            {date && (
              <div className="px-4 py-2 mb-2 bg-primary/10 border-y border-primary/20 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-tighter text-primary">
                  {format(date, "d 'de' MMM", { locale: ptBR })}
                </span>
                <span className="text-[9px] font-bold text-primary/60">{filteredTarefas.length} Notas</span>
              </div>
            )}
            
            {loading ? (
              <div className="p-10 text-center animate-pulse text-[#a2a2a7] text-xs font-bold uppercase tracking-widest">Sincronizando...</div>
            ) : filteredTarefas.length === 0 ? (
              <div className="p-10 text-center text-[#a2a2a7] space-y-2">
                <Filter size={24} className="mx-auto opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma nota encontrada</p>
                {date && <button onClick={() => setDate(undefined)} className="text-primary text-[9px] font-black uppercase underline">Ver todas</button>}
              </div>
            ) : filteredTarefas.map((t) => (
              <div 
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                className={`p-4 rounded-xl cursor-pointer mb-1 transition-all relative overflow-hidden group ${
                  selectedTaskId === t.id 
                    ? "bg-[#e5a823] text-[#000000]" 
                    : "hover:bg-[#2c2c2e] text-[#ffffff]"
                }`}
              >
                <h3 className={`text-sm font-bold truncate mb-0.5 ${selectedTaskId === t.id ? "text-black" : "text-white"}`}>
                  {t.titulo || "Nota sem título"}
                </h3>
                <div className="flex items-center gap-2 text-[11px] opacity-60">
                  <span className="font-semibold">
                    {format(new Date(t.created_at), "HH:mm")}
                  </span>
                  <span className="truncate">
                    {t.descricao ? t.descricao.substring(0, 40) : "Sem conteúdo adicional"}
                  </span>
                </div>
                {t.concluida && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${selectedTaskId === t.id ? "text-black" : "text-primary"}`}>
                    <CheckCircle2 size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content (Editor) */}
        <main className="flex-1 flex flex-col bg-[#1c1c1e] relative">
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
                <header className="h-14 border-b border-[#38383a] flex items-center justify-between px-6 shrink-0">
                  <div className="flex items-center gap-4 text-[#a2a2a7]">
                    <button onClick={() => updateTask(selectedTask.id, { concluida: !selectedTask.concluida })} className="hover:text-primary transition-colors">
                      {selectedTask.concluida ? <CheckCircle2 className="text-primary" size={20} /> : <Circle size={20} />}
                    </button>
                    <button onClick={() => deleteTask(selectedTask.id)} className="hover:text-red-400 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#2c2c2e] rounded-lg">
                      <LayoutGrid size={16} className="text-[#a2a2a7]" />
                      <Share size={16} className="text-[#a2a2a7]" />
                    </div>
                    {saving && <span className="text-[10px] uppercase font-bold text-primary animate-pulse tracking-widest">Salvando...</span>}
                  </div>
                </header>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full">
                  <div className="text-center mb-8">
                    <span className="text-[11px] font-bold text-[#a2a2a7] uppercase tracking-[0.2em]">
                      {format(new Date(selectedTask.data_vencimento), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                    </span>
                  </div>

                  <input 
                    type="text"
                    value={selectedTask.titulo}
                    onChange={(e) => updateTask(selectedTask.id, { titulo: e.target.value })}
                    className="w-full bg-transparent text-3xl font-black text-white focus:outline-none mb-6 placeholder-[#38383a]"
                    placeholder="Título da Nota"
                  />

                  <textarea 
                    value={selectedTask.descricao || ""}
                    onChange={(e) => updateTask(selectedTask.id, { descricao: e.target.value })}
                    className="w-full bg-transparent text-lg text-[#d1d1d6] leading-relaxed focus:outline-none resize-none h-[calc(100vh-350px)] placeholder-[#38383a]"
                    placeholder="Comece a escrever..."
                  />
                  
                  {/* Footer Settings */}
                  <div className="mt-12 pt-12 border-t border-[#38383a] grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#a2a2a7] flex items-center gap-2">
                        <User size={12} /> Lead Vinculado
                      </label>
                      <select 
                        value={selectedTask.lead_id || ""}
                        onChange={(e) => updateTask(selectedTask.id, { lead_id: e.target.value || null })}
                        className="w-full bg-[#2c2c2e] border border-[#38383a] rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Nenhum lead vinculado</option>
                        {leads.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#a2a2a7] flex items-center gap-2">
                        <CalendarIcon size={12} /> Data de Vencimento
                      </label>
                      <input 
                        type="datetime-local"
                        value={selectedTask.data_vencimento ? selectedTask.data_vencimento.substring(0, 16) : ""}
                        onChange={(e) => updateTask(selectedTask.id, { data_vencimento: new Date(e.target.value).toISOString() })}
                        className="w-full bg-[#2c2c2e] border border-[#38383a] rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-[#2c2c2e] rounded-2xl md:col-span-2">
                      <div className={`p-3 rounded-xl ${selectedTask.alerta_whatsapp ? 'bg-primary/20 text-primary' : 'bg-[#38383a] text-[#a2a2a7]'}`}>
                        <MessageSquare size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase tracking-tight">Alerta no WhatsApp</h4>
                        <p className="text-[10px] text-[#a2a2a7]">Notificar via automação quando vencer.</p>
                      </div>
                      <button 
                        onClick={() => updateTask(selectedTask.id, { alerta_whatsapp: !selectedTask.alerta_whatsapp })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${selectedTask.alerta_whatsapp ? 'bg-primary' : 'bg-[#38383a]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${selectedTask.alerta_whatsapp ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#38383a]">
                <SquarePen size={80} strokeWidth={1} />
                <p className="mt-4 font-bold uppercase tracking-widest text-xs">Selecione ou crie uma nota</p>
                <button 
                  onClick={createNewTask}
                  className="mt-6 px-6 py-2 bg-[#2c2c2e] text-[#a2a2a7] rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                >
                  Nova Nota
                </button>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #38383a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #48484a;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
    </>
  );
};

export default AdminTarefas;

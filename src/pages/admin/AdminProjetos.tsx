import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Map as MapIcon, Globe, Instagram, 
  Trash2, Plus, ExternalLink, Pencil, GripVertical,
  X, Check
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const STATUS_COLS = [
  { key: "briefing", label: "Briefing", color: "border-blue-500/30 bg-blue-500/5", textColor: "text-blue-400" },
  { key: "producao", label: "Produção", color: "border-amber-500/30 bg-amber-500/5", textColor: "text-amber-400" },
  { key: "revisao", label: "Revisão", color: "border-purple-500/30 bg-purple-500/5", textColor: "text-purple-400" },
  { key: "entregue", label: "Entregue", color: "border-primary/30 bg-primary/5", textColor: "text-primary" },
];

const AdminProjetos = () => {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ cliente_nome: "", lead_id: "", link_ambiente_teste: "" });

  const fetchData = async () => {
    setLoading(true);
    const { data: projData } = await supabase.from("projetos").select("*, leads(nome, origem)").order("created_at", { ascending: false });
    const { data: leadsData } = await supabase.from("leads").select("id, nome").order("nome");
    setProjetos(projData ?? []);
    setLeads(leadsData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const updated = projetos.map(p => p.id === draggableId ? { ...p, status: newStatus } : p);
    setProjetos(updated);

    const { error } = await supabase.from("projetos").update({ status: newStatus }).eq("id", draggableId);
    if (error) {
      toast({ title: "Erro ao mover projeto", description: error.message, variant: "destructive" });
      fetchData();
    } else {
      toast({ title: "Status Atualizado", description: `Projeto movido para ${STATUS_COLS.find(c => c.key === newStatus)?.label}` });
    }
  };

  const handleAddProject = async () => {
    if (!newProject.cliente_nome) return;
    const { error } = await supabase.from("projetos").insert([newProject]);
    if (!error) {
      toast({ title: "Projeto criado!" });
      setIsModalOpen(false);
      setNewProject({ cliente_nome: "", lead_id: "", link_ambiente_teste: "" });
      fetchData();
    }
  };

  const byStatus = (status: string) => projetos.filter((p) => p.status === status);

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Deseja realmente excluir este projeto?")) return;
    const { error } = await supabase.from("projetos").delete().eq("id", id);
    if (!error) {
      setProjetos(prev => prev.filter(p => p.id !== id));
      toast({ title: "Projeto excluído" });
    }
  };

  return (
    <>
      <Helmet><title>HLJ DEV | Projetos</title></Helmet>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto min-h-screen">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              Projetos <span className="text-primary">em Andamento</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">{projetos.length} projetos em execução</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-xs tracking-widest rounded-xl h-12 px-6 gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Novo Projeto
          </Button>
        </header>

        {loading ? (
          <div className="text-primary animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando Operação...</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
              {STATUS_COLS.map(({ key, label, color, textColor }) => (
                <div key={key} className={`min-w-[300px] flex flex-col snap-start`}>
                  <div className={`flex items-center justify-between mb-4 p-4 rounded-2xl border ${color} backdrop-blur-sm`}>
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${textColor}`}>{label}</span>
                    <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-lg text-white font-bold">{byStatus(key).length}</span>
                  </div>
                  
                  <Droppable droppableId={key}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-3 flex-1 rounded-2xl transition-colors duration-200 p-2 ${
                          snapshot.isDraggingOver ? "bg-white/[0.03]" : ""
                        }`}
                      >
                        {byStatus(key).length === 0 && !snapshot.isDraggingOver ? (
                          <div className="text-center py-12 border border-dashed border-zinc-900 rounded-3xl opacity-30">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Vazio</p>
                          </div>
                        ) : (
                          byStatus(key).map((p, index) => (
                            <Draggable key={p.id} draggableId={p.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-zinc-900/60 border ${
                                    snapshot.isDragging ? "border-primary shadow-2xl shadow-primary/20" : "border-zinc-800"
                                  } rounded-2xl p-5 hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <GripVertical className="h-3 w-3 text-zinc-700 group-hover:text-zinc-500 shrink-0" />
                                      <h3 className="text-xs font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors truncate">{p.cliente_nome}</h3>
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteProject(p.id)}
                                      className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>

                                  {p.leads && (
                                    <div className="space-y-1.5 mb-4">
                                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight truncate">Lead: {p.leads.nome}</p>
                                      {p.leads.origem?.toLowerCase().includes('maps') || p.leads.origem?.toLowerCase().includes('extração') ? (
                                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-amber-500/70">
                                          <MapIcon size={10} /> Campanha Maps
                                        </span>
                                      ) : p.leads.origem?.toLowerCase().includes('instagram') ? (
                                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-pink-500/70">
                                          <Instagram size={10} /> Instagram
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-blue-500/70">
                                          <Globe size={10} /> Site HLJ DEV
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {p.link_ambiente_teste && (
                                    <a href={p.link_ambiente_teste} target="_blank" rel="noreferrer"
                                      className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3 bg-primary/10 rounded-lg border border-primary/20 mt-2 w-fit">
                                      <ExternalLink size={10} /> Ver ambiente
                                    </a>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}

        {/* Modal Novo Projeto */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8">
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Novo Projeto</h2>
                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">Inicie uma nova produção</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome do Cliente / Projeto</label>
                      <input 
                        value={newProject.cliente_nome}
                        onChange={(e) => setNewProject({...newProject, cliente_nome: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary transition-colors outline-none"
                        placeholder="Ex: Barber Shop Adonai"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Vincular a um Lead (Opcional)</label>
                      <select 
                        value={newProject.lead_id}
                        onChange={(e) => setNewProject({...newProject, lead_id: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary transition-colors outline-none appearance-none"
                      >
                        <option value="">Nenhum lead selecionado</option>
                        {leads.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Link de Teste (URL)</label>
                      <input 
                        value={newProject.link_ambiente_teste}
                        onChange={(e) => setNewProject({...newProject, link_ambiente_teste: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-primary transition-colors outline-none"
                        placeholder="https://test.salonart.com.br"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddProject}
                    className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase text-xs tracking-widest rounded-2xl h-14 gap-2 shadow-lg shadow-primary/10 transition-all"
                  >
                    <Check className="h-4 w-4" /> Criar Projeto
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminProjetos;

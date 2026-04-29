import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Phone, Star, Globe, Map as MapIcon, 
  GripVertical, Trash2, Calendar, Instagram, 
  Filter, Search, LayoutGrid 
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { LeadDetailsPanel } from "@/components/admin/LeadDetailsPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS_COLS = [
  { key: "novo", label: "Novo", color: "border-blue-500/20 bg-blue-500/5", textColor: "text-blue-400" },
  { key: "em_contato", label: "Em Contato", color: "border-amber-500/20 bg-amber-500/5", textColor: "text-amber-400" },
  { key: "proposta_enviada", label: "Proposta Enviada", color: "border-purple-500/20 bg-purple-500/5", textColor: "text-purple-400" },
  { key: "fechado", label: "Fechado", color: "border-primary/20 bg-primary/5", textColor: "text-primary" },
  { key: "perdido", label: "Perdido", color: "border-red-500/20 bg-red-500/5", textColor: "text-red-400" },
];

const fetchLeads = async () => {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const AdminPipeline = () => {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [filterOrigin, setFilterOrigin] = useState<string>("all");

  const { data: leads = [], isLoading: loading } = useQuery({
    queryKey: ['pipeline-leads'],
    queryFn: fetchLeads,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['pipeline-leads'] });
      const prev = queryClient.getQueryData<any[]>(['pipeline-leads']);
      queryClient.setQueryData<any[]>(['pipeline-leads'], old =>
        (old ?? []).map(l => l.id === id ? { ...l, status } : l)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['pipeline-leads'], ctx?.prev);
      toast({ title: "Erro ao mover lead", variant: "destructive" });
    },
    onSuccess: ({ id, status }) => {
      toast({ title: "Lead atualizado", description: `Movido para ${STATUS_COLS.find(c => c.key === status)?.label}` });
      queryClient.invalidateQueries({ queryKey: ['dashboard-leads'] }); // sync dashboard
      if (status === "fechado") {
        const lead = (queryClient.getQueryData<any[]>(['pipeline-leads']) ?? []).find(l => l.id === id);
        if (lead) {
          supabase.from("projetos").insert({ cliente_nome: lead.nome, lead_id: lead.id, status: "briefing" })
            .then(({ error }) => {
              if (!error) toast({ title: "🚀 Projeto Iniciado!", description: `Projeto para ${lead.nome} criado automaticamente.` });
            });
        }
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline-leads'] });
      const prev = queryClient.getQueryData<any[]>(['pipeline-leads']);
      queryClient.setQueryData<any[]>(['pipeline-leads'], old => (old ?? []).filter(l => l.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['pipeline-leads'], ctx?.prev);
      toast({ title: "Erro ao excluir lead", variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Lead excluído", description: "Removido com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['dashboard-leads'] });
    },
  });

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    updateStatusMutation.mutate({ id: draggableId, status: destination.droppableId });
  };

  const filteredLeads = leads.filter(l => {
    if (filterOrigin === 'all') return true;
    if (filterOrigin === 'maps') return l.origem?.toLowerCase().includes('maps') || l.origem?.toLowerCase().includes('extração');
    if (filterOrigin === 'site') return l.origem?.toLowerCase().includes('site');
    if (filterOrigin === 'instagram') return l.origem?.toLowerCase().includes('instagram');
    return true;
  });

  const byStatus = (status: string) => filteredLeads.filter((l) => l.status === status);

  const handleDeleteLead = (id: string) => {
    deleteMutation.mutate(id);
    setSelectedLead(null);
    setLeadToDelete(null);
  };

  return (
    <>
      <Helmet><title>HLJ DEV | Pipeline Leads</title></Helmet>
      <div className="p-6 md:p-10 space-y-8 max-w-[1800px] mx-auto min-h-screen relative overflow-hidden">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary/60 text-xs mb-1 uppercase tracking-[0.3em] font-black">
              <Users className="h-3 w-3" /> Gestão de Funil
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
              Pipeline <span className="text-primary">CRM</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
              {filteredLeads.length} leads {filterOrigin !== 'all' ? `de ${filterOrigin}` : ''} no fluxo
            </p>
          </div>

          {/* Filtros de Origem */}
          <div className="flex items-center bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-2xl gap-1">
            <button 
              onClick={() => setFilterOrigin('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterOrigin === 'all' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilterOrigin('maps')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterOrigin === 'maps' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <MapIcon size={12} /> Campanha
            </button>
            <button 
              onClick={() => setFilterOrigin('site')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterOrigin === 'site' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <Globe size={12} /> Site
            </button>
            <button 
              onClick={() => setFilterOrigin('instagram')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterOrigin === 'instagram' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <Instagram size={12} /> Instagram
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center gap-3 text-primary animate-pulse font-black uppercase text-xs tracking-widest">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Sincronizando Leads...
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x min-h-[70vh]">
              {STATUS_COLS.map(({ key, label, color, textColor }) => (
                <div key={key} className={`min-w-[320px] flex flex-col snap-start`}>
                  <div className={`flex items-center justify-between mb-4 p-4 rounded-2xl border ${color} backdrop-blur-sm sticky top-0 z-10`}>
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
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Sem Leads</p>
                          </div>
                        ) : (
                          byStatus(key).map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedLead(lead)}
                                  className={`bg-zinc-900/60 border ${
                                    snapshot.isDragging ? "border-primary shadow-2xl shadow-primary/20" : "border-zinc-800"
                                  } rounded-2xl p-5 hover:border-zinc-600 transition-all cursor-pointer group relative overflow-hidden`}
                                  style={{
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <GripVertical className="h-3 w-3 text-zinc-700 group-hover:text-zinc-500 shrink-0" />
                                      <h3 className="text-xs font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors truncate">{lead.nome}</h3>
                                    </div>
                                    {lead.lead_score != null && (
                                      <span className="text-[9px] font-black text-primary flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded">
                                        <Star className="h-2.5 w-2.5 fill-current" />{lead.lead_score}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 mb-4">
                                    {lead.origem?.toLowerCase().includes('maps') || lead.origem?.toLowerCase().includes('extração') ? (
                                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-widest border border-amber-500/10">
                                        <MapIcon className="h-2 w-2" /> Campanha
                                      </span>
                                    ) : lead.origem?.toLowerCase().includes('instagram') ? (
                                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 text-[8px] font-black uppercase tracking-widest border border-pink-500/10">
                                        <Instagram className="h-2 w-2" /> Instagram
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-500/10">
                                        <Globe className="h-2 w-2" /> Site HLJ DEV
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/50">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      {lead.whatsapp && (
                                        <Phone className="h-3 w-3 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                      )}
                                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                    </div>
                                  </div>
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

        {/* Lead Details Drawer */}
        <AnimatePresence>
          {selectedLead && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLead(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <LeadDetailsPanel 
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onAction={(action) => {
                  if (action === 'delete') {
                    setLeadToDelete(selectedLead.id);
                  }
                }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
          <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white shadow-2xl shadow-red-900/10 backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black uppercase tracking-tighter text-xl">Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400 font-medium">
                Tem certeza que deseja excluir permanentemente este lead? Esta ação não poderá ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="bg-zinc-900 hover:bg-zinc-800 text-white border-none uppercase tracking-widest text-[10px] font-black rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (leadToDelete) handleDeleteLead(leadToDelete);
                  setLeadToDelete(null);
                  setSelectedLead(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white uppercase tracking-widest text-[10px] font-black rounded-xl"
              >
                Sim, Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default AdminPipeline;

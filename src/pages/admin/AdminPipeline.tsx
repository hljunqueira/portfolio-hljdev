import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Phone, Star, Globe, Map as MapIcon, 
  GripVertical, Trash2, Calendar, Instagram, 
  Filter, Search, LayoutGrid, Download, Sparkles, MessageCircle, ArrowRight, ShieldCheck, List, Table
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { LeadDetailsPanel } from "@/components/admin/LeadDetailsPanel";
import { MapsProspeccionModal } from "@/components/admin/MapsProspeccionModal";
import { Button } from "@/components/ui/button";
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
  const { data, error } = await supabase
    .from("leads")
    .select("id, nome, empresa, whatsapp, telefone, email, status, origem, lead_score, score, website, rating, user_ratings_total, created_at, endereco, foto_url, categorias")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const AdminPipeline = () => {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [filterOrigin, setFilterOrigin] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ['dashboard-leads'] });
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
    onSuccess: () => {
      toast({ title: "Lead excluído" });
      queryClient.invalidateQueries({ queryKey: ['dashboard-leads'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("leads").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: `${selectedLeadIds.length} leads excluídos com sucesso!` });
      setSelectedLeadIds([]);
      queryClient.invalidateQueries({ queryKey: ['pipeline-leads'] });
    }
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

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Helmet><title>HLJ DEV | Pipeline CRM LeadSite</title></Helmet>
      <div className="p-6 md:p-10 space-y-8 max-w-[1800px] mx-auto min-h-screen relative overflow-hidden">
        {/* Header Superior estilo LeadSite */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary/60 text-xs mb-1 uppercase tracking-[0.3em] font-black">
              <Users className="h-3 w-3" /> Gestão de Funil & Prospeção
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
              Pipeline <span className="text-primary">LeadSite</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
              {filteredLeads.length} leads qualificados no fluxo
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Seletor de Modo: Kanban vs Tabela */}
            <div className="flex items-center bg-zinc-900/80 border border-zinc-800 p-1.5 rounded-2xl gap-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "kanban" ? "bg-primary text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutGrid size={14} /> Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "table" ? "bg-primary text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Table size={14} /> Tabela
              </button>
            </div>

            {/* Nova Extração Google Maps */}
            <Button
              onClick={() => setIsMapsModalOpen(true)}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-all gap-2 shadow-lg shadow-blue-600/20"
            >
              <Sparkles size={16} />
              <span>⚡ Extração Maps</span>
            </Button>
          </div>
        </header>

        {/* Ações em Massa Bar (Bulk Actions) */}
        {selectedLeadIds.length > 0 && (
          <div className="bg-blue-600/20 border border-blue-500/40 p-4 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-black text-blue-300 uppercase tracking-wider">
              {selectedLeadIds.length} lead(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => bulkDeleteMutation.mutate(selectedLeadIds)}
                disabled={bulkDeleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                <Trash2 size={14} className="mr-1" /> Excluir Selecionados
              </Button>
            </div>
          </div>
        )}

        {/* Conteúdo Principal: Modo Kanban ou Modo Tabela */}
        {loading ? (
          <div className="flex items-center gap-3 text-primary animate-pulse font-black uppercase text-xs tracking-widest">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Sincronizando Leads...
          </div>
        ) : viewMode === "table" ? (
          /* MODO TABELA (Estilo LeadSite Table View) */
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/60 border-b border-zinc-800 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Lead / Empresa</th>
                    <th className="p-4">Contatos (WhatsApp)</th>
                    <th className="p-4">Origem / Status</th>
                    <th className="p-4">Score</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredLeads.map((lead) => {
                    const score = lead.lead_score ?? lead.score ?? 0;
                    const isSelected = selectedLeadIds.includes(lead.id);

                    return (
                      <tr key={lead.id} className={`hover:bg-zinc-900/30 transition-colors ${isSelected ? "bg-blue-500/10" : ""}`}>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(lead.id)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{lead.nome}</div>
                          {lead.empresa && <div className="text-[10px] text-zinc-500">{lead.empresa}</div>}
                        </td>
                        <td className="p-4">
                          <div className="text-zinc-300 font-bold">{lead.whatsapp || lead.telefone || 'N/A'}</div>
                          {lead.email && <div className="text-[10px] text-zinc-500">{lead.email}</div>}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-900 text-zinc-400 border border-zinc-800 mr-2">
                            {lead.origem || 'Google Maps'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary">
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            score >= 80 ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {score} pts
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-primary hover:text-black text-zinc-300 font-bold rounded-xl text-xs transition-all"
                          >
                            Abrir Gaveta
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* MODO KANBAN */
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x min-h-[70vh]">
              {STATUS_COLS.map(({ key, label, color, textColor }) => (
                <div key={key} className="flex-1 min-w-[320px] max-w-[380px] snap-start flex flex-col">
                  <div className={`p-4 rounded-2xl border ${color} flex items-center justify-between mb-4 backdrop-blur-md`}>
                    <span className={`text-xs font-black uppercase tracking-wider ${textColor}`}>{label}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {byStatus(key).length}
                    </span>
                  </div>

                  <Droppable droppableId={key}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 rounded-3xl p-2 transition-colors space-y-3 ${
                          snapshot.isDraggingOver ? "bg-zinc-900/40 border border-dashed border-zinc-800" : ""
                        }`}
                      >
                        {byStatus(key).map((lead, index) => {
                          const score = lead.lead_score ?? lead.score ?? 0;
                          const isNoWebsite = !lead.website || lead.website.trim() === "";

                          return (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  onClick={() => setSelectedLead(lead)}
                                  className={`bg-zinc-900/60 border border-zinc-800/80 hover:border-primary/50 rounded-2xl p-4 transition-all group relative cursor-pointer ${
                                    snapshot.isDragging ? "shadow-2xl shadow-primary/20 ring-2 ring-primary bg-zinc-900" : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div {...provided.dragHandleProps} className="text-zinc-600 hover:text-zinc-400 cursor-grab p-1" onClick={(e) => e.stopPropagation()}>
                                      <GripVertical size={14} />
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                        score >= 80 ? "bg-green-500/20 text-green-400 border border-green-500/40" :
                                        score >= 50 ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                                        "bg-zinc-800 text-zinc-400"
                                      }`}>
                                        {score} pts
                                      </span>

                                      {isNoWebsite ? (
                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                                          Vácuo Digital
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/40">
                                          Com Site
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <h4 className="text-white font-black text-sm group-hover:text-primary transition-colors mt-1">
                                    {lead.nome}
                                  </h4>

                                  {lead.empresa && lead.empresa !== lead.nome && (
                                    <p className="text-zinc-400 text-xs font-medium mt-0.5 line-clamp-1">{lead.empresa}</p>
                                  )}

                                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 mt-3">
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase">{lead.origem || 'Google Maps'}</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLead(lead);
                                        }}
                                        className="px-2.5 py-1 bg-zinc-800 hover:bg-primary hover:text-black text-zinc-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                                      >
                                        Gaveta <ArrowRight size={10} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      <MapsProspeccionModal
        isOpen={isMapsModalOpen}
        onClose={() => setIsMapsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['pipeline-leads'] })}
      />

      {selectedLead && (
        <LeadDetailsPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onAction={(action, lead) => {
            if (action === "delete") setLeadToDelete(lead.id);
          }}
        />
      )}
    </>
  );
};

export default AdminPipeline;

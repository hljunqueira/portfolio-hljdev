import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  Map, 
  Play, 
  Square, 
  Search, 
  Plus, 
  Settings, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Target,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit2 } from "lucide-react";
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

interface Campaign {
  id: string;
  name: string;
  keyword: string;
  location: string;
  status: "idle" | "running" | "completed" | "error" | "queued";
  leads_found: number;
  dispatches_sent: number;
  last_run?: string;
  created_at: string;
}

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  // Form State
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    keyword: "",
    location: ""
  });

  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    
    // Buscar campanhas
    const { data: campaignsData, error: campaignsError } = await supabase
      .from("campanhas_maps")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!campaignsError && campaignsData) {
      setCampaigns(campaignsData);
    }

    // Buscar contagem de leads pendentes (status 'novo')
    const { count, error: countError } = await supabase
      .from("leads")
      .select("*", { count: 'exact', head: true })
      .eq("status", "novo");

    if (!countError) {
      setPendingCount(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();

    // Inscrição em tempo real para atualizações de status
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campanhas_maps'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCampaigns(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c));
          } else if (payload.eventType === 'INSERT') {
            setCampaigns(prev => [payload.new as Campaign, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setCampaigns(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from("campanhas_maps")
      .delete()
      .eq("id", id);

    if (!error) {
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast({ title: "Campanha Excluída", description: "A estratégia foi removida com sucesso." });
    } else {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const handleStartExtraction = async (campaign: Campaign) => {
    // Agora o disparo é feito via Trigger no Supabase ao mudar o status para 'idle'
    const { error } = await supabase
      .from("campanhas_maps")
      .update({ status: 'queued' })
      .eq("id", campaign.id);

    if (!error) {
      toast({ title: "Campanha Enfileirada", description: "O robô de busca foi acionado via servidor." });
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'queued' } : c));
    } else {
      toast({ title: "Erro ao iniciar", description: error.message, variant: "destructive" });
    }
  };

  const handleStopExtraction = async (campaign: Campaign) => {
    const { error } = await supabase
      .from("campanhas_maps")
      .update({ status: 'idle' })
      .eq("id", campaign.id);

    if (!error) {
      toast({ title: "Extração Pausada", description: "O robô parou de processar novos leads." });
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'idle' } : c));
    } else {
      toast({ title: "Erro ao pausar", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name || !newCampaign.keyword || !newCampaign.location) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    if (editingCampaign) {
      const { error } = await supabase
        .from("campanhas_maps")
        .update({
          name: newCampaign.name,
          keyword: newCampaign.keyword,
          location: newCampaign.location
        })
        .eq("id", editingCampaign.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? { ...c, ...newCampaign } : c));
        toast({ title: "Campanha Atualizada", description: "Os novos parâmetros foram salvos." });
        setIsModalOpen(false);
        setEditingCampaign(null);
        setNewCampaign({ name: "", keyword: "", location: "" });
      }
    } else {
      const { data, error } = await supabase
        .from("campanhas_maps")
        .insert([
          { 
            name: newCampaign.name, 
            keyword: newCampaign.keyword, 
            location: newCampaign.location,
            status: "idle",
            leads_found: 0,
            dispatches_sent: 0
          }
        ])
        .select();

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        const createdCampaign = data[0];
        setCampaigns([createdCampaign, ...campaigns]);
        setIsModalOpen(false);
        setNewCampaign({ name: "", keyword: "", location: "" });
        toast({ title: "Campanha Criada", description: "O robô de extração foi acionado via servidor." });
      }
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest animate-pulse border border-emerald-500/20"><Play className="h-2 w-2 fill-current" /> Extraindo</span>;
      case "queued":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest animate-pulse border border-amber-500/20"><Clock className="h-2 w-2" /> Na Fila</span>;
      case "completed":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20"><CheckCircle2 className="h-2 w-2" /> Finalizado</span>;
      case "idle":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase tracking-widest border border-zinc-700">Pausado</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/20"><AlertCircle className="h-2 w-2" /> Erro</span>;
    }
  };

  return (
    <>
      <Helmet><title>HLJ DEV | Campanhas Maps</title></Helmet>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto min-h-screen">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary/60 text-xs mb-1 uppercase tracking-[0.3em] font-black">
              <Map className="h-3 w-3" /> Gestão de Inteligência
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
              Extração <span className="text-primary">Google Maps</span>
            </h1>
            <p className="text-zinc-500 text-sm italic font-medium">Capture leads por segmento e localização em massa.</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-xs tracking-widest rounded-xl h-12 px-6 gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nova Campanha
          </Button>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              label: "Total Extraído", 
              value: campaigns.reduce((acc, curr) => acc + (curr.leads_found || 0), 0).toString(), 
              icon: Search, 
              color: "text-blue-400" 
            },
            { 
              label: "Campanhas Ativas", 
              value: campaigns.filter(c => c.status === 'running').length.toString(), 
              icon: Play, 
              color: "text-emerald-400" 
            },
            { 
              label: "Leads Pendentes", 
              value: pendingCount >= 1000 ? `${(pendingCount / 1000).toFixed(1)}k` : pendingCount.toString(),
              icon: Clock, 
              color: "text-amber-400" 
            },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Global Stats</span>
              </div>
              <div className="text-3xl font-black text-white">{loading ? "..." : stat.value}</div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Campaigns List */}
        <section className="bg-zinc-950/50 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-zinc-900/80 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" /> Painel de Controle
            </h2>
          </div>
          
          <div className="divide-y divide-zinc-900">
            {loading ? (
              <div className="p-12 text-center text-zinc-600 animate-pulse font-bold uppercase tracking-widest text-xs">
                Carregando campanhas...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                  <Map className="h-8 w-8" />
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Nenhuma campanha iniciada</p>
                <Button variant="outline" onClick={() => setIsModalOpen(true)} className="border-zinc-800 text-zinc-400 font-black uppercase text-[10px] tracking-widest">
                  Criar minha primeira campanha
                </Button>
              </div>
            ) : (
              campaigns.map((camp) => (
                <motion.div 
                  key={camp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${camp.status === 'running' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-zinc-900 text-zinc-500'} border border-zinc-800`}>
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-black uppercase text-sm tracking-tight">{camp.name}</h3>
                        {getStatusBadge(camp.status)}
                      </div>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="text-primary">{camp.keyword}</span>
                        <span className="text-zinc-700">|</span>
                        <span className="flex items-center gap-1"><MapPin size={10} /> {camp.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-center">
                      <div className="text-xl font-black text-white">{camp.leads_found}</div>
                      <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black text-primary">{camp.dispatches_sent}</div>
                      <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Sucesso</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {camp.status === 'running' || camp.status === 'queued' ? (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleStopExtraction(camp)}
                          className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 animate-pulse"
                        >
                          <Square className="h-4 w-4 fill-current" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleStartExtraction(camp)}
                          className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5"
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
                          >
                            <Settings className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-400">
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingCampaign(camp);
                              setNewCampaign({
                                name: camp.name,
                                keyword: camp.keyword,
                                location: camp.location
                              });
                              setIsModalOpen(true);
                            }}
                            className="focus:bg-zinc-800 focus:text-primary cursor-pointer gap-2"
                          >
                            <Edit2 className="h-4 w-4" /> Editar Parâmetros
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          <DropdownMenuItem 
                            onClick={() => setCampaignToDelete(camp.id)}
                            className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer gap-2 text-red-500/70"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir Estratégia
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Create Campaign Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    {editingCampaign ? 'Editar' : 'Nova'} <span className="text-primary">Campanha</span>
                  </h2>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingCampaign(null);
                      setNewCampaign({ name: "", keyword: "", location: "" });
                    }}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateCampaign} className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome Identificador</label>
                      <div className="relative group">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text"
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                          placeholder="Ex: Barbearias em Araranguá"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Segmento (Niche)</label>
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                          <input 
                            type="text"
                            value={newCampaign.keyword}
                            onChange={(e) => setNewCampaign({ ...newCampaign, keyword: e.target.value })}
                            placeholder="Ex: Barbearia"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Localização</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                          <input 
                            type="text"
                            value={newCampaign.location}
                            onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
                            placeholder="Ex: Araranguá, SC"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-dark text-black font-black uppercase tracking-widest py-7 rounded-xl shadow-xl shadow-primary/10 group overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {editingCampaign ? 'Salvar Alterações' : 'Iniciar Robô de Extração'}
                          <Play className="h-4 w-4 fill-current group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase text-center mt-4 tracking-widest">
                    *A extração começará automaticamente via n8n
                  </p>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Campaign Modal */}
        <AlertDialog open={!!campaignToDelete} onOpenChange={() => setCampaignToDelete(null)}>
          <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white shadow-2xl shadow-red-900/10 backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black uppercase tracking-tighter text-xl">Excluir Campanha</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400 font-medium">
                Todos os leads capturados continuarão salvos, mas a estratégia de busca será permanentemente removida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="bg-zinc-900 hover:bg-zinc-800 text-white border-none uppercase tracking-widest text-[10px] font-black rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (campaignToDelete) handleDeleteCampaign(campaignToDelete);
                  setCampaignToDelete(null);
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

export default AdminCampaigns;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  Map, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Target,
  MapPin,
  Trash2,
  Sparkles,
  Globe,
  PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { MapsProspeccionModal } from "@/components/admin/MapsProspeccionModal";
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
  keyword: string;
  location: string;
  status: string;
  total_encontrados?: number;
  validados_whatsapp?: number;
  created_at: string;
}

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("campanhas_maps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar campanhas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase.from("campanhas_maps").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Campanha excluída com sucesso!" });
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    } finally {
      setCampaignToDelete(null);
    }
  };

  return (
    <>
      <Helmet><title>HLJ DEV | Campanhas de Prospecção</title></Helmet>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto min-h-screen">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary/60 text-xs mb-1 uppercase tracking-[0.3em] font-black">
              <Globe className="h-3 w-3" /> Automação de Busca
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
              Campanhas <span className="text-primary">Google Maps</span>
            </h1>
            <p className="text-zinc-500 text-xs font-medium mt-1">
              Histórico de buscas em tempo real por cidade, estado e nicho comercial.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Sparkles size={16} />
            <span>⚡ Nova Prospecção Maps</span>
          </Button>
        </header>

        {/* Lista de Campanhas */}
        {loading ? (
          <div className="flex items-center gap-3 text-primary animate-pulse font-black uppercase text-xs tracking-widest p-8">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Carregando histórico de campanhas...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <Globe size={32} />
            </div>
            <h3 className="text-white font-black uppercase text-base">Nenhuma Campanha Disparada Ainda</h3>
            <p className="text-zinc-500 text-xs max-w-md mx-auto">
              Clique em "Nova Prospecção Maps" para buscar empresas sem site em qualquer cidade do Brasil.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl"
            >
              Criar Primeiras Busca
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl relative group transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                      {camp.location}
                    </span>
                    <h3 className="text-white font-black text-base tracking-tight">{camp.keyword}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    camp.status === 'running' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                    camp.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  }`}>
                    {camp.status === 'running' ? 'Rodando...' : camp.status === 'completed' ? 'Concluído' : 'Ativa'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900">
                  <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/60">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">Encontrados</span>
                    <span className="text-white font-black text-lg">{camp.total_encontrados || 0}</span>
                  </div>
                  <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/60">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">WhatsApp Validados</span>
                    <span className="text-green-400 font-black text-lg">{camp.validados_whatsapp || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[9px] text-zinc-600 font-medium">
                    {new Date(camp.created_at).toLocaleString("pt-BR")}
                  </span>
                  <button
                    onClick={() => setCampaignToDelete(camp.id)}
                    className="p-2 text-zinc-600 hover:text-red-400 rounded-xl hover:bg-zinc-900 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Prospecção */}
      <MapsProspeccionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCampaigns}
      />

      {/* AlertDialog de Exclusão */}
      <AlertDialog open={!!campaignToDelete} onOpenChange={(open) => !open && setCampaignToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Excluir Campanha?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm">
              Esta ação removerá o registro da busca da sua lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 rounded-xl text-xs font-bold uppercase">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => campaignToDelete && handleDeleteCampaign(campaignToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminCampaigns;

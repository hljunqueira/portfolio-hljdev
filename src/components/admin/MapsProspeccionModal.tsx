import { useState } from "react";
import { MapPin, Search, Sparkles, CheckCircle2, AlertCircle, X, Globe, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MapsProspeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const POPULAR_NICHES = [
  "Clínicas Odontológicas",
  "Restaurantes & Baristas",
  "Advogados & Escritórios",
  "Academias & Studio Pilates",
  "Salões de Beleza & Barbearias",
  "Oficinas Mecânicas"
];

const POPULAR_LOCATIONS = [
  "Florianópolis - SC",
  "Curitiba - PR",
  "São Paulo - SP",
  "Rio de Janeiro - RJ",
  "Belo Horizonte - MG",
  "Porto Alegre - RS"
];

export const MapsProspeccionModal = ({ isOpen, onClose, onSuccess }: MapsProspeccionModalProps) => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [stepStatus, setStepStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExtraction = async () => {
    if (!keyword.trim() || !location.trim()) {
      toast({ title: "Preencha o nicho e a localização", variant: "destructive" });
      return;
    }

    setIsExtracting(true);
    setStepStatus("1. Criando campanha no banco de dados...");

    try {
      // 1. Criar campanha no Supabase
      const { data: campaign, error: campErr } = await supabase.from("campanhas_maps").insert({
        keyword: keyword.trim(),
        location: location.trim(),
        status: "running"
      }).select().single();

      if (campErr) throw new Error("Erro ao criar registro de campanha: " + campErr.message);

      setStepStatus("2. Conectando à Google Places API...");

      // 2. Disparar Webhook no N8N
      const n8nWebhookUrl = import.meta.env.VITE_N8N_MAPS_WEBHOOK || "https://n8n.hljdev.com.br/webhook/hlj-extracao-maps";

      const res = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaign.id,
          keyword: keyword.trim(),
          location: location.trim()
        })
      });

      setStepStatus("3. Extraindo negócios sem site e validando contas WhatsApp...");

      toast({ 
        title: "Extração Iniciada com Sucesso!", 
        description: `Buscando ${keyword} em ${location}. Os leads validados aparecerão no Kanban.` 
      });

      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsExtracting(false);
        setStepStatus(null);
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error("Erro na extração Maps:", err);
      toast({ title: "Falha na Extração", description: err.message, variant: "destructive" });
      setIsExtracting(false);
      setStepStatus(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Prospecção Global Google Maps</h3>
                <p className="text-zinc-500 text-xs font-medium">Extraia empresas sem site com WhatsApp ativo em qualquer região.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">1. Nicho ou Palavra-chave</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Ex: Clínicas Odontológicas, Restaurantes..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-200 text-xs focus:border-blue-500/50"
                />
              </div>
              {/* Nichos Rápidos */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {POPULAR_NICHES.map((n, i) => (
                  <button
                    key={i}
                    onClick={() => setKeyword(n)}
                    className="px-2.5 py-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-lg text-[10px] text-zinc-400 font-medium transition-all"
                  >
                    + {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">2. Cidade / Estado / País</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Ex: Florianópolis - SC, São Paulo, Miami FL..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-200 text-xs focus:border-blue-500/50"
                />
              </div>
              {/* Cidades Rápidas */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {POPULAR_LOCATIONS.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => setLocation(loc)}
                    className="px-2.5 py-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-lg text-[10px] text-zinc-400 font-medium transition-all"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Validação Badge Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-2xl flex items-center gap-3">
            <PhoneCall size={18} className="text-blue-400 shrink-0" />
            <p className="text-blue-200 text-[11px] font-medium leading-relaxed">
              O robô do N8N consulta a Google Places API e a Evolution API para importar <span className="font-bold underline">apenas números com WhatsApp ativo</span> e marcados com Vácuo Digital.
            </p>
          </div>

          {/* Status Progress */}
          {stepStatus && (
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400 animate-spin" />
              <span className="text-xs font-bold text-zinc-300">{stepStatus}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleStartExtraction}
            disabled={isExtracting || !keyword || !location}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {isExtracting ? (
              <>
                <Sparkles className="animate-spin" size={16} /> Extraindo Leads...
              </>
            ) : (
              <>
                <Search size={16} /> Disparar Prospecção Global Maps
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

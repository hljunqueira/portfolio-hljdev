import { useState, useEffect } from "react";
import { MapPin, Search, Sparkles, CheckCircle2, AlertCircle, X, Globe, PhoneCall, Filter, ShieldCheck, Star, Navigation, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MapsProspeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ALL_27_ESTADOS = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" }
];

const NICHOS_LEADSITE = [
  { id: "restaurante", label: "Restaurantes & Gastronomia", icon: "🍽️" },
  { id: "dentista", label: "Clínicas Odontológicas", icon: "🦷" },
  { id: "medico", label: "Clínicas Médicas & Estética", icon: "🩺" },
  { id: "advogado", label: "Advogados & Escritórios", icon: "⚖️" },
  { id: "academia", label: "Academias & Crossfit", icon: "🏋️" },
  { id: "oficina", label: "Oficinas Mecânicas & Autocenter", icon: "🚗" },
  { id: "pet", label: "Pet Shops & Veterinárias", icon: "🐾" },
  { id: "imobiliaria", label: "Imobiliárias & Corretores", icon: "🏢" },
  { id: "salao", label: "Salões de Beleza & Barbearias", icon: "✂️" },
  { id: "roupas", label: "Lojas de Roupas & Moda", icon: "👗" },
  { id: "moveis", label: "Lojas de Móveis & Marcenaria", icon: "🛋️" },
  { id: "escola", label: "Escolas & Cursos Livres", icon: "📚" },
  { id: "contabilidade", label: "Contabilidades & BPO", icon: "📊" },
  { id: "arquitetura", label: "Arquitetura & Engenharia", icon: "📐" },
  { id: "hotel", label: "Hotéis & Pousadas", icon: "🏨" },
  { id: "farmacia", label: "Farmácias & Manipulação", icon: "💊" },
  { id: "grafica", label: "Gráficas & Comunicação Visual", icon: "🖨️" },
  { id: "solar", label: "Empresas de Energia Solar", icon: "☀️" },
  { id: "seguros", label: "Corretoras de Seguros", icon: "🛡️" },
  { id: "eventos", label: "Salões de Festas & Eventos", icon: "🎉" },
  { id: "celular", label: "Assistência Técnica & Celulares", icon: "📱" },
  { id: "pizzaria", label: "Pizzarias & Hamburguerias", icon: "🍕" },
  { id: "lava_jato", label: "Lava-jato & Estética Automotiva", icon: "🧽" },
  { id: "podologia", label: "Clínicas de Podologia & Spa", icon: "🦶" },
  { id: "autoescola", label: "Autoescolas & CFC", icon: "🚘" },
  { id: "vidracaria", label: "Vidraçarias & Esquadrias", icon: "🪟" },
  { id: "dedetizadora", label: "Controle de Pragas & Dedetização", icon: "🐜" },
  { id: "supermercado", label: "Supermercados & Empórios", icon: "🛒" },
  { id: "videomaker", label: "Produtoras de Vídeo & Foto", icon: "🎥" },
  { id: "otica", label: "Óticas & Relojoarias", icon: "👓" },
  { id: "marcenaria", label: "Móveis Planejados", icon: "🪵" },
  { id: "seguranca", label: "Segurança Eletrônica & Alarmes", icon: "🚨" },
  { id: "lavanderia", label: "Lavanderias & Passanderias", icon: "🧺" },
  { id: "sorveteria", label: "Sorveterias & Açaí", icon: "🍦" },
  { id: "construcao", label: "Materiais de Construção", icon: "🧱" },
  { id: "buffet", label: "Buffet Infantil & Festas", icon: "🎈" }
];

export const MapsProspeccionModal = ({ isOpen, onClose, onSuccess }: MapsProspeccionModalProps) => {
  const [selectedState, setSelectedState] = useState("SC");
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [selectedCity, setSelectedCity] = useState("TODAS");
  const [customBairro, setCustomBairro] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  
  const [selectedNiche, setSelectedNiche] = useState("Clínicas Odontológicas");
  const [customNiche, setCustomNiche] = useState("");

  // Filtros Avançados (LeadSite)
  const [apenasSemSite, setApenasSemSite] = useState(true);
  const [apenasWhatsAppValidado, setApenasWhatsAppValidado] = useState(true);
  const [minRatingsCount, setMinRatingsCount] = useState(5);

  const [isExtracting, setIsExtracting] = useState(false);
  const [stepStatus, setStepStatus] = useState<string | null>(null);

  // Carregar 100% das cidades do Estado via API do IBGE
  useEffect(() => {
    if (!selectedState) return;
    const fetchIbgeCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`);
        if (!res.ok) throw new Error("Erro IBGE");
        const data = await res.json();
        const cityNames = data.map((c: any) => c.nome);
        setCitiesList(cityNames);
        setSelectedCity("TODAS");
      } catch (err) {
        console.error("Erro ao carregar cidades do IBGE:", err);
        setCitiesList(["Florianópolis", "Joinville", "Blumenau", "Curitiba", "São Paulo", "Porto Alegre", "Belo Horizonte"]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchIbgeCities();
  }, [selectedState]);

  if (!isOpen) return null;

  const currentEstObj = ALL_27_ESTADOS.find(e => e.uf === selectedState);
  const activeBairroText = customBairro.trim();
  const activeLocation = customLocation.trim() || (
    selectedCity === "TODAS"
      ? `Estado de ${currentEstObj?.nome || selectedState}`
      : `${activeBairroText ? activeBairroText + ', ' : ''}${selectedCity} - ${selectedState}`
  );
  const activeNiche = customNiche.trim() || selectedNiche;

  const handleStartExtraction = async () => {
    if (!activeNiche || !activeLocation) {
      toast({ title: "Selecione o nicho e a localização", variant: "destructive" });
      return;
    }

    setIsExtracting(true);
    setStepStatus("1. Registrando campanha de prospecção...");

    try {
      const { data: campaign, error: campErr } = await supabase.from("campanhas_maps").insert({
        keyword: activeNiche,
        location: activeLocation,
        status: "running"
      }).select().single();

      if (campErr) throw new Error("Erro ao registrar campanha: " + campErr.message);

      setStepStatus("2. Consultando Google Places API...");

      const n8nWebhookUrl = import.meta.env.VITE_N8N_MAPS_WEBHOOK || "https://n8n.hljdev.com.br/webhook/hlj-extracao-maps";

      await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaign.id,
          keyword: activeNiche,
          location: activeLocation,
          filtros: {
            apenas_sem_site: apenasSemSite,
            validar_whatsapp: apenasWhatsAppValidado,
            min_avaliacoes: minRatingsCount
          }
        })
      });

      setStepStatus("3. Filtrando Vácuo Digital e validando WhatsApp...");

      toast({ 
        title: "Prospecção Iniciada!", 
        description: `Buscando ${activeNiche} em ${activeLocation}.` 
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
          className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Prospecção LeadSite (Dados Oficiais IBGE)</h3>
                <p className="text-zinc-500 text-xs font-medium">Extraia empresas nos 27 estados e todos os 5.570 municípios do Brasil.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* 1. Seleção de Nicho */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">1. Selecione o Nicho Comercial (36 Nichos)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {NICHOS_LEADSITE.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedNiche(item.label);
                    setCustomNiche("");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    selectedNiche === item.label && !customNiche
                      ? "bg-blue-500/20 border-blue-500 text-blue-300 font-bold"
                      : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-bold leading-tight">{item.label}</span>
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Ou digite um nicho específico (ex: Lojas de Noivas, Podologia...)"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-blue-500/50"
            />
          </div>

          {/* 2. Seleção de Localização IBGE (27 Estados + Cidades do IBGE) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">2. Selecione Estado (UF) e Cidade (Todos os Municípios IBGE)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Estado (27 UFs)</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs font-bold text-zinc-200"
                >
                  {ALL_27_ESTADOS.map(est => (
                    <option key={est.uf} value={est.uf}>{est.nome} ({est.uf})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Cidade / Município</label>
                  {isLoadingCities && (
                    <span className="text-[9px] text-blue-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> IBGE...</span>
                  )}
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={isLoadingCities}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs font-bold text-zinc-200"
                >
                  <option value="TODAS">🌟 Todas as Cidades de {currentEstObj?.nome} ({citiesList.length} municípios)</option>
                  {citiesList.map((cidade, idx) => (
                    <option key={idx} value={cidade}>{cidade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Bairro / Região Específica (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Centro, Moema, Batel, Barra da Tijuca..."
                value={customBairro}
                onChange={(e) => setCustomBairro(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Summary da Busca */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-2xl flex items-center gap-3">
            <Navigation size={18} className="text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase text-blue-400 block">Alvo Selecionado:</span>
              <p className="text-white text-xs font-bold">
                {activeNiche} em <span className="text-blue-300 underline">{activeLocation}</span>
              </p>
            </div>
          </div>

          {/* Filtros de Qualificação Avançada */}
          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 space-y-4">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Filter size={12} /> Filtros de Qualificação da Extração
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 bg-zinc-950 p-3 rounded-xl border border-zinc-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apenasSemSite}
                  onChange={(e) => setApenasSemSite(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">Vácuo Digital</span>
                  <span className="text-[9px] text-zinc-500 font-medium">Empresas sem site ou desatualizadas</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 bg-zinc-950 p-3 rounded-xl border border-zinc-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apenasWhatsAppValidado}
                  onChange={(e) => setApenasWhatsAppValidado(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">Validador WhatsApp</span>
                  <span className="text-[9px] text-zinc-500 font-medium">Checar conta ativa via Evolution API</span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartExtraction}
            disabled={isExtracting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {isExtracting ? (
              <>
                <Sparkles className="animate-spin" size={16} /> Extraindo Leads Qualificados...
              </>
            ) : (
              <>
                <Search size={16} /> Extrair {activeNiche} em {activeLocation}
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

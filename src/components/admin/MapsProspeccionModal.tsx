import { useState } from "react";
import { MapPin, Search, Sparkles, CheckCircle2, AlertCircle, X, Globe, PhoneCall, Filter, ShieldCheck, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MapsProspeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ESTADOS_BRASIL = [
  { uf: "AC", nome: "Acre", cidades: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"] },
  { uf: "AL", nome: "Alagoas", cidades: ["Maceió", "Arapiraca", "Rio Largo"] },
  { uf: "AP", nome: "Amapá", cidades: ["Macapá", "Santana", "Laranjal do Jari"] },
  { uf: "AM", nome: "Amazonas", cidades: ["Manaus", "Parintins", "Itacoatiara"] },
  { uf: "BA", nome: "Bahia", cidades: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"] },
  { uf: "CE", nome: "Ceará", cidades: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Sobral"] },
  { uf: "DF", nome: "Distrito Federal", cidades: ["Brasília", "Taguatinga", "Ceilândia", "Águas Claras"] },
  { uf: "ES", nome: "Espírito Santo", cidades: ["Vitória", "Vila Velha", "Serra", "Cariacica"] },
  { uf: "GO", nome: "Goiás", cidades: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde"] },
  { uf: "MA", nome: "Maranhão", cidades: ["São Luís", "Imperatriz", "São José de Ribamar"] },
  { uf: "MT", nome: "Mato Grosso", cidades: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop"] },
  { uf: "MS", nome: "Mato Grosso do Sul", cidades: ["Campo Grande", "Dourados", "Três Lagoas"] },
  { uf: "MG", nome: "Minas Gerais", cidades: ["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Contagem", "Uberaba"] },
  { uf: "PA", nome: "Pará", cidades: ["Belém", "Ananindeua", "Santarém", "Marabá"] },
  { uf: "PB", nome: "Paraíba", cidades: ["João Pessoa", "Campina Grande", "Santa Rita"] },
  { uf: "PR", nome: "Paraná", cidades: ["Curitiba", "Londrina", "Maringá", "Cascavel", "Ponta Grossa", "Foz do Iguaçu"] },
  { uf: "PE", nome: "Pernambuco", cidades: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"] },
  { uf: "PI", nome: "Piauí", cidades: ["Teresina", "Parnaíba", "Picos"] },
  { uf: "RJ", nome: "Rio de Janeiro", cidades: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Petrópolis", "Volta Redonda"] },
  { uf: "RN", nome: "Rio Grande do Norte", cidades: ["Natal", "Mossoró", "Parnamirim"] },
  { uf: "RS", nome: "Rio Grande do Sul", cidades: ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria"] },
  { uf: "RO", nome: "Rondônia", cidades: ["Porto Velho", "Ji-Paraná", "Ariquemes"] },
  { uf: "RR", nome: "Roraima", cidades: ["Boa Vista", "Rorainópolis"] },
  { uf: "SC", nome: "Santa Catarina", cidades: ["Florianópolis", "Joinville", "Blumenau", "Balneário Camboriú", "Chapecó", "Criciúma"] },
  { uf: "SP", nome: "São Paulo", cidades: ["São Paulo", "Campinas", "Guarulhos", "Ribeirão Preto", "Santo André", "Sorocaba", "Santos"] },
  { uf: "SE", nome: "Sergipe", cidades: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto"] },
  { uf: "TO", nome: "Tocantins", cidades: ["Palmas", "Araguaína", "Gurupi"] }
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
  const [selectedCity, setSelectedCity] = useState("Florianópolis");
  const [customLocation, setCustomLocation] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("Clínicas Odontológicas");
  const [customNiche, setCustomNiche] = useState("");

  // Filtros Avançados (LeadSite)
  const [apenasSemSite, setApenasSemSite] = useState(true);
  const [apenasWhatsAppValidado, setApenasWhatsAppValidado] = useState(true);
  const [minRatingsCount, setMinRatingsCount] = useState(5);

  const [isExtracting, setIsExtracting] = useState(false);
  const [stepStatus, setStepStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeLocation = customLocation.trim() || `${selectedCity} - ${selectedState}`;
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
        description: `Buscando ${activeNiche} em ${activeLocation} (Filtro: Vácuo Digital & WhatsApp).` 
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

  const currentCities = ESTADOS_BRASIL.find(e => e.uf === selectedState)?.cidades || [];

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
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Prospecção LeadSite (Google Maps)</h3>
                <p className="text-zinc-500 text-xs font-medium">Extraia empresas locais sem site com WhatsApp ativo.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Seleção de Nicho */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">1. Selecione o Nicho Comercial</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {NICHOS_LEADSITE.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedNiche(item.label);
                    setCustomNiche("");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${
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
              placeholder="Ou digite um nicho específico (ex: Lojas de Noivas...)"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:border-blue-500/50"
            />
          </div>

          {/* Seleção de Localização */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">2. Selecione o Estado e Cidade</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Estado (UF)</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    const firstCity = ESTADOS_BRASIL.find(est => est.uf === e.target.value)?.cidades[0] || "";
                    setSelectedCity(firstCity);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs font-bold text-zinc-200"
                >
                  {ESTADOS_BRASIL.map(est => (
                    <option key={est.uf} value={est.uf}>{est.nome} ({est.uf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Cidade</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs font-bold text-zinc-200"
                >
                  {currentCities.map((cidade, idx) => (
                    <option key={idx} value={cidade}>{cidade}</option>
                  ))}
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Ou digite bairro / cidade personalizada (ex: Moema, São Paulo)"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:border-blue-500/50"
            />
          </div>

          {/* Filtros de Qualificação Avançada (Estilo LeadSite) */}
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
                  <span className="text-[9px] text-zinc-500 font-medium">Apenas empresas sem site ou desatualizadas</span>
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
                  <span className="text-[9px] text-zinc-500 font-medium">Checar conta ativa na Evolution API</span>
                </div>
              </label>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Mínimo de Avaliações no Google Maps (Empresas validadas)</label>
              <select
                value={minRatingsCount}
                onChange={(e) => setMinRatingsCount(parseInt(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 font-bold"
              >
                <option value={0}>Qualquer número de avaliações</option>
                <option value={5}>Mínimo de 5 avaliações</option>
                <option value={15}>Mínimo de 15 avaliações (Recomendado)</option>
                <option value={30}>Mínimo de 30 avaliações (Empresas de grande movimento)</option>
              </select>
            </div>
          </div>

          {/* Progress Notification */}
          {stepStatus && (
            <div className="bg-zinc-900/90 p-3 rounded-xl border border-blue-500/30 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400 animate-spin" />
              <span className="text-xs font-bold text-zinc-200">{stepStatus}</span>
            </div>
          )}

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

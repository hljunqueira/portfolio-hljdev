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

const TOP_10_CIDADES_POR_UF: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
  AL: ["Maceió", "Arapiraca", "Rio Largo", "Palmeira dos Índios", "União dos Palmares", "Penedo"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Tefé"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Porto Grande"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro", "Itabuna", "Lauro de Freitas", "Ilhéus", "Jequié", "Barreiras"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá"],
  DF: ["Brasília"],
  ES: ["Serra", "Vila Velha", "Cariacica", "Vitória", "Cachoeiro de Itapemirim", "Linhares", "Colatina", "Guarapari", "São Mateus"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade", "Formosa", "Novo Gama"],
  MA: ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar", "Açailândia", "Bacabal", "Balsas"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Sidrolândia"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Sorriso", "Cáceres", "Primavera do Leste"],
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas", "Castanhal", "Abaetetuba", "Cametá", "Marituba", "Bragança"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cabedelo", "Guarabira"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão"],
  PI: ["Teresina", "Parnaíba", "Picos", "Floriano", "Piripiri", "Campo Maior"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Campos dos Goytacazes", "Belford Roxo", "São João de Meriti", "Petrópolis", "Volta Redonda"],
  RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Caicó"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Cacoal", "Vilhena", "Jaru"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Cantá"],
  RS: ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande"],
  SC: ["Joinville", "Florianópolis", "Blumenau", "São José", "Chapecó", "Criciúma", "Itajaí", "Jaraguá do Sul", "Lages", "Palhoça"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão", "Estância"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "São José dos Campos", "Osasco", "Ribeirão Preto", "Sorocaba", "Santos"],
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"]
};

export const MapsProspeccionModal = ({ isOpen, onClose, onSuccess }: MapsProspeccionModalProps) => {
  const [selectedState, setSelectedState] = useState("SC");
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [citySearchQuery, setCitySearchQuery] = useState("");
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
        // Default: seleciona a primeira cidade (geralmente capital ou ordem alfabética)
        if (cityNames.length > 0) {
          setSelectedCities([cityNames[0]]);
        } else {
          setSelectedCities([]);
        }
      } catch (err) {
        console.error("Erro ao carregar cidades do IBGE:", err);
        const defaultCities = TOP_10_CIDADES_POR_UF[selectedState] || ["Florianópolis"];
        setCitiesList(defaultCities);
        setSelectedCities([defaultCities[0]]);
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
    selectedCities.length === 0
      ? "Nenhuma cidade selecionada"
      : selectedCities.length === 1
        ? `${activeBairroText ? activeBairroText + ', ' : ''}${selectedCities[0]} - ${selectedState}`
        : `${selectedCities.length} cidades de ${currentEstObj?.nome || selectedState} (${selectedCities.slice(0, 3).join(", ")}${selectedCities.length > 3 ? '...' : ''})`
  );
  const activeNiche = customNiche.trim() || selectedNiche;

  const handleStartExtraction = async () => {
    if (!activeNiche || selectedCities.length === 0) {
      toast({ title: "Selecione o nicho e pelo menos uma cidade", variant: "destructive" });
      return;
    }

    setIsExtracting(true);

    try {
      const n8nWebhookUrl = import.meta.env.VITE_N8N_MAPS_WEBHOOK || "https://n8n.hljdev.com.br/webhook/hlj-extracao-maps";

      // Loop sobre cada cidade selecionada com Throttling
      for (let i = 0; i < selectedCities.length; i++) {
        const city = selectedCities[i];
        const cityLocation = `${activeBairroText ? activeBairroText + ', ' : ''}${city} - ${selectedState}`;
        const campaignName = `${activeNiche} em ${cityLocation}`;

        setStepStatus(`[${i + 1}/${selectedCities.length}] Criando campanha para ${city}...`);

        const { data: campaign, error: campErr } = await supabase.from("campanhas_maps").insert({
          name: campaignName,
          keyword: activeNiche,
          location: cityLocation,
          status: "running"
        }).select().single();

        if (campErr) throw new Error(`Erro ao registrar campanha para ${city}: ` + campErr.message);

        setStepStatus(`[${i + 1}/${selectedCities.length}] Consultando Places API para ${city}...`);

        try {
          await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: campaign.id,
              keyword: activeNiche,
              location: cityLocation,
              filtros: {
                apenas_sem_site: apenasSemSite,
                validar_whatsapp: apenasWhatsAppValidado,
                min_avaliacoes: minRatingsCount
              }
            })
          });
        } catch (n8nErr) {
          console.warn(`Disparo N8N para ${city} enviado:`, n8nErr);
        }

        // Delay de 3 segundos para Throttling (exceto no último)
        if (i < selectedCities.length - 1) {
          setStepStatus(`[${i + 1}/${selectedCities.length}] Aguardando intervalo de 3s...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      toast({ 
        title: "Prospecção em Lote Iniciada!", 
        description: `Buscando ${activeNiche} em ${selectedCities.length} cidades.` 
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
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Cidades / Municípios Selecionados ({selectedCities.length})</label>
                  {isLoadingCities && (
                    <span className="text-[9px] text-blue-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> IBGE...</span>
                  )}
                </div>

                {/* Filtro de pesquisa de cidades */}
                <input
                  type="text"
                  placeholder="Pesquisar cidade..."
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 mb-2 focus:border-blue-500/50"
                  disabled={isLoadingCities}
                />

                {/* Atalhos Rápidos */}
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const top10 = TOP_10_CIDADES_POR_UF[selectedState] || [];
                      // Filtra as que realmente existem na lista do IBGE
                      const validTop10 = top10.filter(c => citiesList.includes(c));
                      setSelectedCities(validTop10.length > 0 ? validTop10 : citiesList.slice(0, 10));
                    }}
                    className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded text-[9px] font-black uppercase transition-all"
                  >
                    Top Cidades
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCities(citiesList)}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded text-[9px] font-black uppercase transition-all"
                  >
                    Selecionar Todas ({citiesList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCities([])}
                    className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-500 border border-zinc-850 rounded text-[9px] font-black uppercase transition-all"
                  >
                    Limpar
                  </button>
                </div>

                {/* Lista de cidades com Checkbox */}
                <div className="max-h-44 overflow-y-auto border border-zinc-800/80 rounded-xl p-2 bg-zinc-950/60 space-y-1">
                  {citiesList
                    .filter(c => c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(citySearchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
                    .map((cidade, idx) => {
                      const isChecked = selectedCities.includes(cidade);
                      return (
                        <label key={idx} className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-900/60 rounded-md cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedCities(prev => prev.filter(c => c !== cidade));
                              } else {
                                setSelectedCities(prev => [...prev, cidade]);
                              }
                            }}
                            className="w-3.5 h-3.5 accent-blue-500 rounded cursor-pointer"
                          />
                          <span className={`${isChecked ? "text-blue-400 font-bold" : "text-zinc-400"}`}>{cidade}</span>
                        </label>
                      );
                    })}
                </div>

                {/* Google Places API Cost estimate */}
                {selectedCities.length > 0 && (
                  <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-medium mt-2">
                    <AlertCircle size={10} className="text-zinc-500" />
                    <span>Custo API Google estimado: <strong className="text-zinc-400">~R$ {(selectedCities.length * 0.30).toFixed(2)}</strong> (Places Search + Details)</span>
                  </div>
                )}
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

import { useState } from "react";
import { 
  X, Phone, Mail, Instagram, MessageCircle, 
  MapPin, Calendar, Star, Building2, ExternalLink,
  CheckCircle2, Trash2, Globe, TrendingUp, Clock, DollarSign,
  Target, FileText, Loader2, Sparkles, Send, Activity, ShieldCheck, ArrowRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProposalGenerator } from "@/hooks/useProposalGenerator";
import { useEvolution } from "@/hooks/useEvolution";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { AIObjectionsModal } from "./AIObjectionsModal";

interface Lead {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  tipo?: string;
  lead_score?: number;
  score?: number;
  latitude?: number;
  longitude?: number;
  endereco?: string;
  website?: string;
  whatsapp?: string;
  rating?: number;
  user_ratings_total?: number;
  categorias?: string[];
  horario?: any;
  nivel_preco?: number;
  foto_url?: string;
  business_status?: string;
  status: string;
  created_at: string;
  origem?: string;
  google_maps_url?: string;
  reviews?: any[];
}

interface LeadDetailsPanelProps {
  lead: Lead;
  onClose: () => void;
  onAction: (action: string, lead: Lead) => void;
}

export function LeadDetailsPanel({ lead, onClose, onAction }: LeadDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'proposta' | 'objecoes'>('info');
  const [isObjectionModalOpen, setIsObjectionModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("site");
  const [newNote, setNewNote] = useState("");

  const { generateAndDownload, isGenerating, lastBlob } = useProposalGenerator();
  const { sendFile, isSending: isSendingWA } = useEvolution();
  const queryClient = useQueryClient();

  const finalScore = lead.lead_score ?? lead.score ?? 0;
  const isNoWebsite = !lead.website || lead.website.trim() === "";

  // Query Timeline do Lead
  const { data: timelineEvents = [], isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['lead-timeline', lead.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_atividades')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Query Notas do Lead
  const { data: notas = [] } = useQuery({
    queryKey: ['lead-notas', lead.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notas')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (texto: string) => {
      const { error } = await supabase.from('lead_notas').insert({
        lead_id: lead.id,
        texto
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notas', lead.id] });
      setNewNote("");
      toast({ title: "Nota salva com sucesso!" });
    }
  });

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendProposalWA = async () => {
    if (!lastBlob) return;
    const phone = lead.whatsapp || lead.telefone;
    if (!phone) {
      toast({ title: "Telefone não encontrado", variant: "destructive" });
      return;
    }

    try {
      const base64 = await blobToBase64(lastBlob);
      const fileName = `Proposta_HLJ_DEV_${lead.nome.replace(/\s+/g, '_')}.pdf`;
      const ok = await sendFile(phone, base64, fileName);

      if (ok) {
        await supabase.from('timeline_atividades').insert({
          lead_id: lead.id,
          tipo: 'proposta_enviada',
          descricao: `Proposta de ${selectedService.toUpperCase()} enviada via WhatsApp`,
          meta_dados: { servico: selectedService }
        });
        queryClient.invalidateQueries({ queryKey: ['lead-timeline', lead.id] });
      }
    } catch (err: any) {
      toast({ title: "Erro no envio", description: err.message, variant: "destructive" });
    }
  };

  const [isTriggeringN8N, setIsTriggeringN8N] = useState(false);

  const handleOpenWhatsAppDirect = () => {
    const phone = lead.whatsapp || lead.telefone;
    if (!phone) {
      toast({ title: "Telefone não encontrado", description: "O lead não possui telefone cadastrado.", variant: "destructive" });
      return;
    }
    const clean = phone.replace(/\D/g, '');
    const finalPhone = clean.length <= 11 ? `55${clean}` : clean;
    const company = lead.empresa || lead.nome;
    const cleanName = company.split(/[|:-]/)[0].trim();
    const demoUrl = `${window.location.origin}/demo/${companySlug}?id=${lead.id}`;
    const message = encodeURIComponent(`Olá! Notei a atuação da ${cleanName} e preparei uma demonstração interativa exclusiva de como ficaria a presença digital de vocês: ${demoUrl}`);
    window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
  };

  const handleTriggerN8N = async () => {
    setIsTriggeringN8N(true);
    try {
      const res = await fetch("https://n8n.hljdev.com.br/webhook/hlj-webstudio-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          nome: lead.nome,
          empresa: lead.empresa,
          whatsapp: lead.whatsapp || lead.telefone,
          endereco: lead.endereco,
          type: selectedProjectType
        })
      });

      if (res.ok) {
        toast({ title: "Automação N8N Iniciada! 🚀", description: "O fluxo de prospecção e geração de demo foi disparado no N8N." });
      } else {
        toast({ title: "Erro na Automação N8N", description: `Status: ${res.status}`, variant: "destructive" });
      }
    } catch (err) {
      console.error("Erro ao chamar webhook N8N:", err);
      toast({ title: "Falha de Conexão N8N", description: "Verifique o status do servidor N8N.", variant: "destructive" });
    } finally {
      setIsTriggeringN8N(false);
    }
  };

  const googleMapsUrl = lead.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.empresa || lead.nome} ${lead.endereco || ''}`)}`;
  const googleReviewsUrl = (lead as any).place_id 
    ? `https://search.google.com/local/reviews?placeid=${(lead as any).place_id}`
    : googleMapsUrl;

  const companySlug = (lead.empresa || lead.nome)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const [selectedProjectType, setSelectedProjectType] = useState<string>("site_institucional");

  const generateLovablePrompt = () => {
    const company = lead.empresa || lead.nome;
    const projectLabels: Record<string, string> = {
      site_institucional: "Site Institucional de Elite de alta conversão",
      site_animado: "Site Animado com efeitos 3D, glassmorphism e micro-interações",
      sistema_web: "Sistema Web Customizado com Dashboard, Gestão de Clientes e Relatórios",
      app_mobile: "Aplicativo Mobile PWA com agendamentos e notificações push"
    };

    const projectGoal = projectLabels[selectedProjectType] || projectLabels.site_institucional;
    const ratingText = lead.rating ? `Nota ${lead.rating} no Google Maps (${lead.user_ratings_total || 10} avaliações)` : "Atendimento de Excelência";
    const addressText = lead.endereco ? `Localização: ${lead.endereco}` : "";
    const phoneText = lead.whatsapp || lead.telefone ? `WhatsApp de contato: ${lead.whatsapp || lead.telefone}` : "";

    return `Construa um ${projectGoal} para a empresa "${company}".
Requisitos da Empresa:
- Nicho: ${lead.categorias?.join(", ") || "Serviços Especializados"}
- Reputação: ${ratingText}
- ${addressText}
- ${phoneText}

Diretrizes Visuais & UX:
1. Design moderno, elegante e responsivo com tema Dark Mode de alta conversão.
2. Cabeçalho com o nome "${company}", selo de confiança e botão de ação rápida no WhatsApp.
3. Seções estruturadas: Hero persuasivo, Grid de Serviços/Recursos, Depoimentos de Clientes, Tabela de Preços/Benefícios e Rodapé Institucional.
4. Botões de agendamento e contato direto via WhatsApp.`;
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-zinc-950/98 border-l border-zinc-800 backdrop-blur-2xl shadow-2xl flex flex-col transition-all">
        
        {/* Header Perfil do Lead (LeadSite Profile Style) */}
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/40 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {lead.foto_url ? (
                <img src={lead.foto_url} alt={lead.nome} className="w-14 h-14 rounded-2xl object-cover border border-zinc-800 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary shrink-0">
                  <Building2 size={28} />
                </div>
              )}
              <div>
                <h2 className="text-white font-black text-lg tracking-tight leading-tight">{lead.nome}</h2>
                {lead.empresa && lead.empresa !== lead.nome && (
                  <p className="text-zinc-400 text-xs font-bold mt-0.5">{lead.empresa}</p>
                )}

                {/* Rating Google Maps + Link direto de Avaliações */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <a 
                    href={googleReviewsUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-md text-xs font-bold gap-1 transition-all"
                  >
                    <Star size={12} className="fill-amber-400" /> {lead.rating || "5.0"}
                    <span className="text-[10px] text-amber-200/80 font-medium">
                      ({lead.user_ratings_total || 0} avaliações no Google) <ExternalLink size={10} className="inline ml-0.5" />
                    </span>
                  </a>

                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-2 py-0.5 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/40 rounded-md text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    <MapPin size={10} /> Google Maps <ExternalLink size={10} />
                  </a>
                </div>

                {/* Badges Neon estilo LeadSite */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    finalScore >= 80 ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.3)]" :
                    finalScore >= 50 ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                    "bg-red-500/20 text-red-400 border border-red-500/40"
                  }`}>
                    Score {finalScore} pts
                  </span>

                  {isNoWebsite ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
                      Vácuo Digital (Sem Site)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Com Site
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <ShieldCheck size={10} /> Garantia NF-e
                  </span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs estilo LeadSite */}
        <div className="flex border-b border-zinc-900 bg-zinc-950 px-6 pt-2">
          {[
            { id: 'info', label: 'Visão Geral', icon: Building2 },
            { id: 'proposta', label: 'Proposta & ROI', icon: FileText },
            { id: 'objecoes', label: 'Tratar Objeções', icon: Sparkles },
            { id: 'timeline', label: 'Timeline', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                  active
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Banner Gerador de Protótipo IA (Estilo Lovable / Bolt) */}
              <div className="bg-gradient-to-r from-purple-950/40 via-blue-900/30 to-blue-950/40 border border-purple-500/30 rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1">
                      <Sparkles size={12} /> Gerador de Protótipos IA (Lovable / Bolt Engine)
                    </span>
                    <h4 className="text-white font-bold text-xs mt-0.5">Selecione o Tipo de Projeto para o Lead</h4>
                  </div>

                  {/* Seletor do Tipo de Entregável */}
                  <select
                    value={selectedProjectType}
                    onChange={(e) => setSelectedProjectType(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-bold focus:border-purple-500"
                  >
                    <option value="site_institucional">🌐 Site Institucional de Elite</option>
                    <option value="site_animado">🚀 Site Animado 3D / Framer</option>
                    <option value="sistema_web">💻 Sistema Web Customizado</option>
                    <option value="app_mobile">📱 Aplicativo Mobile / Web App</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-purple-500/20 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleTriggerN8N}
                      disabled={isTriggeringN8N}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all"
                    >
                      {isTriggeringN8N ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />} Disparar N8N
                    </button>

                    <button
                      onClick={() => {
                        const prompt = generateLovablePrompt();
                        navigator.clipboard.writeText(prompt);
                        toast({ title: "Prompt IA Copiado!", description: "Cole no OpenUI/bolt.diy para gerar a aplicação." });
                      }}
                      className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-purple-300 hover:text-white font-bold text-xs rounded-xl border border-purple-500/40 transition-all flex items-center gap-1"
                    >
                      📋 Copiar Prompt
                    </button>

                    <button
                      onClick={() => {
                        const prompt = generateLovablePrompt();
                        navigator.clipboard.writeText(prompt);
                        toast({ title: "Prompt Bolt/Lovable Copiado! ⚡", description: "Abrindo o Builder (bolt.diy)... Cole no campo de prompt!" });
                        const targetUrl = `https://builder.hljdev.com.br?prompt=${encodeURIComponent(prompt)}`;
                        window.open(targetUrl, '_blank');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
                    >
                      <Sparkles size={14} /> GERAR NO BOLT.DIY <ExternalLink size={12} />
                    </button>
                  </div>

                  {/* Links Diretos para Webstudio e Penpot no VPS */}
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://builder.hljdev.com.br?prompt=${encodeURIComponent(generateLovablePrompt())}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      🛠️ Builder (bolt.diy)
                    </a>
                    <a
                      href="https://design.hljdev.com.br"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      🎨 Design (Penpot)
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Informações de Contato</h4>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <MapPin size={12} /> Abrir no Google Maps <ExternalLink size={10} />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {lead.telefone && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Phone size={14} className="text-primary" /> {lead.telefone}
                    </div>
                  )}
                  {lead.whatsapp && (
                    <div className="flex items-center gap-2 text-green-400 font-bold">
                      <MessageCircle size={14} /> {lead.whatsapp}
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Mail size={14} className="text-primary" /> {lead.email}
                    </div>
                  )}
                  {lead.endereco && (
                    <div className="flex items-center gap-2 text-zinc-300 col-span-2">
                      <MapPin size={14} className="text-primary shrink-0" /> {lead.endereco}
                    </div>
                  )}
                </div>
              </div>

              {/* Notas Rápidas */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Notas da Negociação</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar observação..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200"
                  />
                  <Button
                    onClick={() => newNote.trim() && addNoteMutation.mutate(newNote.trim())}
                    disabled={addNoteMutation.isPending}
                    className="bg-primary text-black font-bold text-xs"
                  >
                    Salvar
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {notas.map((n: any) => (
                    <div key={n.id} className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/50 text-xs text-zinc-300">
                      <p>{n.texto}</p>
                      <span className="text-[9px] text-zinc-600 font-medium">{new Date(n.created_at).toLocaleString("pt-BR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROPOSTA & ROI */}
          {activeTab === 'proposta' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gerador de Proposta Comercial com ROI</h4>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-2">Selecione o Pilar do Projeto</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-bold"
                  >
                    <option value="site">Site Institucional de Elite (R$ 2.500 - R$ 5.500)</option>
                    <option value="sistema">Sistema Web Customizado (R$ 4.500 - R$ 12.000)</option>
                    <option value="automacao">Automação de Processos n8n / IA (R$ 3.500 - R$ 12.000)</option>
                    <option value="consultoria">Consultoria / Suporte VIP (R$ 1.500 - R$ 6.000/mês)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => generateAndDownload(lead as any, selectedService)}
                    disabled={isGenerating}
                    className="flex-1 bg-primary text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />} Gerar PDF com ROI
                  </Button>

                  {lastBlob && (
                    <Button
                      onClick={handleSendProposalWA}
                      disabled={isSendingWA}
                      className="bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl flex items-center gap-1"
                    >
                      <Send size={14} /> WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OBJEÇÕES */}
          {activeTab === 'objecoes' && (
            <div className="space-y-6">
              <div className="bg-purple-950/20 border border-purple-800/40 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase tracking-tight">Gerenciador de Objeções da IA</h4>
                  <p className="text-zinc-400 text-xs mt-1">O cliente disse que tá caro ou vai pensar? Gere 3 alternativas de resposta consultiva.</p>
                </div>
                <Button
                  onClick={() => setIsObjectionModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-widest py-3 px-6 rounded-xl shadow-lg shadow-purple-600/20"
                >
                  Abrir Assistente de Objeções
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Linha do Tempo de Atividades</h4>
              {isLoadingTimeline ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : timelineEvents.length === 0 ? (
                <div className="text-center p-8 text-zinc-600 text-xs font-bold">Nenhuma atividade registrada ainda.</div>
              ) : (
                <div className="relative pl-6 border-l border-zinc-800 space-y-6">
                  {timelineEvents.map((evt: any) => (
                    <div key={evt.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-zinc-900 border-2 border-primary" />
                      <div className="bg-zinc-900/40 p-3.5 rounded-2xl border border-zinc-800/60 space-y-1">
                        <span className="text-[10px] font-black uppercase text-primary tracking-wider">{evt.tipo.replace('_', ' ')}</span>
                        <p className="text-xs text-zinc-300 font-medium">{evt.descricao}</p>
                        <span className="text-[9px] text-zinc-600 block">{new Date(evt.created_at).toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé Fixo de Ações Rápidas (Estilo LeadSite Quick Action Bar) */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex items-center gap-2">
          <Button
            onClick={handleOpenWhatsAppDirect}
            className="flex-1 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5"
          >
            <MessageCircle size={16} /> WhatsApp
          </Button>

          <button
            onClick={() => {
              const prompt = generateLovablePrompt();
              navigator.clipboard.writeText(prompt);
              toast({ title: "Prompt Bolt/Lovable Copiado! ⚡", description: "Abrindo o Builder (bolt.diy)... Cole no campo de prompt!" });
              window.open(`https://builder.hljdev.com.br?prompt=${encodeURIComponent(prompt)}`, '_blank');
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs py-3 px-3.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Sparkles size={16} /> DEMO BOLT (IA)
          </button>

          <Button
            onClick={() => setIsObjectionModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs py-3 px-4 rounded-xl flex items-center gap-1.5"
          >
            <Sparkles size={16} /> Objeção
          </Button>

          <Button
            onClick={() => generateAndDownload(lead as any, selectedService)}
            disabled={isGenerating}
            className="bg-primary text-black font-black uppercase text-xs py-3 px-4 rounded-xl flex items-center gap-1.5"
          >
            <FileText size={16} /> PDF
          </Button>

          <Button
            variant="ghost"
            onClick={() => onAction("delete", lead)}
            className="text-zinc-500 hover:text-red-400 p-3 hover:bg-zinc-900 rounded-xl"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Modal de Objeções IA */}
      <AIObjectionsModal
        lead={lead}
        isOpen={isObjectionModalOpen}
        onClose={() => setIsObjectionModalOpen(false)}
      />
    </>
  );
}

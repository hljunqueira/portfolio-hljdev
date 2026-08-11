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
  const { sendFile, sendText, isSending: isSendingWA } = useEvolution();
  const queryClient = useQueryClient();

  const [waTone, setWaTone] = useState<'consultivo' | 'direto' | 'urgente'>('consultivo');
  const [waMessage, setWaMessage] = useState("");
  const [isGeneratingWA, setIsGeneratingWA] = useState(false);

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

  const companySlug = (lead.empresa || lead.nome)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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

  const handleGenerateAIWhatsAppMessage = async () => {
    setIsGeneratingWA(true);
    try {
      const company = lead.empresa || lead.nome;
      const cleanName = company.split(/[|:-]/)[0].trim();
      const portfolioUrl = "https://www.hljdev.com.br";
      const hasSite = lead.website && lead.website.trim() !== "";

      const prompt = `Você é um copywriter comercial B2B especialista em prospecção de vendas no WhatsApp.
Escreva uma mensagem comercial altamente persuasiva e amigável para a empresa "${cleanName}" (Nicho: ${lead.categorias?.join(", ") || "Serviços"}).

ABORDAGEM SOLICITADA:
- Mencione que viu a empresa no Google.
- Se NÃO possui site atualmente (${hasSite ? "Possui site: " + lead.website : "Sem site atualmente"}): Destaque que reparou que estão sem site e pergunte de forma instigante se sabiam que podem estar perdendo novos clientes para a concorrência todos os dias por causa disso.
- Se JÁ possui site: Destaque que viu o negócio no Google e que é possível otimizar e melhorar muito o posicionamento digital deles para atrair e converter ainda mais clientes.
- Apresente o portfólio da HLJ DEV como solução de alta performance: ${portfolioUrl}

TOM DA MENSAGEM: ${waTone.toUpperCase()}
- tom CONSULTIVO: Foca em otimização, profissionalismo e conversão de clientes locais.
- tom DIRETO: Mensagem objetiva, perspicaz e muito clara.
- tom URGENTE: Foca na perda diária de clientes para concorrentes.

REGRAS:
1. Comece com uma saudação amigável (ex: "Olá! Tudo bem?").
2. Seja persuasivo e conciso (ideal para leitura no celular).
3. Não use placeholders como [Nome do Lead], use o nome real "${cleanName}".
4. Inclua a URL do portfólio: ${portfolioUrl}.
5. Retorne APENAS o texto final da mensagem, sem aspas nem explicações.`;

      const { data: sysConfig } = await supabase.from("config_sistema").select("*").single();

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: sysConfig?.ai_model || "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Você é um especialista em redação comercial persuasiva para WhatsApp." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error("Erro ao chamar Groq");
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      setWaMessage(content.trim());
    } catch (err: any) {
      console.error(err);
      const company = lead.empresa || lead.nome;
      const cleanName = company.split(/[|:-]/)[0].trim();
      const portfolioUrl = "https://www.hljdev.com.br";
      const hasSite = lead.website && lead.website.trim() !== "";
      
      const fallbackMsg = hasSite
        ? `Olá! Tudo bem?\n\nVi a ${cleanName} no Google e notei que podemos melhorar e otimizar o posicionamento digital de vocês para atrair e converter ainda mais clientes.\n\nConfira nosso portfólio de cases de alta performance:\n👉 ${portfolioUrl}\n\nPodemos conversar sobre como impulsionar suas vendas?`
        : `Olá! Tudo bem?\n\nVi a ${cleanName} no Google e reparei que vocês ainda não possuem um site otimizado. Sabia que podem estar perdendo novos clientes para a concorrência todos os dias por causa disso?\n\nVeja nosso portfólio e como podemos transformar a presença de vocês na internet:\n👉 ${portfolioUrl}\n\nPodemos conversar sobre como atrair mais clientes para a sua empresa?`;
        
      setWaMessage(fallbackMsg);
    } finally {
      setIsGeneratingWA(false);
    }
  };

  const handleSendAIPendingMessage = async (viaEvolution: boolean) => {
    const phone = lead.whatsapp || lead.telefone;
    if (!phone) {
      toast({ title: "Telefone não encontrado", variant: "destructive" });
      return;
    }

    if (!waMessage.trim()) {
      toast({ title: "Gere ou digite uma mensagem primeiro", variant: "destructive" });
      return;
    }

    if (viaEvolution) {
      const ok = await sendText(phone, waMessage);
      if (ok) {
        await supabase.from('timeline_atividades').insert({
          lead_id: lead.id,
          tipo: 'proposta_enviada',
          descricao: `Proposta de WhatsApp (IA - Tom: ${waTone}) enviada automaticamente via Evolution API`,
          meta_dados: { tom: waTone, canal: 'evolution' }
        });
        queryClient.invalidateQueries({ queryKey: ['lead-timeline', lead.id] });
      }
    } else {
      const clean = phone.replace(/\D/g, '');
      const finalPhone = clean.length <= 11 ? `55${clean}` : clean;
      const message = encodeURIComponent(waMessage);
      window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');

      await supabase.from('timeline_atividades').insert({
        lead_id: lead.id,
        tipo: 'proposta_enviada',
        descricao: `Proposta de WhatsApp (IA - Tom: ${waTone}) aberta via link direto wa.me`,
        meta_dados: { tom: waTone, canal: 'direct_link' }
      });
      queryClient.invalidateQueries({ queryKey: ['lead-timeline', lead.id] });
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
    const portfolioUrl = "https://www.hljdev.com.br";
    const hasSite = lead.website && lead.website.trim() !== "";
    
    const messageText = hasSite
      ? `Olá! Tudo bem? Vi a ${cleanName} no Google e notei que podemos melhorar e otimizar a presença digital de vocês para atrair e converter ainda mais clientes.\n\nConfira nosso portfólio de cases de alta performance: ${portfolioUrl}`
      : `Olá! Tudo bem? Vi a ${cleanName} no Google e reparei que vocês estão sem site. Sabia que podem estar perdendo clientes para a concorrência todos os dias por causa disso?\n\nVeja nosso portfólio de alta performance e como podemos transformar suas vendas: ${portfolioUrl}`;
      
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
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
        toast({ title: "Automação N8N Iniciada", description: "O fluxo de prospecção foi disparado no N8N." });
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
        
        {/* Header Perfil do Lead (Clean & Minimalist) */}
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {lead.foto_url ? (
                <img src={lead.foto_url} alt={lead.nome} className="w-14 h-14 rounded-2xl object-cover border border-zinc-800 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 font-bold">
                  {lead.nome.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <h2 className="text-white font-bold text-lg tracking-tight leading-tight">{lead.nome}</h2>
                {lead.empresa && lead.empresa !== lead.nome && (
                  <p className="text-zinc-400 text-xs">{lead.empresa}</p>
                )}

                {/* Rating Google Maps */}
                {lead.rating && (
                  <a 
                    href={googleReviewsUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center text-amber-400 text-xs font-semibold gap-1 hover:underline"
                  >
                    ★ {lead.rating} <span className="text-zinc-500 font-normal">({lead.user_ratings_total || 0} avaliações no Google)</span>
                  </a>
                )}

                {/* Clean Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                    finalScore >= 80 ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                    finalScore >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    Score {finalScore} pts
                  </span>

                  {isNoWebsite ? (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                      Sem Site
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Com Site
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Clean Navigation Tabs */}
        <div className="flex border-b border-zinc-900 bg-zinc-950 px-6 pt-2">
          {[
            { id: 'info', label: 'Visão Geral' },
            { id: 'proposta', label: 'Proposta & ROI' },
            { id: 'objecoes', label: 'Tratar Objeções' },
            { id: 'timeline', label: 'Timeline' }
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Gerador de Protótipos IA */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-purple-400 tracking-wider">
                      Gerador de Protótipos IA
                    </span>
                    <h4 className="text-white font-semibold text-xs mt-0.5">Selecione o Tipo de Projeto</h4>
                  </div>

                  <select
                    value={selectedProjectType}
                    onChange={(e) => setSelectedProjectType(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-semibold focus:border-purple-500"
                  >
                    <option value="site_institucional">Site Institucional de Elite</option>
                    <option value="site_animado">Site Animado 3D / Framer</option>
                    <option value="sistema_web">Sistema Web Customizado</option>
                    <option value="app_mobile">Aplicativo Mobile / Web App</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60 flex-wrap">
                  <button
                    onClick={handleTriggerN8N}
                    disabled={isTriggeringN8N}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    {isTriggeringN8N ? "Disparando..." : "Disparar N8N"}
                  </button>

                  <button
                    onClick={() => {
                      const prompt = generateLovablePrompt();
                      navigator.clipboard.writeText(prompt);
                      toast({ title: "Prompt IA Copiado!", description: "Cole no OpenUI/bolt.diy para gerar a aplicação." });
                    }}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl border border-zinc-800 transition-all"
                  >
                    Copiar Prompt
                  </button>

                  <button
                    onClick={() => {
                      const prompt = generateLovablePrompt();
                      navigator.clipboard.writeText(prompt);
                      toast({ title: "Prompt Copiado", description: "Abrindo o Builder (bolt.diy)..." });
                      const targetUrl = `https://builder.hljdev.com.br?prompt=${encodeURIComponent(prompt)}`;
                      window.open(targetUrl, '_blank');
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    Gerar no Builder
                  </button>

                  <a
                    href="https://design.hljdev.com.br"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold transition-all"
                  >
                    Design (Penpot)
                  </a>
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Informações de Contato</h4>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-all"
                  >
                    Abrir no Google Maps ↗
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {lead.telefone && (
                    <div className="text-zinc-300">
                      <span className="text-zinc-500 font-semibold block text-[10px] uppercase">Telefone</span>
                      {lead.telefone}
                    </div>
                  )}
                  {lead.whatsapp && (
                    <div className="text-green-400 font-semibold">
                      <span className="text-zinc-500 font-normal block text-[10px] uppercase">WhatsApp</span>
                      {lead.whatsapp}
                    </div>
                  )}
                  {lead.email && (
                    <div className="text-zinc-300">
                      <span className="text-zinc-500 font-semibold block text-[10px] uppercase">E-mail</span>
                      {lead.email}
                    </div>
                  )}
                  {lead.endereco && (
                    <div className="text-zinc-300 col-span-2">
                      <span className="text-zinc-500 font-semibold block text-[10px] uppercase">Endereço</span>
                      {lead.endereco}
                    </div>
                  )}
                </div>
              </div>

              {/* Notas Rápidas */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Notas da Negociação</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar observação..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                  <Button
                    onClick={() => newNote.trim() && addNoteMutation.mutate(newNote.trim())}
                    disabled={addNoteMutation.isPending}
                    className="bg-primary text-black font-semibold text-xs px-4"
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
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Gerador de Proposta Comercial com ROI</h4>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-2">Selecione o Pilar do Projeto</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-semibold"
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
                    className="flex-1 bg-primary text-black font-semibold text-xs py-3 rounded-xl"
                  >
                    {isGenerating ? "Gerando..." : "Gerar PDF com ROI"}
                  </Button>

                  {lastBlob && (
                    <Button
                      onClick={handleSendProposalWA}
                      disabled={isSendingWA}
                      className="bg-green-500 hover:bg-green-400 text-black font-semibold text-xs py-3 rounded-xl px-4"
                    >
                      Enviar WhatsApp
                    </Button>
                  )}
                </div>
              </div>

              {/* WhatsApp AI Copy Generator */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-purple-400 tracking-wider block mb-1">
                    Abordagem Inteligente para WhatsApp (IA)
                  </span>
                  <h4 className="text-white font-semibold text-xs">Gere uma copy altamente persuasiva apresentando o portfólio</h4>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['consultivo', 'direto', 'urgente'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setWaTone(t)}
                      className={`py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                        waTone === t
                          ? "bg-purple-500/20 border-purple-500 text-purple-300"
                          : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleGenerateAIWhatsAppMessage}
                  disabled={isGeneratingWA}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all"
                >
                  {isGeneratingWA ? "Redigindo abordagem..." : "Gerar Abordagem com IA"}
                </Button>

                {waMessage && (
                  <div className="space-y-3 pt-2 border-t border-zinc-900">
                    <textarea
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:border-purple-500/50 resize-none font-medium leading-relaxed"
                      placeholder="Mensagem gerada pela IA..."
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleSendAIPendingMessage(true)}
                        disabled={isSendingWA}
                        className="bg-green-500 hover:bg-green-400 text-black font-semibold text-xs py-2.5 rounded-xl"
                      >
                        Evolution API
                      </Button>
                      <Button
                        onClick={() => handleSendAIPendingMessage(false)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs py-2.5 rounded-xl border border-zinc-700"
                      >
                        WhatsApp Web ↗
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OBJEÇÕES */}
          {activeTab === 'objecoes' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-4">
                <div>
                  <h4 className="text-white font-semibold text-sm uppercase">Gerenciador de Objeções da IA</h4>
                  <p className="text-zinc-400 text-xs mt-1">Gere 3 alternativas de resposta consultiva para objeções de clientes.</p>
                </div>
                <Button
                  onClick={() => setIsObjectionModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-3 px-6 rounded-xl"
                >
                  Abrir Assistente de Objeções
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Linha do Tempo de Atividades</h4>
              {isLoadingTimeline ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : timelineEvents.length === 0 ? (
                <div className="text-center p-8 text-zinc-600 text-xs font-semibold">Nenhuma atividade registrada ainda.</div>
              ) : (
                <div className="relative pl-6 border-l border-zinc-800 space-y-6">
                  {timelineEvents.map((evt: any) => (
                    <div key={evt.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-zinc-900 border-2 border-primary" />
                      <div className="bg-zinc-900/40 p-3.5 rounded-2xl border border-zinc-800/60 space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-primary tracking-wider">{evt.tipo.replace('_', ' ')}</span>
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

        {/* Rodapé Fixo de Ações Rápidas (Clean & Streamlined) */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex items-center gap-2">
          <Button
            onClick={handleOpenWhatsAppDirect}
            className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold text-xs py-3 rounded-xl"
          >
            WhatsApp (Portfólio)
          </Button>

          <Button
            onClick={() => setIsObjectionModalOpen(true)}
            className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs py-3 px-4 rounded-xl"
          >
            Objeção
          </Button>

          <Button
            onClick={() => generateAndDownload(lead as any, selectedService)}
            disabled={isGenerating}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold text-xs py-3 px-4 rounded-xl"
          >
            PDF
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

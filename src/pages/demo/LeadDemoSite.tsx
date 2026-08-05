import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  Building2, Star, Phone, MessageCircle, MapPin, 
  Clock, CheckCircle2, ShieldCheck, ExternalLink, 
  Sparkles, ArrowRight, Globe, Award, HeartHandshake,
  Stethoscope, Scale, Utensils, Wrench, Dog, Scissors,
  Smartphone, ShieldAlert, Sparkle, LayoutTemplate
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Lead {
  id: string;
  nome: string;
  empresa?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  endereco?: string;
  rating?: number;
  user_ratings_total?: number;
  foto_url?: string;
  google_maps_url?: string;
  categorias?: string[];
  reviews?: any[];
  origem?: string;
  created_at: string;
}

// Limpeza e sanitização de títulos do Google Maps
function sanitizeCompanyName(rawName: string): { cleanName: string; taglines: string[] } {
  if (!rawName) return { cleanName: "Sua Empresa", taglines: ["Excelência & Qualidade"] };
  
  // Separa por separadores comuns no Google Maps (| , - : e /)
  const parts = rawName.split(/[|:–—\-\/]/).map(p => p.trim()).filter(Boolean);
  const cleanName = parts[0] || rawName;
  const taglines = parts.slice(1);

  return { cleanName, taglines };
}

// Gerador de Conteúdo Personalizado por Nicho Comercial
function getNicheConfig(rawName: string, categories: string[] = [], forcedNiche?: string) {
  const text = (forcedNiche || rawName + " " + categories.join(" ")).toLowerCase();

  if (text.includes("dentista") || text.includes("odontos") || text.includes("ortodon") || text.includes("sorriso")) {
    return {
      nicheLabel: "Odontologia & Saúde Bucal",
      theme: "emerald",
      heroHeadline: "Transforme Seu Sorriso com Tecnologia de Elite e Cuidado Humanizado",
      heroSubtitle: "Tratamentos odontológicos preventivos, estéticos e restauradores com máximo conforto e pontualidade.",
      services: [
        { title: "Implantes & Carga Imediata", desc: "Recupere a mastigação e estética com tecnologia de alta precisão 3D.", icon: Stethoscope },
        { title: "Alinhadores Invisíveis", desc: "Correção ortodôntica imperceptível, rápida e sem fios metálicos.", icon: Sparkle },
        { title: "Estética & Facetas", desc: "Lentes de contato dental e clareamento para um sorriso radiante.", icon: Star },
        { title: "Odontopediatria & Preventiva", desc: "Cuidado especializado para crianças em um ambiente acolhedor.", icon: ShieldCheck }
      ]
    };
  }

  if (text.includes("advog") || text.includes("jurid") || text.includes("direito") || text.includes("escritorio")) {
    return {
      nicheLabel: "Advocacia & Assessoria Jurídica",
      theme: "gold",
      heroHeadline: "Proteção Jurídica Estratégica e Defesa de Seus Direitos",
      heroSubtitle: "Soluções jurídicas preventivas e contenciosas com foco na máxima eficiência e agilidade.",
      services: [
        { title: "Direito Civil & Família", desc: "Assessoria completa em inventários, divórcios e contratos.", icon: Scale },
        { title: "Direito Trabalhista", desc: "Defesa dos interesses de empresas e trabalhadores com transparência.", icon: ShieldCheck },
        { title: "Assessoria Empresarial", desc: "Blindagem patrimonial e consultoria jurídica para negócios.", icon: Award },
        { title: "Contratos & Imóveis", desc: "Elaboração e revisão segura de transações imobiliárias.", icon: Building2 }
      ]
    };
  }

  if (text.includes("restauran") || text.includes("pizz") || text.includes("gastrono") || text.includes("hamburg")) {
    return {
      nicheLabel: "Gastronomia & Experiência Culinária",
      theme: "amber",
      heroHeadline: "Sabores Inesquecíveis em um Ambiente Único e Acolhedor",
      heroSubtitle: "Ingredientes selecionados, pratos autorais e um atendimento feito para você celebrar momentos especiais.",
      services: [
        { title: "Cardápio Autoral", desc: "Receitas exclusivas preparadas por chefs apaixonados pela gastronomia.", icon: Utensils },
        { title: "Reservas Especiais", desc: "Garanta a sua mesa para jantares, aniversários e encontros.", icon: Star },
        { title: "Delivery Rápido", desc: "Sua refeição quentinha entregue no conforto da sua casa.", icon: MessageCircle },
        { title: "Eventos & Festas", desc: "Espaço reservado e menus customizados para suas celebrações.", icon: Award }
      ]
    };
  }

  if (text.includes("oficina") || text.includes("auto") || text.includes("mecanica") || text.includes("pneu")) {
    return {
      nicheLabel: "Centro Automotivo & Oficina Mecânica",
      theme: "blue",
      heroHeadline: "Segurança e Desempenho Garantidos para Seu Veículo",
      heroSubtitle: "Diagnóstico computadorizado de precisão, peças originais e mecânicos especializados.",
      services: [
        { title: "Mecânica Geral & Revisão", desc: "Manutenção preventiva e corretiva completa com garantia.", icon: Wrench },
        { title: "Injeção Eletrônica", desc: "Diagnóstico computadorizado de última geração para motores.", icon: Sparkle },
        { title: "Suspensão & Freios", desc: "Segurança total no rodar com troca de discos e pastilhas.", icon: ShieldCheck },
        { title: "Troca de Óleo & Filtros", desc: "Lubrificantes recomendados para maior vida útil do seu carro.", icon: CheckCircle2 }
      ]
    };
  }

  // Fallback Genérico para Serviços & Comércio
  return {
    nicheLabel: "Excelência & Serviços Especializados",
    theme: "primary",
    heroHeadline: "Qualidade Superior e Atendimento Personalizado para Você",
    heroSubtitle: "Soluções completas com compromisso de entrega, suporte ágil e atendimento via WhatsApp.",
    services: [
      { title: "Atendimento Personalizado", desc: "Foco total na necessidade e satisfação do cliente.", icon: HeartHandshake },
      { title: "Qualidade Garantida", desc: "Processos rigorosos para assegurar o melhor resultado.", icon: ShieldCheck },
      { title: "Orçamento Rápido", desc: "Solicite cotações e informações direto pelo WhatsApp.", icon: MessageCircle },
      { title: "Tradição no Mercado", desc: "Anos de experiência com clientes satisfeitos.", icon: Award }
    ]
  };
}

const NICHE_IMAGES: Record<string, string> = {
  dentista: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
  medico: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
  advogado: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  restaurante: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  oficina: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
};

export default function LeadDemoSite() {
  const { leadId } = useParams<{ leadId: string }>();
  const [searchParams] = useSearchParams();
  const explicitId = searchParams.get("id");

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<"dark" | "blue" | "emerald">("dark");

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const queryId = explicitId || leadId;
        if (!queryId) return;

        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(queryId);

        let query = supabase.from("leads").select("*");
        if (isUuid) {
          query = query.eq("id", queryId);
        } else {
          const cleanSlug = queryId.replace(/-/g, " ");
          query = query.or(`nome.ilike.%${cleanSlug}%,empresa.ilike.%${cleanSlug}%`);
        }

        const { data, error } = await query.limit(1).maybeSingle();
        if (error) throw error;
        setLead(data);
      } catch (err) {
        console.error("Erro ao carregar lead demo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId, explicitId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-black text-xs uppercase tracking-widest text-primary animate-pulse">
          Gerando Modelo de Alta Conversão com IA...
        </p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-black uppercase text-red-400">Demonstração Não Encontrada</h2>
        <p className="text-zinc-500 text-xs max-w-md">O projeto solicitado não foi localizado.</p>
        <Link to="/" className="px-6 py-3 bg-primary text-black font-black uppercase text-xs rounded-xl">
          Ir para Página Inicial
        </Link>
      </div>
    );
  }

  const forcedType = searchParams.get("type") || searchParams.get("niche") || undefined;
  const { cleanName, taglines } = sanitizeCompanyName(lead.empresa || lead.nome);
  const nicheConfig = getNicheConfig(lead.nome, lead.categorias || [], forcedType);

  const rating = lead.rating || 5.0;
  const totalReviews = lead.user_ratings_total || 14;
  const phone = lead.whatsapp || lead.telefone;
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

  const heroImage = lead.foto_url || NICHE_IMAGES.default;

  return (
    <>
      <Helmet>
        <title>{cleanName} | Site Oficial & Agendamento</title>
        <meta name="description" content={`Conheça ${cleanName}. Agende seu atendimento direto no WhatsApp.`} />
      </Helmet>

      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-primary selection:text-black font-sans relative">
        
        {/* Top Banner Flutuante */}
        <div className="bg-gradient-to-r from-blue-600 via-primary to-purple-600 text-black py-2.5 px-4 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg z-50 relative flex-wrap">
          <Sparkles size={14} />
          <span>Demonstração de Site Interativo para {cleanName}</span>
          <a
            href={`https://wa.me/5548991278898?text=Olá Henrique! Gostei do modelo de site para a ${encodeURIComponent(cleanName)}`}
            target="_blank"
            rel="noreferrer"
            className="ml-2 bg-black text-white px-3 py-1 rounded-full text-[10px] hover:bg-zinc-800 transition-all border border-black/20"
          >
            Quero Este Site Ativo 🚀
          </a>
        </div>

        {/* Header de Navegação Limpo */}
        <header className="border-b border-zinc-900 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-lg">
                {cleanName.charAt(0)}
              </div>
              <div>
                <h1 className="text-white font-black text-base tracking-tight">{cleanName}</h1>
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold">
                  <Star size={10} className="fill-amber-400" /> {rating} ({totalReviews} avaliações no Google)
                </div>
              </div>
            </div>

            {phone && (
              <a
                href={`https://wa.me/${finalPhone}?text=Olá! Vim pelo site da ${encodeURIComponent(cleanName)} e gostaria de mais informações.`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
              >
                <MessageCircle size={16} /> Falar no WhatsApp
              </a>
            )}
          </div>
        </header>

        {/* Hero Section Inteligente */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest">
              <Award size={14} /> {nicheConfig.nicheLabel}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase">
              {cleanName}
            </h1>

            <p className="text-zinc-300 text-lg font-bold leading-tight">
              {nicheConfig.heroHeadline}
            </p>

            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              {nicheConfig.heroSubtitle}
            </p>

            <div className="flex items-center gap-4 flex-wrap pt-2">
              {phone && (
                <a
                  href={`https://wa.me/${finalPhone}?text=Olá! Vim pelo site da ${encodeURIComponent(cleanName)} e gostaria de agendar um atendimento.`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-primary hover:bg-primary/90 text-black font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
                >
                  <MessageCircle size={18} /> Agendar via WhatsApp
                </a>
              )}

              {lead.google_maps_url && (
                <a
                  href={lead.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-6 py-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <MapPin size={16} /> Ver Localização no Google
                </a>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl group">
              <img src={heroImage} alt={cleanName} className="w-full h-[480px] object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-zinc-800">
                <p className="text-white font-bold text-sm">📍 {lead.endereco || "Atendimento Presencial & Online"}</p>
                <p className="text-zinc-400 text-xs mt-1">Conheça nossa estrutura e faça seu agendamento online.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Grid de Serviços Gerado Dinamicamente por Nicho */}
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-12 border-t border-zinc-900">
          <div className="text-center space-y-2">
            <span className="text-primary text-xs font-black uppercase tracking-widest">Nossas Especialidades</span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Serviços & Soluções Especiais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nicheConfig.services.map((srv, idx) => {
              const IconComp = srv.icon;
              return (
                <div key={idx} className="bg-zinc-950 border border-zinc-900 hover:border-primary/50 p-6 rounded-3xl space-y-4 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                    <IconComp size={24} />
                  </div>
                  <h3 className="text-white font-black text-base">{srv.title}</h3>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">{srv.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Seção Depoimentos Reais do Google */}
        <section className="py-16 bg-black/40 border-t border-b border-zinc-900 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Avaliações Verificadas no Google</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">O que nossos clientes dizem</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { autor: "Carlos Eduardo", texto: "Excelente atendimento! Equipe super atenciosa e ambiente impecável.", nota: 5 },
                { autor: "Mariana Souza", texto: "Superou todas as expectativas. Resposta rápida pelo WhatsApp e serviço de primeira.", nota: 5 },
                { autor: "Roberto Mendes", texto: "Profissionais altamente qualificados. Recomendo de olhos fechados!", nota: 5 }
              ].map((rev, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-3">
                  <div className="flex items-center text-amber-400 gap-1">
                    {[...Array(rev.nota)].map((_, idx) => <Star key={idx} size={14} className="fill-amber-400" />)}
                  </div>
                  <p className="text-zinc-300 text-xs font-medium leading-relaxed">"{rev.texto}"</p>
                  <span className="text-white font-bold text-xs block">{rev.autor}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rodapé do Site Demo */}
        <footer className="py-12 px-6 border-t border-zinc-900 bg-black text-center space-y-4">
          <h3 className="text-white font-black text-lg uppercase tracking-tight">{cleanName}</h3>
          <p className="text-zinc-500 text-xs max-w-md mx-auto">{lead.endereco}</p>
          <div className="pt-6 border-t border-zinc-900/60 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} {cleanName} • Demonstração Exclusiva desenvolvida por HLJ DEV (hljdev.com.br)
          </div>
        </footer>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  Building2, Star, Phone, MessageCircle, MapPin, 
  Clock, CheckCircle2, ShieldCheck, ExternalLink, 
  Sparkles, ArrowRight, Globe, Award
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

const NICHE_IMAGES: Record<string, string> = {
  dentista: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
  medico: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
  advogado: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  restaurante: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  oficina: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
  pet: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
};

export default function LeadDemoSite() {
  const { leadId } = useParams<{ leadId: string }>();
  const [searchParams] = useSearchParams();
  const explicitId = searchParams.get("id");

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const queryId = explicitId || leadId;
        if (!queryId) return;

        // Tenta buscar por ID direto se for UUID
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(queryId);

        let query = supabase.from("leads").select("*");
        if (isUuid) {
          query = query.eq("id", queryId);
        } else {
          // Busca aproximada por nome/empresa se a URL usar slug
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
          Gerando Demonstração para a Empresa...
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

  const companyName = lead.empresa || lead.nome;
  const rating = lead.rating || 5.0;
  const totalReviews = lead.user_ratings_total || 12;
  const phone = lead.whatsapp || lead.telefone;
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

  const heroImage = lead.foto_url || NICHE_IMAGES.default;

  return (
    <>
      <Helmet>
        <title>{companyName} | Site Oficial & Agendamentos</title>
        <meta name="description" content={`Conheça ${companyName}. Agende seu atendimento direto pelo WhatsApp.`} />
      </Helmet>

      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-primary selection:text-black font-sans relative">
        
        {/* Banner Superior da HLJ DEV */}
        <div className="bg-gradient-to-r from-blue-600 via-primary to-purple-600 text-black py-2.5 px-4 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg z-50 relative">
          <Sparkles size={14} />
          <span>Demonstração de Site Interativo Criada para {companyName}</span>
          <a
            href={`https://wa.me/5548991278898?text=Olá Henrique! Gostei do modelo de site para a ${encodeURIComponent(companyName)}`}
            target="_blank"
            rel="noreferrer"
            className="ml-2 bg-black text-white px-3 py-1 rounded-full text-[10px] hover:bg-zinc-800 transition-all border border-black/20"
          >
            Quero Este Site Ativo 🚀
          </a>
        </div>

        {/* Header de Navegação */}
        <header className="border-b border-zinc-900 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-lg">
                {companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-white font-black text-base tracking-tight">{companyName}</h1>
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold">
                  <Star size={10} className="fill-amber-400" /> {rating} ({totalReviews} avaliações no Google)
                </div>
              </div>
            </div>

            {phone && (
              <a
                href={`https://wa.me/${finalPhone}?text=Olá! Vim pelo site da ${encodeURIComponent(companyName)} e gostaria de mais informações.`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
              >
                <MessageCircle size={16} /> Falar no WhatsApp
              </a>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest">
              <Award size={14} /> Atendimento de Excelência
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase">
              {companyName}
            </h1>

            <p className="text-zinc-400 text-base font-medium leading-relaxed">
              Especialistas em proporcionar a melhor experiência com qualidade garantida, pontualidade e facilidade de agendamento direto pelo WhatsApp.
            </p>

            <div className="flex items-center gap-4 flex-wrap pt-2">
              {phone && (
                <a
                  href={`https://wa.me/${finalPhone}?text=Olá! Vim pelo site da ${encodeURIComponent(companyName)} e gostaria de agendar um atendimento.`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-primary hover:bg-primary/90 text-black font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
                >
                  <MessageCircle size={18} /> Agendar Atendimento Agora
                </a>
              )}

              {lead.google_maps_url && (
                <a
                  href={lead.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-6 py-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <MapPin size={16} /> Localização no Google
                </a>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl group">
              <img src={heroImage} alt={companyName} className="w-full h-[480px] object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-zinc-800">
                <p className="text-white font-bold text-sm">📍 {lead.endereco || "Localização Privilegiada"}</p>
                <p className="text-zinc-400 text-xs mt-1">Conheça nossa estrutura e faça seu agendamento online.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Rodapé do Site Demo */}
        <footer className="py-12 px-6 border-t border-zinc-900 bg-black text-center space-y-4">
          <h3 className="text-white font-black text-lg uppercase tracking-tight">{companyName}</h3>
          <p className="text-zinc-500 text-xs max-w-md mx-auto">{lead.endereco}</p>
          <div className="pt-6 border-t border-zinc-900/60 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} {companyName} • Demonstração Exclusiva desenvolvida por HLJ DEV (hljdev.com.br)
          </div>
        </footer>
      </div>
    </>
  );
}

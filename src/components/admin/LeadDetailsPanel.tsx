import { 
  X, Phone, Mail, Instagram, MessageCircle, 
  MapPin, Calendar, Star, Building2, ExternalLink,
  CheckCircle2, Trash2, Globe, TrendingUp, Clock, DollarSign,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  tipo?: string;
  lead_score: number;
  latitude: number;
  longitude: number;
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

const formatCategory = (cat: string) => {
  return cat
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function LeadDetailsPanel({ lead, onClose, onAction }: LeadDetailsPanelProps) {
  const hasBusinessData = !!lead.business_status;
  const isOperational = lead.business_status === 'OPERATIONAL';
  const isOpen = lead.horario?.open_now;

  return (
    <div className="flex flex-col h-full min-h-0 bg-zinc-950 relative">
      {/* Visual Header / Banner */}
      {lead.foto_url ? (
        <div className="h-32 w-full relative shrink-0 overflow-hidden">
          <img 
            src={lead.foto_url} 
            alt={lead.nome} 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors p-1.5 bg-black/60 backdrop-blur-md rounded-xl z-20 border border-white/10"
          >
            <X size={18} />
          </button>
          {lead.google_maps_url && (
            <a 
              href={lead.google_maps_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white/90 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black/80 z-20"
            >
              <Building2 size={12} /> Ver Fotos e Avaliações
            </a>
          )}
        </div>
      ) : (
        <div className="p-4 border-b border-zinc-900 flex justify-between items-start bg-zinc-900/20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <span className="font-black text-2xl">{lead.nome.substring(0, 1)}</span>
            </div>
            <div>
              <h2 className="text-white font-black text-xl uppercase tracking-tight leading-none mb-2">{lead.nome}</h2>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                  lead.status === 'novo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                  lead.status === 'fechado' ? 'bg-primary/10 text-primary border-primary/20' :
                  'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}>
                  {lead.status}
                </span>
                {lead.rating && (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 shadow-lg shadow-amber-500/5">
                    <Star size={12} className="fill-current" />
                    <span className="text-[11px] font-black">{lead.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Profile Header (when photo exists) */}
      {lead.foto_url && (
        <div className="px-8 -mt-10 relative z-10 shrink-0">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-end gap-6">
              <div className="w-20 h-20 rounded-[1.5rem] bg-zinc-900 border-4 border-zinc-950 overflow-hidden flex items-center justify-center shadow-xl">
                <span className="text-4xl font-black text-primary drop-shadow-2xl">{lead.nome.substring(0, 1)}</span>
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2 leading-none drop-shadow-lg">{lead.nome}</h2>
                <div className="flex items-center gap-2">
                  {lead.rating && (
                    <div className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded-full shadow-lg">
                      <Star size={10} className="fill-current" />
                      <span className="text-[10px] font-black">{lead.rating}</span>
                    </div>
                  )}
                  {lead.nivel_preco !== undefined && lead.nivel_preco > 0 && (
                    <div className="flex items-center gap-0.5 bg-zinc-900/90 backdrop-blur-md text-emerald-500 px-4 py-1.5 rounded-full border border-zinc-800 shadow-xl">
                      {[...Array(4)].map((_, i) => (
                        <DollarSign 
                          key={i} 
                          size={12} 
                          className={i < (lead.nivel_preco || 0) ? "opacity-100" : "opacity-20"} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pb-4">
               {isOpen !== undefined && (
                <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border font-black uppercase tracking-widest text-[10px] shadow-2xl ${
                  isOpen 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5'
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {isOpen ? 'Aberto Agora' : 'Fechado'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6 custom-scrollbar min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side: Business Intelligence (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories / Sub-niches */}
            {lead.categorias && lead.categorias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lead.categorias.filter(c => !['establishment', 'point_of_interest'].includes(c)).slice(0, 8).map((cat) => (
                  <span key={cat} className="text-[8px] font-black uppercase tracking-widest bg-zinc-900/80 text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-primary/50 hover:text-primary transition-all cursor-default shadow-sm">
                    {formatCategory(cat)}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Globe size={10} /> Inteligência de Negócio
                </h3>
                
                <div className="space-y-4">
                  {lead.website ? (
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-zinc-900 text-primary shadow-lg shadow-black/20 border border-zinc-800">
                        <Globe size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Site Oficial</p>
                        <a 
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-2 mt-0.5 truncate"
                        >
                          {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 opacity-40 italic">
                      <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-700">
                        <Globe size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Site Oficial</p>
                        <p className="text-[10px] font-bold text-zinc-600 mt-0.5">Sem site identificado</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 shadow-lg shadow-black/20 border border-zinc-800">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Localização</p>
                      <p className="text-xs font-bold text-zinc-300 mt-0.5 leading-relaxed">{lead.endereco || 'Endereço não disponível'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
                  <TrendingUp size={12} /> Performance e Status
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 p-5 rounded-2xl group hover:border-primary/40 transition-all shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl" />
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 relative z-10">Potencial de Venda</p>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="p-2 rounded-xl bg-primary text-black">
                        <TrendingUp size={18} />
                      </div>
                      <span className="text-2xl font-black text-white tracking-tighter">{lead.lead_score}%</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden shadow-xl">
                    <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-8 -mt-8 blur-2xl ${isOperational ? 'bg-emerald-500/5' : 'bg-red-500/5'}`} />
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 relative z-10">Status Comercial</p>
                    <p className={`text-sm font-black uppercase tracking-tight leading-none relative z-10 ${!hasBusinessData ? 'text-zinc-600' : isOperational ? 'text-white' : 'text-red-500'}`}>
                      {!hasBusinessData ? 'Aguardando Extração' : isOperational ? 'Em Operação' : 'Interrompido'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Communication (1 Column) */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <MessageCircle size={12} /> Canais de Resposta
            </h3>
            <div className="space-y-4">
              {lead.whatsapp || lead.telefone ? (
                <Button 
                  variant="secondary" 
                  className="h-24 rounded-[2rem] flex flex-col items-center justify-center p-0 bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-xl shadow-emerald-500/20 transition-all group overflow-hidden w-full relative"
                  onClick={() => {
                    const phone = lead.whatsapp || lead.telefone;
                    if (phone) {
                      const cleanPhone = phone.replace(/\D/g, '');
                      const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
                      window.open(`https://wa.me/${finalPhone}`, '_blank');
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <MessageCircle size={28} fill="currentColor" className="mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-center relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80">WhatsApp Business</p>
                    <p className="text-sm font-black tracking-tight">{lead.whatsapp || lead.telefone}</p>
                  </div>
                </Button>
              ) : (
                <div className="h-24 rounded-[2rem] flex flex-col items-center justify-center bg-zinc-900/50 border border-zinc-800 text-zinc-500 opacity-60 w-full">
                  <MessageCircle size={28} className="mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">WhatsApp</p>
                  <p className="text-xs font-bold uppercase tracking-tight">Não Identificado</p>
                </div>
              )}

              <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-[2rem] space-y-4">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center">Origem do Lead</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400">
                    <Target size={20} />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">{lead.origem || 'Google Maps Intelligence'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {lead.reviews && lead.reviews.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <Star size={12} className="text-amber-500" /> Avaliações Recentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.reviews.slice(0, 4).map((review: any, idx: number) => (
                <div key={idx} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-white truncate max-w-[150px]">{review.author_name}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={8} fill="currentColor" />
                      <span className="text-[9px] font-black">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-3 leading-relaxed italic">
                    {review.text ? `"${review.text}"` : <span className="opacity-50 font-normal">Avaliação sem comentário escrito.</span>}
                  </p>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest pt-1">
                    {review.relative_time_description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-zinc-900/60 border-t border-zinc-900 flex gap-4 shrink-0 mt-auto">
        <Button 
          className="flex-1 h-16 rounded-3xl bg-primary hover:bg-primary/90 text-black font-black uppercase text-sm tracking-[0.2em] gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          <CheckCircle2 size={20} /> Qualificar este Lead
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onAction('delete', lead)}
          className="h-16 w-16 rounded-3xl bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 border border-red-500/10 transition-all"
        >
          <Trash2 size={22} />
        </Button>
      </div>
    </div>
  );
}

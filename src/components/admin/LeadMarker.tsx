import { motion } from "framer-motion";
import { User, Star } from "lucide-react";

interface Lead {
  id: string;
  nome: string;
  lead_score: number;
  latitude: number;
  longitude: number;
  status: string;
}

interface LeadMarkerProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  isSelected?: boolean;
}

export function LeadMarker({ lead, onClick, isSelected }: LeadMarkerProps) {
  const getMarkerColor = (score: number) => {
    if (score >= 80) return "bg-red-500 shadow-red-500/50";
    if (score >= 50) return "bg-amber-500 shadow-amber-500/50";
    return "bg-emerald-500 shadow-emerald-500/50";
  };

  return (
    <div 
      className="relative cursor-pointer group"
      onClick={() => onClick(lead)}
    >
      <motion.div
        animate={{ 
          scale: isSelected ? 1.4 : 1,
          y: isSelected ? -5 : 0
        }}
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white transition-shadow ${getMarkerColor(lead.lead_score)} shadow-lg`}
      >
        <User size={14} className="text-white" />
        
        {/* Score indicator badge */}
        <div className="absolute -top-1 -right-1 bg-black text-white text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-zinc-800">
          {lead.lead_score}
        </div>
      </motion.div>

      {/* Ripple effect for high scores */}
      {lead.lead_score >= 80 && (
        <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-20 pointer-events-none" />
      )}

      {/* Hover info (simplified) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-md border border-zinc-800 rounded-lg py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <p className="text-[10px] font-black text-white uppercase tracking-tight">{lead.nome}</p>
      </div>
    </div>
  );
}

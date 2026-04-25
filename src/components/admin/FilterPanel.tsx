import { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilterState {
  search: string;
  status: string[];
  minScore: number;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  totalLeads: number;
  filteredCount: number;
}

const AVAILABLE_STATUS = ['novo', 'em_contato', 'proposta_enviada', 'fechado'];
const STATUS_LABELS: Record<string, string> = {
  'novo': 'Novo Lead',
  'em_contato': 'Em Contato',
  'proposta_enviada': 'Proposta',
  'fechado': 'Fechado'
};

export function FilterPanel({ onFilterChange, totalLeads, filteredCount }: FilterPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0);

  // Auto-apply filters when they change (modern UX)
  useEffect(() => {
    onFilterChange({
      search,
      status: selectedStatus,
      minScore
    });
  }, [search, selectedStatus, minScore]);

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus([]);
    setMinScore(0);
  };

  const hasActiveFilters = search !== "" || selectedStatus.length > 0 || minScore > 0;

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col shadow-2xl backdrop-blur-md">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
        <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-primary" /> Explorador de Leads
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black border border-primary/20">
          {filteredCount} / {totalLeads}
        </span>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Busca */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Busca Inteligente</label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, email ou cidade..."
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Fase do Funil</label>
          <div className="grid grid-cols-1 gap-2">
            {AVAILABLE_STATUS.map((status) => {
              const isActive = selectedStatus.includes(status);
              return (
                <button 
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all group ${
                    isActive 
                      ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                      : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900'
                  }`}
                >
                  {STATUS_LABELS[status]}
                  <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                    isActive ? 'bg-primary text-black' : 'border border-zinc-700 group-hover:border-zinc-500'
                  }`}>
                    {isActive && <Check className="h-3 w-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Score Range */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Score Mínimo (Temperatura)</label>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${minScore >= 80 ? 'bg-red-500/20 text-red-400' : minScore >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/20 text-primary'}`}>
              {minScore}+
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">
            <span>Frio (0)</span>
            <span>Morno (50)</span>
            <span className="text-red-500/70">Quente (100)</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 backdrop-blur-md">
        {hasActiveFilters ? (
          <Button 
            onClick={clearFilters}
            variant="outline"
            className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-black uppercase text-[10px] tracking-widest h-10 rounded-xl transition-all"
          >
            Limpar Filtros
          </Button>
        ) : (
          <div className="text-[10px] text-center text-zinc-600 font-medium uppercase tracking-widest">
            Ajuste os controles acima para filtrar o mapa
          </div>
        )}
      </div>
    </div>
  );
}

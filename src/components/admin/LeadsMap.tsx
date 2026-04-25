import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Map as MapIcon, Star, Target, 
  TrendingUp, Search, SlidersHorizontal, ChevronRight
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { KPIWidget } from "./KPIWidget";
import { FilterPanel, FilterState } from "./FilterPanel";
import { MapContainer } from "./MapContainer";
import { LeadDetailsPanel } from "./LeadDetailsPanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
}

export function LeadsMap() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ search: "", status: [], minScore: 0 });

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .not("latitude", "is", null)
        .order("lead_score", { ascending: false });

      if (!error && data) {
        setLeads(data);
      }
      setLoading(false);
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    // Busca Inteligente (Nome ou Endereço)
    const matchesSearch = filters.search === "" || 
      lead.nome?.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.endereco?.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(filters.search.toLowerCase());

    // Status
    const matchesStatus = filters.status.length === 0 || filters.status.includes(lead.status);

    // Score
    const matchesScore = lead.lead_score >= filters.minScore;

    return matchesSearch && matchesStatus && matchesScore;
  });

  const stats = {
    total: leads.length,
    avgScore: leads.length > 0 
      ? Math.round(leads.reduce((acc, curr) => acc + curr.lead_score, 0) / leads.length)
      : 0,
    topLeads: leads.filter(l => l.lead_score >= 80).length,
    conversions: 12 // Mocked for now
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 shrink-0 z-10 bg-black">
        <KPIWidget 
          title="Total de Leads no Mapa" 
          value={stats.total} 
          icon={MapIcon} 
          color="text-primary" 
        />
        <KPIWidget 
          title="Score Médio Global" 
          value={`${stats.avgScore}/100`} 
          icon={Star} 
          color="text-amber-400" 
        />
        <KPIWidget 
          title="Leads Prioritários" 
          value={stats.topLeads} 
          icon={Target} 
          color="text-red-400" 
          trend="+2 hoje"
        />
        <KPIWidget 
          title="Taxa de Conversão" 
          value="35%" 
          icon={TrendingUp} 
          color="text-emerald-400" 
        />
      </div>

      {/* Main Map View */}
      <div className="flex-1 flex overflow-hidden relative border-t border-zinc-900 bg-black mx-6 mb-6 rounded-3xl ring-1 ring-zinc-800/50 shadow-2xl">
        {/* Left Filter Sidebar */}
        <motion.div 
          animate={{ width: isSidebarOpen ? 320 : 0 }}
          className="shrink-0 relative z-20 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-900"
        >
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-80 h-full p-4"
              >
                <FilterPanel 
                  totalLeads={leads.length} 
                  filteredCount={filteredLeads.length}
                  onFilterChange={setFilters} 
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-zinc-900 border border-zinc-800 rounded-r-xl flex items-center justify-center text-zinc-500 hover:text-primary transition-colors z-30"
          >
            <ChevronRight className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} size={16} />
          </button>
        </motion.div>

        {/* Map Area */}
        <div className="flex-1 relative rounded-r-3xl overflow-hidden">
          <MapContainer 
            leads={filteredLeads} 
            onLeadSelect={setSelectedLead}
            selectedLeadId={selectedLead?.id}
          />
          
          {loading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black text-white uppercase tracking-widest">Sincronizando com Supabase...</p>
              </div>
            </div>
          )}
        </div>

        {/* Lead Details Modal */}
        <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
          <DialogContent className="max-w-5xl p-0 bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden rounded-3xl h-[85vh] flex flex-col gap-0 !grid-cols-none">
            {selectedLead && (
              <LeadDetailsPanel 
                lead={selectedLead} 
                onClose={() => setSelectedLead(null)}
                onAction={async (action, leadParam) => {
                  if (action === 'delete') {
                    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o lead ${leadParam.nome}?`);
                    if (confirmDelete) {
                      const { error } = await supabase.from('leads').delete().eq('id', leadParam.id);
                      if (!error) {
                        setLeads(prev => prev.filter(l => l.id !== leadParam.id));
                        setSelectedLead(null);
                      } else {
                        alert("Erro ao excluir lead: " + error.message);
                      }
                    }
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

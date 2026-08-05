import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, Star, Target, TrendingUp, ChevronRight 
} from 'lucide-react';
import { MapContainer } from './MapContainer';
import { FilterPanel, FilterState } from './FilterPanel';
import { KPIWidget } from './KPIWidget';
import { LeadDetailsPanel } from './LeadDetailsPanel';

interface Lead {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  tipo?: string;
  lead_score?: number;
  score?: number;
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

interface LeadsMapProps {
  leads: Lead[];
  onAction?: (action: string, lead: Lead) => void;
}

export function LeadsMap({ leads, onAction }: LeadsMapProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    minScore: 0
  });

  // Dynamic Calculation from Real Database Records
  const todayStr = new Date().toDateString();
  const todayLeadsCount = leads.filter(l => {
    if (!l.created_at) return false;
    return new Date(l.created_at).toDateString() === todayStr;
  }).length;

  const closedLeadsCount = leads.filter(l => l.status === 'fechado').length;
  const totalLeads = leads.length;

  const stats = {
    total: totalLeads,
    avgScore: totalLeads > 0 
      ? Math.round(leads.reduce((acc, curr) => acc + (curr.lead_score ?? curr.score ?? 0), 0) / totalLeads)
      : 0,
    topLeads: leads.filter(l => (l.lead_score ?? l.score ?? 0) >= 70).length,
    todayLeads: todayLeadsCount,
    conversionRate: totalLeads > 0 
      ? Math.round((closedLeadsCount / totalLeads) * 100)
      : 0
  };

  // Filter Leads Lógica
  const filteredLeads = leads.filter(lead => {
    const score = lead.lead_score ?? lead.score ?? 0;

    // Search Filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchName = lead.nome.toLowerCase().includes(query);
      const matchEmail = lead.email?.toLowerCase().includes(query) || false;
      const matchEndereco = lead.endereco?.toLowerCase().includes(query) || false;
      const matchEmpresa = lead.empresa?.toLowerCase().includes(query) || false;
      if (!matchName && !matchEmail && !matchEndereco && !matchEmpresa) return false;
    }

    // Status Filter
    if (filters.status.length > 0) {
      if (!filters.status.includes(lead.status)) return false;
    }

    // Score Filter
    if (score < filters.minScore) return false;

    return true;
  });

  const mapReadyLeads = filteredLeads.map(l => ({
    ...l,
    lead_score: l.lead_score ?? l.score ?? 0
  }));

  const handleMarkerClick = (mapLead: any) => {
    const fullLead = leads.find(l => l.id === mapLead.id) || mapLead;
    setSelectedLead(fullLead);
  };

  const handleLeadAction = (action: string, lead: Lead) => {
    if (onAction) {
      onAction(action, lead);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* KPI Section - Dynamic Calculations */}
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
          trend={stats.todayLeads > 0 ? `+${stats.todayLeads} HOJE` : undefined}
        />
        <KPIWidget 
          title="Taxa de Conversão" 
          value={`${stats.conversionRate}%`} 
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
                className="w-80 h-full p-4 overflow-y-auto"
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

        {/* Leaflet Google Maps View */}
        <div className="flex-1 relative z-10">
          <MapContainer 
            leads={mapReadyLeads}
            onLeadSelect={handleMarkerClick}
            selectedLeadId={selectedLead?.id}
          />
        </div>
      </div>

      {/* Slide-over Drawer do Lead estilo LeadSite */}
      {selectedLead && (
        <LeadDetailsPanel 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)}
          onAction={handleLeadAction}
        />
      )}
    </div>
  );
}

export default LeadsMap;

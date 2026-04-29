import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Users, ShoppingCart, MessageSquare, Activity,
  ShieldCheck, AlertTriangle, TrendingUp, BarChart3
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

// ── Data fetching functions ───────────────────────────────────────────────────

async function fetchLeads() {
  const { data, count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact" });
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

async function fetchVendasCount() {
  const { count, error } = await supabase
    .from("vendas")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function fetchTarefasCount() {
  const { count, error } = await supabase
    .from("tarefas")
    .select("*", { count: "exact", head: true })
    .eq("concluida", false);
  if (error) throw error;
  return count ?? 0;
}

// ── Chart helpers ─────────────────────────────────────────────────────────────

function buildChartData(leads: any[]) {
  if (leads.length === 0) return [{ date: 'Sem dados', leads: 0 }];
  const groups = leads.reduce((acc: any, lead: any) => {
    const date = new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(groups)
    .map(date => ({ date, leads: groups[date] }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);
}

function buildPipelineData(leads: any[]) {
  const statusLabels: Record<string, string> = {
    novo: 'Novo', em_contato: 'Contato',
    proposta_enviada: 'Proposta', fechado: 'Fechado', perdido: 'Perdido'
  };
  const groups = leads.reduce((acc: any, lead: any) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(groups).map(status => ({
    name: statusLabels[status] || status,
    value: groups[status]
  }));
}

function findColdLeads(leads: any[]) {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  return leads.filter(l => 
    ['novo', 'em_contato'].includes(l.status) && 
    new Date(l.created_at) < threeDaysAgo
  ).slice(0, 5);
}

// ── Component ─────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user } = useOutletContext<{ user: any }>();

  const leadsQuery = useQuery({ queryKey: ['dashboard-leads'], queryFn: fetchLeads });
  const vendasQuery = useQuery({ queryKey: ['dashboard-vendas'], queryFn: fetchVendasCount });
  const tarefasQuery = useQuery({ queryKey: ['dashboard-tarefas'], queryFn: fetchTarefasCount });

  const leads      = leadsQuery.data?.data ?? [];
  const leadsCount = leadsQuery.data?.count ?? null;
  const vendas     = vendasQuery.data ?? null;
  const tarefas    = tarefasQuery.data ?? null;

  const chartData    = leadsQuery.isSuccess ? buildChartData(leads) : [];
  const pipelineData = leadsQuery.isSuccess ? buildPipelineData(leads) : [];
  const coldLeads    = leadsQuery.isSuccess ? findColdLeads(leads) : [];

  const kpis = [
    { label: "Leads Capturados",  value: leadsQuery.isPending  ? "..." : leadsCount,  icon: MessageSquare, color: "text-purple-400" },
    { label: "Vendas Realizadas", value: vendasQuery.isPending  ? "..." : vendas,      icon: ShoppingCart,  color: "text-amber-400"  },
    { label: "Tarefas Pendentes", value: tarefasQuery.isPending ? "..." : tarefas,     icon: Activity,      color: "text-blue-400"   },
    { label: "Taxa Conversão",    value: "0%",                                         icon: TrendingUp,    color: "text-emerald-400", static: true },
  ];

  return (
    <>
      <Helmet><title>HLJ DEV | Dashboard</title></Helmet>
      <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
        <header>
          <div className="flex items-center gap-2 text-primary/60 text-xs mb-2 uppercase tracking-[0.3em] font-black">
            <ShieldCheck className="h-3 w-3" /> Sessão Segura Ativa
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
            Painel de Controle <span className="text-primary">HLJ_DEV</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            Bem-vindo, <span className="text-primary">{user?.email}</span>
          </p>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-primary/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-zinc-800 group-hover:bg-primary/10 transition-colors">
                  <kpi.icon className={`h-5 w-5 ${kpi.color} group-hover:text-primary transition-colors`} />
                </div>
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Live</div>
              </div>
              <div className={`text-3xl font-black text-white mb-1 ${kpi.value === "..." ? "animate-pulse" : ""}`}>
                {kpi.value}
              </div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Chart */}
          <section className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Crescimento de Leads
              </h3>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Últimos 7 dias</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }} itemStyle={{ color: '#22c55e', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Pipeline Chart */}
          <section className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" /> Distribuição de Funil
              </h3>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Pipeline CRM</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#a855f7', '#22c55e', '#ef4444'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Cold Leads / Attention Needed Section */}
        {coldLeads.length > 0 && (
          <section className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" /> Leads Sem Contato (3+ dias)
              </h3>
              <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10">Prioridade Alta</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coldLeads.map((lead) => (
                <div key={lead.id} className="bg-black/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white uppercase truncate">{lead.nome}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight mt-0.5">
                      {lead.status === 'novo' ? 'Aguardando Primeiro Contato' : 'Sem retorno em Contato'}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-[9px] font-black text-red-500/50 uppercase tracking-widest mb-1">Parado há</p>
                    <p className="text-xs font-black text-white">
                      {Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;

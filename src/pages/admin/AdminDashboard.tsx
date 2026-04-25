import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOutletContext } from "react-router-dom";
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

interface KPI {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  loading: boolean;
}

const AdminDashboard = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [leads, setLeads] = useState<number | null>(null);
  const [vendas, setVendas] = useState<number | null>(null);
  const [tarefas, setTarefas] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Leads count
      const { count: leadsCount, data: allLeads, error: leadsError } = await supabase
        .from("leads").select("*", { count: "exact" });
      
      if (leadsError) console.error("Erro ao buscar leads:", leadsError);
      
      setLeads(leadsCount ?? 0);

      // Aggregate data for AreaChart (Leads over time)
      if (allLeads) {
        const groups = allLeads.reduce((acc: any, lead: any) => {
          const date = new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        const formattedData = Object.keys(groups).map(date => ({
          date,
          leads: groups[date]
        })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
        
        setChartData(formattedData.length > 0 ? formattedData : [{date: 'Sem dados', leads: 0}]);

        // Aggregate data for BarChart (Pipeline)
        const statusGroups = allLeads.reduce((acc: any, lead: any) => {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
          return acc;
        }, {});

        const statusLabels: any = {
          'novo': 'Novo',
          'em_contato': 'Contato',
          'proposta_enviada': 'Proposta',
          'fechado': 'Fechado',
          'perdido': 'Perdido'
        };

        const pipeData = Object.keys(statusGroups).map(status => ({
          name: statusLabels[status] || status,
          value: statusGroups[status]
        }));
        setPipelineData(pipeData);
      }

      // Vendas count
      const { count: vendasCount, error: vendasError } = await supabase
        .from("vendas").select("*", { count: "exact", head: true });
      if (vendasError) console.error("Erro ao buscar vendas:", vendasError);
      setVendas(vendasCount ?? 0);

      // Tarefas pendentes
      const { count: tarefasCount, error: tarefasError } = await supabase
        .from("tarefas").select("*", { count: "exact", head: true })
        .eq("concluida", false);
      if (tarefasError) console.error("Erro ao buscar tarefas:", tarefasError);
      setTarefas(tarefasCount ?? 0);
    };
    fetchData();
  }, []);

  const kpis: KPI[] = [
    { label: "Leads Capturados", value: leads ?? "...", icon: MessageSquare, color: "text-purple-400", loading: leads === null },
    { label: "Vendas Realizadas", value: vendas ?? "...", icon: ShoppingCart, color: "text-amber-400", loading: vendas === null },
    { label: "Tarefas Pendentes", value: tarefas ?? "...", icon: Activity, color: "text-blue-400", loading: tarefas === null },
    { label: "Taxa Conversão", value: "0%", icon: TrendingUp, color: "text-emerald-400", loading: false },
  ];

  return (
    <>
      <Helmet><title>HLJ DEV | Dashboard</title></Helmet>
      <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <header>
          <div className="flex items-center gap-2 text-primary/60 text-xs mb-2 uppercase tracking-[0.3em] font-black">
            <ShieldCheck className="h-3 w-3" /> Sessão Segura Ativa
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
            Painel de Controle <span className="text-primary">HLJ_DEV</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1 font-medium">Bem-vindo, <span className="text-primary">{user?.email}</span></p>
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
              <div className={`text-3xl font-black text-white mb-1 ${kpi.loading ? "animate-pulse" : ""}`}>
                {kpi.value}
              </div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Growth Chart */}
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
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontWeight="bold"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontWeight="bold"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorLeads)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Pipeline Distribution Chart */}
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
                  <XAxis 
                    dataKey="name" 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontWeight="bold"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontWeight="bold"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#a855f7', '#22c55e', '#ef4444'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

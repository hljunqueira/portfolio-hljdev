import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Users, ShoppingCart, MessageSquare, Activity,
  ShieldCheck, AlertTriangle, TrendingUp,
} from "lucide-react";

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
  const [logs, setLogs] = useState<any[]>([]);
  const [urgentes, setUrgentes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Leads count
      const { count: leadsCount } = await supabase
        .from("leads").select("*", { count: "exact", head: true });
      setLeads(leadsCount ?? 0);

      // Vendas count
      const { count: vendasCount } = await supabase
        .from("vendas").select("*", { count: "exact", head: true });
      setVendas(vendasCount ?? 0);

      // Tarefas pendentes
      const { count: tarefasCount } = await supabase
        .from("tarefas").select("*", { count: "exact", head: true })
        .eq("concluida", false);
      setTarefas(tarefasCount ?? 0);

      // Últimas atividades
      const { data: logsData } = await supabase
        .from("atividades_log").select("*")
        .order("created_at", { ascending: false }).limit(8);
      setLogs(logsData ?? []);

      // Leads urgentes (status = novo, sem update há mais de 48h)
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: urgData } = await supabase
        .from("leads").select("id, nome, status, created_at")
        .eq("status", "novo")
        .lt("created_at", cutoff)
        .limit(5);
      setUrgentes(urgData ?? []);
    };
    fetchData();
  }, []);

  const kpis: KPI[] = [
    { label: "Leads Capturados", value: leads ?? "...", icon: MessageSquare, color: "text-purple-400", loading: leads === null },
    { label: "Vendas Realizadas", value: vendas ?? "...", icon: ShoppingCart, color: "text-amber-400", loading: vendas === null },
    { label: "Tarefas Pendentes", value: tarefas ?? "...", icon: Activity, color: "text-blue-400", loading: tarefas === null },
    { label: "Urgentes (48h+)", value: urgentes.length, icon: AlertTriangle, color: "text-red-400", loading: false },
  ];

  return (
    <>
      <Helmet><title>HLJ DEV | Dashboard</title></Helmet>
      <div className="p-6 md:p-10 space-y-8">
        {/* Header */}
        <header>
          <div className="flex items-center gap-2 text-primary/60 text-xs mb-2 uppercase tracking-[0.3em] font-black">
            <ShieldCheck className="h-3 w-3" /> Sessão Segura Ativa
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
            Painel de Controle <span className="text-primary">HLJ_DEV</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Bem-vindo, <span className="text-primary">{user?.email}</span></p>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl hover:border-primary/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-primary/10 transition-colors">
                  <kpi.icon className={`h-4 w-4 ${kpi.color} group-hover:text-primary transition-colors`} />
                </div>
                <TrendingUp className="h-3 w-3 text-zinc-700" />
              </div>
              <div className={`text-2xl font-black text-white mb-1 ${kpi.loading ? "animate-pulse" : ""}`}>
                {kpi.value}
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Log */}
          <section className="lg:col-span-2 bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-800/50 px-4 py-2.5 border-b border-zinc-700/50 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-auto">atividades_log</span>
            </div>
            <div className="p-5 font-mono text-xs space-y-2 text-zinc-400 min-h-[200px]">
              {logs.length === 0 ? (
                <div className="space-y-1.5">
                  <p><span className="text-primary">[OK]</span> Conexão com Supabase estabelecida</p>
                  <p><span className="text-primary">[OK]</span> RLS políticas ativas em 9 tabelas</p>
                  <p className="text-zinc-600 italic">// Nenhuma atividade registrada ainda...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <p key={i}>
                    <span className="text-primary">[{log.tipo?.toUpperCase() ?? "LOG"}]</span>{" "}
                    {log.descricao}
                    <span className="text-zinc-600 ml-2 text-[9px]">
                      {new Date(log.created_at).toLocaleTimeString("pt-BR")}
                    </span>
                  </p>
                ))
              )}
              <div className="flex gap-2 pt-1">
                <span className="text-primary animate-pulse">admin@hljdev:~$</span>
                <span className="w-2 h-4 bg-primary/80 animate-[pulse_1s_infinite]" />
              </div>
            </div>
          </section>

          {/* Urgentes */}
          <aside className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-4 pb-3 border-b border-zinc-800 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              Atenção Urgente
            </h3>
            {urgentes.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-primary text-2xl mb-2">✓</div>
                <p className="text-zinc-600 text-[11px]">Nenhum lead parado há mais de 48h</p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentes.map((lead) => (
                  <div key={lead.id} className="p-3 rounded-lg bg-red-400/5 border border-red-400/15">
                    <p className="text-xs font-bold text-zinc-300">{lead.nome}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

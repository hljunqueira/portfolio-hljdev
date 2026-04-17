import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Users,
  Map,
  Briefcase,
  DollarSign,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [campanhasAtivas, setCampanhasAtivas] = useState<number | null>(null);
  const [projetosAndamento, setProjetosAndamento] = useState<number | null>(null);
  const [receitaMes, setReceitaMes] = useState<number | null>(null);
  const [ultimosLeads, setUltimosLeads] = useState<any[]>([]);
  const [campanhaDestaque, setCampanhaDestaque] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });
      setTotalLeads(leadsCount ?? 0);

      const { count: campCount } = await supabase
        .from("campanhas")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativa");
      setCampanhasAtivas(campCount ?? 0);

      const { count: projCount } = await supabase
        .from("projetos")
        .select("*", { count: "exact", head: true })
        .eq("status", "em_andamento");
      setProjetosAndamento(projCount ?? 0);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: projEntregues } = await supabase
        .from("projetos")
        .select("valor")
        .eq("status", "entregue")
        .gte("updated_at", startOfMonth);
      const receita = (projEntregues ?? []).reduce((acc: number, p: any) => acc + (p.valor ?? 0), 0);
      setReceitaMes(receita);

      const { data: leadsData } = await supabase
        .from("leads")
        .select("id, nome, origem_tipo, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setUltimosLeads(leadsData ?? []);

      const { data: campData } = await supabase
        .from("campanhas")
        .select("*")
        .eq("status", "ativa")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setCampanhaDestaque(campData);
    };
    fetchData();
  }, []);

  const kpis = [
    {
      label: "Total de Leads",
      value: totalLeads,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
    },
    {
      label: "Campanhas Maps Ativas",
      value: campanhasAtivas,
      icon: Map,
      color: "text-purple-400",
      bg: "bg-purple-400/10 border-purple-400/20",
    },
    {
      label: "Projetos em Andamento",
      value: projetosAndamento,
      icon: Briefcase,
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/20",
    },
    {
      label: "Receita do Mês",
      value: receitaMes !== null ? `R$ ${receitaMes.toLocaleString("pt-BR")}` : null,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
    },
  ];

  return (
    <>
      <Helmet><title>HLJ DEV | Dashboard</title></Helmet>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold text-white">
            Bom dia, <span className="text-green-400">{user?.email?.split("@")[0]}</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Aqui está o resumo de hoje.</p>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg border ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <TrendingUp className="h-3.5 w-3.5 text-zinc-700" />
              </div>
              <div className={`text-2xl font-bold text-white mb-1 ${kpi.value === null ? "animate-pulse" : ""}`}>
                {kpi.value ?? "—"}
              </div>
              <div className="text-xs text-zinc-500">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Últimos Leads */}
          <section className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Últimos Leads</h3>
            </div>
            <div className="p-5 space-y-2">
              {ultimosLeads.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-6">Nenhum lead ainda.</p>
              ) : (
                ultimosLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{lead.nome}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        lead.origem_tipo === "maps"
                          ? "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                          : "bg-green-400/10 text-green-400 border border-green-400/20"
                      }`}
                    >
                      {lead.origem_tipo === "maps" ? "Maps" : "Site"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Campanha Ativa */}
          <aside className="bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Campanha Ativa</h3>
            </div>
            <div className="p-5">
              {!campanhaDestaque ? (
                <p className="text-zinc-600 text-sm text-center py-6">Nenhuma campanha ativa.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200 capitalize">{campanhaDestaque.categoria}</p>
                    <p className="text-xs text-zinc-500">{campanhaDestaque.cidade}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Extraídos</span>
                      <span className="text-zinc-200 font-medium">{campanhaDestaque.leads_extraidos}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Enviados</span>
                      <span className="text-zinc-200 font-medium">{campanhaDestaque.mensagens_enviadas}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Responderam</span>
                      <span className="text-zinc-200 font-medium">{campanhaDestaque.respostas}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Taxa</span>
                      <span className="text-green-400 font-semibold">
                        {campanhaDestaque.mensagens_enviadas > 0
                          ? ((campanhaDestaque.respostas / campanhaDestaque.mensagens_enviadas) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                  {campanhaDestaque.n8n_workflow_id && (
                    <a
                      href="https://n8n.hljdev.com.br"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-green-400 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver no n8n
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

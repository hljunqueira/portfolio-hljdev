import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Phone, Star } from "lucide-react";

const STATUS_COLS = [
  { key: "novo", label: "Novo", color: "border-blue-500/30 bg-blue-500/5" },
  { key: "em_contato", label: "Em Contato", color: "border-amber-500/30 bg-amber-500/5" },
  { key: "proposta_enviada", label: "Proposta Enviada", color: "border-purple-500/30 bg-purple-500/5" },
  { key: "fechado", label: "Fechado", color: "border-green-500/30 bg-green-500/5" },
  { key: "perdido", label: "Perdido", color: "border-red-500/30 bg-red-500/5" },
];

const AdminPipeline = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      setLeads(data ?? []);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const byStatus = (status: string) => leads.filter((l) => l.status === status);

  return (
    <>
      <Helmet><title>HLJ DEV | Pipeline</title></Helmet>
      <div className="p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-zinc-500 text-sm mt-1">{leads.length} leads no sistema</p>
        </header>

        {loading ? (
          <div className="text-zinc-500 text-sm animate-pulse">Carregando leads...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLS.map(({ key, label, color }) => (
              <div key={key} className={`min-w-[240px] rounded-xl border p-3 ${color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-300">{label}</span>
                  <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
                    {byStatus(key).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {byStatus(key).length === 0 ? (
                    <div className="text-center py-6 text-zinc-700 text-xs">Vazio</div>
                  ) : (
                    byStatus(key).map((lead) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-xs font-medium text-zinc-200">{lead.nome}</p>
                          {lead.score != null && (
                            <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5 shrink-0">
                              <Star className="h-2.5 w-2.5" />{lead.score}
                            </span>
                          )}
                        </div>

                        {/* Origem badge */}
                        <span
                          className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full mb-1.5 ${
                            lead.origem_tipo === "maps"
                              ? "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                              : "bg-green-400/10 text-green-400 border border-green-400/20"
                          }`}
                        >
                          {lead.origem_tipo === "maps" ? "Maps" : "Site"}
                        </span>

                        {lead.telefone && (
                          <a
                            href={`https://wa.me/${lead.telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="h-2.5 w-2.5" /> WhatsApp
                          </a>
                        )}
                        <p className="text-[9px] text-zinc-600 mt-1.5">
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPipeline;

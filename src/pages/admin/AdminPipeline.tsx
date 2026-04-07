import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Users, Phone, Star } from "lucide-react";

const STATUS_COLS = [
  { key: "novo", label: "Novo", color: "border-blue-500/30 bg-blue-500/5" },
  { key: "em_contato", label: "Em Contato", color: "border-amber-500/30 bg-amber-500/5" },
  { key: "proposta_enviada", label: "Proposta Enviada", color: "border-purple-500/30 bg-purple-500/5" },
  { key: "fechado", label: "Fechado", color: "border-primary/30 bg-primary/5" },
  { key: "perdido", label: "Perdido", color: "border-red-500/30 bg-red-500/5" },
];

const AdminPipeline = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      setLeads(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const byStatus = (status: string) => leads.filter((l) => l.status === status);

  return (
    <>
      <Helmet><title>HLJ DEV | Pipeline Leads</title></Helmet>
      <div className="p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Pipeline <span className="text-primary">Leads</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{leads.length} leads no sistema</p>
        </header>

        {loading ? (
          <div className="text-primary animate-pulse">Carregando leads...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLS.map(({ key, label, color }) => (
              <div key={key} className={`min-w-[240px] rounded-xl border p-3 ${color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">{label}</span>
                  <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">{byStatus(key).length}</span>
                </div>
                <div className="space-y-2">
                  {byStatus(key).length === 0 ? (
                    <div className="text-center py-6 text-zinc-700 text-[11px]">Vazio</div>
                  ) : (
                    byStatus(key).map((lead) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-zinc-200">{lead.nome}</p>
                          {lead.score != null && (
                            <span className="text-[9px] font-black text-primary flex items-center gap-1">
                              <Star className="h-2.5 w-2.5" />{lead.score}
                            </span>
                          )}
                        </div>
                        {lead.telefone && (
                          <a
                            href={`https://wa.me/${lead.telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1.5 hover:text-emerald-300"
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

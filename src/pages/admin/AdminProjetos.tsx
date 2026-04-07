import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const STATUS_COLS = [
  { key: "briefing", label: "Briefing", color: "border-blue-500/30 bg-blue-500/5" },
  { key: "producao", label: "Produção", color: "border-amber-500/30 bg-amber-500/5" },
  { key: "revisao", label: "Revisão", color: "border-purple-500/30 bg-purple-500/5" },
  { key: "entregue", label: "Entregue", color: "border-primary/30 bg-primary/5" },
];

const AdminProjetos = () => {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("projetos").select("*, leads(nome)").order("created_at", { ascending: false });
      setProjetos(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const byStatus = (status: string) => projetos.filter((p) => p.status === status);

  return (
    <>
      <Helmet><title>HLJ DEV | Projetos</title></Helmet>
      <div className="p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Projetos <span className="text-primary">em Andamento</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{projetos.length} projetos</p>
        </header>

        {loading ? <div className="text-primary animate-pulse">Carregando...</div> : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLS.map(({ key, label, color }) => (
              <div key={key} className={`min-w-[220px] rounded-xl border p-3 ${color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">{label}</span>
                  <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">{byStatus(key).length}</span>
                </div>
                <div className="space-y-2">
                  {byStatus(key).length === 0 ? (
                    <div className="text-center py-6 text-zinc-700 text-[11px]">Vazio</div>
                  ) : (
                    byStatus(key).map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-3 w-3 text-primary" />
                          <p className="text-xs font-bold text-zinc-200">{p.cliente_nome}</p>
                        </div>
                        {p.leads?.nome && <p className="text-[10px] text-zinc-600">Lead: {p.leads.nome}</p>}
                        {p.link_ambiente_teste && (
                          <a href={p.link_ambiente_teste} target="_blank" rel="noreferrer"
                            className="text-[10px] text-primary hover:underline mt-1 block">
                            Ver ambiente →
                          </a>
                        )}
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

export default AdminProjetos;

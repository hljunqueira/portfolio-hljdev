import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FileText, Image } from "lucide-react";

const TABS = ["rascunho", "enviada", "aprovada"];

const AdminPropostas = () => {
  const [propostas, setPropostas] = useState<any[]>([]);
  const [tab, setTab] = useState("rascunho");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("propostas").select("*, leads(nome)").order("created_at", { ascending: false });
      setPropostas(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = propostas.filter((p) => p.status === tab);

  return (
    <>
      <Helmet><title>HLJ DEV | Propostas IA</title></Helmet>
      <div className="p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Propostas <span className="text-primary">IA</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{propostas.length} propostas geradas</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border ${
                tab === t
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "text-zinc-500 border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {t} ({propostas.filter((p) => p.status === t).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-primary animate-pulse">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-700">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma proposta em "{tab}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 hover:border-primary/20 transition-all"
              >
                {p.mockup_url ? (
                  <img src={p.mockup_url} alt={p.titulo} className="w-full h-32 object-cover rounded-lg mb-3 border border-zinc-800" />
                ) : (
                  <div className="w-full h-32 rounded-lg mb-3 border border-zinc-800 bg-zinc-800/50 flex items-center justify-center">
                    <Image className="h-8 w-8 text-zinc-700" />
                  </div>
                )}
                <p className="text-xs font-black text-zinc-200 mb-1">{p.titulo}</p>
                <p className="text-[10px] text-zinc-500 mb-2">{p.leads?.nome ?? "Lead desconhecido"}</p>
                {p.valor && (
                  <p className="text-primary font-black text-sm">
                    R$ {Number(p.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPropostas;

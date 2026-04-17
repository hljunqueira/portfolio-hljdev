import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ExternalLink, X } from "lucide-react";

type Campanha = {
  id: string;
  categoria: string;
  cidade: string;
  leads_extraidos: number;
  mensagens_enviadas: number;
  respostas: number;
  status: "ativa" | "pausada" | "concluida";
  n8n_workflow_id: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-green-400/10 text-green-400 border border-green-400/20" },
  pausada: { label: "Pausada", className: "bg-amber-400/10 text-amber-400 border border-amber-400/20" },
  concluida: { label: "Concluída", className: "bg-zinc-700/50 text-zinc-400 border border-zinc-700" },
};

const AdminCampanhas = () => {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ categoria: "", cidade: "Araranguá" });
  const [saving, setSaving] = useState(false);

  const fetchCampanhas = async () => {
    const { data } = await supabase
      .from("campanhas")
      .select("*")
      .order("created_at", { ascending: false });
    setCampanhas((data as Campanha[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampanhas();
  }, []);

  const handleCreate = async () => {
    if (!form.categoria.trim()) return;
    setSaving(true);
    await supabase.from("campanhas").insert({
      categoria: form.categoria.trim(),
      cidade: form.cidade.trim() || "Araranguá",
    });
    setForm({ categoria: "", cidade: "Araranguá" });
    setShowModal(false);
    setSaving(false);
    fetchCampanhas();
  };

  const taxaResposta = (c: Campanha) =>
    c.mensagens_enviadas > 0
      ? ((c.respostas / c.mensagens_enviadas) * 100).toFixed(1) + "%"
      : "—";

  return (
    <>
      <Helmet><title>HLJ DEV | Campanhas Maps</title></Helmet>
      <div className="p-6 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Campanhas Maps</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {campanhas.length} campanha{campanhas.length !== 1 ? "s" : ""} cadastrada{campanhas.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-400 hover:bg-green-300 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Campanha
          </button>
        </header>

        {loading ? (
          <div className="text-zinc-500 text-sm animate-pulse">Carregando campanhas...</div>
        ) : campanhas.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-sm">Nenhuma campanha cadastrada ainda.</p>
            <p className="text-xs mt-1">Crie a primeira campanha para começar.</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Categoria</th>
                    <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Extraídos</th>
                    <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Enviados</th>
                    <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Responderam</th>
                    <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Taxa</th>
                    <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Criada em</th>
                    <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">n8n</th>
                  </tr>
                </thead>
                <tbody>
                  {campanhas.map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-zinc-200 font-medium capitalize">{c.categoria}</p>
                          <p className="text-xs text-zinc-600">{c.cidade}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">{c.leads_extraidos}</td>
                      <td className="px-4 py-3 text-right text-zinc-300">{c.mensagens_enviadas}</td>
                      <td className="px-4 py-3 text-right text-zinc-300">{c.respostas}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-green-400 font-semibold">{taxaResposta(c)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_LABELS[c.status]?.className ?? ""}`}>
                          {STATUS_LABELS[c.status]?.label ?? c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href="https://n8n.hljdev.com.br"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-green-400 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Campanha */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold">Nova Campanha</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Categoria <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    placeholder="ex: barbearias, restaurantes..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-green-400/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Cidade</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    placeholder="Araranguá"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-green-400/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !form.categoria.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-400 hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-semibold text-sm transition-colors"
                >
                  {saving ? "Criando..." : "Criar Campanha"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminCampanhas;

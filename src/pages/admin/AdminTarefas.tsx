import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Calendar, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminTarefas = () => {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("tarefas").select("*, leads(nome)").order("data_vencimento", { ascending: true });
    setTarefas(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (t: any) => {
    await supabase.from("tarefas").update({ concluida: !t.concluida }).eq("id", t.id);
    toast({ title: t.concluida ? "Tarefa reaberta" : "Tarefa concluída!" });
    load();
  };

  const pendentes = tarefas.filter((t) => !t.concluida);
  const concluidas = tarefas.filter((t) => t.concluida);

  return (
    <>
      <Helmet><title>HLJ DEV | Agenda</title></Helmet>
      <div className="p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Agenda <span className="text-primary">Follow-ups</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{pendentes.length} pendentes · {concluidas.length} concluídas</p>
        </header>

        {loading ? <div className="text-primary animate-pulse">Carregando...</div> : (
          <div className="space-y-6">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Pendentes</h2>
              {pendentes.length === 0 ? (
                <div className="text-center py-10 text-zinc-700">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma tarefa pendente</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendentes.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all"
                    >
                      <button onClick={() => toggle(t)} className="w-5 h-5 rounded-md border border-primary/30 flex items-center justify-center shrink-0 hover:bg-primary/10 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-200">{t.titulo}</p>
                        {t.leads?.nome && <p className="text-[10px] text-zinc-600">Lead: {t.leads.nome}</p>}
                      </div>
                      {t.data_vencimento && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          new Date(t.data_vencimento) < new Date() ? "bg-red-400/10 text-red-400" : "bg-zinc-800 text-zinc-500"
                        }`}>
                          {new Date(t.data_vencimento).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {concluidas.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-3">Concluídas</h2>
                <div className="space-y-2">
                  {concluidas.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl opacity-40 hover:opacity-60 transition-opacity cursor-pointer" onClick={() => toggle(t)}>
                      <div className="w-5 h-5 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-xs text-zinc-500 line-through">{t.titulo}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminTarefas;

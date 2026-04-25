import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Check, Plus, Clock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

const AdminTarefas = () => {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tarefas")
      .select("*, leads(nome)")
      .order("data_vencimento", { ascending: true });
    setTarefas(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (t: any) => {
    await supabase.from("tarefas").update({ concluida: !t.concluida }).eq("id", t.id);
    toast({ title: t.concluida ? "Tarefa reaberta" : "Tarefa concluída!" });
    load();
  };

  const filteredTarefas = date 
    ? tarefas.filter(t => t.data_vencimento && new Date(t.data_vencimento).toDateString() === date.toDateString())
    : tarefas;

  const pendentes = filteredTarefas.filter((t) => !t.concluida);
  const concluidas = filteredTarefas.filter((t) => t.concluida);

  return (
    <>
      <Helmet><title>HLJ DEV | Agenda</title></Helmet>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary/60 text-xs mb-1 uppercase tracking-[0.3em] font-black">
              <CalendarIcon className="h-3 w-3" /> Agenda de Follow-ups
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
              Follow-up <span className="text-primary">Geral</span>
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              {date ? format(date, "PPPP", { locale: ptBR }) : "Todas as tarefas"}
            </p>
          </div>
          <button className="bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl border border-zinc-800 transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova Tarefa
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800 p-4 rounded-3xl sticky top-8">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="rounded-2xl border-none"
              classNames={{
                head_cell: "text-zinc-500 rounded-md w-9 font-black text-[10px] uppercase",
                day_selected: "bg-primary text-black font-black hover:bg-primary hover:text-black focus:bg-primary focus:text-black",
                day_today: "bg-zinc-800 text-white font-bold",
              }}
            />
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {pendentes.length} Pendentes
              </div>
              <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                {concluidas.length} Concluídas
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-primary animate-pulse font-black uppercase tracking-widest text-xs">
                Sincronizando com Supabase...
              </div>
            ) : filteredTarefas.length === 0 ? (
              <div className="p-20 text-center bg-zinc-950/50 border border-dashed border-zinc-900 rounded-3xl">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-zinc-800" />
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Nenhuma tarefa para este dia</p>
                <button onClick={() => setDate(undefined)} className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Ver todas as tarefas</button>
              </div>
            ) : (
              <div className="space-y-3">
                {pendentes.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between gap-4 hover:border-primary/20 transition-all shadow-lg shadow-black/20"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button 
                        onClick={() => toggle(t)} 
                        className="w-6 h-6 rounded-lg border-2 border-zinc-700 flex items-center justify-center shrink-0 hover:border-primary/50 transition-all group-hover:scale-110"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{t.titulo}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {t.leads?.nome && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                              <User className="h-2.5 w-2.5" /> {t.leads.nome}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                            <Clock className="h-2.5 w-2.5" /> {format(new Date(t.data_vencimento), "HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {concluidas.length > 0 && (
                  <div className="pt-8 space-y-3">
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2 mb-4">Concluídas</h4>
                    {concluidas.map((t) => (
                      <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-900 opacity-40 hover:opacity-100 transition-all group cursor-pointer" onClick={() => toggle(t)}>
                        <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-xs text-zinc-500 font-bold line-through uppercase tracking-tight">{t.titulo}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTarefas;

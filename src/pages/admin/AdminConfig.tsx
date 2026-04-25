import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { Settings, Plus, Pencil, Trash2, Check, X, AlertTriangle, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const AdminConfig = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const navigate = useNavigate();

  const load = async () => {
    const { data } = await supabase.from("templates_mensagem").select("*").order("created_at", { ascending: false });
    setTemplates(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (t: any) => { setEditingId(t.id); setEditData({ ...t }); };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveEdit = async () => {
    const { error } = await supabase.from("templates_mensagem").update({ nome: editData.nome, texto: editData.texto, tipo: editData.tipo }).eq("id", editingId);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Template salvo!" });
    cancelEdit(); load();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Excluir template?")) return;
    await supabase.from("templates_mensagem").delete().eq("id", id);
    load();
  };

  const addTemplate = async () => {
    await supabase.from("templates_mensagem").insert({ nome: "Novo Template", texto: "", tipo: "geral" });
    load();
  };

  return (
    <>
      <Helmet>
        <title>HLJ DEV | Configurações</title>
      </Helmet>
      <div className="p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Config <span className="text-primary">& Templates</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Templates de WhatsApp e configurações globais</p>
        </header>

        <section className="mb-10 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <BarChart2 size={24} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-tight mb-1">Métricas & Performance</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Visualize a performance das suas campanhas, leads e conversão.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/admin/analytics")}
              className="px-6 py-2.5 bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg"
            >
              Abrir Analytics
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Settings className="h-3.5 w-3.5" /> Templates WhatsApp
            </h2>
            <button onClick={addTemplate} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
              <Plus className="h-3.5 w-3.5" /> Novo
            </button>
          </div>

          {loading ? (
            <div className="text-primary animate-pulse">Carregando...</div>
          ) : (
            <div className="space-y-3">
              {templates.length === 0 ? (
                <div className="text-center py-12 text-zinc-700">
                  <p className="text-sm">Nenhum template cadastrado</p>
                </div>
              ) : (
                templates.map((t) => {
                  const editing = editingId === t.id;
                  return (
                    <div key={t.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {editing ? (
                            <div className="space-y-2">
                              <input value={editData.nome} onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-200 text-sm w-full font-bold" placeholder="Nome" />
                              <input value={editData.tipo ?? ""} onChange={(e) => setEditData({ ...editData, tipo: e.target.value })}
                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-400 text-xs w-full" placeholder="Tipo (ex: follow-up, boas-vindas)" />
                              <textarea value={editData.texto} onChange={(e) => setEditData({ ...editData, texto: e.target.value })}
                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-xs w-full min-h-[80px]" placeholder="Texto da mensagem..." />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-black text-zinc-200">{t.nome}</p>
                                {t.tipo && <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 uppercase">{t.tipo}</span>}
                              </div>
                              <p className="text-xs text-zinc-500 whitespace-pre-wrap">{t.texto || <span className="italic">Sem texto</span>}</p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {editing ? (
                            <>
                              <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check className="h-4 w-4" /></button>
                              <button onClick={cancelEdit} className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(t)} className="text-zinc-600 hover:text-primary transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteTemplate(t.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        <section className="mt-12 pt-8 border-t border-zinc-900">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-4">
            <Settings className="h-3.5 w-3.5" /> Manutenção do Sistema
          </h2>
          
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black uppercase text-sm tracking-tight mb-1">Limpeza de Base de Dados</h3>
                <p className="text-zinc-500 text-xs leading-relaxed max-w-md">
                  Esta ação irá deletar <span className="text-red-400 font-bold uppercase">todos os leads</span> cadastrados no sistema. 
                  Esta operação é irreversível e deve ser usada com cautela para resetar o CRM.
                </p>
                
                <button 
                  onClick={async () => {
                    const confirm1 = confirm("⚠️ ATENÇÃO: Você está prestes a apagar TODOS os leads do sistema. Deseja continuar?");
                    if (!confirm1) return;
                    
                    const confirm2 = confirm("🛑 ÚLTIMO AVISO: Todos os dados de geointeligência, fotos e sites serão perdidos. TEM CERTEZA?");
                    if (!confirm2) return;

                    const { error: errorLeads } = await supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                    const { error: errorCampaigns } = await supabase.from("campanhas_maps").update({ leads_found: 0, dispatches_sent: 0 }).neq("id", "00000000-0000-0000-0000-000000000000");
                    const { error: errorActivities } = await supabase.from("atividades_geo").delete().neq("id", "00000000-0000-0000-0000-000000000000");

                    if (errorLeads || errorCampaigns) {
                      toast({ title: "Erro na limpeza", description: "Alguns dados não puderam ser removidos.", variant: "destructive" });
                    } else {
                      toast({ title: "Sistema Resetado!", description: "Toda a inteligência e contadores foram zerados." });
                      setTimeout(() => window.location.reload(), 1500);
                    }
                  }}
                  className="mt-4 px-6 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Limpar Todos os Leads
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AdminConfig;

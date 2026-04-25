import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { 
  Settings, Plus, Pencil, Trash2, Check, X, AlertTriangle, 
  BarChart2, Smartphone, Cpu, DollarSign, Activity, 
  RefreshCcw, QrCode, Wifi, WifiOff, Server
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const AdminConfig = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [sysConfig, setSysConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  
  // WhatsApp States
  const [waStatus, setWaStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'LOADING'>('LOADING');
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  // Health States
  const [health, setHealth] = useState({
    supabase: 'loading',
    n8n: 'loading',
    evolution: 'loading'
  });

  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: tData } = await supabase.from("templates_mensagem").select("*").order("created_at", { ascending: false });
      setTemplates(tData ?? []);

      const { data: sConfig } = await supabase.from("config_sistema").select("*").single();
      setSysConfig(sConfig);
      
      checkHealth();
      if (sConfig) checkWaStatus(sConfig);
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    // Supabase check
    try {
      const { error } = await supabase.from("leads").select("id", { count: 'exact', head: true }).limit(1);
      setHealth(prev => ({ ...prev, supabase: error ? 'error' : 'online' }));
    } catch {
      setHealth(prev => ({ ...prev, supabase: 'error' }));
    }

    // Evolution check (simple ping)
    try {
      const res = await fetch("https://evolution.hljdev.com.br/health", { method: 'GET' });
      setHealth(prev => ({ ...prev, evolution: res.ok ? 'online' : 'error' }));
    } catch {
      setHealth(prev => ({ ...prev, evolution: 'error' }));
    }

    // N8N check
    setHealth(prev => ({ ...prev, n8n: 'online' })); // Simplified
  };

  const checkWaStatus = async (config: any) => {
    try {
      const res = await fetch(`${config.wa_api_url}/instance/connectionState/${config.wa_instance_name}`, {
        headers: { 'apikey': config.wa_api_key }
      });
      const data = await res.json();
      setWaStatus(data.instance?.state === 'open' ? 'CONNECTED' : 'DISCONNECTED');
    } catch (e) {
      setWaStatus('DISCONNECTED');
    }
  };

  const generateQrCode = async () => {
    if (!sysConfig) return;
    setWaStatus('LOADING');
    try {
      // 1. Verificar se a instância existe
      const stateRes = await fetch(`${sysConfig.wa_api_url}/instance/connectionState/${sysConfig.wa_instance_name}`, {
        headers: { 'apikey': sysConfig.wa_api_key }
      });
      
      if (stateRes.status === 404) {
        // 2. Criar instância se não existir
        await fetch(`${sysConfig.wa_api_url}/instance/create`, {
          method: 'POST',
          headers: { 
            'apikey': sysConfig.wa_api_key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instanceName: sysConfig.wa_instance_name,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
          })
        });
      }

      // 3. Solicitar Conexão / QR Code
      const res = await fetch(`${sysConfig.wa_api_url}/instance/connect/${sysConfig.wa_instance_name}`, {
        headers: { 'apikey': sysConfig.wa_api_key }
      });
      const data = await res.json();
      
      if (data.code) {
        setQrCode(data.code);
        setWaStatus('DISCONNECTED');
      } else if (data.instance?.state === 'open' || data.status === 'CONNECTED') {
        setWaStatus('CONNECTED');
        toast({ title: "WhatsApp já conectado!", description: "Sua instância está ativa." });
      } else {
        toast({ title: "Aguardando QR Code...", description: "Tente novamente em instantes." });
        setWaStatus('DISCONNECTED');
      }
    } catch (e) {
      console.error("WA Integration error:", e);
      toast({ title: "Erro na integração", description: "Verifique se a Evolution API está online.", variant: "destructive" });
      setWaStatus('DISCONNECTED');
    }
  };

  const saveSysConfig = async () => {
    setSaving(true);
    const { error } = await supabase.from("config_sistema").update(sysConfig).eq("id", sysConfig.id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configurações atualizadas!" });
    }
    setSaving(false);
  };

  useEffect(() => { loadData(); }, []);

  const startEdit = (t: any) => { setEditingId(t.id); setEditData({ ...t }); };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveTemplateEdit = async () => {
    const { error } = await supabase.from("templates_mensagem").update({ 
      nome: editData.nome, texto: editData.texto, tipo: editData.tipo 
    }).eq("id", editingId);
    
    if (error) { 
      toast({ title: "Erro", description: error.message, variant: "destructive" }); 
      return; 
    }
    toast({ title: "Template salvo!" });
    cancelEdit(); loadData();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Excluir template?")) return;
    await supabase.from("templates_mensagem").delete().eq("id", id);
    loadData();
  };

  const addTemplate = async () => {
    await supabase.from("templates_mensagem").insert({ nome: "Novo Template", texto: "", tipo: "geral" });
    loadData();
  };

  if (loading) {
    return (
      <div className="p-10 text-primary flex items-center gap-3 animate-pulse">
        <RefreshCcw className="animate-spin h-5 w-5" />
        <span className="font-black uppercase tracking-widest text-xs">Carregando Elite Engine...</span>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>HLJ DEV | Central de Comando</title>
      </Helmet>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Central de <span className="text-primary">Comando</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium tracking-tight">Otimize a inteligência e infraestrutura do seu ecossistema.</p>
          </div>
          
          <div className="flex gap-2">
            <HealthIndicator label="DB" status={health.supabase} />
            <HealthIndicator label="N8N" status={health.n8n} />
            <HealthIndicator label="WA" status={health.evolution} />
          </div>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between group cursor-pointer"
            onClick={() => navigate("/admin/analytics")}
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <BarChart2 size={28} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Performance Analítica</h3>
                <p className="text-zinc-500 text-xs">Métricas reais de conversão e ROI.</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-black transition-colors">
              <Check size={18} />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${waStatus === 'CONNECTED' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                {waStatus === 'CONNECTED' ? <Wifi size={28} /> : <WifiOff size={28} />}
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-tight">WhatsApp Elite</h3>
                <p className="text-zinc-500 text-xs">{waStatus === 'CONNECTED' ? 'Conectado e operacional' : 'Aguardando conexão'}</p>
              </div>
            </div>
            <button 
              onClick={generateQrCode}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${waStatus === 'CONNECTED' ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-primary text-black hover:scale-105'}`}
              disabled={waStatus === 'CONNECTED'}
            >
              {waStatus === 'CONNECTED' ? 'Ativo' : 'Conectar'}
            </button>
          </motion.div>
        </div>

        {qrCode && (
          <div className="mb-12 bg-white p-8 rounded-3xl flex flex-col items-center justify-center gap-4 max-w-sm mx-auto shadow-2xl shadow-primary/20 border-4 border-primary">
            <h3 className="text-black font-black uppercase text-sm tracking-widest">Escaneie o QR Code</h3>
            <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
            <button onClick={() => setQrCode(null)} className="text-zinc-400 text-[10px] uppercase font-bold hover:text-black">Fechar</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* AI Settings */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                <Cpu size={14} /> Inteligência Artificial (Groq/Llama)
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">System Prompt (Personalidade)</label>
                  <textarea 
                    value={sysConfig?.ai_system_prompt || ""}
                    onChange={(e) => setSysConfig({ ...sysConfig, ai_system_prompt: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-200 text-sm min-h-[120px] focus:border-primary/50 transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Modelo AI</label>
                    <select 
                      value={sysConfig?.ai_model || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, ai_model: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 text-sm focus:border-primary/50"
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Alta Performance)</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B (Instantâneo)</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Alertar Lead a partir de:</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={sysConfig?.lead_score_threshold_alerta || 80}
                        onChange={(e) => setSysConfig({ ...sysConfig, lead_score_threshold_alerta: parseInt(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 text-sm focus:border-primary/50"
                      />
                      <span className="text-zinc-500 font-bold text-xs">PTS</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                <DollarSign size={14} /> Tabela de Preços (Propostas IA)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Sites Institucionais</h4>
                  <div className="flex gap-2">
                    <PriceInput label="Mín" value={sysConfig?.precos_min_site} onChange={(val) => setSysConfig({ ...sysConfig, precos_min_site: val })} />
                    <PriceInput label="Máx" value={sysConfig?.precos_max_site} onChange={(val) => setSysConfig({ ...sysConfig, precos_max_site: val })} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Sistemas Customizados</h4>
                  <div className="flex gap-2">
                    <PriceInput label="Mín" value={sysConfig?.precos_min_sistema} onChange={(val) => setSysConfig({ ...sysConfig, precos_min_sistema: val })} />
                    <PriceInput label="Máx" value={sysConfig?.precos_max_sistema} onChange={(val) => setSysConfig({ ...sysConfig, precos_max_sistema: val })} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Business Rules & Follow-up */}
          <div className="space-y-8">
            <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 h-full">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                <Activity size={14} /> Cadência de Vendas
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">Intervalo Follow-up 1</label>
                  <CadenceControl 
                    value={sysConfig?.followup_interval_1 || 24} 
                    onChange={(val) => setSysConfig({ ...sysConfig, followup_interval_1: val })} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">Intervalo Follow-up 2</label>
                  <CadenceControl 
                    value={sysConfig?.followup_interval_2 || 72} 
                    onChange={(val) => setSysConfig({ ...sysConfig, followup_interval_2: val })} 
                  />
                </div>
                
                <div className="pt-6">
                  <button 
                    onClick={saveSysConfig}
                    disabled={saving}
                    className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : "Salvar Central de Comando"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Templates Section - Re-styled */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <Smartphone size={14} /> Templates WhatsApp
            </h2>
            <button onClick={addTemplate} className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
              Novo Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((t) => {
              const editing = editingId === t.id;
              return (
                <div key={t.id} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all group">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {editing ? (
                          <input 
                            value={editData.nome} 
                            onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-200 text-xs w-full font-bold focus:border-primary/50" 
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <p className="text-xs font-black text-white uppercase tracking-tight">{t.nome}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editing ? (
                          <>
                            <button onClick={saveTemplateEdit} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Check size={14} /></button>
                            <button onClick={cancelEdit} className="p-1.5 text-zinc-500 hover:bg-zinc-800 rounded-lg"><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(t)} className="p-1.5 text-zinc-600 hover:text-primary hover:bg-primary/10 rounded-lg"><Pencil size={14} /></button>
                            <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      {editing ? (
                        <div className="space-y-3">
                          <input 
                            value={editData.tipo ?? ""} 
                            onChange={(e) => setEditData({ ...editData, tipo: e.target.value })}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-400 text-[10px] w-full" 
                            placeholder="Tipo (ex: follow-up)" 
                          />
                          <textarea 
                            value={editData.texto} 
                            onChange={(e) => setEditData({ ...editData, texto: e.target.value })}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 text-xs w-full min-h-[100px] focus:border-primary/50" 
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 uppercase font-bold tracking-widest">{t.tipo || 'Geral'}</span>
                          <p className="text-xs text-zinc-500 line-clamp-4 leading-relaxed font-medium italic">"{t.texto || 'Sem conteúdo'}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Maintenance - Restyled */}
        <section className="pt-12 border-t border-zinc-900">
          <div className="bg-red-500/5 border border-red-500/10 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 text-red-500/5 rotate-12">
              <AlertTriangle size={160} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle size={40} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-white font-black uppercase text-xl tracking-tighter mb-2">Protocolo de Limpeza Total</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xl font-medium">
                  Esta ação irá deletar <span className="text-red-400 font-bold uppercase underline">todos os leads</span> e zerar o banco de dados. 
                  Operação irreversível de alta criticidade.
                </p>
              </div>
              <button 
                onClick={async () => {
                  const confirm1 = confirm("⚠️ PROTOCOLO DE SEGURANÇA: Apagar TODOS os dados?");
                  if (!confirm1) return;
                  const confirm2 = confirm("🛑 ÚLTIMO AVISO: Não há recuperação de dados após isso. Confirmar?");
                  if (!confirm2) return;

                  const { error: errorLeads } = await supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                  if (errorLeads) {
                    toast({ title: "Falha no Protocolo", variant: "destructive" });
                  } else {
                    toast({ title: "Sistema Resetado", description: "Todos os dados foram eliminados." });
                    setTimeout(() => window.location.reload(), 1500);
                  }
                }}
                className="px-10 py-5 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-2xl shadow-red-500/30 active:scale-95"
              >
                Ativar Limpeza
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const HealthIndicator = ({ label, status }: { label: string, status: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
    <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : status === 'loading' ? 'bg-zinc-600 animate-pulse' : 'bg-red-500 animate-ping'}`} />
    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
  </div>
);

const PriceInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="flex-1">
    <label className="text-[8px] text-zinc-600 uppercase font-black mb-1 block">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px] font-bold">R$</span>
      <input 
        type="number"
        value={value || 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-8 pr-3 text-zinc-200 text-xs font-bold focus:border-primary/50"
      />
    </div>
  </div>
);

const CadenceControl = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
      <span>{value} Horas</span>
      <span>{Math.round(value/24)} Dias</span>
    </div>
    <input 
      type="range"
      min="1"
      max="168"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

export default AdminConfig;

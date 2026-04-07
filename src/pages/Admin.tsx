import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Terminal, 
  Database,
  Activity,
  ShieldCheck,
  MessageSquare,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sessão Encerrada",
      description: "Desconexão do terminal realizada com sucesso.",
    });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono">
        <div className="text-primary animate-pulse flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          CARREGANDO_SISTEMA...
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Usuários Ativos", value: "1.2k", icon: Users, color: "text-blue-400" },
    { label: "Requisições API", value: "45.8k", icon: Activity, color: "text-emerald-400" },
    { label: "Leads Capturados", value: "854", icon: MessageSquare, color: "text-purple-400" },
    { label: "Vendas Shop", value: "128", icon: Package, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-mono selection:bg-primary/20 selection:text-primary">
      <Helmet>
        <title>HLJ DEV | Painel de Controle</title>
      </Helmet>

      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="flex flex-col md:flex-row min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-black/50 border-b md:border-b-0 md:border-r border-primary/20 p-6 flex flex-col backdrop-blur-md">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-primary/10 rounded border border-primary/30 flex items-center justify-center transition-all group-hover:shadow-[0_0_15px_rgba(20,255,20,0.3)]">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <span className="font-black text-primary tracking-tighter text-xl">HLJ_ROOT</span>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarLink icon={LayoutDashboard} label="Dashboard" active />
            <SidebarLink icon={Users} label="Usuários" />
            <SidebarLink icon={Database} label="Banco de Dados" />
            <SidebarLink icon={Activity} label="Logs de Sistema" />
            <SidebarLink icon={Settings} label="Configurações" />
          </nav>

          <div className="pt-6 border-t border-primary/10 mt-auto">
            <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {user?.email?.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-primary/50 uppercase font-black truncate">Administrador</p>
                <p className="text-[11px] text-zinc-300 truncate lowercase font-mono">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all font-bold uppercase text-[10px] tracking-widest"
            >
              <LogOut className="h-4 w-4" />
              Sair da Sessão
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary/60 text-xs mb-2 uppercase tracking-[0.3em] font-black">
                <ShieldCheck className="h-3 w-3" />
                Sessão Segura Ativa
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase mb-2">
                Painel de Controle <span className="text-primary">HLJ_DEV</span>
              </h1>
              <p className="text-zinc-500 text-sm max-w-xl">
                Bem-vindo ao núcleo administrativo. Monitore métricas em tempo real e gerencie a infraestrutura do ecossistema.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-800">
                <div className="px-3 py-1.5 rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-400">V4.0.2_ESTAVEL</div>
                <div className="px-3 py-1.5 rounded-md bg-primary/10 text-[10px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Online
                </div>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:border-primary/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-zinc-800 group-hover:bg-primary/10 transition-colors`}>
                    <stat.icon className={`h-5 w-5 ${stat.color} group-hover:text-primary transition-colors`} />
                  </div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">+12.5%</div>
                </div>
                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Terminal Preview */}
            <section className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
                <div className="bg-zinc-800/50 px-4 py-2 border-b border-zinc-700/50 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">hlj_system_logs.sh</div>
                  <div className="w-10" />
                </div>
                <div className="p-6 font-mono text-xs space-y-2 text-zinc-400 overflow-x-auto min-h-[300px]">
                  <p><span className="text-primary">[OK]</span> Carregando módulos de segurança...</p>
                  <p><span className="text-primary">[OK]</span> Conexão estabelecida com Supabase Cluster #01</p>
                  <p><span className="text-primary">[OK]</span> Handshake Evolution API v2 completo</p>
                  <p className="text-zinc-600 italic mt-4">// Iniciando observador de tráfego...</p>
                  <p><span className="text-amber-400">[INFO]</span> Nova sessão iniciada a partir de 192.168.1.XX</p>
                  <p><span className="text-blue-400">[QUERY]</span> SELECT * FROM leads WHERE status = 'pendente'</p>
                  <p><span className="text-primary">[OK]</span> Sincronização de inventário concluída</p>
                  <div className="flex gap-2">
                    <span className="text-primary animate-pulse underline">admin@hljdev:~$</span>
                    <span className="w-2 h-4 bg-primary/80 animate-[pulse_1s_infinite]" />
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <aside className="space-y-6">
              <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl">
                 <h3 className="text-white font-black uppercase text-sm tracking-widest mb-6 pb-4 border-b border-zinc-800">Ações Rápidas</h3>
                 <div className="space-y-3">
                   <ActionButton label="Limpar Cache CDN" />
                   <ActionButton label="Reiniciar Agentes IA" />
                   <ActionButton label="Exportar Relatório" />
                   <ActionButton label="Backup db_hlj_prod" primary />
                 </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
                  <h3 className="text-primary font-black uppercase text-sm tracking-widest mb-2 relative z-10">Status da Rede</h3>
                  <p className="text-[11px] text-primary/60 mb-6 font-bold relative z-10">Todos os sistemas operando nominalmente no momento.</p>
                  <Button className="w-full bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest relative z-10">Ver Detalhes</Button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
    active 
      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(20,255,20,0.1)]" 
      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
  }`}>
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

const ActionButton = ({ label, primary = false }: { label: string, primary?: boolean }) => (
    <button className={`w-full px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
      primary 
        ? "bg-primary/5 border-primary/40 text-primary hover:bg-primary hover:text-black" 
        : "bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
    }`}>
      {label}
    </button>
);

export default Admin;

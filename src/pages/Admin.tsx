import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Outlet, useLocation, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Map,
  Briefcase,
  BarChart2,
  Calendar,
  ChevronLeft,
  Menu,
  ShieldCheck,
  BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
  { icon: Users, label: "Pipeline", to: "/admin/pipeline", showBadge: true },
  { icon: Map, label: "Campanhas Maps", to: "/admin/maps" },
  { icon: Calendar, label: "Agenda", to: "/admin/tarefas" },
  { icon: Briefcase, label: "Projetos", to: "/admin/projetos" },
  { icon: Settings, label: "Config", to: "/admin/config" },
];

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };
    fetchUserData();
    
    // Fetch initial new leads count
    const fetchNewLeadsCount = async () => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'novo');
      
      if (count !== null) setNewLeadsCount(count);
    };
    
    fetchNewLeadsCount();

    // Global realtime subscription for new leads
    const channel = supabase.channel('global-admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          const newLead = payload.new;
          
          // Increment count if it's a new lead
          if (newLead.status === 'novo') {
            setNewLeadsCount(prev => prev + 1);
          }

          // Trigger global toast notification for specific sources
          const origem = newLead.origem?.toLowerCase() || '';
          if (origem.includes('site') || origem.includes('instagram')) {
            toast({
              title: "🚀 Novo Lead Captado!",
              description: `${newLead.nome} acabou de entrar via ${newLead.origem}.`,
              duration: 10000,
            });
            
            // Optional: Play a notification sound
            try {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(() => {}); // Ignore if browser blocks autoplay
            } catch (e) {}
          }
        }
      )
      // Also listen for updates to decrement the badge if a lead is moved out of 'novo'
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leads' },
        (payload) => {
          const oldLead = payload.old;
          const newLead = payload.new;
          if (oldLead.status === 'novo' && newLead.status !== 'novo') {
            setNewLeadsCount(prev => Math.max(0, prev - 1));
          } else if (oldLead.status !== 'novo' && newLead.status === 'novo') {
            setNewLeadsCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'leads' },
        (payload) => {
          if (payload.old.status === 'novo') {
            setNewLeadsCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Sessão Encerrada", description: "Desconexão realizada com sucesso." });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary animate-pulse flex items-center gap-3">
          <ShieldCheck className="h-6 w-6" />
          <span className="font-bold tracking-tighter uppercase">Autenticando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-400 selection:bg-primary/20 selection:text-primary">
      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          <motion.aside
            animate={{ width: collapsed ? 70 : 260 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="hidden md:flex flex-col bg-zinc-950 border-r border-zinc-900 shrink-0 overflow-hidden"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-8">
              <div
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-lg shadow-primary/20 relative"
                onClick={() => navigate("/")}
              >
                <ShieldCheck className="w-6 h-6 text-black" />
                {collapsed && newLeadsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                )}
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col min-w-0"
                >
                  <span className="font-black text-white tracking-tighter text-xl uppercase leading-none">
                    HLJ <span className="text-primary">DEV</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Sistemas & IA</span>
                </motion.div>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="ml-auto text-zinc-600 hover:text-white transition-colors shrink-0"
              >
                {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 space-y-1.5 px-3 overflow-y-auto">
              {NAV_ITEMS.map(({ icon: Icon, label, to, showBadge }) => {
                const isActive = to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all group relative ${
                      isActive
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    }`}
                    title={collapsed ? label : undefined}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "group-hover:text-primary"} transition-colors`} />
                    {!collapsed && <span className="whitespace-nowrap flex-1">{label}</span>}
                    
                    {/* Badge for new leads */}
                    {showBadge && newLeadsCount > 0 && (
                      <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-black ${isActive ? 'bg-primary text-black' : 'bg-red-500 text-white'} ${collapsed ? 'absolute top-1 right-1' : ''}`}>
                        {newLeadsCount}
                      </span>
                    )}

                    {isActive && !collapsed && (
                      <motion.div layoutId="activeNav" className="ml-auto w-1 h-4 bg-primary rounded-full" />
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* User footer */}
            <div className="p-4 border-t border-zinc-900 mt-auto">
              {!collapsed ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/50">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm uppercase shrink-0">
                      {user?.email?.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-zinc-300 truncate font-bold">{user?.email}</p>
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Administrador</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all font-bold uppercase text-[10px] tracking-widest rounded-xl h-12"
                  >
                    <LogOut className="h-4 w-4" />
                    Encerrar Sessão
                  </Button>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center h-12 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.aside>
        </AnimatePresence>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto min-h-screen bg-black">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default Admin;

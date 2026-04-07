import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Outlet, useLocation, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Terminal,
  FileText,
  ShoppingCart,
  Briefcase,
  Package,
  BarChart2,
  Calendar,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
  { icon: Users, label: "Pipeline", to: "/admin/pipeline" },
  { icon: FileText, label: "Propostas IA", to: "/admin/propostas" },
  { icon: ShoppingCart, label: "Vendas", to: "/admin/vendas" },
  { icon: Briefcase, label: "Projetos", to: "/admin/projetos" },
  { icon: Package, label: "Produtos Shop", to: "/admin/produtos" },
  { icon: BarChart2, label: "Analytics", to: "/admin/analytics" },
  { icon: Calendar, label: "Agenda", to: "/admin/tarefas" },
  { icon: Settings, label: "Config", to: "/admin/config" },
];

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    toast({ title: "Sessão Encerrada", description: "Desconexão realizada com sucesso." });
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

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-mono selection:bg-primary/20 selection:text-primary">
      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          <motion.aside
            animate={{ width: collapsed ? 64 : 240 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="hidden md:flex flex-col bg-black/60 border-r border-primary/15 backdrop-blur-md shrink-0 overflow-hidden"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-primary/10">
              <div
                className="w-8 h-8 bg-primary/10 rounded border border-primary/30 flex items-center justify-center shrink-0 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(20,255,20,0.3)]"
                onClick={() => navigate("/")}
              >
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-black text-primary tracking-tighter text-lg whitespace-nowrap"
                >
                  HLJ_ROOT
                </motion.span>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="ml-auto text-zinc-600 hover:text-primary transition-colors shrink-0"
              >
                {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
              {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
                const isActive = to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all group ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(20,255,20,0.08)]"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
                    }`}
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                  </NavLink>
                );
              })}
            </nav>

            {/* User footer */}
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="px-3 py-4 border-t border-primary/10"
              >
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase shrink-0">
                    {user?.email?.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-primary/50 uppercase font-black">Admin</p>
                    <p className="text-[10px] text-zinc-300 truncate lowercase">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all font-bold uppercase text-[9px] tracking-widest h-8"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </Button>
              </motion.div>
            )}
            {collapsed && (
              <div className="px-2 py-4 border-t border-primary/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.aside>
        </AnimatePresence>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto min-h-screen">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default Admin;

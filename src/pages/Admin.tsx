import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Outlet, useLocation, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Map,
  Briefcase,
  CalendarCheck,
  ChevronLeft,
  Menu,
  Wifi,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/pipeline": "Pipeline",
  "/admin/campanhas": "Campanhas Maps",
  "/admin/projetos": "Projetos",
  "/admin/tarefas": "Tarefas",
  "/admin/config": "Config & Templates",
};

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
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

  useEffect(() => {
    const fetchNewLeads = async () => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "novo");
      setNewLeadsCount(count ?? 0);
    };
    fetchNewLeads();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Sessão encerrada", description: "Desconexão realizada com sucesso." });
    navigate("/login");
  };

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Admin";
  const initials = user?.email?.substring(0, 2)?.toUpperCase() ?? "AD";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-sm font-sans">Carregando...</div>
      </div>
    );
  }

  const operacaoItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/admin", exact: true, badge: null as number | null, badgeText: null as string | null },
    { icon: Users, label: "Pipeline", to: "/admin/pipeline", exact: false, badge: newLeadsCount > 0 ? newLeadsCount : null, badgeText: null as string | null },
    { icon: Map, label: "Campanhas Maps", to: "/admin/campanhas", exact: false, badge: null as number | null, badgeText: "novo" },
    { icon: Briefcase, label: "Projetos", to: "/admin/projetos", exact: false, badge: null as number | null, badgeText: null as string | null },
    { icon: CalendarCheck, label: "Tarefas", to: "/admin/tarefas", exact: false, badge: null as number | null, badgeText: null as string | null },
  ];

  const sistemaItems = [
    { icon: Settings, label: "Config & Templates", to: "/admin/config" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-zinc-400 font-sans">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 64 : 240 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="hidden md:flex flex-col bg-[#0a0c10] border-r border-zinc-800/60 shrink-0 overflow-hidden"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800/60">
            <div
              className="w-8 h-8 bg-green-400/10 rounded-lg border border-green-400/20 flex items-center justify-center shrink-0 cursor-pointer hover:bg-green-400/20 transition-colors"
              onClick={() => navigate("/")}
            >
              <span className="text-green-400 font-black text-xs">H</span>
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-white text-sm whitespace-nowrap tracking-tight"
              >
                HLJ DEV
              </motion.span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto text-zinc-600 hover:text-zinc-300 transition-colors shrink-0"
            >
              {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-5">
            {/* Operação */}
            <div>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2">
                  Operação
                </p>
              )}
              <div className="space-y-0.5">
                {operacaoItems.map(({ icon: Icon, label, to, exact, badge, badgeText }) => {
                  const isActive = exact
                    ? location.pathname === to
                    : location.pathname.startsWith(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-green-400/10 text-green-400 border border-green-400/20"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                      }`}
                      title={collapsed ? label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="whitespace-nowrap flex-1">{label}</span>
                          {badge != null && (
                            <span className="text-[10px] bg-green-400/20 text-green-400 font-bold px-1.5 py-0.5 rounded-full">
                              {badge}
                            </span>
                          )}
                          {badgeText && (
                            <span className="text-[9px] bg-green-400/10 text-green-400 font-bold px-1.5 py-0.5 rounded-full border border-green-400/20 uppercase tracking-wide">
                              {badgeText}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Sistema */}
            <div>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2">
                  Sistema
                </p>
              )}
              <div className="space-y-0.5">
                {sistemaItems.map(({ icon: Icon, label, to }) => {
                  const isActive = location.pathname.startsWith(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-green-400/10 text-green-400 border border-green-400/20"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                      }`}
                      title={collapsed ? label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User footer */}
          <div className="px-2 py-3 border-t border-zinc-800/60">
            {!collapsed ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="w-7 h-7 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center text-green-400 font-bold text-xs shrink-0">
                    {initials}
                  </div>
                  <p className="text-xs text-zinc-300 truncate flex-1 min-w-0">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Topbar */}
          <header className="h-14 bg-[#0a0c10] border-b border-zinc-800/60 flex items-center px-6 gap-4 shrink-0">
            <h2 className="text-white font-semibold text-sm flex-1">{pageTitle}</h2>
            <div className="flex items-center gap-1.5 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <Wifi className="h-3 w-3" />
              <span>Sistemas online</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet context={{ user }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;

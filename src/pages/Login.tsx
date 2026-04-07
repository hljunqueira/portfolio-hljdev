import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldCheck, Lock, User, Loader2, ArrowLeft, KeySquare } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      toast({
        title: "Acesso Autorizado",
        description: "Bem-vindo ao centro de comando HLJ DEV.",
      });
      navigate("/admin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha na Autenticação",
        description: error.message || "Credenciais inválidas ou erro no servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-primary/30 selection:text-primary relative overflow-hidden font-mono">
      <Helmet>
        <title>HLJ DEV | Login Administrativo</title>
        <meta name="description" content="Área restrita de controle - HLJ DEV" />
      </Helmet>

      {/* CRT Effects Overlay */}
      <div className="crt-overlay" />

      {/* Decorative Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0 opacity-50" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10 crt-flicker"
      >
        {/* Terminal Window */}
        <div className="bg-black/90 border border-primary/40 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(20,255,20,0.2)] flex flex-col backdrop-blur-sm">
          
          {/* Terminal Header */}
          <div className="bg-zinc-900/80 flex items-center justify-between px-4 py-2.5 border-b border-primary/30 text-[10px] uppercase font-bold tracking-[0.2em] text-primary/70">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-80" />
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3" /> HLJ_CONSOLE_ROOT
            </div>
            <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors hover:bg-primary/10 px-2 py-0.5 rounded cursor-pointer">
              <ArrowLeft className="h-2.5 w-2.5" /> VOLTAR_SITE
            </Link>
          </div>

          {/* Terminal Body */}
          <div className="p-8 space-y-6 relative">
            
            <div className="space-y-1 mb-8">
              <div className="flex items-center gap-2 text-primary font-bold text-base mb-1 uppercase tracking-tight">
                <ShieldCheck className="h-4 w-4" />
                <span>Verificação de Identidade</span>
              </div>
              <p className="text-primary/60 text-[11px] leading-relaxed">
                &gt; Autenticação necessária para acesso root.
                <br />
                &gt; Status: Aguardando credenciais<span className="terminal-cursor" />
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="group/input relative">
                <div className="absolute left-3 top-3 text-primary/40 group-focus-within/input:text-primary transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <Input 
                  type="email" 
                  placeholder="ID_USUARIO" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-primary/20 focus-visible:border-primary focus-visible:ring-primary/10 h-11 pl-10 text-primary font-mono placeholder:text-primary/10 rounded-md transition-all uppercase text-[12px] tracking-widest"
                  required 
                />
              </div>

              <div className="group/input relative">
                <div className="absolute left-3 top-3 text-primary/40 group-focus-within/input:text-primary transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <Input 
                  type="password" 
                  placeholder="CHAVE_DE_ACESSO" 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-black/50 border-primary/20 focus-visible:border-primary focus-visible:ring-primary/10 h-11 pl-10 text-primary font-mono placeholder:text-primary/10 rounded-md transition-all text-[12px] tracking-widest"
                  required 
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => toast({ title: "Recuperação de Acesso", description: "Contate o suporte HLJ DEV para redefinir sua chave root." })}
                  className="text-[10px] text-primary/40 hover:text-primary transition-colors flex items-center gap-1 uppercase font-bold tracking-widest group"
                >
                  <KeySquare className="h-3 w-3 group-hover:rotate-12 transition-transform" /> ESQUECEU_A_SENHA?
                </button>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-primary/20 border border-primary/50 text-primary hover:bg-primary hover:text-black font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(20,255,20,0.1)]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> VERIFICANDO...
                  </div>
                ) : (
                  "[ EXECUTAR LOGIN ]"
                )}
              </Button>

              <div className="pt-4 flex justify-between items-center opacity-30 text-[9px] uppercase font-bold tracking-tighter text-primary">
                <span>PROT_B2B_CRIPTOGRAFADO</span>
                <span>v4.0.2_ESTAVEL</span>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="mt-8 text-center flex flex-col gap-2">
            <span className="text-[9px] text-primary/20 uppercase font-black tracking-[0.4em]">
                HLJ DEV • Core Engineering
            </span>
        </div>
      </motion.div>
    </div>
  );
};


export default Login;


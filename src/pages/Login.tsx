import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";

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
        description: "Bem-vindo de volta ao centro de operações.",
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
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <Helmet>
        <title>HLJ DEV | Login Administrativo</title>
        <meta name="description" content="Área restrita de controle - HLJ DEV" />
      </Helmet>

      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-30" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-8">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <ShieldCheck className="w-10 h-10 text-black" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                HLJ <span className="text-primary">DEV</span>
              </h1>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">Acesso Restrito</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-8 md:p-10 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight mb-2">Bem-vindo</h2>
            <p className="text-zinc-500 text-sm">Insira suas credenciais para gerenciar a operação.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus-visible:border-primary/50 focus-visible:ring-primary/10 h-14 pl-12 text-white placeholder:text-zinc-700 rounded-2xl transition-all"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Senha</label>
                <button 
                  type="button"
                  onClick={() => toast({ title: "Recuperação", description: "Contate o administrador para redefinir sua senha." })}
                  className="text-[10px] text-zinc-600 hover:text-primary transition-colors font-bold uppercase tracking-widest"
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus-visible:border-primary/50 focus-visible:ring-primary/10 h-14 pl-12 text-white placeholder:text-zinc-700 rounded-2xl transition-all"
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/10 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Autenticando...
                </div>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>
        </div>

        </motion.div>
    </div>
  );
};

export default Login;


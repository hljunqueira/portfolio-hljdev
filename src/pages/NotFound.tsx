import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary flex items-center justify-center px-4">
      {/* CRT Scanlines Effect */}
      <div className="crt-overlay" />
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Glitch 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black text-primary/20 select-none leading-none tracking-tighter animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-primary select-none leading-none tracking-tighter opacity-50 blur-sm animate-pulse" style={{ animationDelay: '0.1s' }}>
            404
          </div>
        </div>

        {/* Error Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 shadow-[0_0_30px_rgba(20,255,20,0.2)]">
          <AlertTriangle className="h-10 w-10 text-primary" />
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Página Não Encontrada
        </h2>
        <p className="text-muted-foreground text-lg mb-2">
          O caminho <code className="text-primary font-mono bg-secondary/50 px-2 py-1 rounded">{location.pathname}</code> não existe em nossos servidores.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-8 font-mono">
          Error Code: NOT_FOUND | Route: {location.pathname}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_20px_rgba(20,255,20,0.3)] hover:shadow-[0_0_30px_rgba(20,255,20,0.5)] hover:scale-105 transition-all duration-300 uppercase tracking-wider"
          >
            <Home className="h-5 w-5" />
            Voltar ao Início
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary/50 border border-border/50 text-foreground font-medium rounded-lg hover:bg-secondary hover:border-primary/50 hover:text-primary transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Página Anterior
          </button>
        </div>

        {/* Terminal-style footer */}
        <div className="mt-16 pt-8 border-t border-border/40">
          <div className="inline-flex items-center gap-2 bg-secondary/30 px-6 py-3 rounded-full border border-border/50">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(20,255,20,0.8)]" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              HLJ DEV Systems • All Services Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

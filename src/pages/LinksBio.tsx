import { Link } from "react-router-dom";
import { ArrowRight, Bot, Code2, Gift, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function LinksBio() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 antialiased">
      <Helmet>
        <title>HLJ DEV | Site&Sistema | Automações | Agentes de IA</title>
        <meta name="description" content="Links oficiais, materiais gratuitos e contato HLJ DEV." />
      </Helmet>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header/Perfil */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full blur-md bg-gradient-to-tr from-primary/40 to-primary/10" />
            <img 
              src="/lovable-uploads/Eu-fundo%20vermelho.png" 
              alt="HLJ DEV" 
              className="relative w-24 h-24 rounded-full border-2 border-background object-cover shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">Henrique Junqueira</h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">HLJ DEV | Site&Sistema | Automações | Agentes de IA</p>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <Button asChild variant="outline" className="w-full h-14 justify-between px-6 text-base font-medium hover:border-primary/50 group bg-card">
            <Link to="/#contact">
              <span className="flex items-center gap-3"><Gift className="h-5 w-5 text-primary" /> Pack Grátis: 50 Prompts</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full h-14 justify-between px-6 text-base font-medium hover:border-primary/50 group bg-card">
            <a href="https://wa.me/5548991013293?text=Oi%20Henrique,%20vim%20pelo%20Instagram%20e%20queria%20falar%20sobre%20automa%C3%A7%C3%A3o!" target="_blank" rel="noopener noreferrer">
              <span className="flex items-center gap-3"><Bot className="h-5 w-5 text-primary" /> Diagnóstico de Automação (WhatsApp)</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </Button>

          <Button asChild variant="outline" className="w-full h-14 justify-between px-6 text-base font-medium hover:border-primary/50 group bg-card">
            <Link to="/">
              <span className="flex items-center gap-3"><Code2 className="h-5 w-5 text-primary" /> Conhecer a Agência (Site)</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HLJ DEV</p>
          <a href="https://portfolio-hljdev.vercel.app/" className="hover:text-primary transition-colors">portfolio-hljdev.vercel.app</a>
        </div>
      </div>
    </div>
  );
}

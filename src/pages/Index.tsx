import { Hero } from "@/components/site/Hero";
import { ProjectsGrid } from "@/components/site/ProjectsGrid";
import { LeadChat } from "@/components/site/LeadChat";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Instagram, Linkedin } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const [activeId, setActiveId] = useState<string>("hero");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Efeito para lidar com âncoras (hashes) vindas de outras páginas
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        // Pequeno delay para garantir que o layout renderizou
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ids = ["hero", "cases", "contact"] as const;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const linkClass = (id: string) =>
    `hidden md:block text-sm font-medium transition-colors hover:text-primary ${activeId === id ? "text-primary" : "text-muted-foreground"}`;

  return (
    <div id="top" className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Helmet>
        <title>HLJ DEV | Site&Sistema | Automações | Agentes de IA</title>
        <meta name="description" content="Especialista em Automação B2B, Sistemas Web e Agentes de Inteligência Artificial." />
      </Helmet>
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled || mobileMenuOpen ? "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <a href="#top" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 transition-transform hover:scale-105 relative z-20">
            <img
              src="/logo-hljdev-removebg-preview.png"
              alt="HLJ DEV"
              className="h-16 w-auto brightness-0 invert scale-[2] origin-left"
            />
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm relative z-20">
            <Link to="/shop" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Sites & Sistemas</Link>
            <a href="#cases" className={linkClass("cases")}>Cases de Sucesso</a>
            <a href="#contact" className="inline-flex items-center justify-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 uppercase tracking-tighter font-black">
              Falar com Agente
            </a>
          </nav>

          <button
            className="md:hidden relative z-20 p-2 text-foreground focus:outline-none transition-colors hover:text-primary hover:scale-110 active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-7 w-7 text-primary transition-transform rotate-90" /> : <Menu className="h-7 w-7 transition-transform" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-0 left-0 w-full h-screen bg-background/95 backdrop-blur-xl z-10 flex flex-col pt-24 px-6 md:hidden border-b border-border/40 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
            <nav className="flex flex-col gap-2 mt-4">
              <span className="text-xs uppercase tracking-widest text-primary font-bold mb-4 opacity-70 border-b border-primary/20 pb-2">Navegação</span>
              <Link 
                to="/shop" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xl py-4 border-b border-border/40 font-medium text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300"
              >
                Sites & Sistemas
              </Link>
              <a 
                href="#cases" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-xl py-4 border-b border-border/40 font-medium transition-colors hover:text-primary hover:translate-x-2 duration-300 ${activeId === "cases" ? "text-primary" : "text-muted-foreground"}`}
              >
                Cases de Sucesso
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xl mt-4 py-4 rounded-xl text-center bg-primary/10 font-bold text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(20,255,20,0.1)] transition-all duration-300 active:scale-95"
              >
                Falar com Agente
              </a>
            </nav>
          </div>
        )}
      </header>

      <main className="flex flex-col items-center w-full">
        <Hero />
        <ProjectsGrid />
        <LeadChat />
      </main>

      <footer className="w-full relative border-t border-primary/20 bg-secondary/10 mt-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(20,255,20,0.5)]"></div>

        <div className="max-w-6xl mx-auto px-4 pb-16 pt-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-muted-foreground items-start">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col items-start justify-start">
            <div className="flex flex-col items-center w-fit">
              <div className="flex items-center transition-transform hover:scale-105 origin-center cursor-pointer -mt-12" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img src="/logo-hljdev-removebg-preview.png" alt="HLJ DEV" className="h-56 object-contain brightness-0 invert" />
              </div>
              <div className="flex items-center gap-4 -mt-20">
                <a href="https://instagram.com/ohenriquejunqueira" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-border/40 hover:border-primary/50 shadow-sm hover:shadow-[0_0_15px_rgba(20,255,20,0.2)]">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-border/40 hover:border-primary/50 shadow-sm hover:shadow-[0_0_15px_rgba(20,255,20,0.2)]">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4 pt-8">
            <h4 className="font-bold text-foreground text-base tracking-wide uppercase opacity-80">Soluções Digitais</h4>
            <nav className="flex flex-col gap-3 font-medium">
              <a href="#cases" className="hover:text-primary transition-colors hover:translate-x-1 w-fit duration-300">Cases de Sucesso</a>
              <Link to="/shop" className="hover:text-primary transition-colors hover:translate-x-1 w-fit duration-300">Sites & Sistemas</Link>
            </nav>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4 pt-8">
            <h4 className="font-bold text-foreground text-base tracking-wide uppercase opacity-80">Suporte & Cliente</h4>
            <nav className="flex flex-col gap-3 font-medium">
              <a href="https://wa.me/5548991013293" className="hover:text-primary transition-colors hover:translate-x-1 w-fit duration-300" target="_blank" rel="noopener noreferrer">WhatsApp de Atendimento</a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 bg-background/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <span>© {new Date().getFullYear()} HLJ DEV • Todos os Direitos Reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

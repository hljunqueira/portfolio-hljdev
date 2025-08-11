import { SocialBar } from "@/components/site/SocialBar";
import { Hero } from "@/components/site/Hero";
import { ProjectsGrid } from "@/components/site/ProjectsGrid";
import { LeadForm } from "@/components/site/LeadForm";
import { Link } from "react-router-dom";
import { About } from "@/components/site/About";
import { Experience } from "@/components/site/Experience";
import { Skills } from "@/components/site/Skills";
import { SkillsGrid } from "@/components/site/SkillsGrid";
import { SkillsShowcase } from "@/components/site/SkillsShowcase";
import { Education } from "@/components/site/Education";
import { useEffect, useMemo, useState } from "react";

const Index = () => {
  const [activeId, setActiveId] = useState<string>("about");

  useEffect(() => {
    const ids = ["about", "experience", "education", "projects", "skills", "contact"] as const;
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
      {
        root: null,
        // ativa quando a seção entra no meio da tela
        rootMargin: "-45% 0px -50% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const linkClass = (id: string) =>
    `hover:text-primary transition-colors ${activeId === id ? "text-primary" : ""}`;

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <SocialBar />

      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border/60 max-w-full">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-4">
        <a href="#top" className="text-lg font-bold tracking-tight">
          <span className="text-primary">Hlj</span>.dev
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#about" className={linkClass("about")} aria-current={activeId === "about" ? "page" : undefined}>Sobre</a>
          <a href="#experience" className={linkClass("experience")} aria-current={activeId === "experience" ? "page" : undefined}>Experiência</a>
          <a href="#projects" className={linkClass("projects")} aria-current={activeId === "projects" ? "page" : undefined}>Cases de Sucesso</a>
          <a href="#skills" className={linkClass("skills")} aria-current={activeId === "skills" ? "page" : undefined}>Habilidades</a>
          <a href="#contact" className={linkClass("contact")} aria-current={activeId === "contact" ? "page" : undefined}>Contato</a>
        </nav>
        </div>
      </header>

      <main>
        <Hero />
        <About />
        <Experience />
        <Education />
        <ProjectsGrid />
        <SkillsShowcase />
        <LeadForm />
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted-foreground flex items-center justify-between">
        <p>© {new Date().getFullYear()} Hlj.dev</p>
        <div className="flex items-center gap-4">
          <a href="https://wa.me/5548991013293" className="hover:text-primary" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <Link to="/login" className="opacity-60 hover:opacity-100">Acesso</Link>
          <Link to="/admin" className="sr-only">Admin</Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;

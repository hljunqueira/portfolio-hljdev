import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, CalendarDays } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";

function useTypewriter(text: string, speed = 60, start = true) {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (!start) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setValue(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, start]);
  return value;
}

export function Hero() {
  const [showTyping, setShowTyping] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowTyping(true), 600);
    return () => clearTimeout(t);
  }, []);
  const typed = useTypewriter("Tecnologia prática, sem complicação", 50, showTyping);

  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 min-h-[85vh] md:min-h-[90vh]">
      <Helmet>
        <title>Hlj.dev | Tecnologia prática, sem complicação</title>
        <meta name="description" content="Landing pages, sistemas e automações entregues em etapas curtas, com comunicação direta e suporte contínuo." />
        <link rel="canonical" href="/" />
      </Helmet>
      <div className="grid md:grid-cols-2 items-center gap-10">
        <div className="text-left animate-enter font-inter">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-3xl text-muted-foreground/90 mb-3 font-medium"
          >
            Olá <motion.span
              className="inline-block"
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 18, -6, 14, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
              aria-hidden
            >👋</motion.span>, eu sou
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            <span className="block text-primary">Henrique Junqueira</span>
            <span className="block text-3xl md:text-5xl font-bold text-foreground/80 mt-2">
              {typed}<span className="inline-block w-[2px] h-[1.1em] -mb-[.2em] bg-primary ml-1 animate-pulse" aria-hidden />
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground max-w-xl"
          >
            Entrego sites, sistemas e automações em etapas curtas, com comunicação direta e suporte contínuo.
          </motion.p>
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild variant="hero" className="font-semibold">
                <a href="#contact" aria-label="Agendar conversa">
                  <CalendarDays className="h-4 w-4" /> Agendar Conversa
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="#projects">Cases de Sucesso</a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://wa.me/5548991013293" target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
                  WhatsApp
                </a>
              </Button>
            </div>
            <span className="mt-2 block text-xs text-muted-foreground/80">Respostas em até 24 horas</span>
          </div>
        </div>
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <span className="pointer-events-none absolute -inset-6 rounded-full blur-2xl" style={{ boxShadow: "var(--shadow-glow)" }} />
            <img
              src="/lovable-uploads/Eu-fundo%20vermelho.png"
              alt="Retrato criativo do desenvolvedor Hlj.dev"
              className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border border-border shadow-lg"
              loading="eager"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

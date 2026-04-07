import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, TrendingUp, Clock, Shield, Terminal } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";

const rotatingWords = [
  "Máquinas de Vendas.",
  "Agentes de I.A.",
  "Vendas 24/7.",
  "Tecnologia de Ponta.",
];

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = rotatingWords[wordIndex];
    let timeoutId: NodeJS.Timeout;

    if (!isDeleting && currentText === word) {
      // Pause at the end of word
      timeoutId = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && currentText === "") {
      // Move to next word
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    } else {
      // Typing or deleting characters
      const nextChar = isDeleting
        ? currentText.slice(0, -1)
        // @ts-ignore
        : word.slice(0, currentText.length + 1);

      timeoutId = setTimeout(() => {
        setCurrentText(nextChar);
      }, isDeleting ? 40 : 80); // Speed of backspace vs typing
    }

    return () => clearTimeout(timeoutId);
  }, [currentText, isDeleting, wordIndex]);

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-10"
    >
      <Helmet>
        <title>HLJ DEV | Máquinas de Vendas, Chatbots e Automação</title>
        <meta
          name="description"
          content="Automações com I.A., CRMs e Sistemas web focados em escalar negócios e eliminar trabalho braçal."
        />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Fundo de Vídeo e Efeitos Técnicos */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted={true}
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-30 select-none pointer-events-none"
        >
          <source src="/video-fundo.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay de Grade Técnica */}
        <div 
          className="absolute inset-0 z-[1] opacity-[0.1]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.15) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.15) 1px, transparent 1px)`,
            backgroundSize: '45px 45px'
          }}
        />
        
        {/* Efeito de Scanlines */}
        <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.02] overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>

        {/* Depth Gradient */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-background/10 via-background/60 to-background pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-0 pb-16 md:pt-4 md:pb-24 relative z-10">
        <div className="text-center space-y-8">
          {/* Headline com palavra rotativa */}
          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.1] px-4"
          >
            {["Escale", "sua", "operação", "com"].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.2em]"
              >
                {word}
              </motion.span>
            ))}
            <br className="hidden md:block" />
            <motion.span 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-primary font-mono drop-shadow-[0_0_20px_rgba(20,255,20,0.3)] mt-2 md:mt-0"
            >
              <span>{currentText}</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-[4px] h-[0.7em] bg-primary ml-1 translate-y-1"
              />
            </motion.span>
          </motion.h1>



          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              asChild
              size="lg"
              className="relative w-full sm:w-auto h-16 px-10 text-lg font-black shadow-2xl shadow-primary/20 group transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/40 overflow-hidden bg-primary text-primary-foreground border-none rounded-none tracking-tight"
            >
              <a href="#contact">
                <span className="relative z-10 flex items-center gap-3">
                  <Terminal className="h-5 w-5" />
                  Ativar Máquina de Vendas
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </span>
                
                {/* Scanner bar effect */}
                <motion.div 
                  className="absolute inset-x-0 w-full h-[2px] bg-white/40 z-20"
                  animate={{ top: ['-10%', '110%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Hover shine */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-base font-medium group border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
            >
              <a
                href="https://wa.me/5548991013293?text=Oi%20Henrique,%20vim%20pelo%20site%20e%20queria%20testar%20seu%20rob%C3%B4!"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Bot className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                Chamar no WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

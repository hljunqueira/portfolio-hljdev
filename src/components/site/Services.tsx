import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Bot, Code2, Workflow, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, MouseEvent } from "react";

const services = [
  {
    title: "Automações e Bots\nde Atendimento",
    description:
      "Chega de perder clientes por tempo de resposta lento no WhatsApp. Agentes de Inteligência Artificial que atendem, qualificam e agendam reuniões em 3 segundos, 24/7.",
    icon: <Bot className="h-7 w-7" />,
    features: [
      "Atendimento instantâneo real",
      "Fim do gargalo comercial",
      "Triagem 100% automatizada",
    ],
    cta: "Ter Meu Agente",
    gradient: "from-primary/30 to-primary/5",
  },
  {
    title: "Sistemas Web\nSob Medida",
    description:
      "Abandone o caos de planilhas quebradas e softwares lentos. Plataformas robustas com Dashboards em tempo real para destravar a gestão da sua operação.",
    icon: <Code2 className="h-7 w-7" />,
    features: [
      "Fim da desordem de dados",
      "Controle total em tela única",
      "Interfaces ultra-ágeis",
    ],
    cta: "Destravar Gestão",
    gradient: "from-green-500/30 to-emerald-900/10",
  },
  {
    title: "Treinamentos e\nBots em n8n",
    description:
      "Pare de bater cabeça tentando aprender I.A. sozinho. Implemente workflows maduros no n8n e tenha nossa biblioteca de prompts para escalar sua equipe hoje.",
    icon: <Workflow className="h-7 w-7" />,
    features: [
      "Curva de aprendizado zerada",
      "Pack de Prompts validados",
      "Automação visível",
    ],
    cta: "Acelerar Equipe",
    gradient: "from-teal-400/30 to-primary/10",
  },
];

function ServiceCard({
  s,
  i,
}: {
  s: (typeof services)[number];
  i: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouse(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const spotlightBg = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, hsl(350 89% 60% / 0.06), transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative bg-card border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-[box-shadow,border-color] duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* Mouse-follow spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: spotlightBg }}
      />

      {/* Gradient corner */}
      <div
        className={`absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br ${s.gradient} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
          {s.icon}
        </div>

        <h3 className="text-xl font-bold mb-3 whitespace-pre-line leading-tight">
          {s.title}
        </h3>

        <p className="text-muted-foreground mb-6 leading-relaxed flex-grow text-[0.935rem]">
          {s.description}
        </p>

        <ul className="space-y-3 mb-8">
          {s.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-primary/70 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          className="w-full group/btn border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
          asChild
        >
          <a href="#contact">
            {s.cta}
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}

export function Services() {
  return (
    <section id="services" className="relative w-full py-24 md:py-32 scroll-mt-20 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/40 via-secondary/20 to-background" />

      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Transforme Custo Operacional em <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(20,255,20,0.5)]">
              Lucro Real
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((s, i) => (
            <ServiceCard key={s.title} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

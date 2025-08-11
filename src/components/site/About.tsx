import { motion } from "framer-motion";
import { Code2, Network, GitBranch, Cloud, Layers, Accessibility, Workflow, Boxes } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-24">
      <motion.header className="mb-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <h2 id="about-title" className="text-2xl md:text-3xl font-bold">Sobre Mim</h2>
        <p className="text-muted-foreground">Resumo profissional e o que me move.</p>
        <p className="text-sm text-muted-foreground mt-1">Santa Catarina, Brasil</p>
      </motion.header>

      <motion.div className="grid gap-6 grid-cols-1" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
        <motion.div className="space-y-4 text-muted-foreground leading-relaxed" variants={fadeUp}>
          <p>
            Sou formado em Redes de Computadores e atuo como Analista de Suporte Jr. na Goomer (Food Service),
            unindo visão técnica de infraestrutura com foco em produto para entregar sistemas web estáveis e integrações
            eficientes.
          </p>
          <div>
            <p className="mb-2">No dia a dia, trabalho com:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-semibold text-foreground">Troubleshooting técnico</span> em produção (ambiente web)
              </li>
              <li>
                <span className="font-semibold text-foreground">Integrações com ERPs</span> via <span className="font-semibold text-foreground">APIs REST</span> (mapeamento de dados e testes de conectividade)
              </li>
              <li>
                <span className="font-semibold text-foreground">Melhoria contínua</span> de sistemas e <span className="font-semibold text-foreground">suporte a usuários</span>
              </li>
            </ul>
          </div>
          <p>
            Atualmente me especializo como Desenvolvedor Full Stack por meio de um MBA em Desenvolvimento Fullstack de Sistemas
            Modernos para Nuvem (Cloud Native), aprofundando arquitetura, escalabilidade e performance com foco em experiência do usuário.
          </p>
          <p>
            Tenho interesse em tecnologias web, automação de processos e desenvolvimento orientado a serviços. Meu objetivo é atuar em projetos
            desafiadores e inovadores, contribuindo com código limpo, pensamento analítico e foco em resultados.
          </p>
          <p>
            Quer conhecer minha trajetória completa? Veja meu
            <a className="text-primary hover:underline ml-1" href="https://www.linkedin.com/in/hljunqueira/" target="_blank" rel="noopener noreferrer">currículo e recomendações no LinkedIn</a>.
          </p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <h3 className="text-base font-semibold mb-3">Tecnologias</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Core stack */}
            <div className="col-span-2">
              <div className="text-xs uppercase text-muted-foreground mb-2">Core</div>
              <div className="grid grid-cols-3 gap-2">
                <TechPill label="React" icon={<ReactSvg />} />
                <TechPill label="TypeScript" icon={<TsSvg />} />
                <TechPill label="Node.js" icon={<NodeSvg />} />
              </div>
            </div>
            {/* UI/UX */}
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-2">UI / UX</div>
              <div className="grid grid-cols-1 gap-2">
                <TechPill label="Tailwind" icon={<TailwindSvg />} />
                <TechPill label="Design System" icon={<Layers className="h-4 w-4" />} />
                <TechPill label="A11y (WCAG)" icon={<Accessibility className="h-4 w-4" />} />
              </div>
            </div>
            {/* Integrações */}
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-2">Integrações</div>
              <div className="grid grid-cols-1 gap-2">
                <TechPill label="ERPs / REST / Webhooks" icon={<Network className="h-4 w-4" />} />
                <TechPill label="OAuth2 / JWT" icon={<Boxes className="h-4 w-4" />} />
                <TechPill label="Mapeamento de dados" icon={<GitBranch className="h-4 w-4" />} />
              </div>
            </div>
            {/* Cloud & DevOps */}
            <div className="col-span-2">
              <div className="text-xs uppercase text-muted-foreground mb-2">Cloud & DevOps</div>
              <div className="grid grid-cols-3 gap-2">
                <TechPill label="Docker" icon={<Cloud className="h-4 w-4" />} />
                <TechPill label="CI/CD" icon={<Workflow className="h-4 w-4" />} />
                <TechPill label="Observabilidade" icon={<Code2 className="h-4 w-4" />} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}


// Small UI helpers for icon+label pills
function TechPill({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-secondary/40 px-2.5 py-1.5 text-xs">
      <span className="grid h-5 w-5 place-items-center rounded-sm bg-secondary text-primary">{icon}</span>
      <span className="leading-none">{label}</span>
    </div>
  );
}

function ReactSvg() {
  return (
    <svg viewBox="0 0 256 256" className="h-4 w-4" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="12">
        <ellipse cx="128" cy="128" rx="20" ry="20" />
        <ellipse cx="128" cy="128" rx="60" ry="20" transform="rotate(60 128 128)" />
        <ellipse cx="128" cy="128" rx="60" ry="20" transform="rotate(120 128 128)" />
      </g>
    </svg>
  );
}

function TsSvg() {
  return (
    <svg viewBox="0 0 256 256" className="h-4 w-4" aria-hidden>
      <rect width="256" height="256" rx="8" fill="currentColor" opacity="0.15" />
      <text x="128" y="162" textAnchor="middle" fontSize="116" fill="currentColor" fontFamily="Inter, system-ui">TS</text>
    </svg>
  );
}

function NodeSvg() {
  return (
    <svg viewBox="0 0 256 256" className="h-4 w-4" aria-hidden>
      <polygon points="128,16 236,80 236,176 128,240 20,176 20,80" fill="none" stroke="currentColor" strokeWidth="10" />
      <text x="128" y="160" textAnchor="middle" fontSize="50" fill="currentColor" fontFamily="Inter, system-ui">node</text>
    </svg>
  );
}

function TailwindSvg() {
  return (
    <svg viewBox="0 0 256 256" className="h-4 w-4" aria-hidden>
      <path d="M80 128c24-48 72-48 96 0 16 32 40 32 56 16-8 32-40 48-64 32-24-16-40-16-64 0-24 16-56 0-64-32 16 16 40 16 56-16z" fill="currentColor" />
    </svg>
  );
}



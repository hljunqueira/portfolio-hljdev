import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import {
  siReact,
  siNextdotjs,
  siTypescript,
  siJavascript,
  siTailwindcss,
  siNodedotjs,
  siDocker,
  siGraphql,
  siMongodb,
  siMysql,
  siGit,
  siLinux,
  siNginx,
  siFigma,
  siPostman,
  siPython,
} from "simple-icons/icons";

type Tech = { name: string };

// Ordem curada por grupos: Frontend → Backend → DevOps/Tools
const techs: Tech[] = [
  // Frontend
  { name: "React" },
  { name: "Next.js" },
  { name: "TypeScript" },
  { name: "JavaScript" },
  { name: "Tailwind" },
  // Backend
  { name: "Node.js" },
  { name: "GraphQL" },
  { name: "MongoDB" },
  { name: "MySQL" },
  { name: "Python" },
  // DevOps/Tools
  { name: "Docker" },
  { name: "Git" },
  { name: "Linux" },
  { name: "Nginx" },
  { name: "Postman" },
  { name: "Figma" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function SkillsShowcase() {
  return (
    <section id="skills" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-24">
      <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold">
            Habilidades <span className="bg-gradient-to-r from-[hsl(var(--primary)/0.85)] via-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)] bg-clip-text text-transparent">Técnicas</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Principais tecnologias com as quais trabalho
          </p>
        </motion.div>

      {/* Duas linhas animadas de cards (como no vídeo) */}
      <div className="space-y-6">
        <MarqueeCards items={techs} durationMs={32000} />
        <MarqueeCards items={techs} durationMs={36000} reverse />
      </div>
    </section>
  );
}

// Ícones de marcas via simple-icons (cores oficiais)
function TechIcon({ name }: { name: string }) {
  const cls = "h-6 w-6";
  const iconsMap: Record<string, { title: string; hex: string; path: string }> = {
    React: siReact,
    "Next.js": siNextdotjs,
    TypeScript: siTypescript,
    JavaScript: siJavascript,
    Tailwind: siTailwindcss,
    "Node.js": siNodedotjs,
    Docker: siDocker,
    GraphQL: siGraphql,
    MongoDB: siMongodb,
    MySQL: siMysql,
    Git: siGit,
    Linux: siLinux,
    Nginx: siNginx,
    Figma: siFigma,
    Postman: siPostman,
    Python: siPython,
  };

  const icon = iconsMap[name];
  if (icon) {
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label={icon.title} className={cls} style={{ color: `#${icon.hex}` }}>
        <path d={icon.path} fill="currentColor" />
      </svg>
    );
  }

  const initials = name
    .replace(/[^A-Za-z]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return <div className="h-6 w-6 grid place-items-center text-xs font-bold">{initials || "?"}</div>;
}

type MarqueeCardsProps = {
  items: Tech[];
  reverse?: boolean;
  durationMs?: number;
};

function MarqueeCards({ items, reverse = false, durationMs = 32000 }: MarqueeCardsProps) {
  const styleVars = { "--marquee-duration": `${durationMs}ms` } as CSSProperties;

  const Tile = ({ name, ghost = false }: { name: string; ghost?: boolean }) => (
    <div className="min-w-[180px]">
      <div
        className={`group rounded-xl border bg-secondary/40 p-6 text-center transition-all ${
          ghost ? "" : "hover:bg-secondary/60 hover:shadow-lg hover:ring-1 hover:ring-primary/30 hover-glow hover-lift"
        }`}
      >
        <div className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-lg bg-secondary text-primary border border-border ${ghost ? "" : "transition-transform duration-300 group-hover:scale-110"}`}>
          <TechIcon name={name} />
        </div>
        <div className="text-sm font-medium text-foreground/90">{name}</div>
      </div>
    </div>
  );

  return (
    <div className={`marquee marquee-mask ${reverse ? "marquee-reverse" : ""}`} style={styleVars}>
      <div className="marquee-inner">
        <div className="flex items-stretch gap-6">
          {items.map((t) => (
            <Tile key={`a-${t.name}`} name={t.name} />
          ))}
          {items.map((t) => (
            <Tile key={`b-${t.name}`} name={t.name} ghost />
          ))}
        </div>
      </div>
    </div>
  );
}

 



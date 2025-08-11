import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type Tech = { name: string };

const techs: Tech[] = [
  { name: "JavaScript" },
  { name: "TypeScript" },
  { name: "React" },
  { name: "Next.js" },
  { name: "Node.js" },
  { name: "Python" },
  { name: "Git" },
  { name: "Docker" },
  { name: "MongoDB" },
  { name: "MySQL" },
  { name: "GraphQL" },
  { name: "Tailwind" },
  { name: "Linux" },
  { name: "Nginx" },
  { name: "Figma" },
  { name: "Postman" },
];

function TechIcon({ name }: { name: string }) {
  // Minimal inline icons. For names not handled, render initials.
  const common = "h-10 w-10 text-primary";
  switch (name) {
    case "React":
      return (
        <svg viewBox="0 0 256 256" className={common} aria-hidden>
          <g fill="none" stroke="currentColor" strokeWidth="14">
            <ellipse cx="128" cy="128" rx="24" ry="24" />
            <ellipse cx="128" cy="128" rx="68" ry="24" transform="rotate(60 128 128)" />
            <ellipse cx="128" cy="128" rx="68" ry="24" transform="rotate(120 128 128)" />
          </g>
        </svg>
      );
    case "TypeScript":
      return (
        <svg viewBox="0 0 256 256" className={common} aria-hidden>
          <rect width="256" height="256" rx="16" fill="currentColor" opacity="0.15" />
          <text x="128" y="162" textAnchor="middle" fontSize="120" fill="currentColor" fontFamily="Inter, system-ui">TS</text>
        </svg>
      );
    case "JavaScript":
      return (
        <svg viewBox="0 0 256 256" className={common} aria-hidden>
          <rect width="256" height="256" rx="16" fill="currentColor" opacity="0.15" />
          <text x="128" y="162" textAnchor="middle" fontSize="120" fill="currentColor" fontFamily="Inter, system-ui">JS</text>
        </svg>
      );
    case "Next.js":
      return (
        <svg viewBox="0 0 256 256" className={common} aria-hidden>
          <circle cx="128" cy="128" r="80" fill="none" stroke="currentColor" strokeWidth="14" />
          <text x="128" y="156" textAnchor="middle" fontSize="96" fill="currentColor" fontFamily="Inter, system-ui">N</text>
        </svg>
      );
    case "Node.js":
      return (
        <svg viewBox="0 0 256 256" className={common} aria-hidden>
          <polygon points="128,16 236,80 236,176 128,240 20,176 20,80" fill="none" stroke="currentColor" strokeWidth="12" />
          <text x="128" y="158" textAnchor="middle" fontSize="56" fill="currentColor" fontFamily="Inter, system-ui">node</text>
        </svg>
      );
    case "Tailwind":
      return (
        <svg viewBox="0 0 256 256" className={common} aria-hidden>
          <path d="M80 128c24-48 72-48 96 0 16 32 40 32 56 16-8 32-40 48-64 32-24-16-40-16-64 0-24 16-56 0-64-32 16 16 40 16 56-16z" fill="currentColor" />
        </svg>
      );
    default:
      const initials = name
        .replace(/[^A-Za-z]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");
      return (
        <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center text-primary font-bold">
          {initials || "?"}
        </div>
      );
  }
}

export function SkillsGrid() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-6">
        <h2 id="skills-title" className="text-2xl md:text-3xl font-bold">
          Habilidades Técnicas
        </h2>
        <p className="text-muted-foreground">Principais tecnologias com as quais trabalho</p>
      </div>

      {/* Mobile: rolagem horizontal em linha; Desktop: grid multi-linhas */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-4 snap-x snap-mandatory">
          {techs.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="snap-start min-w-[160px]"
            >
              <Card className="h-full bg-secondary/40">
                <CardContent className="p-5 grid place-items-center gap-3">
                  <TechIcon name={t.name} />
                  <span className="text-sm text-muted-foreground">{t.name}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {techs.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.04 }}
          >
            <Card className="h-full bg-secondary/40 hover:bg-secondary/60 transition-colors">
              <CardContent className="p-6 grid place-items-center gap-3">
                <TechIcon name={t.name} />
                <span className="text-sm text-muted-foreground">{t.name}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}



import { motion } from "framer-motion";

const techs = [
  { name: "React", svg: (
      <svg viewBox="0 0 256 256" className="h-8 w-8" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="16">
          <ellipse cx="128" cy="128" rx="28" ry="28"/>
          <ellipse cx="128" cy="128" rx="75" ry="28" transform="rotate(60 128 128)"/>
          <ellipse cx="128" cy="128" rx="75" ry="28" transform="rotate(120 128 128)"/>
        </g>
      </svg>
    ) },
  { name: "TypeScript", svg: (
      <svg viewBox="0 0 256 256" className="h-8 w-8" aria-hidden>
        <rect width="256" height="256" rx="16" fill="currentColor" opacity="0.15" />
        <text x="128" y="160" textAnchor="middle" fontSize="120" fill="currentColor" fontFamily="Inter, system-ui">TS</text>
      </svg>
    ) },
  { name: "Node.js", svg: (
      <svg viewBox="0 0 256 256" className="h-8 w-8" aria-hidden>
        <polygon points="128,16 236,80 236,176 128,240 20,176 20,80" fill="none" stroke="currentColor" strokeWidth="16" />
        <text x="128" y="156" textAnchor="middle" fontSize="64" fill="currentColor" fontFamily="Inter, system-ui">node</text>
      </svg>
    ) },
  { name: "Tailwind", svg: (
      <svg viewBox="0 0 256 256" className="h-8 w-8" aria-hidden>
        <path d="M80 128c24-48 72-48 96 0 16 32 40 32 56 16-8 32-40 48-64 32-24-16-40-16-64 0-24 16-56 0-64-32 16 16 40 16 56-16z" fill="currentColor" />
      </svg>
    ) },
];

export function TechIcons() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="tech-title">
      <h2 id="tech-title" className="sr-only">Tecnologias</h2>
      <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
        {techs.map((t, i) => (
          <motion.div
            key={t.name}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="text-primary">{t.svg}</div>
            <span className="text-sm">{t.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

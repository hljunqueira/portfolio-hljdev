import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EducationItem = {
  course: string;
  school: string;
  period: string;
  details?: string[];
  logoSrc?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const education: EducationItem[] = [
  {
    course:
      "Pós‑graduação Lato Sensu (MBA) — Desenvolvimento Fullstack de Sistemas Modernos para Nuvem (Cloud Native)",
    school: "UNESC Digital",
    period: "fev/2025 — ago/2025",
    logoSrc: "/lovable-uploads/unesc-digital.jpg",
  },
  {
    course: "Tecnólogo — Redes de Computadores",
    school: "Universidade Cruzeiro do Sul",
    period: "fev/2019 — abr/2021",
    logoSrc: "/lovable-uploads/cruzeiro-edu.png",
  },
];

export function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-24">
      <motion.header className="mb-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <h2 id="education-title" className="text-2xl md:text-3xl font-bold">Formação</h2>
        <p className="text-muted-foreground">Estudos e especializações.</p>
      </motion.header>

      <div className="grid gap-4 grid-cols-1">
        {education.map((ed) => (
          <motion.div key={ed.course} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <Card className="overflow-hidden border bg-secondary/40 hover:bg-secondary/60 transition-colors">
              <div className="flex items-center gap-3 p-5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
                  {ed.logoSrc ? (
                    <img src={ed.logoSrc} alt="logo" className="h-8 w-8 object-contain" loading="lazy" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted" />
                  )}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-lg leading-snug">
                    {ed.course}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground truncate">{ed.school} · {ed.period}</div>
                </div>
              </div>
              {ed.details?.length ? (
                <CardContent className="pt-0 pb-6">
                  <ul className="list-disc pl-8 text-sm text-muted-foreground space-y-1">
                    {ed.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </CardContent>
              ) : null}
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}



import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const skills = [
  { category: "Frontend", items: ["React", "TypeScript", "Vite", "Tailwind", "shadcn/ui"] },
  { category: "Ferramentas", items: ["Git", "Figma", "ESLint", "Prettier"] },
  { category: "Boas práticas", items: ["Acessibilidade", "Componentização", "UX", "SEO básico"] },
];

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="container mx-auto py-16">
      <motion.header className="mb-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <h2 id="skills-title" className="text-2xl md:text-3xl font-bold">Habilidades</h2>
        <p className="text-muted-foreground">Tecnologias e conhecimentos que utilizo no dia a dia.</p>
      </motion.header>

      <motion.div className="grid gap-6 md:grid-cols-3" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
        {skills.map((group) => (
          <motion.div key={group.category} className="space-y-3" variants={fadeUp}>
            <h3 className="text-base font-semibold">{group.category}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Badge key={item} variant="outline">{item}</Badge>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}



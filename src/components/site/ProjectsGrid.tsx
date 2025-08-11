import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export type Project = {
  title: string;
  description: string;
  image: string;
  status?: string; // ex.: Em Desenvolvimento
  featuresLeft?: string[]; // lista de bullets (coluna esquerda)
  featuresRight?: string[]; // lista de bullets (coluna direita)
  techs?: string[]; // chips de tecnologias
  liveDemo?: string; // link demo
};

const defaultProjects: Project[] = [
  {
    title: "JK ConstruÃ§Ãµes",
    description:
      "Site institucional para construtora, apresentando serviÃ§os, portfÃ³lio de obras e contato rÃ¡pido.",
    image: "/lovable-uploads/jk-print.png",
    status: "ProduÃ§Ã£o",
    featuresLeft: ["SeÃ§Ãµes: Nossa HistÃ³ria, ServiÃ§os, Projetos", "OrÃ§amento e contato via WhatsApp"],
    featuresRight: ["Design responsivo", "SEO bÃ¡sico"],
    techs: ["JavaScript", "CSS", "HTML", "SCSS"],
    liveDemo: "https://jkconstrucoes.com.br",
  },
  {
    title: "Sistema de RH e Recrutamento â€“ Isabel Cunha RH",
    description:
      "Plataforma de RH e recrutamento com foco em triagem de candidatos e gestÃ£o de processos seletivos para a consultoria Isabel Cunha RH.",
    image: "/lovable-uploads/isabel-print.png",
    status: "ProduÃ§Ã£o",
    featuresLeft: ["GestÃ£o de Vagas e Candidatos", "Pipeline de Recrutamento"],
    featuresRight: ["Ãrea do Candidato/Empresa", "Banco de Talentos"],
    techs: ["TypeScript", "JavaScript", "PLpgSQL", "Outros"],
    liveDemo: "https://isabelcunharh.com.br",
  },
  {
    title: "Dumar MÃ³veis Planejados",
    description:
      "Site institucional com portfÃ³lio de mÃ³veis planejados, foco em captaÃ§Ã£o de leads e apresentaÃ§Ã£o de projetos.",
    image: "/lovable-uploads/dumar-print.png",
    status: "ProduÃ§Ã£o",
    featuresLeft: ["PortfÃ³lio de projetos", "Contato rÃ¡pido"],
    featuresRight: ["Design responsivo", "SEO bÃ¡sico"],
    techs: ["TypeScript", "CSS", "HTML"],
    liveDemo: "https://dumarplanejados.com.br",
  },
  {
    title: "PortfÃ³lio Hlj.dev",
    description: "Meu portfÃ³lio pessoal com projetos, habilidades e contato. Evoluindo continuamente.",
    image: "/lovable-uploads/portfolio-hljdev.png",
    status: "Em desenvolvimento",
    techs: ["TypeScript", "CSS"],
  },
  
];

export function ProjectsGrid({ projects = defaultProjects }: { projects?: Project[] }) {

  return (
    <section id="projects" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-24">
      <motion.header className="mb-8" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl md:text-3xl font-bold">Cases de Sucessos</h2>
        <p className="text-muted-foreground mt-1">Resultados entregues para clientes reais.</p>
      </motion.header>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Card className="overflow-hidden border bg-secondary/40">
              {/* Imagem de capa */}
              <div className="w-full overflow-hidden aspect-[16/9] bg-black/20">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{p.title}</CardTitle>
                  {p.status && (
                    <span className={`text-xs rounded-full px-2 py-1 ${p.status === "ProduÃ§Ã£o" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                      {p.status}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{p.description}</p>

                {(p.featuresLeft?.length || p.featuresRight?.length) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {p.featuresLeft?.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {p.featuresRight?.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {p.techs && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {p.techs.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                )}

                {p.liveDemo && (
                  <a
                    href={p.liveDemo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Live Demo
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

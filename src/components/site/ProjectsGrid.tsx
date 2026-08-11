import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";

export type Project = {
  title: string;
  description: string;
  image: string;
  status?: string; 
  featuresLeft?: string[]; 
  featuresRight?: string[]; 
  techs?: string[]; 
  liveDemo?: string; 
};

const defaultProjects: Project[] = [
  {
    title: "Isabel Cunha RH — Plataforma de Recrutamento & Seleção",
    description: "Plataforma web criada para automatizar a triagem de candidatos, simplificar o envio de currículos e agilizar todo o processo seletivo do RH.",
    image: "/isabel-print.png",
    status: "Recrutamento & RH",
    featuresLeft: ["Poupou 80% do tempo dos Analistas de RH", "Portal Self-Service para Candidatos"],
    featuresRight: ["Relatórios Instantâneos de Vagas", "Organização Automática de Currículos"],
    techs: ["SaaS & Gestão", "Automação RH", "Nuvem Segura"],
    liveDemo: "https://isabelcunharh.com.br",
  },
  {
    title: "Dumar Móveis — Planejados & Ambientes de Luxo",
    description: "Vitrine digital de alto padrão desenvolvida para apresentar projetos de interiores exclusivos e direcionar leads qualificados ao WhatsApp de vendas.",
    image: "/dumar.png",
    status: "Móveis & Arquitetura",
    featuresLeft: ["Catálogo em Alta Resolução", "Captação Rápida no Mobile"],
    featuresRight: ["Carregamento Ultra-rápido & SEO"],
    techs: ["Design UI/UX", "Móveis Planejados", "WhatsApp Funnel"],
    liveDemo: "https://dumarplanejados.com.br",
  },
  {
    title: "Up Ideias — Gestão & Validação de Negócios",
    description: "Plataforma interativa projetada para organizar, estruturar e validar novas ideias de produtos e negócios de forma simples, moderna e colaborativa.",
    image: "/upideias.png",
    status: "SaaS & Inovação",
    featuresLeft: ["Dashboard Interativo de Projetos", "Validação Ágil de Ideias"],
    featuresRight: ["Experiência Fluida & Responsiva"],
    techs: ["SaaS & Inovação", "React & Cloud", "Interface Moderna"],
    liveDemo: "https://app-upideias.vercel.app/",
  },
  {
    title: "MDR Informática — Soluções & Assistência Técnica",
    description: "Plataforma comercial completa para apresentação de produtos, celulares, serviços de assistência técnica e atendimento direto ao cliente.",
    image: "/mdr.png",
    status: "Tecnologia & Serviços",
    featuresLeft: ["Exibição Clara de Produtos & Serviços", "Contato Direto via WhatsApp"],
    featuresRight: ["Navegação Otimizada no Celular"],
    techs: ["Tecnologia", "Assistência Técnica", "Vendas Online"],
    liveDemo: "https://mdrinformaticaecelulares.com.br/",
  },
  {
    title: "Salon Art — Beleza & Estética Premium",
    description: "Presença digital sofisticada para valorização de marca, apresentação de serviços de beleza e facilidade no agendamento de clientes.",
    image: "/salonart.png",
    status: "Beleza & Estética",
    featuresLeft: ["Design Elegante & Sofisticado", "Agendamento Direto via WhatsApp"],
    featuresRight: ["Posicionamento de Autoridade"],
    techs: ["Beleza & Estética", "SEO Local", "Web Design"],
    liveDemo: "https://salonart.com.br/",
  }
];

export function ProjectsGrid({ projects = defaultProjects }: { projects?: Project[] }) {

  return (
    <section id="cases" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-24">
      <motion.header className="mb-8" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">Cases de Sucesso</h2>
        <p className="text-muted-foreground mt-1 font-medium">Resultados entregues para clientes reais.</p>
      </motion.header>
      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
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
                    <span className="text-xs rounded-full px-2.5 py-0.5 bg-primary/10 text-primary font-semibold border border-primary/20 shrink-0">
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

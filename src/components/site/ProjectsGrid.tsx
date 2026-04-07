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
    title: "Triagem Automatizada e Gestão (Isabel Cunha RH)",
    description: "A consultoria perdia semanas qualificando candidatos via WhatsApp e e-mail. Construímos uma plataforma do zero que automatiza e centraliza todo o pipeline de contratação.",
    image: "/isabel-print.png",
    status: "Case de Sucesso",
    featuresLeft: ["Poupou 80% do tempo dos Analistas de RH", "Portal Self-Service para Candidatos"],
    featuresRight: ["Relatórios Instantâneos de Vagas", "Fim da desorganização de Currículos PDF"],
    techs: ["SaaS Proprietário", "Alta Escalabilidade", "Dados Seguros"],
    liveDemo: "https://isabelcunharh.com.br",
  },
  {
    title: "Vitrine Digital Premium (Dumar Móveis)",
    description: "Eles faziam projetos incríveis, mas a presença online amadora afastava clientes high-ticket. Entregamos uma vitrine profissional otimizada para capturar leads diretos no WhatsApp da equipe de vendas.",
    image: "/dumar-print.png",
    status: "Impacto Imediato",
    featuresLeft: ["Exibição de Projetos em Alta Resolucão", "Funil de Captação Rápida no Mobile"],
    featuresRight: ["Carregamento Ultra-rápido (SEO Forte)"],
    techs: ["Design UI/UX", "Plataforma Otimizada"],
    liveDemo: "https://dumarplanejados.com.br",
  },
  {
    title: "Portal Digital de Serviços (JK Construções)",
    description: "Construtora com forte atuação offline precisava de credibilidade instantânea para empresas e investidores avaliarem seu portfólio de grandes obras e solicitarem orçamento.",
    image: "/jk-print.png",
    status: "Operação Rápida",
    featuresLeft: ["Catálogo de Obras Concluídas", "Botão de Ação Direto para Diretoria"],
    featuresRight: ["Arquitetura de Conversão B2B"],
    techs: ["Landing Page B2B", "Alta Conversão"],
    liveDemo: "https://jkconstrucoes.com.br",
  },
  
];

export function ProjectsGrid({ projects = defaultProjects }: { projects?: Project[] }) {

  return (
    <section id="projects" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-24">
      <motion.header className="mb-8" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl md:text-3xl font-bold">Cases de Sucessos</h2>
        <p className="text-muted-foreground mt-1">Resultados entregues para clientes reais.</p>
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
                    <span className={`text-xs rounded-full px-2 py-1 ${p.status === "Produção" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
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

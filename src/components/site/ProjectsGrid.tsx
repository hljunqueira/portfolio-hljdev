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
    title: "Isabel Cunha RH — Consultoria Estratégica & Recrutamento",
    description: "Especialista em RH com mais de 20 anos de experiência. Recrutamento, seleção, consultoria estratégica e análise comportamental DISC para empresas.",
    image: "/isabel-print.png",
    status: "Consultoria & RH",
    featuresLeft: ["Poupou 80% do tempo dos Analistas de RH", "Portal Self-Service para Candidatos"],
    featuresRight: ["Relatórios Instantâneos de Vagas", "Organização Automática de Currículos"],
    techs: ["SaaS & Gestão", "Automação RH", "Nuvem Segura"],
    liveDemo: "https://isabelcunharh.com.br",
  },
  {
    title: "Dumar Móveis Planejados — Móveis Sob Medida",
    description: "Especialistas em móveis sob medida e ambientes planejados completos. Cozinhas, closets, banheiros e móveis corporativos de alto padrão.",
    image: "/dumar.png",
    status: "Móveis Sob Medida",
    featuresLeft: ["Catálogo em Alta Resolução", "Captação Rápida no Mobile"],
    featuresRight: ["Carregamento Ultra-rápido & SEO"],
    techs: ["Design UI/UX", "Móveis Planejados", "WhatsApp Funnel"],
    liveDemo: "https://dumarplanejados.com.br",
  },
  {
    title: "UP Ideias — Estratégia, Conteúdo & Métricas com IA",
    description: "O ecossistema UP Ideias: métricas do Instagram com IA (UP Analytics) e plataforma de cursos estilo streaming (UP Creator). Transforme dados em estratégia.",
    image: "/upideias.png",
    status: "SaaS & Inteligência IA",
    featuresLeft: ["Dashboard Interativo de Projetos", "Validação Ágil de Ideias"],
    featuresRight: ["Métricas do Instagram com IA"],
    techs: ["SaaS & IA", "React & Cloud", "Interface Moderna"],
    liveDemo: "https://app-upideias.vercel.app/",
  },
  {
    title: "MDR Informática & Celulares — Assistência & Acessórios",
    description: "Soluções completas em manutenção de smartphones, assistência técnica especializada de informática e venda de produtos com suporte via WhatsApp.",
    image: "/mdr.png",
    status: "Assistência & Tecnologia",
    featuresLeft: ["Exibição Clara de Produtos & Serviços", "Contato Direto via WhatsApp"],
    featuresRight: ["Navegação Otimizada no Celular"],
    techs: ["Tecnologia", "Assistência Técnica", "Vendas Online"],
    liveDemo: "https://mdrinformaticaecelulares.com.br/",
  },
  {
    title: "Salon Art — Studio de Nail Art & Estética de Luxo",
    description: "Studio especializado em nail art, alongamentos e design de unhas de luxo. Agendamento prático e atendimento exclusivo para elevar sua marca.",
    image: "/salonart.png",
    status: "Nail Art & Estética Luxo",
    featuresLeft: ["Design Elegante & Sofisticado", "Agendamento Direto via WhatsApp"],
    featuresRight: ["Posicionamento de Autoridade"],
    techs: ["Beleza & Estética", "SEO Local", "Web Design"],
    liveDemo: "https://salonart.com.br/",
  },
  {
    title: "ZapCar • Gestão Inteligente, Laudo Veicular & Economia",
    description: "Proteja seu patrimônio, economize em manutenções preventivas, realize laudo veicular e valorize seu carro acima da tabela FIPE com o ZapCar.",
    image: "/appzapcar.png",
    status: "Gestão Veicular & App",
    featuresLeft: ["Interface Mobile & PWA", "Consultas & Gestão Ágil"],
    featuresRight: ["Laudo Veicular & Economia FIPE"],
    techs: ["Web App", "Automação", "UI/UX Mobile"],
    liveDemo: "https://appzapcar.com.br/",
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

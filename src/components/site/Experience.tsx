import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const growIn = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

type ExperienceItem = {
  title: string;
  company?: string;
  period: string;
  type?: string;
  responsibilities: string[];
  techs?: string[];
  year: number;
};

const experiences: ExperienceItem[] = [
  {
    title: "Analista de Suporte Jr.",
    company: "Goomer (Food Service)",
    period: "jun/2023 — presente • Sorocaba/SP",
    responsibilities: [
      "Troubleshooting técnico em produção (ambiente web)",
      "Integrações com ERPs via APIs REST: mapeamento de dados e testes de conectividade",
      "Atendimento a usuários (chat/WhatsApp), solucionando chamados de 1º e 2º nível",
      "Reporte de bugs e inconsistências, documentação e validação de correções",
      "Monitoramento de métricas de desempenho, propondo melhorias de performance e estabilidade",
    ],
    techs: ["APIs REST", "ERPs", "Monitoramento", "Suporte N1/N2"],
    year: 2023,
  },
  {
    title: "Técnico de TI",
    company: "Lojas Benoit",
    period: "jun/2022 — jun/2023 • Araranguá/SC",
    responsibilities: [
      "Suporte a estações de trabalho, impressoras e sistemas internos (remoto e presencial)",
      "Manutenção de rede, suporte a ERP interno e configurações de equipamentos",
      "Instalação de software, controle de acesso e atendimento aos usuários",
    ],
    techs: ["Windows", "Redes", "ERP", "Atendimento"],
    year: 2022,
  },
  {
    title: "Analista de Redes",
    company: "Seven Internet",
    period: "jul/2021 — jun/2022 • Balneário Arroio do Silva/SC",
    responsibilities: [
      "Configuração e manutenção de redes LAN, roteadores e equipamentos de backbone",
      "Monitoramento de links e análise de tráfego, resolução de incidentes de conectividade",
      "Suporte em camadas 1 a 3, com foco em disponibilidade e desempenho",
    ],
    techs: ["Redes (camadas 1-3)", "Roteadores", "Backbone"],
    year: 2021,
  },
];

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-24">
      <motion.header className="mb-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
        <h2 id="experience-title" className="text-2xl md:text-3xl font-bold">Experiência</h2>
        <p className="text-muted-foreground">Resumo da minha atuação profissional.</p>
      </motion.header>

      <div className="md:flex gap-6">
        {/* Timeline mínima na esquerda - vermelho e branco */}
        <motion.aside
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="hidden md:flex w-20 md:w-24 relative"
        >
          <div className="absolute left-2.5 md:left-3 top-0 bottom-0 w-px bg-gradient-to-b from-[hsl(var(--primary)/0.3)] to-white/10" />
          <div className="ml-6 flex flex-col justify-between h-full py-2">
            {(["24/25", "22/23", "21/22"] as const).map((label) => (
              <div key={label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_0_3px_rgba(255,0,0,0.25)]" />
                <span className="text-xs font-semibold text-white/85">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.aside>

        {/* Cards */}
        <div className="flex-1 space-y-6">
          {experiences.map((exp, i) => (
            <motion.div key={exp.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={growIn} transition={{ delay: i * 0.05 }}>
              <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>{exp.title}{exp.company ? ` · ${exp.company}` : ""}</span>
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    {exp.responsibilities.map((r) => (
                      <li key={r}>{highlightKeywords(r)}</li>
                    ))}
                  </ul>
                  {exp.techs && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {exp.techs.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Timeline removed on centered layout */}
      </div>
    </section>
  );
}

function highlightKeywords(text: string) {
  const regex = /(Troubleshooting|Integrações?|APIs?\s*REST|Monitoramento|Redes|ERP|Atendimento|desempenho|Backbone)/gi;
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <span key={idx} className="font-semibold text-foreground">
            {part}
          </span>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
}



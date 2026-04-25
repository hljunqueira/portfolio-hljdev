import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, Sparkles, Zap, Code2, 
  Rocket, ArrowLeft, MessageSquare, Star, 
  ExternalLink, Building2, Layout, ShieldCheck,
  Instagram, Linkedin
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const solutions = [
  {
    id: "sites",
    title: "Sites Institucionais de Elite",
    subtitle: "Presença Digital que Vende",
    description: "Sua vitrine 24h por dia. Sites ultra-rápidos, otimizados para o Google e focados em converter visitantes em clientes no WhatsApp.",
    price: "Sob Consulta",
    features: [
      "Design Exclusivo (Zero Templates)",
      "Otimização Máxima para Mobile",
      "Integração Direta com CRM/WhatsApp",
      "Velocidade de Carregamento Incrível",
      "SEO para Busca Regional/Nacional"
    ],
    icon: <Layout className="h-8 w-8 text-primary" />,
    popular: false,
    gradient: "from-primary/20 to-transparent"
  },
  {
    id: "sistemas",
    title: "Sistemas Web e SaaS",
    subtitle: "Gestão e Operação Total",
    description: "Software sob medida para o seu processo. Abandone planilhas lentas e tenha um dashboard centralizado para sua empresa.",
    price: "Projetos sob Medida",
    features: [
      "Dashboards em Tempo Real",
      "Gestão de Leads e Clientes",
      "Automação de Tarefas Repetitivas",
      "Acesso Seguro via Cloud",
      "Arquitetura Escalável (Sem Limites)"
    ],
    icon: <Code2 className="h-8 w-8 text-primary" />,
    popular: true,
    gradient: "from-primary/30 via-primary/10 to-transparent"
  },
  {
    id: "sustentacao",
    title: "Squad HLJ Sustentação",
    subtitle: "Evolução e Suporte",
    description: "Um time de elite cuidando do seu sistema. Evoluções constantes, segurança e suporte técnico para você focar no lucro.",
    price: "Mensalidades Flexíveis",
    features: [
      "Monitoramento 24/7",
      "Backup Diário e Segurança",
      "Novas Funcionalidades todo Mês",
      "Atendimento Prioritário VIP",
      "Consultoria de Processos"
    ],
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    popular: false,
    gradient: "from-primary/30 to-transparent"
  }
];

const cases = [
  {
    title: "Isabel Cunha RH",
    category: "Sistema de Gestão",
    result: "Redução de 80% no tempo de triagem",
    image: "/isabel-print.png",
    link: "https://isabelcunharh.com.br"
  },
  {
    title: "Dumar Móveis",
    category: "Vitrine Digital",
    result: "Aumento real em leads de luxo",
    image: "/dumar-print.png",
    link: "https://dumarplanejados.com.br"
  },
];

const Shop = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <Helmet>
        <title>HLJ DEV | Soluções em Sites & Sistemas</title>
        <meta name="description" content="Desenvolvimento de sistemas exclusivos, sites de alta performance e engenharia de software sob medida." />
      </Helmet>

      {/* Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <header className="fixed top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <ArrowLeft className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Voltar</span>
          </Link>
          <div className="flex-1 flex justify-center">
            <img 
              src="/logo-hljdev-removebg-preview.png" 
              alt="HLJ DEV" 
              className="h-16 w-auto brightness-0 invert scale-[3] origin-center" 
            />
          </div>
          <div className="w-[120px] invisible sm:visible flex justify-end">
            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest" asChild>
              <a href="https://wa.me/5548991013293" target="_blank">Falar com Consultor</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-none uppercase">
              Seu Negócio merece <br/>
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic">Tecnologia sob Medida.</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Desenvolvemos sistemas que resolvem gargalos operacionais e sites que posicionam sua marca como autoridade absoluta.
            </p>
          </motion.div>
        </div>

        {/* Solutions Grid */}
        <div className="max-w-6xl mx-auto px-4 mb-32">
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative group bg-card border ${item.popular ? 'border-primary shadow-[0_0_30px_rgba(20,255,20,0.1)]' : 'border-border/60'} rounded-3xl p-8 flex flex-col h-full overflow-hidden hover:border-primary/40 transition-all duration-300 hover:-translate-y-1`}
              >
                {item.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 flex items-center gap-1 rounded-bl-xl">
                    <Star className="h-3 w-3 fill-current" /> Alta Demanda
                  </div>
                )}

                <div className="relative z-10 flex-grow">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                    {item.icon}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-black leading-none mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">{item.subtitle}</p>
                  </div>

                  <p className="text-muted-foreground text-[14px] leading-relaxed mb-6 font-medium">
                    {item.description}
                  </p>

                  <ul className="space-y-3 mb-8 border-t border-border/40 pt-6">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-zinc-400 group-hover:text-white transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-6 border-t border-border/40 mt-auto">
                  <Button className="w-full h-14 text-xs font-black uppercase tracking-widest group bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 rounded-2xl" asChild>
                    <a href="https://wa.me/5548991013293" target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Solicitar Orçamento
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cases Section */}
        <div className="bg-zinc-950/40 border-y border-zinc-900 py-32">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-4 block">Portfolio Selecionado</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Cases que entregaram <br className="hidden md:block" /><span className="text-primary italic">Resultados Reais.</span></h2>
              </div>
              <Button variant="outline" className="border-zinc-800 text-xs font-black uppercase tracking-widest h-12 rounded-xl" asChild>
                <Link to="/#cases">Ver Todos os Projetos</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {cases.map((caseItem, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-800 mb-6 bg-zinc-900">
                    <img 
                      src={caseItem.image} 
                      alt={caseItem.title} 
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <a href={caseItem.link} target="_blank" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <div>
                    <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-1 block">{caseItem.category}</span>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{caseItem.title}</h4>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <Zap size={12} className="text-primary" /> {caseItem.result}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto px-4 mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Perguntas Comuns</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 bg-zinc-900/30 rounded-3xl border border-zinc-800">
              <h3 className="font-black text-primary mb-3 text-xs uppercase tracking-widest">O sistema será meu?</h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">Sim. Após a entrega final e quitação, o código-fonte e os direitos de uso do software são transferidos integralmente para sua empresa.</p>
            </div>
            <div className="p-8 bg-zinc-900/30 rounded-3xl border border-zinc-800">
              <h3 className="font-black text-primary mb-3 text-xs uppercase tracking-widest">Quanto tempo demora?</h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">Sites institucionais costumam levar de 10 a 20 dias. Sistemas personalizados dependem da complexidade, variando de 4 a 12 semanas.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Reutilizado do Index para consistência) */}
      <footer className="w-full relative border-t border-primary/20 bg-secondary/10 mt-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(20,255,20,0.5)]"></div>
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center text-center">
          <img src="/logo-hljdev-removebg-preview.png" alt="HLJ DEV" className="h-24 object-contain brightness-0 invert mb-8" />
          <p className="text-zinc-500 text-sm max-w-md mb-8">Elevando o padrão tecnológico de empresas que buscam escala e eficiência através de engenharia de software de elite.</p>
          <div className="flex gap-4">
             <a href="https://instagram.com/ohenriquejunqueira" target="_blank" className="text-zinc-400 hover:text-primary transition-colors"><Instagram /></a>
             <a href="#" target="_blank" className="text-zinc-400 hover:text-primary transition-colors"><Linkedin /></a>
          </div>
        </div>
        <div className="border-t border-border/40 py-6 text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          © {new Date().getFullYear()} HLJ DEV • Todos os Direitos Reservados
        </div>
      </footer>
    </div>
  );
};

export default Shop;

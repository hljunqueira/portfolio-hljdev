import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Zap, BrainCircuit, Rocket, ArrowLeft, ShoppingCart, Star, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const products = [
  {
    id: "prompts",
    title: "Mega Pack de Prompts Elite",
    subtitle: "Acelerador de Resultados",
    description: "Os 50+ prompts secretos que economizam 4 horas do seu dia no ChatGPT e Gemini.",
    price: "29,90",
    features: [
      "Prompts de Escrita Criativa",
      "Prompts para Análise de Dados",
      "Templates de E-mail de Vendas",
      "Comandos de Programação/Código",
      "Acesso Vitalício + Atualizações"
    ],
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    popular: false,
    gradient: "from-primary/20 to-transparent"
  },
  {
    id: "course",
    title: "I.A. Masterclass Pro",
    subtitle: "Treinamento Completo",
    description: "Domine o ChatGPT e Gemini. Do prompt básico à engenharia complexa para negócios.",
    price: "49,90",
    features: [
      "Módulos ChatGPT & Gemini",
      "Vencer Alucinações da I.A.",
      "Criação de Personas Reais",
      "Workflows de Produtividade",
      "Certificado de Conclusão"
    ],
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    popular: true,
    gradient: "from-primary/30 via-primary/10 to-transparent"
  },
  {
    id: "bundle",
    title: "Acesso Premium Total",
    subtitle: "O Pacote Definitivo",
    description: "Leve o Pack de Prompts + Masterclass Completa + Suporte e Materiais Extras.",
    price: "99,90",
    features: [
      "Pack Completo de +50 Prompts",
      "Acesso à Masterclass Pro (Vídeo)",
      "Mapas Mentais de Estratégias",
      "Módulo de Vendas por Conteúdo",
      "Acesso e Atualizações Vitalícias"
    ],
    icon: <Rocket className="h-8 w-8 text-primary" />,
    popular: false,
    gradient: "from-primary/30 to-transparent"
  }
];

const Shop = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <Helmet>
        <title>HLJ DEV | Site&Sistema | Automações | Agentes de IA</title>
        <meta name="description" content="Domine a Inteligência Artificial com nossos treinamentos e packs de prompts validados." />
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
            <span className="font-bold text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Voltar ao Site</span>
          </Link>
          <div className="flex-1 flex justify-center">
            <img 
              src="/logo-hljdev-removebg-preview.png" 
              alt="HLJ DEV" 
              className="h-16 w-auto brightness-0 invert scale-[3] origin-center" 
            />
          </div>
          <div className="w-[120px] invisible sm:visible flex justify-end">
            {/* Espaço reservado para equilíbrio visual */}
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
              Acesso Imediato • Checkout Seguro
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight mb-2 leading-tight">
              A Máquina de Resultados.<br/>
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic">Domine o ChatGPT e Gemini.</span>
            </h1>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div id="products" className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative group bg-card border ${product.popular ? 'border-primary shadow-[0_0_30px_rgba(20,255,20,0.1)]' : 'border-border/60'} rounded-2xl p-5 flex flex-col h-full overflow-hidden hover:border-primary/40 transition-all duration-300 hover:-translate-y-1`}
              >
                {product.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1 rounded-bl-lg">
                    <Star className="h-3 w-3 fill-current" /> Mais Vendido
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-b ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 flex-grow">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    {product.icon}
                  </div>

                  <div className="mb-2">
                    <h3 className="text-lg font-bold leading-tight mb-1 group-hover:text-primary transition-colors">{product.title}</h3>
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-80">{product.subtitle}</p>
                  </div>

                  <p className="text-muted-foreground text-[13px] leading-tight mb-3 min-h-[36px]">
                    {product.description}
                  </p>

                  <ul className="space-y-2 mb-4 border-t border-border/40 pt-3 mt-auto">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-[12px] font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary/70 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 border-t border-border/40 pt-3 mt-auto">
                  <div className="mb-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Investimento</span>
                    <div className="flex items-end gap-1">
                      <span className="text-xs font-bold text-primary mb-0.5">R$</span>
                      <span className="text-2xl font-black text-foreground">{product.price.split(',')[0]}</span>
                      <span className="text-[11px] font-bold text-muted-foreground mb-0.5">,{product.price.split(',')[1]}</span>
                    </div>
                  </div>

                  <Button className="w-full h-10 text-[14px] font-bold group bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20" asChild>
                    <a href="https://kiwify.com.br" target="_blank" rel="noopener noreferrer">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Garantar Acesso
                    </a>
                  </Button>
                  
                  <div className="mt-2 flex items-center justify-center gap-1 text-[8px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                    <Zap className="h-2.5 w-2.5" /> Acesso Imediato VIP
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ - Quick assurance */}
        <div className="max-w-2xl mx-auto px-4 mt-32 text-center">
            <h2 className="text-2xl font-bold mb-4">Dúvidas Frequentes</h2>
            <div className="grid gap-4 text-left">
                <div className="p-6 bg-secondary/20 rounded-2xl border border-border/40">
                    <h3 className="font-bold text-primary mb-2 text-sm uppercase tracking-wide">Como recebo o acesso?</h3>
                    <p className="text-sm text-muted-foreground">Após a confirmação do pagamento pela Kiwify, você receberá automaticamente o link de acesso em seu e-mail cadastrado.</p>
                </div>
                <div className="p-6 bg-secondary/20 rounded-2xl border border-border/40">
                    <h3 className="font-bold text-primary mb-2 text-sm uppercase tracking-wide">Preciso ser programador?</h3>
                    <p className="text-sm text-muted-foreground">Não. Nossos cursos e prompts são desenhados para usuários comuns e empresários que desejam usar a I.A. sem precisar escrever uma única linha de código complexo.</p>
                </div>
            </div>
        </div>
      </main>

      <footer className="w-full relative border-t border-primary/20 bg-secondary/10 mt-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(20,255,20,0.5)]"></div>
        
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-muted-foreground items-start">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col items-start justify-start">
            <div className="flex flex-col items-center w-fit">
              <div className="flex items-center transition-transform hover:scale-105 origin-center cursor-pointer -mt-8" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img src="/logo-hljdev-removebg-preview.png" alt="HLJ DEV" className="h-56 object-contain brightness-0 invert" />
              </div>
              <div className="flex items-center gap-4 -mt-12">
                <a href="https://instagram.com/ohenriquejunqueira" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-border/40 hover:border-primary/50 shadow-sm hover:shadow-[0_0_15px_rgba(20,255,20,0.2)]">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-border/40 hover:border-primary/50 shadow-sm hover:shadow-[0_0_15px_rgba(20,255,20,0.2)]">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4 pt-8">
            <h4 className="font-bold text-foreground text-base tracking-wide uppercase opacity-80">Soluções & Ferramentas de IA</h4>
            <nav className="flex flex-col gap-3 font-medium">
              <Link to="/" className="hover:text-primary transition-colors hover:translate-x-1 w-fit duration-300">Soluções Corporativas</Link>
              <a href="#products" className="hover:text-primary transition-colors hover:translate-x-1 w-fit duration-300">Nossos Produtos de IA</a>
            </nav>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4 pt-8">
            <h4 className="font-bold text-foreground text-base tracking-wide uppercase opacity-80">Suporte & Cliente</h4>
            <nav className="flex flex-col gap-3 font-medium">
              <a href="https://wa.me/5548991013293" className="hover:text-primary transition-colors hover:translate-x-1 w-fit duration-300" target="_blank" rel="noopener noreferrer">WhatsApp de Atendimento</a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 bg-background/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 font-medium text-muted-foreground uppercase opacity-75 tracking-wider">
              <span>© {new Date().getFullYear()} HLJ DEV • Engenharia de Software</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/80 px-4 py-2 rounded-full border border-border/50 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(20,255,20,0.8)] animate-pulse" />
              <span className="font-mono text-primary font-bold tracking-widest uppercase">Sistemas em Operação</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Bot, Loader2 } from "lucide-react";

export type Lead = { id: string; nome: string; email: string; whatsapp: string; interesse: string; mensagem: string; created_at: string };

export function LeadForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [interesse, setInteresse] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const id = crypto.randomUUID();
      const lead: Lead = { id, nome, email, whatsapp, interesse, mensagem, created_at: new Date().toISOString() };
      
      // Salva no banco local temporário para a área administrativa do site
      const current = JSON.parse(localStorage.getItem("leads") || "[]");
      localStorage.setItem("leads", JSON.stringify([lead, ...current]));

      // Integração n8n: Dispara para a sua VPS (Mude a URL no .env ou direto no código)
      const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "https://n8n.suavps.com/webhook/lead-captado";
      
      // Em um ambiente de produção real com a API ativa, descomente a linha abaixo:
      // await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
      
      // Simulando o delay do webhook
      await new Promise(resolve => setTimeout(resolve, 800));

      toast({ 
        title: "Escala Iniciada!", 
        description: "Nossos Protocolos já registraram seu contato. Faremos uma triagem técnica e nosso agente falará com você no WhatsApp." 
      });
      
      setNome(""); setEmail(""); setWhatsapp(""); setInteresse(""); setMensagem("");
    } catch (error) {
      toast({ title: "Ops!", description: "Houve um problema ao enviar o contato.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" aria-labelledby="lead-title" className="w-full bg-background border-t border-border/40 py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-6">

          <h2 id="lead-title" className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Pronto para escalar <br/>sua operação?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Desenvolvemos a inteligência que sua empresa precisa para crescer. Preencha o formulário e receba um <strong>protocolo exclusivo</strong> de como dobrar seu faturamento com tecnologia de elite.
          </p>
          <div className="pt-4 flex items-center gap-6 text-sm text-foreground font-semibold">
            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"/> Retorno em até 1 hora</span>
            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary shadow-glow hidden sm:block"/> Orçamento Exato Sem Rodeios</span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Qual seu nome e/ou empresa?" value={nome} onChange={(e) => setNome(e.target.value)} required className="h-12 bg-secondary/50 focus:bg-background transition-colors" />
              <Input type="email" placeholder="O seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-secondary/50 focus:bg-background transition-colors" />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Input type="tel" placeholder="WhatsApp (DDD + N°)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required className="h-12 bg-secondary/50 focus:bg-background transition-colors" />
              <Select value={interesse} onValueChange={setInteresse} required>
                <SelectTrigger className="h-12 bg-secondary/50 focus:bg-background transition-colors font-medium">
                  <SelectValue placeholder="Onde está seu maior gargalo?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automacao">Quero um Agente de I.A (Atendimento/Venda)</SelectItem>
                  <SelectItem value="sistema">Preciso de um Sistema/Aplicativo Web Exclusivo</SelectItem>
                  <SelectItem value="mentoria">Quero uma consultoria de estrutura n8n</SelectItem>
                  <SelectItem value="produtos">Busco ferramentas prontas (Prompts/Templates)</SelectItem>
                  <SelectItem value="outro">Tenho outra ideia e quero alinhar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea placeholder="Descreva brevemente como a sua operação funciona hoje e o que você gostaria de colocar no automático..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} required rows={4} className="bg-secondary/50 focus:bg-background transition-colors resize-none" />
            
            <Button type="submit" size="lg" disabled={loading} className="w-full h-14 text-base font-bold mt-2 group shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform uppercase tracking-tighter">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando Protocolos...</>
              ) : (
                <>Iniciar Minha Escala</>
              )}
            </Button>
          </form>
        </div>

      </div>
    </section>
  );
}

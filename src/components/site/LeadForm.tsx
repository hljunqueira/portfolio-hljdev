import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export type Lead = { id: string; nome: string; email: string; mensagem: string; created_at: string };

export function LeadForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    const lead: Lead = { id, nome, email, mensagem, created_at: new Date().toISOString() };
    // Temp local persistence until Supabase is connected
    const current = JSON.parse(localStorage.getItem("leads") || "[]");
    localStorage.setItem("leads", JSON.stringify([lead, ...current]));
    toast({ title: "Obrigado!", description: "Recebi sua mensagem e retornarei em breve." });
    setNome(""); setEmail(""); setMensagem("");
  };

  return (
    <section id="contact" aria-labelledby="lead-title" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-24">
      <header className="mb-6 text-center">
        <h2 id="lead-title" className="text-2xl md:text-3xl font-bold">Vamos conversar</h2>
        <p className="text-muted-foreground">Envie seu contato e ideia de projeto.</p>
      </header>
      <form onSubmit={onSubmit} className="grid gap-3 sm:gap-4 max-w-xl mx-auto">
        <Input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Textarea placeholder="Mensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)} required rows={5} />
        <div className="flex justify-center">
          <Button type="submit" variant="default">Enviar</Button>
        </div>
        
      </form>
    </section>
  );
}

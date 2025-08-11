import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Área Admin", description: "Conecte o Supabase para ativar autenticação." });
  };

  return (
    <main className="container mx-auto py-16">
      <Helmet>
        <title>Login | Hlj.dev</title>
        <meta name="description" content="Login da área administrativa de leads." />
        <link rel="canonical" href="/login" />
      </Helmet>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Entrar</h1>
      <form onSubmit={onSubmit} className="max-w-sm grid gap-4">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <Button type="submit" variant="default">Entrar</Button>
        <p className="text-xs text-muted-foreground">Para habilitar login real, conecte a integração Supabase.</p>
      </form>
    </main>
  );
};

export default Login;

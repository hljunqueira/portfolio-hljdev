import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Send, Loader2, Zap, CheckCircle2, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "./LeadForm";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

type Step = "nome" | "email" | "whatsapp" | "cep" | "endereco" | "interesse" | "mensagem" | "done";

const GARGALOS = [
  "Site Institucional de Elite",
  "Sistema Web Personalizado",
  "Automação de Processos (n8n)",
  "Suporte e Evolução VIP",
  "Consultoria de Tecnologia"
];

export function LeadChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg_init", sender: "bot", text: "Olá! Pronto para elevar o nível do seu negócio com tecnologia de elite? Para iniciarmos a viabilidade do seu projeto, como posso te chamar?" }
  ]);
  const [step, setStep] = useState<Step>("nome");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState<Partial<Lead>>({});
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    // Pequeno delay para esperar o DOM atualizar com a nova mensagem
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const handleRestart = () => {
    setMessages([
      { id: crypto.randomUUID(), sender: "bot", text: "Olá! Pronto para elevar o nível do seu negócio com tecnologia de elite? Para iniciarmos a viabilidade do seu projeto, como posso te chamar?" }
    ]);
    setStep("nome");
    setLeadData({});
    setInputValue("");
    setIsTyping(false);
  };

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "bot", text }]);
      setIsTyping(false);
    }, 800); // 800ms natural delay
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue.trim();
    if (!textToSend && step !== "done") return;

    // Add User Message
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "user", text: textToSend }]);
    setInputValue("");

    // Process State Machine
    if (step === "nome") {
      setLeadData({ ...leadData, nome: textToSend });
      setStep("email");
      addBotMessage(`Muito prazer, ${textToSend.split(" ")[0]}. Qual é o seu e-mail corporativo ou principal?`);
    } else if (step === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(textToSend)) {
        addBotMessage("Ops! Esse e-mail parece inválido. Poderia digitar novamente?");
        return;
      }
      setLeadData({ ...leadData, email: textToSend });
      setStep("whatsapp");
      addBotMessage("Excelente. E o seu WhatsApp (com DDD) para um contato mais ágil?");
    } else if (step === "whatsapp") {
      const phoneClean = textToSend.replace(/\D/g, "");
      if (phoneClean.length < 10) {
        addBotMessage("Esse número de WhatsApp parece incompleto. Poderia digitar com o DDD?");
        return;
      }
      setLeadData({ ...leadData, whatsapp: textToSend });
      setStep("cep");
      addBotMessage("Entendido. Agora, para localizarmos sua região, qual o seu CEP?");
    } else if (step === "cep") {
      const cep = textToSend.replace(/\D/g, "");
      if (cep.length !== 8) {
        addBotMessage("CEP inválido. Por favor, digite os 8 números.");
        return;
      }
      
      setIsTyping(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        setIsTyping(false);
        
        if (data.erro) {
          addBotMessage("Não encontrei esse CEP. Pode digitar novamente?");
          return;
        }
        
        if (!data.logradouro) {
          // CEP Único da cidade
          setLeadData({ ...leadData, endereco: `${data.localidade}, ${data.uf}` });
          setStep("endereco");
          addBotMessage(`Encontrei sua cidade: ${data.localidade}/${data.uf}. Mas esse CEP é geral. Poderia digitar sua RUA, NÚMERO e BAIRRO?`);
        } else {
          const enderecoEncontrado = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          setLeadData({ ...leadData, endereco: enderecoEncontrado });
          setStep("endereco");
          addBotMessage(`Localizei: ${enderecoEncontrado}. Qual o NÚMERO e COMPLEMENTO (se houver)?`);
        }
      } catch (err) {
        setIsTyping(false);
        addBotMessage("Tive um problema ao buscar o CEP, mas podemos continuar. Digite seu endereço completo:");
        setStep("endereco");
      }
    } else if (step === "endereco") {
      const enderecoCompleto = leadData.endereco && !leadData.endereco.includes("nº") 
        ? `${leadData.endereco}, nº ${textToSend}` 
        : textToSend;
      
      setLeadData({ ...leadData, endereco: enderecoCompleto });
      setStep("interesse");
      addBotMessage("Perfeito! Anotado. Agora, onde está o seu maior gargalo ou foco de tecnologia hoje?");
    } else if (step === "interesse") {
      setLeadData({ ...leadData, interesse: textToSend });
      setStep("mensagem");
      let nextMsg = "Perfeito. Para finalizarmos a triagem, descreva brevemente como sua operação funciona hoje e o que gostaria de melhorar...";
      
      if (textToSend.includes("Site")) {
        nextMsg = "Perfeito. Para finalizarmos a triagem, descreva brevemente o objetivo desse novo site e qual o perfil do público que você quer atingir...";
      } else if (textToSend.includes("Sistema")) {
        nextMsg = "Perfeito. Para finalizarmos a triagem, descreva brevemente qual o maior problema que esse sistema deve resolver e quem seriam os usuários principais...";
      } else if (textToSend.includes("Automação")) {
        nextMsg = "Perfeito. Para finalizarmos a triagem, descreva qual processo repetitivo hoje mais consome tempo da sua equipe e você gostaria de automatizar...";
      } else if (textToSend.includes("Suporte")) {
        nextMsg = "Perfeito. Para finalizarmos a triagem, conte um pouco sobre sua estrutura tecnológica atual e quais os principais desafios que você enfrenta hoje...";
      } else if (textToSend.includes("Consultoria")) {
        nextMsg = "Perfeito. Para finalizarmos a triagem, descreva brevemente o cenário atual da sua empresa e qual o seu principal objetivo tecnológico para os próximos meses...";
      }
      
      addBotMessage(nextMsg);
    } else if (step === "mensagem") {
      setLeadData({ ...leadData, mensagem: textToSend });
      setStep("done");
      
      setIsTyping(true);
      
      // Simulate Webhook sending
      const finalLeadData: Lead = {
        id: crypto.randomUUID(),
        nome: leadData.nome!,
        email: leadData.email!,
        whatsapp: leadData.whatsapp!,
        endereco: leadData.endereco!,
        interesse: leadData.interesse!,
        mensagem: textToSend,
        created_at: new Date().toISOString()
      };

      try {
        const current = JSON.parse(localStorage.getItem("leads") || "[]");
        localStorage.setItem("leads", JSON.stringify([finalLeadData, ...current]));

        // ✅ Webhook ATIVADO - Envia lead para N8N
        const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
        
        const webhookResponse = await fetch(WEBHOOK_URL, { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(finalLeadData) 
        });

        if (!webhookResponse.ok) {
          console.error("❌ Webhook failed:", webhookResponse.status);
        } else {
          console.log("✅ Lead enviado para N8N com sucesso!");
        }

        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "bot", text: "✅ Solicitação recebida! Seus dados foram transferidos para nossa engenharia. Um de nossos especialistas analisará seu perfil e te chamará no WhatsApp em até 1 hora para discutirmos seu novo sistema." }]);
          toast({ title: "Sistema Ativado!", description: "Sua solicitação está na fila de processamento." });
        }, 1500);
      } catch (err) {
        console.error("Erro ao enviar lead:", err);
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "bot", text: "⚠️ Houve um problema técnico. Por favor, tente novamente ou nos chame no WhatsApp diretamente." }]);
        toast({ title: "Erro", description: "Não foi possível processar sua solicitação. Tente novamente.", variant: "destructive" });
      }
    }
  };

  return (
    <section id="contact" aria-labelledby="lead-title" className="w-full bg-background border-t border-border/40 py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <h2 id="lead-title" className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-none">
            Inicie seu <br/><span className="text-primary italic">Projeto de Elite</span>
          </h2>
        </div>

        {/* Right Side: Chatbot UI */}
        <div className="bg-card/50 backdrop-blur-md border border-border/60 rounded-2xl flex flex-col h-[500px] shadow-2xl relative overflow-hidden">
          
          {/* Chat Header */}
          <div className="h-16 border-b border-border/40 flex items-center justify-between px-4 bg-background/50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 border border-primary/30">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center">
                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Online</span>
              </div>
            </div>
            
            {(messages.length > 1 || step === "done") && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRestart} 
                title="Reiniciar Triagem" 
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Chat Messages */}
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-secondary text-secondary-foreground rounded-tl-none border border-border/40"}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary px-4 py-3 rounded-2xl rounded-tl-none border border-border/40 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Replies for "Interesse" step */}
            {step === "interesse" && !isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-4 items-end"
              >
                {GARGALOS.map(opt => (
                  <Button 
                    key={opt} variant="outline" size="sm" 
                    onClick={() => handleSend(opt)}
                    className="w-auto text-xs bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 text-right justify-end"
                  >
                    {opt}
                  </Button>
                ))}
              </motion.div>
            )}

            {/* Restart Option when Done */}
            {step === "done" && !isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-4 items-end"
              >
                <Button 
                  variant="outline" size="sm" 
                  onClick={handleRestart}
                  className="w-auto text-xs bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 flex items-center gap-2 font-bold"
                >
                  <RefreshCcw className="h-3 w-3" /> Iniciar nova conversa
                </Button>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-border/40 bg-background/50">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  step === "done" ? "Triagem finalizada" : 
                  step === "interesse" ? "Selecione uma opção acima..." : 
                  step === "cep" ? "Digite seu CEP (apenas números)..." :
                  step === "endereco" ? "Digite número / complemento / endereço..." :
                  step === "whatsapp" ? "Digite seu WhatsApp com DDD..." :
                  "Digite sua mensagem..."
                }
                disabled={step === "done" || step === "interesse" || isTyping}
                className="flex-1 bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-12 rounded-xl"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputValue.trim() || step === "done" || step === "interesse" || isTyping}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform active:scale-95"
              >
                {step === "done" ? <CheckCircle2 className="h-5 w-5" /> : <Send className="h-5 w-5 ml-0.5" />}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

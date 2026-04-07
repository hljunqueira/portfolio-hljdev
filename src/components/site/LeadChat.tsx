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

type Step = "nome" | "email" | "whatsapp" | "interesse" | "mensagem" | "done";

const GARGALOS = [
  "Agente de I.A (Venda/Suporte)",
  "Sistema Web/SaaS Exclusivo",
  "Mentoria Avançada em n8n",
  "Aceleração via Prompts",
  "Tenho outra ideia (Alinhar)"
];

export function LeadChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg_init", sender: "bot", text: "Olá! Pronto para ativar sua máquina de vendas e escalar sua operação? Para começarmos a configuração, como posso te chamar?" }
  ]);
  const [step, setStep] = useState<Step>("nome");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState<Partial<Lead>>({});
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleRestart = () => {
    setMessages([
      { id: crypto.randomUUID(), sender: "bot", text: "Olá! Pronto para ativar sua máquina de vendas e escalar sua operação? Para começarmos a configuração, como posso te chamar?" }
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
      setLeadData({ ...leadData, email: textToSend });
      setStep("whatsapp");
      addBotMessage("Excelente. E o seu WhatsApp (com DDD) para um contato mais ágil?");
    } else if (step === "whatsapp") {
      setLeadData({ ...leadData, whatsapp: textToSend });
      setStep("interesse");
      addBotMessage("Entendido. Onde está o seu maior gargalo ou foco de automação hoje?");
    } else if (step === "interesse") {
      setLeadData({ ...leadData, interesse: textToSend });
      setStep("mensagem");
      addBotMessage("Perfeito. Para finalizarmos a triagem, descreva brevemente como sua operação funciona hoje e o que gostaria de colocar no automático...");
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
        interesse: leadData.interesse!,
        mensagem: textToSend,
        created_at: new Date().toISOString()
      };

      try {
        const current = JSON.parse(localStorage.getItem("leads") || "[]");
        localStorage.setItem("leads", JSON.stringify([finalLeadData, ...current]));

        const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "https://n8n.suavps.com/webhook/lead-captado";
        // await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(finalLeadData) });

        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "bot", text: "✅ Configuração iniciada! Seus dados foram transferidos para nossa engenharia. Um de nossos especialistas te chamará no WhatsApp em até 1 hora para ativar seu sistema." }]);
          toast({ title: "Sistema Ativado!", description: "Sua solicitação está na fila de processamento." });
        }, 1500);
      } catch (err) {
        setIsTyping(false);
      }
    }
  };

  return (
    <section id="contact" aria-labelledby="lead-title" className="w-full bg-background border-t border-border/40 py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <h2 id="lead-title" className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Fale conosco <br/><span className="text-primary italic">pelo Chat</span>
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
                placeholder={step === "done" ? "Triagem finalizada" : step === "interesse" ? "Selecione uma opção acima..." : "Digite sua mensagem..."}
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

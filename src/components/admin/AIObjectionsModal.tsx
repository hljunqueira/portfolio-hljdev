import { useState } from "react";
import { MessageSquare, Sparkles, Send, Copy, X, CheckCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useEvolution } from "@/hooks/useEvolution";

interface AIObjectionsModalProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_OBJECTIONS = [
  "O valor ficou acima do meu orçamento atual.",
  "Preciso consultar meus sócios / vou pensar melhor.",
  "Já tenho uma pessoa que cuida do meu site/redes.",
  "Não vejo necessidade de investir em sistema agora.",
  "Quero parcelar em mais vezes sem juros."
];

export const AIObjectionsModal = ({ lead, isOpen, onClose }: AIObjectionsModalProps) => {
  const [selectedObjection, setSelectedObjection] = useState("");
  const [customObjection, setCustomObjection] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [responses, setResponses] = useState<{ label: string; text: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { sendFile, isSending } = useEvolution();

  if (!isOpen || !lead) return null;

  const objectionText = customObjection.trim() || selectedObjection;

  const handleGenerate = async () => {
    if (!objectionText) {
      toast({ title: "Selecione ou digite uma objeção", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      // Buscar configurações de preços e parcelamento
      const { data: config } = await supabase.from("config_sistema").select("*").single();

      const maxParcelas = config?.max_parcelas_sem_juros || 6;
      const descPix = config?.taxa_desconto_pix || 5;

      const prompt = `Você é um diretor comercial consultivo de elite da HLJ DEV (tecnologia, sites de alta performance, sistemas web e automações IA).
O lead ${lead.nome} (${lead.interesse || 'Projeto Web'}) apresentou a seguinte OBJEÇÃO no fechamento da venda:
"${objectionText}"

Regras de Negócio Vigentes:
- Parcelamento: Até ${maxParcelas}x sem juros ou 12x no cartão.
- Desconto no PIX/à vista: ${descPix}%.
- Nota Fiscal: Emissão de NF-e 100% garantida inclusa no contrato.

Gere exatamente 3 opções de réplicas persuasivas e curtas para enviar no WhatsApp do cliente:
Opção 1 (Foco em ROI e Perda de Vendas): Mostre o valor que o cliente está perdendo por adiar a decisão.
Opção 2 (Flexibilidade e Parcelamento): Destaque a entrada facilitada + parcelamento em até ${maxParcelas}x sem juros.
Opção 3 (Desconto Especial à Vista): Ofereça o desconto de ${descPix}% no PIX se fechar hoje.

Responda estritamente em formato JSON:
{
  "opcoes": [
    {"label": "Foco em ROI & Perda de Clientes", "text": "..."},
    {"label": "Flexibilidade & Parcelamento em até ${maxParcelas}x", "text": "..."},
    {"label": "Desconto Exclusivo PIX (${descPix}%)", "text": "..."}
  ]
}`;

      // Chamar API Groq
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: config?.ai_model || "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Você é um especialista em vendas B2B e objeções de tecnologia. Responda apenas em JSON válido." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error("Falha ao comunicar com motor de IA");

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));

      if (parsed.opcoes) {
        setResponses(parsed.opcoes);
        toast({ title: "3 Réplicas Geradas!", description: "Escolha a melhor opção para enviar ao cliente." });
      }
    } catch (err: any) {
      console.error("Erro ao gerar contorno de objeção:", err);
      // Fallback persuasivo inteligente
      setResponses([
        {
          label: "Foco em ROI & Valor",
          text: `Entendo perfeitamente sua preocupação, ${lead.nome}! Mas veja: adiar a presença digital do seu negócio custa muito mais caro em vendas perdidas para concorrentes todos os dias. Vamos estruturar um plano que cabe no seu fluxo de caixa?`
        },
        {
          label: "Parcelamento Sem Juros",
          text: `Para facilitarmos seu investimento, ${lead.nome}, conseguimos parcelar o projeto em até 6x sem juros com garantia total de emissão de NF-e. Conseguimos iniciar hoje mesmo?`
        },
        {
          label: "Desconto PIX à Vista",
          text: `${lead.nome}, se conseguirmos fechar o contrato hoje, consigo aprovar 5% de desconto à vista no PIX com entrega priorizada. Que tal?`
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({ title: "Copiado para a área de transferência!" });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendWhatsApp = async (text: string) => {
    const phone = lead.whatsapp || lead.telefone;
    if (!phone) {
      toast({ title: "Telefone não encontrado", description: "O lead não possui número cadastrado.", variant: "destructive" });
      return;
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      const url = import.meta.env.VITE_EVOLUTION_URL;
      const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
      const instance = import.meta.env.VITE_EVOLUTION_INSTANCE;

      const res = await fetch(`${url}/message/sendText/${instance}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey
        },
        body: JSON.stringify({
          number: finalPhone,
          text: text
        })
      });

      if (res.ok) {
        // Registrar na timeline de atividades
        await supabase.from("timeline_atividades").insert({
          lead_id: lead.id,
          tipo: "objecao_respondida",
          descricao: `Réplica de Objeção enviada via WhatsApp: "${objectionText}"`,
          meta_dados: { resposta: text }
        });

        toast({ title: "Mensagem Enviada!", description: "Réplica entregue no WhatsApp do lead." });
        onClose();
      } else {
        throw new Error("Erro ao disparar via Evolution API");
      }
    } catch (err: any) {
      toast({ title: "Falha no Envio", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Gerenciador de Objeções IA</h3>
                <p className="text-zinc-500 text-xs font-medium">Lead: <span className="text-zinc-300 font-bold">{lead.nome}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Objeções Frequentes */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">1. Selecione a Objeção Apresentada</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_OBJECTIONS.map((obj, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedObjection(obj);
                    setCustomObjection("");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                    selectedObjection === obj
                      ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>

          {/* Outra Objeção */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Ou Digite a Objeção Personalizada</label>
            <input
              type="text"
              placeholder="Ex: Quero testar grátis por 30 dias antes de pagar..."
              value={customObjection}
              onChange={(e) => {
                setCustomObjection(e.target.value);
                setSelectedObjection("");
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 text-xs focus:border-purple-500/50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !objectionText}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="animate-spin" size={16} /> Gerando Réplicas Estratégicas...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Gerar 3 Réplicas Persuasivas com IA
              </>
            )}
          </button>

          {/* Exibição das Respostas */}
          {responses.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">2. Escolha e Envie a Melhor Réplica</label>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {responses.map((item, idx) => (
                  <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(item.text, idx)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedIndex === idx ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />} Copiar
                        </button>
                        <button
                          onClick={() => handleSendWhatsApp(item.text)}
                          disabled={isSending}
                          className="px-3 py-1 bg-green-500 hover:bg-green-400 text-black rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all"
                        >
                          <Send size={12} /> WhatsApp
                        </button>
                      </div>
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed font-medium bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

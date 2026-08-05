import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ProposalDocument, ProposalData } from "@/components/admin/ProposalDocument";
import { supabase } from "@/lib/supabase";

export interface LeadInfo {
  id?: string;
  nome: string;
  email?: string;
  whatsapp?: string;
  telefone?: string;
  interesse?: string;
  mensagem?: string;
  tipo?: string;
  empresa?: string;
  endereco?: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function detectServiceType(lead: LeadInfo): string {
  const raw = (lead.interesse || lead.tipo || "").toLowerCase();
  if (raw.includes("site") || raw.includes("institucional") || raw.includes("landing")) return "site";
  if (raw.includes("sistema") || raw.includes("web") || raw.includes("plataforma") || raw.includes("app")) return "sistema";
  if (raw.includes("autom") || raw.includes("n8n") || raw.includes("ia") || raw.includes("inteligência")) return "automacao";
  if (raw.includes("suporte") || raw.includes("consultor") || raw.includes("manutenção") || raw.includes("vip")) return "consultoria";
  return "site";
}

export function useProposalGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  const generateAndDownload = async (lead: LeadInfo, overrideServiceType?: string) => {
    setIsGenerating(true);
    try {
      // 1. Carregar regras financeiras e fiscais do Supabase
      const { data: sysConfig } = await supabase.from("config_sistema").select("*").single();

      const serviceType = overrideServiceType || detectServiceType(lead);
      const maxParcelas = sysConfig?.max_parcelas_sem_juros || 6;
      const descPix = sysConfig?.taxa_desconto_pix || 5.0;
      const nfGarantida = sysConfig?.emissao_nf_garantida ?? true;

      const projectType = lead.interesse || lead.tipo || "Projeto de Tecnologia";
      const context = lead.mensagem || lead.empresa || "Cliente captado via sistema de prospecção HLJ DEV.";

      const prompt = `Você é um diretor comercial consultivo especializado em soluções digitais de alta performance da HLJ DEV.
Escreva uma proposta persuasiva para ${lead.nome} (${projectType}).

REGRAS DE NEGÓCIO E PRECIFICAÇÃO:
- "summary": (1º parágrafo) Diagnóstico da dor e prejuízo financeiro acumulado por falta de infraestrutura digital; (2º parágrafo) Apresentar a solução como investimento de alto retorno (ROI).
- "roiLossEstimate": Estimativa visual do valor que o cliente deixa de faturar por mês (Ex: "R$ 3.500,00 a R$ 6.000,00/mês em vendas perdidas").
- "investment": Valor justo em R$ para mercado brasileiro.
- "paymentTerms": Opções claras: "À Vista no PIX com ${descPix}% de desconto OR Entrada (30%) + até ${maxParcelas}x no cartão sem juros".
- "nfGuarantee": "Garantia contratual de Emissão de Nota Fiscal de Serviços (NFe) inclusa".
- "validUntil": Exactly 15 days from today: ${new Date().toLocaleDateString("pt-BR")}.

Responda APENAS com JSON válido:
{
  "summary": "...",
  "roiLossEstimate": "Perda estimada de 15 a 30 vendas/mês. Prejuízo: R$ 4.500,00/mês.",
  "phases": [
    {"title": "Diagnóstico & Mapeamento", "description": "Mapeamento das necessidades do cliente.", "duration": "1 semana"},
    {"title": "Design & Arquitetura", "description": "Interface visual e experiência do usuário.", "duration": "1 a 2 semanas"},
    {"title": "Desenvolvimento & Testes", "description": "Construção com tecnologia de elite.", "duration": "2 a 3 semanas"},
    {"title": "Lançamento & Suporte", "description": "Publicação com garantia e suporte.", "duration": "Contínuo"}
  ],
  "investment": "R$ 4.500,00",
  "paymentTerms": "À Vista no PIX (com ${descPix}% de desconto) ou Entrada de 30% + até ${maxParcelas}x sem juros",
  "nfGuarantee": "Emissão de NF-e 100% Garantida",
  "validUntil": "${new Date().toLocaleDateString("pt-BR")}"
}`;

      let parsed: any;

      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`
          },
          body: JSON.stringify({
            model: sysConfig?.ai_model || "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "Você é um especialista em propostas comerciais B2B de alta conversão. Responda apenas em JSON." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (!res.ok) throw new Error("Groq API error");
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        parsed = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));
      } catch {
        // Fallback de segurança em caso de falha da API
        parsed = {
          summary: `Elaboramos esta proposta estratégica para solucionar as gargalos operacionais de ${lead.nome}. Nossa solução garante presença digital de elite, alta velocidade de conversão e retorno sobre o investimento (ROI).`,
          roiLossEstimate: "Estimativa de R$ 4.000,00/mês em vendas não capturadas sem presença digital.",
          phases: [
            { title: "Diagnóstico & Mapeamento", description: "Alinhamento das regras de negócio do cliente.", duration: "5 dias" },
            { title: "Design & UX de Alta Conversão", description: "Criação de layout exclusivo e responsivo.", duration: "10 dias" },
            { title: "Construção & Integração", description: "Desenvolvimento técnico e testes de performance.", duration: "15 dias" },
            { title: "Entrega & Treinamento", description: "Publicação oficial e treinamento da equipe.", duration: "3 dias" }
          ],
          investment: serviceType === "site" ? "R$ 4.500,00" : serviceType === "sistema" ? "R$ 8.500,00" : "R$ 5.500,00",
          paymentTerms: `À Vista no PIX com ${descPix}% de desconto ou Entrada (30%) + em até ${maxParcelas}x no cartão sem juros`,
          nfGuarantee: "Emissão de Nota Fiscal Eletrônica (NF-e) Garantida",
          validUntil: new Date().toLocaleDateString("pt-BR")
        };
      }

      const proposalData: ProposalData = {
        clientName: lead.nome,
        clientCompany: lead.empresa || lead.nome,
        clientEmail: lead.email || "Não informado",
        clientPhone: lead.whatsapp || lead.telefone || "Não informado",
        serviceType,
        summary: parsed.summary,
        roiLossEstimate: parsed.roiLossEstimate,
        phases: parsed.phases || [],
        investment: parsed.investment,
        paymentTerms: parsed.paymentTerms,
        nfGuarantee: parsed.nfGuarantee || "Emissão de NF-e 100% Garantida",
        validUntil: parsed.validUntil
      };

      const doc = <ProposalDocument data={proposalData} />;
      const asBlob = await pdf(doc).toBlob();
      setLastBlob(asBlob);

      // Trigger download
      const url = URL.createObjectURL(asBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proposta_HLJ_DEV_${lead.nome.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Gravar na timeline se houver id do lead
      if (lead.id) {
        await supabase.from("timeline_atividades").insert({
          lead_id: lead.id,
          tipo: "proposta_gerada",
          descricao: `Proposta PDF de ${serviceType.toUpperCase()} gerada com sucesso`,
          meta_dados: { investimento: parsed.investment }
        });
      }

      return asBlob;
    } catch (err: any) {
      console.error("Erro na geração de proposta:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateAndDownload, isGenerating, lastBlob };
}

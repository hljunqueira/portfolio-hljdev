import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ProposalDocument, ProposalData } from "@/components/admin/ProposalDocument";

export interface LeadInfo {
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

// ─── SERVICE-SPECIFIC PROMPTS ─────────────────────────────────────────────────

function detectServiceType(lead: LeadInfo): string {
  const raw = (lead.interesse || lead.tipo || "").toLowerCase();
  if (raw.includes("site") || raw.includes("institucional") || raw.includes("landing")) return "site";
  if (raw.includes("sistema") || raw.includes("web") || raw.includes("plataforma") || raw.includes("app")) return "sistema";
  if (raw.includes("autom") || raw.includes("n8n") || raw.includes("ia") || raw.includes("inteligência")) return "automacao";
  if (raw.includes("suporte") || raw.includes("consultor") || raw.includes("manutenção") || raw.includes("vip")) return "consultoria";
  return "sistema"; // default
}

function buildPrompt(lead: LeadInfo, serviceType: string): string {
  const projectType = lead.interesse || lead.tipo || "Projeto de Tecnologia";
  const context = lead.mensagem || lead.empresa || "Cliente captado via sistema de leads.";
  const localizacao = lead.endereco || "Brasil";

  const BASE = `
Dados do lead:
- Nome do cliente: ${lead.nome}
- Tipo de projeto: ${projectType}
- Contexto/Necessidade relatada: ${context}
- Localização: ${localizacao}

REGRAS OBRIGATÓRIAS:
- Linguagem: direta, calorosa e profissional. Tom de "consultor de confiança", não vendedor.
- "investment": valor justo para o mercado brasileiro, realista pelo escopo descrito.
- "paymentTerms": sempre com entrada BAIXA + parcelamento. Ex: "30% de entrada + 3x no cartão sem juros".
- "validUntil": exatamente 15 dias a partir de hoje, formato DD/MM/AAAA. Use a data de hoje como referência: ${new Date().toLocaleDateString("pt-BR")}.

Responda APENAS com JSON válido, sem texto extra, sem blocos de código:
{
  "summary": "...",
  "phases": [
    {"title": "...", "description": "...", "duration": "..."},
    {"title": "...", "description": "...", "duration": "..."},
    {"title": "...", "description": "...", "duration": "..."},
    {"title": "...", "description": "...", "duration": "..."}
  ],
  "investment": "R$ X.XXX",
  "paymentTerms": "...",
  "validUntil": "DD/MM/AAAA"
}`;

  const PROMPTS: Record<string, string> = {
    site: `Você é um consultor de vendas sênior especializado em presença digital para pequenas e médias empresas brasileiras.

Escreva uma proposta de Site Profissional PERSUASIVA para fechar com ${lead.nome}.
O "summary" deve: (1º parágrafo) mostrar que muitos negócios perdem clientes por ter site amador ou nenhum, e que o cliente está perdendo vendas agora; (2º parágrafo) apresentar o site da HLJ DEV como investimento, não custo — destacando velocidade, design que converte e aparecimento no Google.
As fases devem focar em: Entendimento da marca e público → Design e identidade visual → Construção e otimização SEO → Publicação e treinamento.
Valores entre R$ 2.500 e R$ 5.500.
${BASE}`,

    sistema: `Você é um consultor de vendas sênior especializado em sistemas web e plataformas SaaS para o mercado brasileiro.

Escreva uma proposta de Sistema/Plataforma Web PERSUASIVA para fechar com ${lead.nome}.
O "summary" deve: (1º parágrafo) mostrar a dor real de operar sem um sistema (erros manuais, retrabalho, perda de controle, dependência de planilhas); (2º parágrafo) apresentar o sistema como solução que vai profissionalizar e escalar a operação — com ROI claro: tempo economizado, erros eliminados, crescimento possível.
As fases devem focar em: Mapeamento de processos e regras de negócio → UX/Design e arquitetura → Desenvolvimento e testes → Entrega com treinamento.
Valores entre R$ 4.500 e R$ 12.000 dependendo da complexidade.
${BASE}`,

    automacao: `Você é um consultor de vendas sênior especializado em automação de processos e Inteligência Artificial aplicada a negócios brasileiros.

Escreva uma proposta de Automação/IA PERSUASIVA para fechar com ${lead.nome}.
O "summary" deve: (1º parágrafo) mostrar o custo REAL do trabalho manual repetitivo — horas da equipe desperdiçadas, erros humanos, velocidade de resposta lenta — e conectar isso ao contexto do cliente; (2º parágrafo) apresentar a automação como solução que funciona 24h por dia, libera a equipe para o que importa, e paga o investimento em semanas.
As fases devem focar em: Mapeamento e diagnóstico dos processos → Construção e integração dos fluxos → Testes e ajustes finos → Ativação e monitoramento.
Valores entre R$ 1.800 e R$ 6.000.
${BASE}`,

    consultoria: `Você é um consultor de vendas sênior especializado em suporte e consultoria de tecnologia para empresas brasileiras.

Escreva uma proposta de Suporte/Consultoria VIP PERSUASIVA para fechar com ${lead.nome}.
O "summary" deve: (1º parágrafo) mostrar o risco real de não ter suporte especializado: sistemas caindo, decisões técnicas erradas, sem ninguém de confiança para ligar; (2º parágrafo) apresentar o serviço da HLJ DEV como ter um CTO na sua equipe, com resposta rápida, proatividade e tranquilidade garantida.
As fases devem focar em: Diagnóstico da infraestrutura atual → Plano de ação e prioridades → Implementação e otimizações → Monitoramento contínuo e relatórios.
Valores mensais entre R$ 800 e R$ 2.500/mês (plano de 3 meses mínimo).
${BASE}`,
  };

  return PROMPTS[serviceType] || PROMPTS.sistema;
}

// ─── FALLBACK POR SERVIÇO ─────────────────────────────────────────────────────

function buildFallback(lead: LeadInfo, serviceType: string): ProposalData {
  const validDate = new Date();
  validDate.setDate(validDate.getDate() + 15);
  const validUntil = validDate.toLocaleDateString("pt-BR");
  const projectType = lead.interesse || lead.tipo || "Projeto de Tecnologia";

  const FALLBACKS: Record<string, Partial<ProposalData>> = {
    site: {
      summary: `${lead.nome}, hoje um negócio sem presença digital profissional perde clientes antes mesmo de falar com eles. Um site amador ou inexistente passa insegurança e afasta quem estava pronto para comprar.\n\nA HLJ DEV vai criar uma vitrine digital que trabalha por você 24 horas: rápida, bonita, otimizada para o Google e feita para converter visitantes em contatos. Esse não é um custo — é o investimento com o maior retorno da sua operação.`,
      phases: [
        { title: "Entendemos sua marca e seu público", description: "Mergulhamos no seu negócio para criar um site que representa quem você é de verdade.", duration: "3-5 dias" },
        { title: "Design que impressiona e converte", description: "Layout exclusivo, moderno e pensado para transformar visitantes em contatos.", duration: "1-2 semanas" },
        { title: "Construção e otimização para o Google (SEO)", description: "Seu site sendo encontrado por quem já está procurando o que você oferece.", duration: "1-2 semanas" },
        { title: "Publicação e você no controle", description: "Seu site no ar, com treinamento para você atualizar sozinho quando quiser.", duration: "2-3 dias" },
      ],
      investment: "R$ 3.200",
      paymentTerms: "30% de entrada + restante em 2x sem juros no cartão",
    },
    automacao: {
      summary: `${lead.nome}, cada tarefa repetitiva que sua equipe faz manualmente tem um custo invisível: horas pagas para trabalho que uma máquina faria em segundos, sem erros e sem folga.\n\nA HLJ DEV vai mapear, construir e ativar automações inteligentes que trabalham 24h por dia no seu lugar — respondendo clientes, organizando dados, disparando mensagens — enquanto sua equipe foca no que realmente faz o negócio crescer.`,
      phases: [
        { title: "Diagnóstico: onde está o tempo sendo desperdiçado", description: "Mapeamos seus processos e identificamos o que automatizar primeiro para gerar resultado imediato.", duration: "2-3 dias" },
        { title: "Construção dos fluxos automáticos", description: "Implementamos as automações com as melhores ferramentas do mercado, integradas ao que você já usa.", duration: "2-3 semanas" },
        { title: "Testes e ajustes finos", description: "Garantimos que cada automação funciona perfeitamente antes de ligar o botão.", duration: "3-5 dias" },
        { title: "Ativação e você no controle", description: "Tudo no ar, com painel de monitoramento e treinamento para sua equipe.", duration: "1-2 dias" },
      ],
      investment: "R$ 2.800",
      paymentTerms: "30% de entrada + 2x sem juros no cartão",
    },
    consultoria: {
      summary: `${lead.nome}, tecnologia mal gerenciada é risco. Sistema sem suporte é bomba-relógio. A maioria das empresas só descobre isso quando algo quebra — e o prejuízo já aconteceu.\n\nCom a HLJ DEV como seu parceiro técnico, você tem um especialista disponível para decidir, agir e resolver. É como ter um CTO dedicado à sua empresa, por uma fração do custo — com resposta rápida, relatórios mensais e a tranquilidade de saber que alguém de confiança está olhando para sua tecnologia.`,
      phases: [
        { title: "Diagnóstico completo da sua infraestrutura", description: "Auditamos tudo que você já tem e identificamos riscos, gargalos e oportunidades.", duration: "1 semana" },
        { title: "Plano de ação com prioridades claras", description: "Definimos o que resolver primeiro, com cronograma e custo estimado de cada melhoria.", duration: "3-5 dias" },
        { title: "Implementação e otimizações", description: "Executamos as melhorias aprovadas, com total transparência em cada etapa.", duration: "2-4 semanas" },
        { title: "Monitoramento e relatório mensal", description: "Acompanhamento contínuo, alertas proativos e reunião mensal de resultados.", duration: "Contínuo" },
      ],
      investment: "R$ 1.200/mês",
      paymentTerms: "Plano mínimo de 3 meses · Fatura mensal no cartão ou PIX",
    },
    sistema: {
      summary: `${lead.nome}, operar sem um sistema personalizado significa depender de planilhas, WhatsApp e memória — uma combinação que gera retrabalho, erros e limita o crescimento da empresa.\n\nA HLJ DEV vai desenvolver um sistema feito do zero para o seu negócio: do jeito que você trabalha, com as regras que fazem sentido para você — e que vai escalar junto com a empresa, sem precisar de adaptações gambiarra.`,
      phases: [
        { title: "Mapeamos como seu negócio funciona de verdade", description: "Entrevistamos sua equipe e mapeamos todos os processos para não construir nada errado.", duration: "1 semana" },
        { title: "Design e aprovação antes de uma linha de código", description: "Você vê e aprova as telas antes de começarmos — zero surpresas no final.", duration: "1-2 semanas" },
        { title: "Desenvolvimento com entregas parciais", description: "Construímos em fases e você acompanha o progresso semana a semana.", duration: "3-6 semanas" },
        { title: "Entrega, testes e treinamento da equipe", description: "Sistema no ar, equipe treinada e suporte garantido nos primeiros 30 dias.", duration: "1 semana" },
      ],
      investment: "R$ 6.500",
      paymentTerms: "30% de entrada + restante parcelado em 3x sem juros",
    },
  };

  const fallback = FALLBACKS[serviceType] || FALLBACKS.sistema;

  return {
    clientName: lead.nome,
    clientEmail: lead.email,
    clientPhone: lead.whatsapp || lead.telefone,
    projectType,
    summary: fallback.summary!,
    phases: fallback.phases!,
    investment: fallback.investment!,
    paymentTerms: fallback.paymentTerms!,
    validUntil,
  };
}

// ─── MAIN GENERATOR ────────────────────────────────────────────────────────────

async function generateProposalWithGemini(lead: LeadInfo): Promise<ProposalData> {
  const projectType = lead.interesse || lead.tipo || "Projeto de Tecnologia";
  const serviceType = detectServiceType(lead);

  if (!GEMINI_API_KEY) {
    return buildFallback(lead, serviceType);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(lead, serviceType) }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 900 },
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini API error");

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const mockupMap: Record<string, string> = {
      site: '/mockups/site.png',
      sistema: '/mockups/sistema.png',
      automacao: '/mockups/automacao.png',
      consultoria: '/mockups/sistema.png'
    };

    return {
      clientName: lead.nome,
      clientEmail: lead.email,
      clientPhone: lead.whatsapp || lead.telefone,
      projectType,
      summary: parsed.summary,
      phases: parsed.phases,
      investment: parsed.investment,
      paymentTerms: parsed.paymentTerms,
      validUntil: parsed.validUntil,
      mockupUrl: mockupMap[serviceType] || mockupMap.sistema
    };
  } catch {
    const fallback = buildFallback(lead, serviceType);
    const mockupMap: Record<string, string> = {
      site: '/mockups/site.png',
      sistema: '/mockups/sistema.png',
      automacao: '/mockups/automacao.png',
      consultoria: '/mockups/sistema.png'
    };
    return { ...fallback, mockupUrl: mockupMap[serviceType] || mockupMap.sistema };
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useProposalGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  const generateAndDownload = async (lead: LeadInfo) => {
    setIsGenerating(true);
    try {
      const proposalData = await generateProposalWithGemini(lead);
      const doc = <ProposalDocument data={proposalData} />;
      const blob = await pdf(doc).toBlob();
      setLastBlob(blob);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proposta_HLJ_DEV_${lead.nome.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      return blob;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateAndDownload, isGenerating, lastBlob };
};

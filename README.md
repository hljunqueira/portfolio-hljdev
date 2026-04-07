# HLJ DEV — Site&Sistema | Automações | Agentes de IA
**Link Oficial:** [hlj.dev](https://hlj.dev)

Site de engenharia de software e automação desenvolvido com React + TypeScript, Vite, Tailwind CSS e shadcn/ui. 

## Tecnologias
- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- Supabase (Auth & Database)
- Vercel CLI (Deploy Infrastructure)
- Framer Motion (animações imersivas)
- React Router (gerenciamento de rotas)

## Estrutura do Ecossistema
- **Landing Page (Home)**: Conversão B2B com foco em Sistemas e IA.
- **Soluções Corporativas**: Vitrine de serviços de engenharia e automação.
- **IA Shop**: E-commerce de prompts, ferramentas e treinamentos.
- **LeadChat**: Interface interativa de captação de clientes.
- **Painel Administrativo**: Área restrita protegida por Supabase (Estilo Terminal).
- **Links de Conversão**: Página de bio otimizada para redes sociais.
- **Infraestrutura**: Backend real com Supabase Auth e PostgreSQL.

## Scripts
`ash
npm install
npm run dev
npm run build
npm run preview
`

## Estrutura
- src/components/site/* — componentes das seções
- src/components/ui/* — componentes base (shadcn/ui)
- src/pages/Index.tsx — página inicial

## Acessibilidade e UX
- Animações respeitam prefers-reduced-motion
- Navegação por âncoras com scroll-behavior: smooth e scroll-mt
- Header sticky com destaque do link da seção ativa (scroll spy)

## Licença
Uso pessoal. Entre em contato para dúvidas ou oportunidades.

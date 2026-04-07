import { Helmet } from "react-helmet-async";
import { BarChart2 } from "lucide-react";

const AdminAnalytics = () => (
  <>
    <Helmet><title>HLJ DEV | Analytics</title></Helmet>
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
          Analytics <span className="text-primary">& Métricas</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Integrações com GA4, Instagram e Evolution API</p>
      </header>
      <div className="flex flex-col items-center justify-center py-24 text-zinc-700">
        <BarChart2 className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest mb-2">Em Desenvolvimento</p>
        <p className="text-xs text-zinc-600 max-w-sm text-center">
          Esta seção irá exibir dados do Instagram, GA4, LTV de clientes e o gerador de Caption com IA quando as integrações N8N estiverem ativas.
        </p>
      </div>
    </div>
  </>
);

export default AdminAnalytics;

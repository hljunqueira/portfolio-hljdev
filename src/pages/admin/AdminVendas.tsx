import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { ShoppingCart } from "lucide-react";

const PERIODS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

const AdminVendas = () => {
  const [vendas, setVendas] = useState<any[]>([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const from = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("vendas").select("*").gte("created_at", from).order("created_at", { ascending: false });
      setVendas(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [period]);

  const total = vendas.reduce((acc, v) => acc + Number(v.valor ?? 0), 0);

  return (
    <>
      <Helmet><title>HLJ DEV | Vendas</title></Helmet>
      <div className="p-6 md:p-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              Vendas <span className="text-primary">Kiwify</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">{vendas.length} vendas · R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="flex gap-2">
            {PERIODS.map(({ label, days }) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border ${
                  period === days ? "bg-primary/10 text-primary border-primary/30" : "text-zinc-500 border-zinc-800 hover:border-zinc-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="text-primary animate-pulse">Carregando...</div>
        ) : vendas.length === 0 ? (
          <div className="text-center py-20 text-zinc-700">
            <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma venda no período selecionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  {["Data", "Produto", "Cliente", "Email", "Valor", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendas.map((v, i) => (
                  <tr key={v.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${i % 2 === 0 ? "" : "bg-zinc-900/20"}`}>
                    <td className="px-4 py-3 text-zinc-500">{new Date(v.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3 font-bold text-zinc-200">{v.produto_nome ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{v.cliente_nome ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-500">{v.cliente_email ?? "—"}</td>
                    <td className="px-4 py-3 text-primary font-black">R$ {Number(v.valor ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${v.status === "pago" ? "bg-primary/10 text-primary" : "bg-zinc-800 text-zinc-500"}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminVendas;

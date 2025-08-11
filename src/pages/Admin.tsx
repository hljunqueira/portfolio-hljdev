import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";

function exportCsv(rows: any[]) {
  const header = ["nome","email","mensagem","data"];
  const csv = [header.join(","), ...rows.map((r) => [r.nome, r.email, JSON.stringify(r.mensagem).replace(/\n/g, " "), new Date(r.created_at).toLocaleString()].join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "leads.csv"; a.click();
  URL.revokeObjectURL(url);
}

const Admin = () => {
  const [query, setQuery] = useState("");
  const leads = useMemo(() => {
    const data = JSON.parse(localStorage.getItem("leads") || "[]");
    return Array.isArray(data) ? data : [];
  }, []);

  const filtered = leads.filter((l: any) => [l.nome, l.email, l.mensagem].join(" ").toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="container mx-auto py-16">
      <Helmet>
        <title>Admin | Hlj.dev</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="/admin" />
      </Helmet>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground">Conecte o Supabase para autenticação e persistência real.</p>
      </header>

      <div className="flex items-center gap-2 mb-4">
        <input className="w-full rounded-md bg-secondary px-3 py-2 outline-none" placeholder="Buscar" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="rounded-md bg-primary text-primary-foreground px-4 py-2" onClick={() => exportCsv(filtered)}>Exportar CSV</button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Mensagem</th>
              <th className="text-left p-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l: any) => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-3">{l.nome}</td>
                <td className="p-3">{l.email}</td>
                <td className="p-3 max-w-[420px] whitespace-pre-wrap">{l.mensagem}</td>
                <td className="p-3">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-muted-foreground" colSpan={4}>Nenhum lead ainda. Envie uma mensagem pelo formulário para testar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Admin;

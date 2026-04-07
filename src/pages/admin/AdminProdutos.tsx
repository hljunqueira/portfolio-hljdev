import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { Package, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminProdutos = () => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const loadProdutos = async () => {
    const { data } = await supabase.from("produtos").select("*").order("created_at", { ascending: false });
    setProdutos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadProdutos(); }, []);

  const startEdit = (p: any) => { setEditingId(p.id); setEditData({ ...p }); };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveEdit = async () => {
    const { error } = await supabase.from("produtos").update({
      nome: editData.nome, preco: editData.preco, descricao: editData.descricao,
      imagem_url: editData.imagem_url, link_checkout: editData.link_checkout, ativo: editData.ativo,
    }).eq("id", editingId);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Produto atualizado!" });
    cancelEdit();
    loadProdutos();
  };

  const deleteProduto = async (id: string) => {
    if (!confirm("Excluir produto?")) return;
    await supabase.from("produtos").delete().eq("id", id);
    loadProdutos();
  };

  const addProduto = async () => {
    await supabase.from("produtos").insert({ nome: "Novo Produto", preco: 0, ativo: false });
    loadProdutos();
  };

  return (
    <>
      <Helmet><title>HLJ DEV | Produtos Shop</title></Helmet>
      <div className="p-6 md:p-10">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              Produtos <span className="text-primary">Shop</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">{produtos.length} produtos cadastrados</p>
          </div>
          <button onClick={addProduto} className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
            <Plus className="h-4 w-4" /> Novo
          </button>
        </header>

        {loading ? <div className="text-primary animate-pulse">Carregando...</div> : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  {["Nome", "Preço", "Ativo", "Link Checkout", "Ações"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => {
                  const editing = editingId === p.id;
                  return (
                    <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/10">
                      <td className="px-4 py-3">
                        {editing ? <input value={editData.nome} onChange={(e) => setEditData({ ...editData, nome: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 w-full" />
                          : <span className="font-bold text-zinc-200">{p.nome}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? <input type="number" value={editData.preco} onChange={(e) => setEditData({ ...editData, preco: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-primary w-24" />
                          : <span className="text-primary font-black">R$ {Number(p.preco ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input type="checkbox" checked={editData.ativo} onChange={(e) => setEditData({ ...editData, ativo: e.target.checked })} className="accent-primary" />
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${p.ativo ? "bg-primary/10 text-primary" : "bg-zinc-800 text-zinc-500"}`}>
                            {p.ativo ? "Ativo" : "Inativo"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate">
                        {editing ? <input value={editData.link_checkout ?? ""} onChange={(e) => setEditData({ ...editData, link_checkout: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-400 w-full" />
                          : <span className="text-zinc-600">{p.link_checkout ?? "—"}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {editing ? (
                            <>
                              <button onClick={saveEdit} className="text-primary hover:text-primary/80"><Check className="h-4 w-4" /></button>
                              <button onClick={cancelEdit} className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(p)} className="text-zinc-500 hover:text-primary transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteProduto(p.id)} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProdutos;

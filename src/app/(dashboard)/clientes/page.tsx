"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableHead, Th, TableBody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { formatCNPJ, formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Cliente } from "@/types";

const statusVariant: Record<string, "green" | "red"> = {
  ativo:   "green",
  inativo: "red",
};

const statusLabel: Record<string, string> = {
  ativo:   "Ativo",
  inativo: "Inativo",
};

interface FormData {
  razao_social: string;
  cnpj: string;
  regime_tributario: string;
  municipio: string;
  uf: string;
  rt: string;
  honorarios: string;
}

const EMPTY_FORM: FormData = {
  razao_social: "", cnpj: "", regime_tributario: "",
  municipio: "", uf: "", rt: "", honorarios: "",
};

export default function ClientesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    setLoading(true);
    // vw_dashboard_clientes já traz qtd_obrigacoes, pendentes, entregues, sem_movimento
    const { data, error } = await supabase
      .from("vw_dashboard_clientes")
      .select("*")
      .order("razao_social");

    if (!error && data) setClientes(data as unknown as Cliente[]);
    setLoading(false);
  }

  const filtered = clientes.filter((c) =>
    c.razao_social.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj.includes(search.replace(/\D/g, "")) ||
    (c.municipio ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!form.razao_social || !form.cnpj) {
      setError("Razão Social e CNPJ são obrigatórios.");
      return;
    }
    setSaving(true);
    setError("");

    const { error: err } = await supabase.from("clientes").insert({
      razao_social: form.razao_social,
      cnpj: form.cnpj.replace(/\D/g, ""),
      regime_tributario: form.regime_tributario || null,
      municipio: form.municipio || null,
      uf: form.uf || null,
      rt: form.rt || null,
      honorarios: form.honorarios ? Number(form.honorarios) : null,
      status: "ativo",
    });

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetchClientes();
    }
  }

  const totalAtivos   = clientes.filter((c) => c.status === "ativo").length;
  const totalInativos = clientes.filter((c) => c.status === "inativo").length;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nome, CNPJ ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-72"
          />
          <Button variant="outline" size="md">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
        <Button onClick={() => { setModalOpen(true); setError(""); }}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",    value: clientes.length, color: "text-gray-900" },
          { label: "Ativos",   value: totalAtivos,     color: "text-green-700" },
          { label: "Inativos", value: totalInativos,   color: "text-red-700"   },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center py-4">
            <p className={`text-2xl font-bold ${color}`}>
              {loading ? "—" : value}
            </p>
            <p className="text-sm text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando clientes...
        </div>
      ) : (
        <Table>
          <TableHead>
            <Th>Empresa</Th>
            <Th>CNPJ</Th>
            <Th>RT</Th>
            <Th>Honorários</Th>
            <Th>Pendentes</Th>
            <Th>Entregues</Th>
            <Th>Status</Th>
            <Th />
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  {search ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const cv = c as any;
                return (
                <Tr key={c.id} onClick={() => router.push(`/clientes/${c.id}`)}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 shrink-0">
                        {c.razao_social.charAt(0)}
                      </div>
                      <p className="font-medium text-gray-900">{c.razao_social}</p>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs">{formatCNPJ(c.cnpj)}</Td>
                  <Td>
                    {c.rt ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{c.rt}</span>
                    ) : "—"}
                  </Td>
                  <Td>
                    {c.honorarios != null
                      ? <span className="font-medium text-gray-900">{formatCurrency(Number(c.honorarios))}</span>
                      : "—"}
                  </Td>
                  <Td>
                    {cv.pendentes > 0
                      ? <span className="font-semibold text-yellow-700">{cv.pendentes}</span>
                      : <span className="text-gray-400">0</span>}
                  </Td>
                  <Td>
                    {cv.entregues > 0
                      ? <span className="font-medium text-green-700">{cv.entregues}</span>
                      : <span className="text-gray-400">0</span>}
                  </Td>
                  <Td>
                    <Badge variant={statusVariant[c.status]}>
                      {statusLabel[c.status]}
                    </Badge>
                  </Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/clientes/${c.id}`); }}>
                      Ver
                    </Button>
                  </Td>
                </Tr>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {/* Modal novo cliente */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Cliente"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Razão Social *"
              value={form.razao_social}
              onChange={(e) => setForm({ ...form, razao_social: e.target.value })}
              placeholder="Nome da empresa"
            />
          </div>
          <Input
            label="CNPJ *"
            value={form.cnpj}
            onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
          />
          <Input
            label="Regime Tributário"
            value={form.regime_tributario}
            onChange={(e) => setForm({ ...form, regime_tributario: e.target.value })}
            placeholder="Simples Nacional"
          />
          <Input
            label="Município"
            value={form.municipio}
            onChange={(e) => setForm({ ...form, municipio: e.target.value })}
            placeholder="São Paulo"
          />
          <Input
            label="UF"
            value={form.uf}
            onChange={(e) => setForm({ ...form, uf: e.target.value })}
            placeholder="SP"
          />
          <Input
            label="Responsável Técnico (RT)"
            value={form.rt}
            onChange={(e) => setForm({ ...form, rt: e.target.value })}
            placeholder="Nome do RT"
          />
          <Input
            label="Honorários (R$)"
            type="number"
            value={form.honorarios}
            onChange={(e) => setForm({ ...form, honorarios: e.target.value })}
            placeholder="0,00"
          />
        </div>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </Modal>
    </div>
  );
}

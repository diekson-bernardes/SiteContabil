"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, CheckCircle, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableHead, Th, TableBody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { StatusFinanceiro } from "@/types";

const statusMap: Record<StatusFinanceiro, { label: string; variant: "gray"|"green"|"yellow"|"red" }> = {
  pendente:  { label: "Pendente",  variant: "yellow" },
  pago:      { label: "Pago",      variant: "green"  },
  cancelado: { label: "Cancelado", variant: "gray"   },
};

type FilterStatus = "todos" | StatusFinanceiro;

interface Honorario {
  id: string;
  valor: number;
  status: StatusFinanceiro;
  data_pagamento: string | null;
  observacao: string | null;
  created_at: string;
  cliente: { id: string; razao_social: string } | null;
  competencia: { referencia: string; ano: number; mes: number } | null;
}

interface Competencia { id: string; referencia: string }

export default function FinanceiroPage() {
  const supabase = createClient();

  const [honorarios, setHonorarios]       = useState<Honorario[]>([]);
  const [competencias, setCompetencias]   = useState<Competencia[]>([]);
  const [competenciaId, setCompetenciaId] = useState<string>("");
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filter, setFilter]               = useState<FilterStatus>("todos");
  const [selected, setSelected]           = useState<Honorario | null>(null);
  const [saving, setSaving]               = useState(false);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split("T")[0]);
  const [obsModal, setObsModal]           = useState("");

  // Carregar competências
  useEffect(() => {
    supabase
      .from("competencias")
      .select("id, referencia")
      .order("ano", { ascending: false })
      .order("mes", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCompetencias(data);
          setCompetenciaId(data[0].id);
        }
      });
  }, []);

  const fetchHonorarios = useCallback(async () => {
    if (!competenciaId) return;
    setLoading(true);

    // Usa a view vw_financeiro_detalhe que já traz os JOINs prontos
    const { data } = await supabase
      .from("vw_financeiro_detalhe")
      .select("id, valor, status, data_pagamento, observacao, cliente_id, razao_social, competencia_id, referencia")
      .eq("competencia_id", competenciaId)
      .order("status")
      .order("razao_social");

    const mapped: Honorario[] = (data ?? []).map((r: any) => ({
      id: r.id,
      valor: Number(r.valor),
      status: r.status,
      data_pagamento: r.data_pagamento,
      observacao: r.observacao,
      created_at: "",
      cliente: { id: r.cliente_id, razao_social: r.razao_social },
      competencia: { referencia: r.referencia, ano: 0, mes: 0 },
    }));

    setHonorarios(mapped);
    setLoading(false);
  }, [competenciaId]);

  useEffect(() => { fetchHonorarios(); }, [fetchHonorarios]);

  const filtered = honorarios.filter((h) => {
    const nome = h.cliente?.razao_social ?? "";
    const matchSearch = nome.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || h.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPago     = honorarios.filter(h => h.status === "pago").reduce((s, h) => s + Number(h.valor), 0);
  const totalPendente = honorarios.filter(h => h.status === "pendente").reduce((s, h) => s + Number(h.valor), 0);
  const counts: Record<string, number> = { todos: honorarios.length };
  for (const h of honorarios) counts[h.status] = (counts[h.status] ?? 0) + 1;

  async function handleRegistrarPagamento() {
    if (!selected) return;
    setSaving(true);
    await supabase
      .from("financeiro_honorarios")
      .update({
        status: "pago",
        data_pagamento: dataPagamento,
        observacao: obsModal || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    fetchHonorarios();
  }

  const filterOptions: { key: FilterStatus; label: string }[] = [
    { key: "todos",     label: "Todos"     },
    { key: "pendente",  label: "Pendentes" },
    { key: "pago",      label: "Pagos"     },
    { key: "cancelado", label: "Cancelados"},
  ];

  return (
    <div className="space-y-5">
      {/* Resumo financeiro */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Recebido</p>
            <p className="text-xl font-bold text-gray-900">{loading ? "—" : formatCurrency(totalPago)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">A receber</p>
            <p className="text-xl font-bold text-gray-900">{loading ? "—" : formatCurrency(totalPendente)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
            <AlertTriangle className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pendentes</p>
            <p className="text-xl font-bold text-brand-700">{loading ? "—" : (counts["pendente"] ?? 0)} clientes</p>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-56"
          />
          <select
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={competenciaId}
            onChange={(e) => setCompetenciaId(e.target.value)}
          >
            {competencias.map((c) => (
              <option key={c.id} value={c.id}>{c.referencia}</option>
            ))}
          </select>
          {filterOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === key ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label} ({counts[key] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando honorários...
        </div>
      ) : (
        <Table>
          <TableHead>
            <Th>Cliente</Th>
            <Th>Competência</Th>
            <Th>Valor</Th>
            <Th>Pagamento</Th>
            <Th>Status</Th>
            <Th />
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  Nenhum honorário encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((h) => {
                const s = statusMap[h.status];
                return (
                  <Tr key={h.id}>
                    <Td>
                      <p className="font-medium text-gray-900 max-w-[220px] truncate">
                        {h.cliente?.razao_social ?? "—"}
                      </p>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-gray-500">
                        {h.competencia?.referencia ?? "—"}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(Number(h.valor))}
                      </span>
                    </Td>
                    <Td>
                      {h.data_pagamento ? formatDate(h.data_pagamento) : "—"}
                    </Td>
                    <Td><Badge variant={s.variant}>{s.label}</Badge></Td>
                    <Td>
                      {h.status === "pendente" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelected(h);
                            setDataPagamento(new Date().toISOString().split("T")[0]);
                            setObsModal(h.observacao ?? "");
                          }}
                        >
                          Registrar pagamento
                        </Button>
                      )}
                    </Td>
                  </Tr>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {/* Modal registrar pagamento */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Registrar Pagamento"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancelar</Button>
            <Button onClick={handleRegistrarPagamento} loading={saving}>
              <CheckCircle className="h-4 w-4" />
              Confirmar Pagamento
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{selected.cliente?.razao_social}</p>
              <p className="text-sm text-gray-500">
                Competência: {selected.competencia?.referencia} —{" "}
                <span className="font-semibold">{formatCurrency(Number(selected.valor))}</span>
              </p>
            </div>
            <Input
              label="Data de Pagamento"
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Observação</label>
              <textarea
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                rows={2}
                value={obsModal}
                onChange={(e) => setObsModal(e.target.value)}
                placeholder="Observação opcional..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

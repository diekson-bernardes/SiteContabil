"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, Th, TableBody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import type { StatusEntrega } from "@/types";

const statusMap: Record<StatusEntrega, { label: string; variant: "gray"|"blue"|"green"|"yellow"|"red"|"purple" }> = {
  pendente:      { label: "Pendente",      variant: "yellow" },
  vencendo_hoje: { label: "Vence hoje",    variant: "red"    },
  vencida:       { label: "Vencida",       variant: "red"    },
  entregue:      { label: "Entregue",      variant: "green"  },
  dispensada:    { label: "Dispensada",    variant: "gray"   },
  nao_aplicavel: { label: "N/A",           variant: "gray"   },
  sem_movimento: { label: "Sem movimento", variant: "gray"   },
};

type FilterStatus = "todos" | StatusEntrega;

interface Entrega {
  id: string;
  status: StatusEntrega;
  data_vencimento: string | null;
  data_limite_entrega: string | null;
  data_entrega: string | null;
  valor: number | null;
  observacao: string | null;
  updated_at: string;
  competencia: { referencia: string } | null;
  cliente_obrigacao: {
    cliente: { razao_social: string } | null;
    obrigacao: { codigo: string; nome: string; periodicidade: string } | null;
  } | null;
}

interface Competencia { id: string; referencia: string }

export default function ObrigacoesPage() {
  const supabase = createClient();

  const [entregas, setEntregas]       = useState<Entrega[]>([]);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [competenciaId, setCompetenciaId] = useState<string>("");
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<FilterStatus>("todos");
  const [selected, setSelected]       = useState<Entrega | null>(null);
  const [saving, setSaving]           = useState(false);
  const [novoStatus, setNovoStatus]   = useState<StatusEntrega>("entregue");
  const [obsModal, setObsModal]       = useState("");

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

  const fetchEntregas = useCallback(async () => {
    if (!competenciaId) return;
    setLoading(true);

    // Usa a view vw_entregas_detalhe que já traz os JOINs prontos
    const { data } = await supabase
      .from("vw_entregas_detalhe")
      .select("id, status, data_vencimento, data_limite_entrega, data_entrega, valor, observacao, razao_social, obrigacao_codigo, obrigacao_nome, competencia_ref")
      .eq("competencia_id", competenciaId)
      .order("data_vencimento", { ascending: true });

    // Mapeia para o formato esperado pelo componente
    const mapped: Entrega[] = (data ?? []).map((r: any) => ({
      id: r.id,
      status: r.status,
      data_vencimento: r.data_vencimento,
      data_limite_entrega: r.data_limite_entrega,
      data_entrega: r.data_entrega,
      valor: r.valor,
      observacao: r.observacao,
      updated_at: "",
      competencia: { referencia: r.competencia_ref },
      cliente_obrigacao: {
        cliente: { razao_social: r.razao_social },
        obrigacao: { codigo: r.obrigacao_codigo, nome: r.obrigacao_nome, periodicidade: "" },
      },
    }));

    setEntregas(mapped);
    setLoading(false);
  }, [competenciaId]);

  useEffect(() => { fetchEntregas(); }, [fetchEntregas]);

  const filtered = entregas.filter((e) => {
    const cliente = e.cliente_obrigacao?.cliente?.razao_social ?? "";
    const obrig   = e.cliente_obrigacao?.obrigacao?.nome ?? "";
    const codigo  = e.cliente_obrigacao?.obrigacao?.codigo ?? "";
    const matchSearch = (
      cliente.toLowerCase().includes(search.toLowerCase()) ||
      obrig.toLowerCase().includes(search.toLowerCase()) ||
      codigo.toLowerCase().includes(search.toLowerCase())
    );
    const matchFilter = filter === "todos" || e.status === filter;
    return matchSearch && matchFilter;
  });

  const counts: Record<string, number> = { todos: entregas.length };
  for (const e of entregas) {
    counts[e.status] = (counts[e.status] ?? 0) + 1;
  }

  async function handleUpdateStatus() {
    if (!selected) return;
    setSaving(true);
    await supabase
      .from("entregas_obrigacoes")
      .update({
        status: novoStatus,
        observacao: obsModal || null,
        data_entrega: novoStatus === "entregue" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    fetchEntregas();
  }

  const filterOptions: { key: FilterStatus; label: string }[] = [
    { key: "todos",        label: "Todas"         },
    { key: "pendente",     label: "Pendentes"     },
    { key: "vencendo_hoje",label: "Vence hoje"    },
    { key: "vencida",      label: "Vencidas"      },
    { key: "entregue",     label: "Entregues"     },
    { key: "sem_movimento",label: "Sem movimento" },
  ];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Buscar cliente ou obrigação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-64"
          />
          {/* Seletor de competência */}
          <select
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={competenciaId}
            onChange={(e) => setCompetenciaId(e.target.value)}
          >
            {competencias.map((c) => (
              <option key={c.id} value={c.id}>{c.referencia}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={fetchEntregas} size="md">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === key
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label} ({counts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando entregas...
        </div>
      ) : (
        <Table>
          <TableHead>
            <Th>Obrigação</Th>
            <Th>Cliente</Th>
            <Th>Periodicidade</Th>
            <Th>Vencimento</Th>
            <Th>Entrega até</Th>
            <Th>Status</Th>
            <Th />
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  Nenhuma entrega encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const s = statusMap[e.status];
                const ob = e.cliente_obrigacao?.obrigacao;
                const cl = e.cliente_obrigacao?.cliente;
                return (
                  <Tr key={e.id}>
                    <Td>
                      <p className="font-medium text-gray-900">{ob?.nome ?? "—"}</p>
                      <p className="text-xs font-mono text-gray-400">{ob?.codigo ?? ""}</p>
                    </Td>
                    <Td>
                      <p className="text-sm text-gray-700 max-w-[200px] truncate">{cl?.razao_social ?? "—"}</p>
                    </Td>
                    <Td>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 capitalize">
                        {ob?.periodicidade ?? "—"}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {e.data_vencimento ? formatDate(e.data_vencimento) : "—"}
                      </div>
                    </Td>
                    <Td>
                      {e.data_limite_entrega ? formatDate(e.data_limite_entrega) : "—"}
                    </Td>
                    <Td><Badge variant={s.variant}>{s.label}</Badge></Td>
                    <Td>
                      {e.status !== "entregue" && e.status !== "dispensada" && e.status !== "nao_aplicavel" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelected(e);
                            setNovoStatus("entregue");
                            setObsModal(e.observacao ?? "");
                          }}
                        >
                          Atualizar
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

      {/* Modal atualizar status */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Atualizar Status da Entrega"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancelar</Button>
            <Button onClick={handleUpdateStatus} loading={saving}>Confirmar</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
              <p className="font-medium text-gray-900">
                {selected.cliente_obrigacao?.obrigacao?.nome}
              </p>
              <p className="text-gray-500">{selected.cliente_obrigacao?.cliente?.razao_social}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Novo Status</label>
              <select
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value as StatusEntrega)}
              >
                {(["entregue","dispensada","sem_movimento","nao_aplicavel","vencida"] as StatusEntrega[]).map((s) => (
                  <option key={s} value={s}>{statusMap[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Observação</label>
              <textarea
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                rows={3}
                value={obsModal}
                onChange={(e) => setObsModal(e.target.value)}
                placeholder="Observações sobre a entrega..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

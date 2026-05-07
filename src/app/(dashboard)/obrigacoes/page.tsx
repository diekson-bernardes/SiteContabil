"use client";

import { useState } from "react";
import { Plus, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHead, Th, TableBody, Tr, Td } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import type { Obrigacao } from "@/types";

const statusMap = {
  pending:     { label: "Pendente",      variant: "yellow"  as const },
  in_progress: { label: "Em andamento",  variant: "blue"    as const },
  completed:   { label: "Concluída",     variant: "green"   as const },
  overdue:     { label: "Vencida",       variant: "red"     as const },
};

const priorityMap = {
  low:      { label: "Baixa",    variant: "gray"   as const },
  medium:   { label: "Média",    variant: "blue"   as const },
  high:     { label: "Alta",     variant: "yellow" as const },
  critical: { label: "Crítica",  variant: "red"    as const },
};

const MOCK_OBRIGACOES: Obrigacao[] = [
  { id: "1", client_id: "1", assigned_to: null, title: "GFIP",        description: "Geração e envio da GFIP mensal",      due_date: "2026-05-10", competence_date: "2026-04-30", status: "pending",     priority: "high",     category: "Trabalhista", completed_at: null, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z", client: { id: "1", profile_id: null, company_name: "Empresa ABC", cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "active", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
  { id: "2", client_id: "2", assigned_to: null, title: "SPED Fiscal", description: "Entrega do SPED Fiscal trimestral",    due_date: "2026-05-15", competence_date: "2026-03-31", status: "in_progress", priority: "critical", category: "Fiscal",      completed_at: null, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z", client: { id: "2", profile_id: null, company_name: "Tech Soluções", cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "active", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
  { id: "3", client_id: "3", assigned_to: null, title: "IRPJ",        description: "Declaração de IRPJ anual",            due_date: "2026-05-30", competence_date: "2025-12-31", status: "pending",     priority: "high",     category: "Fiscal",      completed_at: null, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z", client: { id: "3", profile_id: null, company_name: "Comércio Geral", cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "pending", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
  { id: "4", client_id: "5", assigned_to: null, title: "DCTF",        description: "Declaração de Débitos e Créditos",    due_date: "2026-04-30", competence_date: "2026-03-31", status: "overdue",     priority: "critical", category: "Federal",     completed_at: null, created_at: "2026-04-01T00:00:00Z", updated_at: "2026-04-01T00:00:00Z", client: { id: "5", profile_id: null, company_name: "Empresa XYZ", cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "active", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
  { id: "5", client_id: "1", assigned_to: null, title: "ECF",         description: "Escrituração Contábil Fiscal",        due_date: "2026-07-31", competence_date: "2025-12-31", status: "pending",     priority: "medium",   category: "Fiscal",      completed_at: null, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z", client: { id: "1", profile_id: null, company_name: "Empresa ABC", cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "active", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
];

type FilterStatus = "all" | "pending" | "in_progress" | "completed" | "overdue";

export default function ObrigacoesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = MOCK_OBRIGACOES.filter((o) => {
    const matchSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.client?.company_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "all" || o.status === filter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:         MOCK_OBRIGACOES.length,
    pending:     MOCK_OBRIGACOES.filter(o => o.status === "pending").length,
    in_progress: MOCK_OBRIGACOES.filter(o => o.status === "in_progress").length,
    completed:   MOCK_OBRIGACOES.filter(o => o.status === "completed").length,
    overdue:     MOCK_OBRIGACOES.filter(o => o.status === "overdue").length,
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar obrigação ou cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="w-72"
        />
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Obrigação
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "in_progress", "overdue", "completed"] as FilterStatus[]).map((s) => {
          const labels: Record<FilterStatus, string> = {
            all: "Todas", pending: "Pendentes", in_progress: "Em andamento", overdue: "Vencidas", completed: "Concluídas"
          };
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {labels[s]} ({counts[s]})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <Th>Obrigação</Th>
          <Th>Cliente</Th>
          <Th>Categoria</Th>
          <Th>Vencimento</Th>
          <Th>Prioridade</Th>
          <Th>Status</Th>
          <Th />
        </TableHead>
        <TableBody>
          {filtered.map((ob) => {
            const s = statusMap[ob.status];
            const p = priorityMap[ob.priority];
            return (
              <Tr key={ob.id}>
                <Td>
                  <p className="font-medium text-gray-900">{ob.title}</p>
                  <p className="text-xs text-gray-500">{ob.description}</p>
                </Td>
                <Td>{ob.client?.company_name ?? "-"}</Td>
                <Td>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {ob.category}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {formatDate(ob.due_date)}
                  </div>
                </Td>
                <Td><Badge variant={p.variant}>{p.label}</Badge></Td>
                <Td><Badge variant={s.variant}>{s.label}</Badge></Td>
                <Td>
                  <Button variant="ghost" size="sm">Editar</Button>
                </Td>
              </Tr>
            );
          })}
        </TableBody>
      </Table>

      {/* New obrigacao modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Obrigação"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button>Salvar</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Título" placeholder="Ex: GFIP, SPED, DCTF..." />
          </div>
          <Input label="Cliente" placeholder="Selecione o cliente..." />
          <Input label="Categoria" placeholder="Fiscal, Trabalhista..." />
          <Input label="Data de Vencimento" type="date" />
          <Input label="Competência" type="date" />
          <div className="col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
              placeholder="Descrição da obrigação..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Search, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHead, Th, TableBody, Tr, Td } from "@/components/ui/Table";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Honorario } from "@/types";

const statusMap = {
  pending:   { label: "Pendente",   variant: "yellow" as const, icon: AlertTriangle },
  paid:      { label: "Pago",       variant: "green"  as const, icon: CheckCircle   },
  overdue:   { label: "Vencido",    variant: "red"    as const, icon: AlertTriangle },
  cancelled: { label: "Cancelado",  variant: "gray"   as const, icon: AlertTriangle },
};

const MOCK_HONORARIOS: Honorario[] = [
  { id: "1", client_id: "1", description: "Honorários mensais - contabilidade",    amount: 1500, due_date: "2026-05-10", payment_date: null,         status: "pending",  reference_month: "2026-05", invoice_number: "NF-0123", notes: null, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z", client: { id: "1", profile_id: null, company_name: "Empresa ABC",    cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "active", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
  { id: "2", client_id: "2", description: "Honorários mensais - contabilidade",    amount: 2800, due_date: "2026-05-10", payment_date: "2026-05-03", status: "paid",     reference_month: "2026-05", invoice_number: "NF-0124", notes: null, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z", client: { id: "2", profile_id: null, company_name: "Tech Soluções",  cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "active", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
  { id: "3", client_id: "5", description: "Honorários mensais - contabilidade",    amount: 1200, due_date: "2026-04-30", payment_date: null,         status: "overdue",  reference_month: "2026-04", invoice_number: "NF-0115", notes: null, created_at: "2026-04-01T00:00:00Z", updated_at: "2026-04-01T00:00:00Z", client: { id: "5", profile_id: null, company_name: "Empresa XYZ",   cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "active", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
  { id: "4", client_id: "3", description: "Serviços extraordinários - abertura",   amount: 800,  due_date: "2026-05-15", payment_date: null,         status: "pending",  reference_month: "2026-05", invoice_number: "NF-0125", notes: null, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z", client: { id: "3", profile_id: null, company_name: "Comércio Geral", cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "pending", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
  { id: "5", client_id: "4", description: "Honorários mensais - contabilidade",    amount: 950,  due_date: "2026-05-10", payment_date: "2026-05-05", status: "paid",     reference_month: "2026-05", invoice_number: "NF-0126", notes: null, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z", client: { id: "4", profile_id: null, company_name: "Loja Beta",      cnpj: null, cpf: null, email: "", phone: null, address: null, city: null, state: null, zip_code: null, status: "inactive", responsible_staff_id: null, notes: null, created_at: "", updated_at: "" } },
];

type FilterStatus = "all" | "pending" | "paid" | "overdue";

const totalPaid    = MOCK_HONORARIOS.filter(h => h.status === "paid").reduce((s, h) => s + h.amount, 0);
const totalPending = MOCK_HONORARIOS.filter(h => h.status === "pending").reduce((s, h) => s + h.amount, 0);
const totalOverdue = MOCK_HONORARIOS.filter(h => h.status === "overdue").reduce((s, h) => s + h.amount, 0);

export default function FinanceiroPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = MOCK_HONORARIOS.filter((h) => {
    const matchSearch =
      (h.client?.company_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      h.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "all" || h.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Recebido (mês)</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">A receber</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPending)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Em atraso</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
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
          {(["all", "pending", "paid", "overdue"] as FilterStatus[]).map((s) => {
            const labels: Record<FilterStatus, string> = { all: "Todos", pending: "Pendentes", paid: "Pagos", overdue: "Vencidos" };
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === s ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Honorário
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <Th>Cliente</Th>
          <Th>Descrição</Th>
          <Th>Ref.</Th>
          <Th>Vencimento</Th>
          <Th>Valor</Th>
          <Th>NF</Th>
          <Th>Status</Th>
          <Th />
        </TableHead>
        <TableBody>
          {filtered.map((h) => {
            const s = statusMap[h.status];
            return (
              <Tr key={h.id}>
                <Td>
                  <p className="font-medium text-gray-900">{h.client?.company_name ?? "-"}</p>
                </Td>
                <Td className="max-w-xs">
                  <p className="truncate text-sm text-gray-600">{h.description}</p>
                </Td>
                <Td>
                  <span className="text-xs text-gray-500">{h.reference_month ?? "-"}</span>
                </Td>
                <Td>{formatDate(h.due_date)}</Td>
                <Td>
                  <span className="font-semibold text-gray-900">{formatCurrency(h.amount)}</span>
                </Td>
                <Td>
                  <span className="text-xs font-mono text-gray-500">{h.invoice_number ?? "-"}</span>
                </Td>
                <Td><Badge variant={s.variant}>{s.label}</Badge></Td>
                <Td>
                  {h.status === "pending" || h.status === "overdue" ? (
                    <Button variant="secondary" size="sm">Registrar pagamento</Button>
                  ) : (
                    <Button variant="ghost" size="sm">Ver</Button>
                  )}
                </Td>
              </Tr>
            );
          })}
        </TableBody>
      </Table>

      {/* New honorario modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Honorário"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button><DollarSign className="h-4 w-4" />Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Cliente" placeholder="Selecione o cliente..." />
          <Input label="Descrição" placeholder="Ex: Honorários mensais - contabilidade" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor (R$)" type="number" placeholder="0,00" />
            <Input label="Vencimento" type="date" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Referência" placeholder="2026-05" />
            <Input label="Nº NF" placeholder="NF-0000" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

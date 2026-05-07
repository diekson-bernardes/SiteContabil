"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableHead, Th, TableBody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { formatCNPJ } from "@/lib/utils";
import type { Client } from "@/types";

const statusVariant: Record<string, "green" | "red" | "yellow"> = {
  active:   "green",
  inactive: "red",
  pending:  "yellow",
};
const statusLabel: Record<string, string> = {
  active:   "Ativo",
  inactive: "Inativo",
  pending:  "Pendente",
};

const MOCK_CLIENTS: Client[] = [
  { id: "1", profile_id: null, company_name: "Empresa ABC Ltda",   cnpj: "12345678000195", cpf: null, email: "contato@abc.com",    phone: "(11) 3000-0001", address: null, city: "São Paulo",    state: "SP", zip_code: null, status: "active",   responsible_staff_id: null, notes: null, created_at: "2024-01-10T00:00:00Z", updated_at: "2024-01-10T00:00:00Z" },
  { id: "2", profile_id: null, company_name: "Tech Soluções SA",   cnpj: "98765432000188", cpf: null, email: "admin@tech.com",     phone: "(11) 3000-0002", address: null, city: "São Paulo",    state: "SP", zip_code: null, status: "active",   responsible_staff_id: null, notes: null, created_at: "2024-02-15T00:00:00Z", updated_at: "2024-02-15T00:00:00Z" },
  { id: "3", profile_id: null, company_name: "Comércio Geral ME",  cnpj: "11223344000155", cpf: null, email: "fiscal@comercio.com", phone: "(21) 3000-0003", address: null, city: "Rio de Janeiro",state: "RJ", zip_code: null, status: "pending",  responsible_staff_id: null, notes: null, created_at: "2024-03-20T00:00:00Z", updated_at: "2024-03-20T00:00:00Z" },
  { id: "4", profile_id: null, company_name: "Loja Beta Eireli",   cnpj: "55667788000122", cpf: null, email: "beta@loja.com",      phone: "(31) 3000-0004", address: null, city: "Belo Horizonte",state: "MG", zip_code: null, status: "inactive", responsible_staff_id: null, notes: null, created_at: "2024-04-05T00:00:00Z", updated_at: "2024-04-05T00:00:00Z" },
  { id: "5", profile_id: null, company_name: "Empresa XYZ Ltda",  cnpj: "99887766000133", cpf: null, email: "xyz@empresa.com",    phone: "(11) 3000-0005", address: null, city: "São Paulo",    state: "SP", zip_code: null, status: "active",   responsible_staff_id: null, notes: null, created_at: "2024-05-01T00:00:00Z", updated_at: "2024-05-01T00:00:00Z" },
];

interface ClientFormData {
  company_name: string;
  cnpj: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

const EMPTY_FORM: ClientFormData = { company_name: "", cnpj: "", email: "", phone: "", city: "", state: "" };

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ClientFormData>(EMPTY_FORM);

  const filtered = MOCK_CLIENTS.filter((c) =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.cnpj ?? "").includes(search)
  );

  function handleSave() {
    // Would call Supabase insert here
    setModalOpen(false);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-64"
          />
          <Button variant="outline" size="md">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",    value: MOCK_CLIENTS.length,                       color: "text-gray-900" },
          { label: "Ativos",   value: MOCK_CLIENTS.filter(c => c.status === "active").length,   color: "text-green-700" },
          { label: "Inativos", value: MOCK_CLIENTS.filter(c => c.status !== "active").length,   color: "text-red-700"   },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center py-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <Th>Empresa</Th>
          <Th>CNPJ</Th>
          <Th>E-mail</Th>
          <Th>Cidade / UF</Th>
          <Th>Status</Th>
          <Th />
        </TableHead>
        <TableBody>
          {filtered.map((client) => (
            <Tr key={client.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {client.company_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.company_name}</p>
                    <p className="text-xs text-gray-500">{client.phone}</p>
                  </div>
                </div>
              </Td>
              <Td className="font-mono text-xs">
                {client.cnpj ? formatCNPJ(client.cnpj) : "-"}
              </Td>
              <Td>{client.email}</Td>
              <Td>{client.city} / {client.state}</Td>
              <Td>
                <Badge variant={statusVariant[client.status]}>
                  {statusLabel[client.status]}
                </Badge>
              </Td>
              <Td>
                <Button variant="ghost" size="sm">Ver</Button>
              </Td>
            </Tr>
          ))}
        </TableBody>
      </Table>

      {/* New client modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Cliente"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Razão Social"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              placeholder="Nome da empresa"
            />
          </div>
          <Input
            label="CNPJ"
            value={form.cnpj}
            onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
          />
          <Input
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
          <div className="col-span-2">
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contato@empresa.com"
            />
          </div>
          <Input
            label="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="São Paulo"
          />
          <Input
            label="UF"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="SP"
          />
        </div>
      </Modal>
    </div>
  );
}

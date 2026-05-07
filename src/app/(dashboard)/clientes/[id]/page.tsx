import { Metadata } from "next";
import { ArrowLeft, Mail, Phone, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCNPJ } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalhe do Cliente" };

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  // In production, fetch client from Supabase using params.id
  const client = {
    id: params.id,
    company_name: "Empresa ABC Ltda",
    cnpj: "12345678000195",
    email: "contato@abc.com",
    phone: "(11) 3000-0001",
    city: "São Paulo",
    state: "SP",
    status: "active",
    notes: "Cliente desde 2020. Regime: Lucro Presumido.",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h2 className="text-lg font-semibold text-gray-900">{client.company_name}</h2>
        <Badge variant="green">Ativo</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Dados Cadastrais</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="font-mono">{formatCNPJ(client.cnpj)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              {client.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              {client.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              {client.city} / {client.state}
            </div>
          </div>
          {client.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Observações</p>
              <p className="text-sm text-gray-700">{client.notes}</p>
            </div>
          )}
        </Card>

        {/* Recent obrigacoes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Últimas Obrigações</CardTitle>
            <Button size="sm" variant="outline">Ver todas</Button>
          </CardHeader>
          <div className="space-y-2">
            {[
              { title: "GFIP", due: "10/05/2026", status: "pending" },
              { title: "DCTF", due: "15/04/2026", status: "completed" },
              { title: "SPED", due: "31/03/2026", status: "completed" },
            ].map((o) => (
              <div key={o.title} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{o.title}</p>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-500">{o.due}</p>
                  <Badge variant={o.status === "completed" ? "green" : "yellow"}>
                    {o.status === "completed" ? "Concluída" : "Pendente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

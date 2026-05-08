import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, FileText, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCNPJ, formatCurrency, formatDate } from "@/lib/utils";
import type { StatusEntrega } from "@/types";

export const metadata: Metadata = { title: "Detalhe do Cliente" };

const statusEntregaMap: Record<StatusEntrega, { label: string; variant: "gray"|"blue"|"green"|"yellow"|"red"|"purple" }> = {
  pendente:      { label: "Pendente",     variant: "yellow" },
  vencendo_hoje: { label: "Vence hoje",   variant: "red"    },
  vencida:       { label: "Vencida",      variant: "red"    },
  entregue:      { label: "Entregue",     variant: "green"  },
  dispensada:    { label: "Dispensada",   variant: "gray"   },
  nao_aplicavel: { label: "N/A",          variant: "gray"   },
  sem_movimento: { label: "Sem movimento",variant: "gray"   },
};

const statusFinMap: Record<string, { label: string; variant: "gray"|"green"|"yellow"|"red" }> = {
  pendente:  { label: "Pendente",  variant: "yellow" },
  pago:      { label: "Pago",      variant: "green"  },
  cancelado: { label: "Cancelado", variant: "gray"   },
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: cliente }, { data: entregas }, { data: honorarios }] = await Promise.all([
    supabase.from("clientes").select("*").eq("id", id).single(),

    supabase
      .from("entregas_obrigacoes")
      .select(`
        id, status, data_vencimento, data_entrega,
        competencia:competencias(referencia),
        cliente_obrigacao:cliente_obrigacoes(
          obrigacao:obrigacoes(codigo, nome)
        )
      `)
      .eq("cliente_obrigacoes.cliente_id", id)
      .order("data_vencimento", { ascending: false })
      .limit(10),

    supabase
      .from("financeiro_honorarios")
      .select("id, valor, status, data_pagamento, competencia:competencias(referencia)")
      .eq("cliente_id", id)
      .order("competencia_id", { ascending: false })
      .limit(6),
  ]);

  if (!cliente) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{cliente.razao_social}</h2>
          <p className="text-sm text-gray-500 font-mono">{formatCNPJ(cliente.cnpj)}</p>
        </div>
        <Badge variant={cliente.status === "ativo" ? "green" : "red"}>
          {cliente.status === "ativo" ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Dados cadastrais */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Dados Cadastrais</CardTitle></CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="font-mono text-xs">{formatCNPJ(cliente.cnpj)}</span>
            </div>
            {cliente.inscricao_estadual && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                IE: {cliente.inscricao_estadual}
              </div>
            )}
            {(cliente.municipio || cliente.uf) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                {cliente.municipio}{cliente.uf ? ` / ${cliente.uf}` : ""}
              </div>
            )}
            {cliente.honorarios != null && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                {formatCurrency(cliente.honorarios)}<span className="text-xs text-gray-400">/mês</span>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {cliente.regime_tributario && (
              <div className="rounded-lg bg-brand-50 px-3 py-2">
                <p className="text-xs text-brand-600 font-medium">Regime Tributário</p>
                <p className="text-sm text-brand-900">{cliente.regime_tributario}</p>
              </div>
            )}
            {cliente.rt && (
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500 font-medium">Responsável Técnico</p>
                <p className="text-sm text-gray-700">{cliente.rt}</p>
              </div>
            )}
            {cliente.observacoes && (
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500 font-medium mb-1">Observações</p>
                <p className="text-sm text-gray-700">{cliente.observacoes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Últimas entregas */}
        <Card className="lg:col-span-2" padding="none">
          <CardHeader className="px-6 pt-5 pb-0">
            <CardTitle>Últimas Entregas de Obrigações</CardTitle>
            <Link href={`/obrigacoes?cliente=${id}`}>
              <Button size="sm" variant="outline">Ver todas</Button>
            </Link>
          </CardHeader>
          <ul className="divide-y divide-gray-100">
            {!entregas || entregas.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm text-gray-400">
                Nenhuma entrega registrada.
              </li>
            ) : (
              entregas.map((e) => {
                const co = e.cliente_obrigacao as any;
                const s = statusEntregaMap[e.status as StatusEntrega] ?? { label: e.status, variant: "gray" as const };
                return (
                  <li key={e.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {co?.obrigacao?.nome ?? "—"}{" "}
                        <span className="text-xs font-mono text-gray-400">({co?.obrigacao?.codigo})</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Competência: {(e.competencia as any)?.referencia ?? "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs text-gray-500">
                        {e.data_vencimento ? formatDate(e.data_vencimento) : "—"}
                      </p>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </Card>
      </div>

      {/* Honorários */}
      {honorarios && honorarios.length > 0 && (
        <Card padding="none">
          <CardHeader className="px-6 pt-5 pb-0">
            <CardTitle>Honorários Recentes</CardTitle>
          </CardHeader>
          <ul className="divide-y divide-gray-100">
            {honorarios.map((h) => {
              const s = statusFinMap[h.status] ?? { label: h.status, variant: "gray" as const };
              return (
                <li key={h.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Competência: {(h.competencia as any)?.referencia ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{formatCurrency(Number(h.valor))}</span>
                    {h.data_pagamento && (
                      <span className="text-xs text-gray-400">Pago em {formatDate(h.data_pagamento)}</span>
                    )}
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

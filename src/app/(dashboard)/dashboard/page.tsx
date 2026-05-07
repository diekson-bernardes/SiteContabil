import { Metadata } from "next";
import { Users, CheckSquare, DollarSign, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { StatusEntrega } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

const statusEntregaMap: Record<StatusEntrega, { label: string; variant: "gray"|"blue"|"green"|"yellow"|"red"|"purple" }> = {
  pendente:       { label: "Pendente",      variant: "yellow" },
  vencendo_hoje:  { label: "Vence hoje",    variant: "red"    },
  vencida:        { label: "Vencida",       variant: "red"    },
  entregue:       { label: "Entregue",      variant: "green"  },
  dispensada:     { label: "Dispensada",    variant: "gray"   },
  nao_aplicavel:  { label: "N/A",           variant: "gray"   },
  sem_movimento:  { label: "Sem movimento", variant: "gray"   },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // ── Stats em paralelo ────────────────────────────────────────────────────
  const [
    { count: clientesAtivos },
    { count: entregasPendentes },
    { count: entregasVencendoHoje },
    { count: honorariosPendentes },
    { data: recebidoData },
    { data: competencias },
    { data: proximasEntregas },
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("entregas_obrigacoes").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("entregas_obrigacoes").select("*", { count: "exact", head: true }).eq("status", "vencendo_hoje"),
    supabase.from("financeiro_honorarios").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("financeiro_honorarios").select("valor").eq("status", "pago"),
    supabase.from("competencias").select("referencia").order("ano", { ascending: false }).order("mes", { ascending: false }).limit(1),
    supabase
      .from("entregas_obrigacoes")
      .select(`
        id, status, data_vencimento, data_limite_entrega,
        competencia:competencias(referencia),
        cliente_obrigacao:cliente_obrigacoes(
          cliente:clientes(razao_social),
          obrigacao:obrigacoes(codigo, nome)
        )
      `)
      .in("status", ["pendente", "vencendo_hoje"])
      .order("data_vencimento", { ascending: true })
      .limit(8),
  ]);

  const totalRecebido = (recebidoData ?? []).reduce((s, h) => s + Number(h.valor), 0);
  const competenciaAtual = competencias?.[0]?.referencia ?? "-";
  const totalPendentesHoje = (entregasPendentes ?? 0) + (entregasVencendoHoje ?? 0);

  return (
    <div className="space-y-6">
      {/* Competência atual */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        Competência atual: <span className="font-semibold text-gray-700">{competenciaAtual}</span>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Clientes Ativos"
          value={clientesAtivos ?? 0}
          icon={<Users className="h-6 w-6 text-brand-600" />}
          iconBg="bg-brand-50"
          description="Carteira atual"
        />
        <StatsCard
          title="Entregas Pendentes"
          value={totalPendentesHoje}
          icon={<CheckSquare className="h-6 w-6 text-yellow-600" />}
          iconBg="bg-yellow-50"
          description={entregasVencendoHoje ? `${entregasVencendoHoje} vencem hoje` : "Aguardando entrega"}
        />
        <StatsCard
          title="Honorários Pendentes"
          value={honorariosPendentes ?? 0}
          icon={<AlertTriangle className="h-6 w-6 text-orange-600" />}
          iconBg="bg-orange-50"
          description="Aguardando pagamento"
        />
        <StatsCard
          title="Total Recebido"
          value={formatCurrency(totalRecebido)}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          iconBg="bg-green-50"
          description="Honorários pagos"
        />
      </div>

      {/* Alerta de vencendo hoje */}
      {(entregasVencendoHoje ?? 0) > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Atenção — Prazo hoje</p>
            <p className="text-sm text-red-700">
              {entregasVencendoHoje} entrega(s) vencem hoje e precisam ser concluídas.
            </p>
          </div>
        </div>
      )}

      {/* Próximas entregas */}
      <Card padding="none">
        <CardHeader className="px-6 pt-5 pb-0">
          <CardTitle>Próximas Entregas Pendentes</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <ul className="divide-y divide-gray-100">
          {!proximasEntregas || proximasEntregas.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-gray-400">
              Nenhuma entrega pendente.
            </li>
          ) : (
            proximasEntregas.map((e) => {
              const co = e.cliente_obrigacao as any;
              const s = statusEntregaMap[e.status as StatusEntrega];
              return (
                <li key={e.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {co?.obrigacao?.nome ?? "—"}{" "}
                      <span className="font-mono text-xs text-gray-400">({co?.obrigacao?.codigo})</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">{co?.cliente?.razao_social ?? "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                    <p className="text-xs font-medium text-gray-700">
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
  );
}

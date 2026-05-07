import { Metadata } from "next";
import {
  Users, MessageSquare, CheckSquare, DollarSign,
  AlertTriangle, TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const MOCK_STATS = {
  totalClients: 48,
  activeClients: 43,
  pendingObrigacoes: 12,
  overdueObrigacoes: 3,
  unreadMessages: 7,
  pendingHonorarios: 15,
  overdueHonorarios: 2,
  monthlyRevenue: 28500,
};

const MOCK_ACTIVITY = [
  { id: "1", type: "message"   as const, title: "Nova mensagem de Empresa XYZ", subtitle: "Dúvida sobre IRPJ", date: "2026-05-07", badge: { label: "Novo", variant: "blue" as const } },
  { id: "2", type: "obrigacao" as const, title: "SPED Fiscal - Empresa ABC", subtitle: "Prazo: 15/05/2026", date: "2026-05-06", badge: { label: "Urgente", variant: "yellow" as const } },
  { id: "3", type: "honorario" as const, title: "Honorário vencido - Tech Ltda", subtitle: "R$ 1.200,00", date: "2026-05-05", badge: { label: "Vencido", variant: "red" as const } },
  { id: "4", type: "obrigacao" as const, title: "DCTF entregue - Comercial SA", subtitle: "Concluída com sucesso", date: "2026-05-04", badge: { label: "Concluída", variant: "green" as const } },
  { id: "5", type: "message"   as const, title: "Resposta enviada para Loja Beta", subtitle: "Documentação fiscal", date: "2026-05-03" },
];

const UPCOMING_OBRIGACOES = [
  { id: "1", title: "GFIP",       client: "Empresa ABC",    due: "10/05", status: "pending" },
  { id: "2", title: "SPED Fiscal",client: "Tech Soluções",  due: "15/05", status: "in_progress" },
  { id: "3", title: "ECF",        client: "Comércio Geral", due: "15/05", status: "pending" },
  { id: "4", title: "IRPJ",       client: "Empresa XYZ",    due: "30/05", status: "overdue" },
];

const statusMap: Record<string, { label: string; variant: "gray" | "blue" | "green" | "red" | "yellow" }> = {
  pending:     { label: "Pendente",     variant: "yellow" },
  in_progress: { label: "Em andamento", variant: "blue"   },
  completed:   { label: "Concluída",    variant: "green"  },
  overdue:     { label: "Vencida",      variant: "red"    },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Clientes Ativos"
          value={MOCK_STATS.activeClients}
          icon={<Users className="h-6 w-6 text-brand-600" />}
          iconBg="bg-brand-50"
          trend={5}
          description="vs. mês anterior"
        />
        <StatsCard
          title="Mensagens Não Lidas"
          value={MOCK_STATS.unreadMessages}
          icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-50"
          description="Aguardando resposta"
        />
        <StatsCard
          title="Obrigações Pendentes"
          value={MOCK_STATS.pendingObrigacoes}
          icon={<CheckSquare className="h-6 w-6 text-green-600" />}
          iconBg="bg-green-50"
          description={`${MOCK_STATS.overdueObrigacoes} vencidas`}
        />
        <StatsCard
          title="Receita do Mês"
          value={formatCurrency(MOCK_STATS.monthlyRevenue)}
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          iconBg="bg-purple-50"
          trend={8}
          description="vs. mês anterior"
        />
      </div>

      {/* Alert banner for overdue */}
      {(MOCK_STATS.overdueObrigacoes > 0 || MOCK_STATS.overdueHonorarios > 0) && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Atenção necessária</p>
            <p className="text-sm text-yellow-700">
              {MOCK_STATS.overdueObrigacoes} obrigação(ões) vencida(s) e{" "}
              {MOCK_STATS.overdueHonorarios} honorário(s) em atraso.
            </p>
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent activity — 3 cols */}
        <div className="lg:col-span-3">
          <RecentActivity items={MOCK_ACTIVITY} />
        </div>

        {/* Upcoming obrigacoes — 2 cols */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader className="px-6 pt-5 pb-0">
              <CardTitle>Próximas Obrigações</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <ul className="divide-y divide-gray-100">
              {UPCOMING_OBRIGACOES.map((item) => {
                const s = statusMap[item.status];
                return (
                  <li key={item.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.client}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs font-medium text-gray-700">{item.due}</p>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

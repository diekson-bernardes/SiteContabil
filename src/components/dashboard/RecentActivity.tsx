import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { MessageSquare, CheckSquare, DollarSign } from "lucide-react";

type ActivityType = "message" | "obrigacao" | "honorario";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  date: string;
  badge?: { label: string; variant: "gray" | "blue" | "green" | "yellow" | "red" };
}

const typeConfig: Record<ActivityType, { icon: React.ElementType; bg: string; color: string }> = {
  message:   { icon: MessageSquare, bg: "bg-blue-50",   color: "text-blue-600" },
  obrigacao: { icon: CheckSquare,   bg: "bg-green-50",  color: "text-green-600" },
  honorario: { icon: DollarSign,    bg: "bg-purple-50", color: "text-purple-600" },
};

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card padding="none">
      <CardHeader className="px-6 pt-5 pb-0">
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <ul className="divide-y divide-gray-100">
        {items.length === 0 && (
          <li className="px-6 py-8 text-center text-sm text-gray-400">
            Nenhuma atividade recente.
          </li>
        )}
        {items.map((item) => {
          const cfg = typeConfig[item.type];
          return (
            <li key={item.id} className="flex items-start gap-3 px-6 py-3.5">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                {item.badge && (
                  <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

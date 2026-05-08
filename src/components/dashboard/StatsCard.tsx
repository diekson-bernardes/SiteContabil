import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  trend?: number;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBg = "bg-brand-50",
  trend,
  description,
  className,
}: StatsCardProps) {
  const TrendIcon = trend == null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend == null ? "" : trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500";

  return (
    <Card className={cn("flex items-start gap-4", className)}>
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        {(trend != null || description) && (
          <div className="mt-1 flex items-center gap-1">
            {TrendIcon && (
              <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
            )}
            {description && (
              <p className={cn("text-xs", trend != null ? trendColor : "text-gray-500")}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

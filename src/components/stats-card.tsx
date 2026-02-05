import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-50",
}: StatsCardProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
            <p className="truncate text-xs font-medium text-gray-500 sm:text-sm">{title}</p>
            <p className="truncate text-xl font-bold text-gray-900 sm:text-3xl">{value}</p>
            <p className="truncate text-xs text-gray-400 sm:text-sm">{subtitle}</p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12",
              iconBgColor
            )}
          >
            <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

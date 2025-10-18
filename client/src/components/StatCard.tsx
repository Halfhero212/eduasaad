import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: string;
}

export function StatCard({ title, value, icon: Icon, trend, gradient = "from-primary to-chart-2" }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-gradient-to-br ${gradient} p-3 rounded-lg`}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          {trend && (
            <div className={`text-sm font-medium ${trend.isPositive ? 'text-chart-3' : 'text-destructive'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold" data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

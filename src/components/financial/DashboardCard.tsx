import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "income" | "expense";
}

export function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default" 
}: DashboardCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300 border-0",
      "bg-gradient-to-br from-card to-secondary/20",
      variant === "income" && "bg-gradient-to-br from-income-light to-income/10 border-income/20",
      variant === "expense" && "bg-gradient-to-br from-expense-light to-expense/10 border-expense/20"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          variant === "income" && "text-income",
          variant === "expense" && "text-expense",
          variant === "default" && "text-primary"
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
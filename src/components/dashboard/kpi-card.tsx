import { cn } from "@/lib/utils"
import {
  Weight,
  FileText,
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Route,
  Scale,
  Building,
  Users,
  Shield,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Weight,
  FileText,
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Route,
  Scale,
  Building,
  Users,
  Shield,
}

interface KPICardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: string
  trend?: { value: number; isPositive: boolean }
  accentColor?: string
}

export function KPICard({ label, value, subtitle, icon, trend, accentColor }: KPICardProps) {
  const Icon = icon ? iconMap[icon] : null

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              accentColor ? `bg-[${accentColor}]/10` : "bg-primary/10"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                accentColor ? `text-[${accentColor}]` : "text-primary"
              )}
            />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend.isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span
            className={cn(
              "text-[11px] font-medium",
              trend.isPositive ? "text-green-600" : "text-red-500"
            )}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // positive or negative percentage
  description?: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

export function AnalyticsCard({ title, value, icon: Icon, trend, description, iconColorClass = "text-primary", iconBgClass = "bg-primary/10" }: AnalyticsCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group">
      <CardContent className="p-4 md:p-5">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1.5 z-10 relative flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-xl md:text-2xl font-bold tracking-tight truncate">{value}</p>
            
            {trend !== undefined && (
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-green-500/10 text-green-500' : isNegative ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>
                  {isPositive ? '+' : ''}{trend}%
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline-block truncate">{description || "vs last month"}</span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 shrink-0 rounded-xl ${iconBgClass} flex items-center justify-center ${iconColorClass} z-10 relative group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
      </CardContent>
    </Card>
  );
}

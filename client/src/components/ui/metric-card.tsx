import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string | number;
    direction: "up" | "down";
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, trend, className }: MetricCardProps) {
  return (
    <div className={cn("bg-gray-50 rounded p-3", className)}>
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-xl font-semibold text-gray-900">{value}</div>
      {trend && (
        <div 
          className={cn(
            "text-xs mt-1 flex items-center",
            trend.positive ? "text-green-600" : "text-red-600"
          )}
        >
          {trend.direction === "up" ? (
            <ArrowUp className="mr-1 h-3 w-3" />
          ) : (
            <ArrowDown className="mr-1 h-3 w-3" />
          )}
          {trend.value} {trend.label}
        </div>
      )}
    </div>
  );
}

export default MetricCard;

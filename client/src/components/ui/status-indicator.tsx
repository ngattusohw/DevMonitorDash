import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface StatusIndicatorProps {
  status: "operational" | "degraded" | "incident";
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const statusConfig = {
    operational: {
      icon: CheckCircle,
      text: "Operational",
      color: "text-green-600",
    },
    degraded: {
      icon: AlertTriangle,
      text: "Degraded",
      color: "text-yellow-600",
    },
    incident: {
      icon: AlertCircle,
      text: "Incident",
      color: "text-red-600",
    },
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={cn("text-xs flex items-center", config.color, className)}>
      <Icon className="mr-1 h-3 w-3" />
      <span>{config.text}</span>
    </div>
  );
}

export default StatusIndicator;

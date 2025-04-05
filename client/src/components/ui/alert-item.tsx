import React from "react";
import { cn } from "@/lib/utils";
import { Alert } from "@/types";
import { getServiceMetadata } from "@/lib/service-integrations";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertItemProps {
  alert: Alert;
  onViewDetails?: (alert: Alert) => void;
  onAcknowledge?: (alert: Alert) => void;
}

export function AlertItem({ alert, onViewDetails, onAcknowledge }: AlertItemProps) {
  const { severity, title, description, serviceType, createdAt } = alert;
  const serviceMetadata = getServiceMetadata(serviceType);
  
  const severityConfig = {
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
  };
  
  const config = severityConfig[severity];
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  return (
    <div className="p-4 flex items-start hover:bg-gray-50">
      <div className="flex-shrink-0 mt-1">
        <span className={cn("inline-flex items-center justify-center h-8 w-8 rounded-full", config.bgColor)}>
          <Icon className={config.textColor} />
        </span>
      </div>
      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="mt-2 flex">
          <Button 
            variant="link" 
            size="sm"
            className="h-auto p-0 text-xs font-medium text-primary-600 hover:text-primary-700"
            onClick={() => onViewDetails && onViewDetails(alert)}
          >
            View Details
          </Button>
          <Button 
            variant="link" 
            size="sm"
            className="ml-4 h-auto p-0 text-xs font-medium text-gray-500 hover:text-gray-700"
            onClick={() => onAcknowledge && onAcknowledge(alert)}
          >
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AlertItem;

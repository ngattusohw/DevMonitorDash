import React from "react";
import { ServiceType } from "@/types";
import { getServiceMetadata } from "@/lib/service-integrations";
import { cn } from "@/lib/utils";
import StatusIndicator from "@/components/ui/status-indicator";

interface ServiceHealthCardProps {
  serviceType: ServiceType;
  status: "operational" | "degraded" | "incident";
}

export function ServiceHealthCard({ serviceType, status }: ServiceHealthCardProps) {
  const serviceMetadata = getServiceMetadata(serviceType);
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col items-center">
      <div className={cn(
        "rounded-full w-12 h-12 flex items-center justify-center mb-3",
        status === "operational" ? "bg-green-100" : 
        status === "degraded" ? "bg-yellow-100" : "bg-red-100"
      )}>
        <serviceMetadata.icon className={cn(
          "text-xl",
          status === "operational" ? "text-green-600" : 
          status === "degraded" ? "text-yellow-600" : "text-red-600"
        )} />
      </div>
      <div className="text-sm font-medium text-gray-900">{serviceMetadata.name}</div>
      <StatusIndicator status={status} className="mt-1" />
    </div>
  );
}

export default ServiceHealthCard;

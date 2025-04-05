import React from "react";
import { ServiceHealthCard } from "@/components/ui/service-health-card";
import { ServiceHealth } from "@/types";

interface ServiceHealthOverviewProps {
  services: ServiceHealth[];
}

export function ServiceHealthOverview({ services }: ServiceHealthOverviewProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Health</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {services.map((service) => (
          <ServiceHealthCard
            key={service.serviceType}
            serviceType={service.serviceType}
            status={service.status}
          />
        ))}
      </div>
    </div>
  );
}

export default ServiceHealthOverview;

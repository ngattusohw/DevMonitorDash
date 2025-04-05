import React from "react";
import { DataCard } from "@/components/ui/data-card";
import { MetricCard } from "@/components/ui/metric-card";
import { MoreHorizontal } from "lucide-react";
import { ServiceType } from "@/types";
import { getServiceMetadata } from "@/lib/service-integrations";
import { useServiceData } from "@/hooks/use-service-data";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface ServiceMetricsProps {
  projectId: number;
  serviceType: ServiceType;
}

export function ServiceMetrics({ projectId, serviceType }: ServiceMetricsProps) {
  const serviceMetadata = getServiceMetadata(serviceType);
  const { data, loading } = useServiceData(projectId, serviceType);
  
  if (loading) {
    return (
      <DataCard
        title={`${serviceMetadata.name}`}
        icon={<serviceMetadata.icon />}
        action={<button className="text-gray-400 hover:text-gray-500"><MoreHorizontal className="h-5 w-5" /></button>}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </DataCard>
    );
  }
  
  // Determine which chart type to use based on the service
  const renderChart = () => {
    const chartData = data.chartData;
    
    // For demonstration, we'll use different chart types for different services
    if (serviceType === 'stytch' || serviceType === 'sendbird' || serviceType === 'aws') {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.series.map((series, index) => (
              <Line 
                key={series.name}
                type="monotone" 
                dataKey={series.dataKey}
                name={series.name}
                stroke={serviceMetadata.color} 
                activeDot={{ r: 8 }}
                strokeOpacity={index === 0 ? 1 : 0.7}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (serviceType === 'onesignal') {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.series.map((series) => (
              <Bar 
                key={series.name}
                dataKey={series.dataKey}
                name={series.name}
                fill={serviceMetadata.color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (serviceType === 'mixpanel') {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.funnelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="value"
              name="Conversion Rate"
              fill={serviceMetadata.color}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      // Default chart type
      return (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.series.map((series) => (
              <Line 
                key={series.name}
                type="monotone" 
                dataKey={series.dataKey}
                name={series.name}
                stroke={serviceMetadata.color}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };
  
  return (
    <DataCard
      title={`${serviceMetadata.name}`}
      icon={<serviceMetadata.icon />}
      action={<button className="text-gray-400 hover:text-gray-500"><MoreHorizontal className="h-5 w-5" /></button>}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        {data.metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
          />
        ))}
      </div>
      {renderChart()}
    </DataCard>
  );
}

export default ServiceMetrics;

import { useState, useEffect } from "react";
import { ServiceType } from "@/types";
import { 
  generateMockChartData, 
  generateMockFunnelData, 
  generateMockDistributionData,
  generateMockTimeData
} from "@/lib/chart-utils";
import { getServiceMetadata, getMetricName } from "@/lib/service-integrations";

interface ServiceData {
  metrics: Array<{
    title: string;
    value: string | number;
    trend?: {
      value: string | number;
      direction: "up" | "down";
      label: string;
      positive: boolean;
    };
  }>;
  chartData: any[];
  series: Array<{
    name: string;
    dataKey: string;
  }>;
  funnelData?: any[];
  distributionData: any[];
  timeData: any[];
}

export function useServiceData(projectId: number, serviceType: ServiceType) {
  const [data, setData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would fetch actual data from the backend
        // For the MVP, we're using mock data generators
        setTimeout(() => {
          const serviceMetadata = getServiceMetadata(serviceType);
          const chartData = generateMockChartData(serviceType);
          const distributionData = generateMockDistributionData(serviceType);
          const timeData = generateMockTimeData();
          
          // Construct different service-specific data
          let metrics = [];
          let series = [];
          let funnelData;
          
          switch (serviceType) {
            case 'stytch':
              metrics = [
                {
                  title: "Active Users (today)",
                  value: "2,847",
                  trend: {
                    value: "12%",
                    direction: "up",
                    label: "vs. yesterday",
                    positive: true
                  }
                },
                {
                  title: "New Signups (today)",
                  value: "124",
                  trend: {
                    value: "8%",
                    direction: "up",
                    label: "vs. yesterday",
                    positive: true
                  }
                }
              ];
              series = [
                { name: "Daily Active Users", dataKey: "activeUsers" },
                { name: "New Signups", dataKey: "newSignups" }
              ];
              break;
            
            case 'onesignal':
              metrics = [
                {
                  title: "Notifications Sent (7d)",
                  value: "28,534",
                  trend: {
                    value: "4,076",
                    direction: "up",
                    label: "daily average",
                    positive: true
                  }
                },
                {
                  title: "Delivery Rate",
                  value: "97.8%",
                  trend: {
                    value: "0.5%",
                    direction: "down",
                    label: "vs. last week",
                    positive: false
                  }
                }
              ];
              series = [
                { name: "Notifications Sent", dataKey: "sent" },
                { name: "Delivered", dataKey: "delivered" }
              ];
              break;
            
            case 'aws':
              metrics = [
                {
                  title: "Lambda Invocations (24h)",
                  value: "342,156",
                  trend: {
                    value: "5%",
                    direction: "up",
                    label: "vs. yesterday",
                    positive: true
                  }
                },
                {
                  title: "EC2 Avg CPU Utilization",
                  value: "68%",
                  trend: {
                    value: "12%",
                    direction: "up",
                    label: "vs. yesterday",
                    positive: false
                  }
                }
              ];
              series = [
                { name: "Lambda Errors", dataKey: "errors" },
                { name: "CPU Utilization (%)", dataKey: "cpu" }
              ];
              break;
            
            case 'sendbird':
              metrics = [
                {
                  title: "Active Channels (24h)",
                  value: "1,284",
                  trend: {
                    value: "7%",
                    direction: "up",
                    label: "vs. yesterday",
                    positive: true
                  }
                },
                {
                  title: "Messages Sent (24h)",
                  value: "34,782",
                  trend: {
                    value: "3%",
                    direction: "up",
                    label: "vs. yesterday",
                    positive: true
                  }
                }
              ];
              series = [
                { name: "Active Channels", dataKey: "channels" },
                { name: "Messages Sent", dataKey: "messages" }
              ];
              break;
            
            case 'twilio':
              metrics = [
                {
                  title: "SMS Sent (7d)",
                  value: "12,468",
                  trend: {
                    value: "2%",
                    direction: "down",
                    label: "vs. last week",
                    positive: false
                  }
                },
                {
                  title: "Delivery Success Rate",
                  value: "82%",
                  trend: {
                    value: "13%",
                    direction: "down",
                    label: "vs. normal",
                    positive: false
                  }
                }
              ];
              series = [
                { name: "SMS Sent", dataKey: "smsSent" },
                { name: "Delivery Rate (%)", dataKey: "deliveryRate" }
              ];
              break;
            
            case 'mixpanel':
              metrics = [
                {
                  title: "User Retention",
                  value: "82%",
                  trend: {
                    value: "3%",
                    direction: "up",
                    label: "vs. last month",
                    positive: true
                  }
                },
                {
                  title: "Purchase Funnel",
                  value: "12%",
                  trend: {
                    value: "2%",
                    direction: "up",
                    label: "vs. last month",
                    positive: true
                  }
                }
              ];
              series = [
                { name: "Retention Rate", dataKey: "retention" }
              ];
              funnelData = generateMockFunnelData();
              break;
            
            default:
              metrics = [
                {
                  title: "Primary Metric",
                  value: "1,234",
                  trend: {
                    value: "5%",
                    direction: "up",
                    label: "vs. previous",
                    positive: true
                  }
                },
                {
                  title: "Secondary Metric",
                  value: "567",
                  trend: {
                    value: "2%",
                    direction: "up",
                    label: "vs. previous",
                    positive: true
                  }
                }
              ];
              series = [
                { name: "Value", dataKey: "value" }
              ];
          }
          
          setData({
            metrics,
            chartData,
            series,
            funnelData,
            distributionData,
            timeData
          });
          
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, serviceType]);
  
  return { data: data as ServiceData, loading, error };
}

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Metric } from "@/types";
import { useDashboard } from "@/contexts/dashboard-context";

type DateRangeType = "24h" | "7d" | "30d" | "90d" | "custom";

interface MetricsParams {
  projectId: number;
  serviceType?: string;
  metricType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useProjectMetrics(
  projectId?: number,
  serviceType?: string,
  metricType?: string
) {
  const { dateRange, customDateRange, refreshTrigger } = useDashboard();

  // Calculate date range based on the selected range
  const getDateRange = () => {
    if (dateRange === "custom" && customDateRange.start && customDateRange.end) {
      return {
        startDate: customDateRange.start.toISOString(),
        endDate: customDateRange.end.toISOString(),
      };
    }

    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "24h":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7); // Default to 7 days
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const { startDate, endDate } = getDateRange();

  const queryParams: MetricsParams = {
    projectId: projectId || 0,
    serviceType,
    metricType,
    startDate,
    endDate,
  };

  // Only include parameters that are defined
  Object.keys(queryParams).forEach((key) => {
    const typedKey = key as keyof MetricsParams;
    if (queryParams[typedKey] === undefined) {
      delete queryParams[typedKey];
    }
  });

  // Convert the params object to a query string
  const queryString = new URLSearchParams(
    queryParams as unknown as Record<string, string>
  ).toString();

  return useQuery({
    queryKey: [
      "/api/metrics", 
      projectId, 
      serviceType, 
      metricType, 
      dateRange, 
      startDate, 
      endDate, 
      refreshTrigger
    ],
    queryFn: () => apiRequest("GET", `/api/metrics?${queryString}`),
    enabled: !!projectId,
  });
}

export function useServiceMetrics(
  projectId: number,
  serviceType: string,
  dateRangeType?: DateRangeType
) {
  return useQuery({
    queryKey: ["/api/service-metrics", projectId, serviceType, dateRangeType],
    queryFn: () =>
      apiRequest("GET", `/api/projects/${projectId}/metrics/${serviceType}?range=${dateRangeType || "7d"}`),
    enabled: !!projectId && !!serviceType,
  });
}
import { apiRequest } from "@/lib/queryClient";
import {
  Project,
  ServiceIntegration,
  Alert,
  DashboardWidget,
  Metric
} from "@/types";

// Project API methods
export const fetchProjects = async (userId: number): Promise<Project[]> => {
  const res = await apiRequest("GET", `/api/projects?userId=${userId}`, undefined);
  return await res.json();
};

export const createProject = async (data: { name: string; description?: string; userId: number }): Promise<Project> => {
  const res = await apiRequest("POST", "/api/projects", data);
  return await res.json();
};

export const updateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
  const res = await apiRequest("PUT", `/api/projects/${id}`, data);
  return await res.json();
};

export const deleteProject = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/projects/${id}`, undefined);
};

// Service Integration API methods
export const fetchServiceIntegrations = async (projectId: number): Promise<ServiceIntegration[]> => {
  const res = await apiRequest("GET", `/api/service-integrations?projectId=${projectId}`, undefined);
  return await res.json();
};

export const createServiceIntegration = async (data: {
  projectId: number;
  serviceType: string;
  credentials: Record<string, any>;
  active: boolean;
}): Promise<ServiceIntegration> => {
  const res = await apiRequest("POST", "/api/service-integrations", data);
  return await res.json();
};

export const updateServiceIntegration = async (id: number, data: Partial<ServiceIntegration>): Promise<ServiceIntegration> => {
  const res = await apiRequest("PUT", `/api/service-integrations/${id}`, data);
  return await res.json();
};

export const deleteServiceIntegration = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/service-integrations/${id}`, undefined);
};

// Alert API methods
export const fetchAlerts = async (projectId?: number): Promise<Alert[]> => {
  const url = projectId ? `/api/alerts?projectId=${projectId}` : "/api/alerts";
  const res = await apiRequest("GET", url, undefined);
  return await res.json();
};

export const createAlert = async (data: {
  projectId: number;
  serviceType: string;
  title: string;
  description: string;
  severity: string;
  status: string;
}): Promise<Alert> => {
  const res = await apiRequest("POST", "/api/alerts", data);
  return await res.json();
};

export const updateAlert = async (id: number, data: Partial<Alert>): Promise<Alert> => {
  const res = await apiRequest("PUT", `/api/alerts/${id}`, data);
  return await res.json();
};

export const deleteAlert = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/alerts/${id}`, undefined);
};

// Dashboard Widget API methods
export const fetchDashboardWidgets = async (projectId: number): Promise<DashboardWidget[]> => {
  const res = await apiRequest("GET", `/api/dashboard-widgets?projectId=${projectId}`, undefined);
  return await res.json();
};

export const createDashboardWidget = async (data: {
  projectId: number;
  name: string;
  widgetType: string;
  serviceType: string;
  metricType: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}): Promise<DashboardWidget> => {
  const res = await apiRequest("POST", "/api/dashboard-widgets", data);
  return await res.json();
};

export const updateDashboardWidget = async (id: number, data: Partial<DashboardWidget>): Promise<DashboardWidget> => {
  const res = await apiRequest("PUT", `/api/dashboard-widgets/${id}`, data);
  return await res.json();
};

export const deleteDashboardWidget = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/dashboard-widgets/${id}`, undefined);
};

// Metric API methods
export const fetchMetrics = async (
  projectId: number,
  options?: {
    serviceType?: string;
    metricType?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Metric[]> => {
  let url = `/api/metrics?projectId=${projectId}`;
  
  if (options?.serviceType) {
    url += `&serviceType=${options.serviceType}`;
  }
  
  if (options?.metricType) {
    url += `&metricType=${options.metricType}`;
  }
  
  if (options?.startDate) {
    url += `&startDate=${options.startDate.toISOString()}`;
  }
  
  if (options?.endDate) {
    url += `&endDate=${options.endDate.toISOString()}`;
  }
  
  const res = await apiRequest("GET", url, undefined);
  return await res.json();
};

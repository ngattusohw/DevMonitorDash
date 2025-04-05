export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  createdAt: string;
}

export type ServiceType = 'stytch' | 'onesignal' | 'aws' | 'sendbird' | 'twilio' | 'mixpanel';

export interface ServiceIntegration {
  id: number;
  projectId: number;
  serviceType: ServiceType;
  credentials: Record<string, any>;
  active: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
}

export type AlertSeverity = 'info' | 'warning' | 'error';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: number;
  projectId: number;
  serviceType: ServiceType;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
}

export type WidgetType = 'chart' | 'metric' | 'status' | 'alert-list';

export interface DashboardWidget {
  id: number;
  projectId: number;
  name: string;
  widgetType: WidgetType;
  serviceType: ServiceType;
  metricType: string;
  configuration: Record<string, any>;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  createdAt: string;
}

export interface Metric {
  id: number;
  projectId: number;
  serviceType: ServiceType;
  metricType: string;
  value: any;
  timestamp: string;
}

export interface ServiceHealth {
  serviceType: ServiceType;
  status: 'operational' | 'degraded' | 'incident';
  statusText: string;
  icon: string;
}

export interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export interface ServiceMetadata {
  name: string;
  color: string;
  icon: string;
  description: string;
  metrics: string[];
}

export interface ServiceMetricsMap {
  [key: string]: ServiceMetadata;
}

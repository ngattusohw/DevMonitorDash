import { ServiceType } from "@shared/schema";
import { DateRange } from "../types";

export const DATE_RANGES: { [key: string]: DateRange } = {
  "24h": { type: "24h", label: "Last 24 hours" },
  "7d": { type: "7d", label: "Last 7 days" },
  "30d": { type: "30d", label: "Last 30 days" },
  "custom": { type: "custom", label: "Custom range" }
};

export const SERVICE_ICONS: Record<ServiceType, string> = {
  stytch: "lock",
  onesignal: "notifications",
  aws: "cloud",
  sendbird: "forum",
  twilio: "call",
  mixpanel: "analytics"
};

export const SERVICE_NAMES: Record<ServiceType, string> = {
  stytch: "Stytch (Auth)",
  onesignal: "OneSignal",
  aws: "AWS",
  sendbird: "Sendbird",
  twilio: "Twilio",
  mixpanel: "Mixpanel"
};

export const ALERT_SEVERITY_COLORS = {
  critical: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200"
  },
  warning: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200"
  },
  info: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200"
  }
};

export const TREND_COLORS = {
  up: "text-green-600",
  down: "text-red-600",
  same: "text-yellow-600"
};

export const TREND_ICONS = {
  up: "arrow_upward",
  down: "arrow_downward",
  same: "remove"
};

export const PROJECT_STATUS_COLORS = {
  healthy: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    progress: "bg-green-500"
  },
  warning: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    progress: "bg-yellow-500"
  },
  alert: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    progress: "bg-red-500"
  }
};

export const CHART_COLORS = [
  {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  }
];

export const BAR_CHART_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444'  // red
];

import { 
  Lock, 
  Bell, 
  Cloud, 
  MessageSquare, 
  Phone, 
  BarChart,
  LucideIcon
} from "lucide-react";
import { ServiceType, ServiceMetadata, ServiceMetricsMap } from "@/types";

// Service metadata and mappings
export const serviceMetricsMap: ServiceMetricsMap = {
  stytch: {
    name: "Stytch",
    color: "#4f46e5",
    icon: Lock,
    description: "Authentication services and user identity management",
    metrics: [
      "active_users",
      "new_signups",
      "login_success_rate",
      "password_resets",
      "mfa_usage",
      "session_duration"
    ]
  },
  onesignal: {
    name: "OneSignal",
    color: "#ef4444",
    icon: Bell,
    description: "Cross-platform push notification delivery",
    metrics: [
      "notifications_sent",
      "delivery_rate",
      "open_rate",
      "opt_out_rate",
      "delivery_errors",
      "platform_breakdown"
    ]
  },
  aws: {
    name: "AWS",
    color: "#f59e0b",
    icon: Cloud,
    description: "Cloud infrastructure and services",
    metrics: [
      "cpu_utilization",
      "lambda_invocations",
      "lambda_errors",
      "s3_storage",
      "rds_performance",
      "api_gateway_requests"
    ]
  },
  sendbird: {
    name: "Sendbird",
    color: "#3b82f6",
    icon: MessageSquare,
    description: "In-app messaging and chat services",
    metrics: [
      "active_channels",
      "messages_sent",
      "user_engagement",
      "media_sharing",
      "api_usage",
      "throttling_events"
    ]
  },
  twilio: {
    name: "Twilio",
    color: "#8b5cf6",
    icon: Phone,
    description: "Communication APIs for SMS, voice, and video",
    metrics: [
      "sms_sent",
      "delivery_rate",
      "voice_minutes",
      "cost_tracking",
      "error_rates",
      "geographic_distribution"
    ]
  },
  mixpanel: {
    name: "Mixpanel",
    color: "#10b981",
    icon: BarChart,
    description: "Product analytics for user behavior tracking",
    metrics: [
      "conversion_funnels",
      "feature_usage",
      "user_retention",
      "event_tracking",
      "custom_events",
      "session_duration"
    ]
  }
};

// Get service metadata by service type
export const getServiceMetadata = (serviceType: ServiceType): ServiceMetadata => {
  return serviceMetricsMap[serviceType] || {
    name: "Unknown Service",
    color: "#6b7280",
    icon: Cloud,
    description: "Service information not available",
    metrics: []
  };
};

// Get a human-readable name for a metric
export const getMetricName = (metricType: string): string => {
  return metricType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get all available services
export const getAllServices = (): ServiceType[] => {
  return Object.keys(serviceMetricsMap) as ServiceType[];
};

// Get service status (for demonstration purposes)
export const getServiceStatus = (serviceType: ServiceType): "operational" | "degraded" | "incident" => {
  // This would typically come from your API
  const statusMap: Record<ServiceType, "operational" | "degraded" | "incident"> = {
    stytch: "operational",
    onesignal: "operational",
    aws: "degraded",
    sendbird: "operational",
    twilio: "incident",
    mixpanel: "operational"
  };
  
  return statusMap[serviceType] || "operational";
};

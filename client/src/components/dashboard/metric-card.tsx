import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, Activity, Users, Mail, Bell, User } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  type?: "number" | "percentage" | "currency";
  icon?: string;
  data?: Array<{ timestamp: string; value: number }>;
  isLoading?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  "users": Users,
  "activity": Activity,
  "alert": AlertTriangle,
  "clock": Clock,
  "mail": Mail,
  "bell": Bell,
  "user": User,
};

export function MetricCard({
  title,
  value,
  change,
  type = "number",
  icon = "activity",
  data = [],
  isLoading = false,
}: MetricCardProps) {
  // Format value based on type
  const formattedValue = React.useMemo(() => {
    if (isLoading) return "";
    
    if (typeof value === "string") return value;
    
    switch (type) {
      case "percentage":
        return `${value}%`;
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(value as number);
      default:
        return new Intl.NumberFormat("en-US").format(value as number);
    }
  }, [value, type, isLoading]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      // Generate empty data if none provided
      return Array(10)
        .fill(0)
        .map((_, i) => ({ timestamp: `${i}`, value: 0 }));
    }
    return data;
  }, [data]);

  // Determine chart color based on trend
  const chartColor = React.useMemo(() => {
    if (!change) return "var(--primary)";
    
    switch (change.trend) {
      case "up":
        return "rgba(34, 197, 94, 1)";
      case "down":
        return "rgba(239, 68, 68, 1)";
      default:
        return "var(--primary)";
    }
  }, [change]);

  const IconComponent = iconMap[icon] || Activity;

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="rounded-md bg-primary-50 p-2 mr-3">
              <IconComponent className="h-4 w-4 text-primary-500" />
            </div>
            <span className="text-sm font-medium text-gray-600">{title}</span>
          </div>
          {change && (
            <div
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                change.trend === "up"
                  ? "bg-green-50 text-green-600"
                  : change.trend === "down"
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              {change.value}
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold mb-2">{formattedValue}</div>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const formattedValue = type === "percentage" 
                          ? `${payload[0].value}%` 
                          : type === "currency"
                          ? new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                            }).format(payload[0].value as number)
                          : new Intl.NumberFormat("en-US").format(payload[0].value as number);
                          
                        return (
                          <div className="bg-white p-2 shadow-md rounded-md border text-xs">
                            <div>{formattedValue}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    fillOpacity={1}
                    fill={`url(#gradient-${title})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricCard;
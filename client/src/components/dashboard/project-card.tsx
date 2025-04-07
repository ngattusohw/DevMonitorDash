import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  AlertTriangle, 
  Plus, 
  Settings,
  BarChart,
  LineChart,
  XCircle
} from "lucide-react";
import { Project, ServiceType } from "@/types";
import { useServiceMetrics } from "@/hooks/use-project-metrics";
import { useDashboard } from "@/contexts/dashboard-context";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Predefined metric configurations 
const AVAILABLE_METRICS: MetricConfig[] = [
  { id: "users", title: "Active Users", icon: "users", type: "number", serviceType: "stytch" },
  { id: "api_requests", title: "API Requests", icon: "activity", type: "number", serviceType: "aws" },
  { id: "auth_success", title: "Auth Success", icon: "user", type: "percentage", serviceType: "stytch" },
  { id: "notifications", title: "Notifications", icon: "bell", type: "number", serviceType: "onesignal" },
  { id: "response_time", title: "Response Time", icon: "clock", type: "number", serviceType: "aws" },
  { id: "error_rate", title: "Error Rate", icon: "alert", type: "percentage", serviceType: "aws" },
  { id: "daily_active", title: "Daily Active", icon: "users", type: "number", serviceType: "mixpanel" },
  { id: "revenue", title: "Revenue", icon: "activity", type: "currency", serviceType: "mixpanel" },
];

interface MetricConfig {
  id: string;
  title: string;
  icon: string;
  type: "number" | "percentage" | "currency";
  serviceType: ServiceType;
}

interface ProjectCardProps {
  project: Project;
  alertCount?: number;
}

export function ProjectCard({ project, alertCount = 0 }: ProjectCardProps) {
  const [_, setLocation] = useLocation();
  const { dateRange } = useDashboard();
  const [showCharts, setShowCharts] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricConfig[]>([
    AVAILABLE_METRICS[0], // Default to Active Users
    AVAILABLE_METRICS[1], // Default to API Requests
  ]);
  
  // Function to add a metric to the card
  const addMetric = (metric: MetricConfig) => {
    if (selectedMetrics.length < 4) { // Limit to 4 metrics per card
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  // Function to remove a metric from the card
  const removeMetric = (metricId: string) => {
    setSelectedMetrics(selectedMetrics.filter(m => m.id !== metricId));
  };

  const handleViewProject = () => {
    setLocation(`/project/${project.id}`);
  };

  const handleConfigClose = () => {
    setConfigOpen(false);
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
          </div>
          <div className="flex space-x-2">
            {alertCount > 0 && (
              <div className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {alertCount} {alertCount === 1 ? "Alert" : "Alerts"}
              </div>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setConfigOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedMetrics.map(metric => (
            <ProjectMetric 
              key={metric.id}
              projectId={project.id}
              metric={metric}
              showChart={showCharts}
              onRemove={() => removeMetric(metric.id)}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="ghost"
          className="w-full justify-between group"
          onClick={handleViewProject}
        >
          <span>View Dashboard</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>

      {/* Project Configuration Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {project.name}</DialogTitle>
            <DialogDescription>
              Customize which metrics to display and how they appear
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showCharts" className="font-medium">
                {showCharts ? 
                  <div className="flex items-center">
                    <LineChart className="h-4 w-4 mr-2" />
                    Show metric charts
                  </div> : 
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2" />
                    Show metrics as numbers
                  </div>
                }
              </Label>
              <Switch
                id="showCharts"
                checked={showCharts}
                onCheckedChange={setShowCharts}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium">Available Metrics</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_METRICS.filter(
                  metric => !selectedMetrics.some(m => m.id === metric.id)
                ).map(metric => (
                  <Button
                    key={metric.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addMetric(metric)}
                    disabled={selectedMetrics.length >= 4}
                    className="justify-start">
                    <Plus className="mr-2 h-3 w-3" />
                    {metric.title}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium">Selected Metrics</Label>
              <div className="grid grid-cols-2 gap-2">
                {selectedMetrics.map(metric => (
                  <Button
                    key={metric.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => removeMetric(metric.id)}
                    className="justify-between">
                    {metric.title}
                    <XCircle className="ml-2 h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleConfigClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface ProjectMetricProps {
  projectId: number;
  metric: MetricConfig;
  showChart: boolean;
  onRemove: () => void;
}

function ProjectMetric({ projectId, metric, showChart, onRemove }: ProjectMetricProps) {
  const { dateRange } = useDashboard();
  const { data, isLoading } = useServiceMetrics(projectId, metric.serviceType, dateRange);
  
  // Process the metric data
  const metricData = React.useMemo(() => {
    // Use a typed response structure
    interface MetricResponse {
      metrics: {
        [key: string]: {
          dataPoints: Array<{timestamp: string; value: number}>
        }
      }
    }

    const typedData = data as unknown as MetricResponse | undefined;
    
    if (!typedData || !typedData.metrics || !typedData.metrics[metric.id]) {
      return { 
        value: 0, 
        change: { value: "0%", trend: "neutral" as const }, 
        chartData: [] 
      };
    }
    
    const metricInfo = typedData.metrics[metric.id];
    
    // Calculate trend and change percentage
    const dataPoints = metricInfo.dataPoints || [];
    const firstValue = dataPoints[0]?.value || 0;
    const lastValue = dataPoints[dataPoints.length - 1]?.value || 0;
    const changePercent = firstValue === 0 
      ? 0 
      : ((lastValue - firstValue) / firstValue) * 100;
    
    const trend = changePercent > 0 
      ? "up" as const
      : changePercent < 0 
        ? "down" as const
        : "neutral" as const;
    
    // Format chart data
    const chartData = dataPoints.map((point: {timestamp: string; value: number}) => ({
      timestamp: point.timestamp,
      value: point.value
    }));
    
    return {
      value: lastValue,
      change: {
        value: `${Math.abs(changePercent).toFixed(1)}%`,
        trend
      },
      chartData
    };
  }, [data, metric.id]);

  return (
    <div className="relative group">
      <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-6 w-6 rounded-full bg-white"
          onClick={onRemove}
        >
          <XCircle className="h-3 w-3 text-red-500" />
        </Button>
      </div>
      
      <MetricCard
        title={metric.title}
        value={metricData.value}
        change={metricData.change}
        type={metric.type}
        icon={metric.icon}
        data={showChart ? metricData.chartData : []}
        isLoading={isLoading}
      />
    </div>
  );
}

export default ProjectCard;
import React, { useState } from "react";
import { useParams } from "wouter";
import { useProjects } from "@/hooks/use-projects";
import { useAlerts } from "@/hooks/use-alerts";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Edit2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ServiceHealthOverview from "@/components/dashboard/service-health-overview";
import RecentAlerts from "@/components/dashboard/recent-alerts";
import ServiceMetrics from "@/components/dashboard/service-metrics";
import { Alert } from "@/types";
import { useToast } from "@/hooks/use-toast";
import AddWidgetModal from "@/components/modals/add-widget-modal";

export function ProjectDashboard() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id);
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const { alerts, updateAlert } = useAlerts();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  
  // Filter alerts for this project
  const projectAlerts = alerts.filter(alert => alert.projectId === projectId);
  
  // Mock service health data for this project
  const serviceHealth = [
    { serviceType: "stytch", status: "operational", statusText: "Operational", icon: "lock" },
    { serviceType: "onesignal", status: "operational", statusText: "Operational", icon: "bell" },
    { serviceType: "aws", status: "degraded", statusText: "Degraded", icon: "cloud" },
    { serviceType: "sendbird", status: "operational", statusText: "Operational", icon: "message-square" },
    { serviceType: "twilio", status: "incident", statusText: "Incident", icon: "phone" },
    { serviceType: "mixpanel", status: "operational", statusText: "Operational", icon: "bar-chart" },
  ];
  
  // Service types available for this project
  const serviceTypes = ['stytch', 'onesignal', 'aws', 'sendbird', 'twilio', 'mixpanel'];
  
  const handleRefreshData = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated.",
      });
    }, 1000);
  };
  
  const handleViewAlertDetails = (alert: Alert) => {
    toast({
      title: "View Alert Details",
      description: `Viewing details for ${alert.title}`,
    });
  };
  
  const handleAcknowledgeAlert = (alert: Alert) => {
    updateAlert({
      ...alert,
      status: "acknowledged"
    });
    toast({
      title: "Alert Acknowledged",
      description: `${alert.title} has been acknowledged.`,
    });
  };
  
  const handleAddWidget = (data: any) => {
    toast({
      title: "Widget Added",
      description: `Added a new ${data.widgetType} widget for ${data.serviceType}.`,
    });
  };
  
  if (!project) {
    return <div className="p-6">Project not found</div>;
  }
  
  return (
    <div className="p-6">
      {/* Project Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name} Dashboard</h1>
          <div className="text-sm text-gray-500 mt-1">Overview across all integrated services</div>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          
          <Button onClick={() => setAddWidgetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Service Health Overview */}
      <ServiceHealthOverview services={serviceHealth} />

      {/* Recent Alerts */}
      <RecentAlerts 
        alerts={projectAlerts.slice(0, 3)} 
        onViewDetails={handleViewAlertDetails}
        onAcknowledge={handleAcknowledgeAlert}
      />

      {/* Dashboard Widgets */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => setEditingLayout(!editingLayout)}
            >
              <Edit2 className="mr-1 h-3 w-3" />
              {editingLayout ? "Save Layout" : "Edit Layout"}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {serviceTypes.map(serviceType => (
            <ServiceMetrics 
              key={serviceType} 
              projectId={projectId} 
              serviceType={serviceType as any}
            />
          ))}
        </div>
      </div>
      
      {/* Add Widget Modal */}
      <AddWidgetModal
        open={addWidgetOpen}
        onOpenChange={setAddWidgetOpen}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}

export default ProjectDashboard;

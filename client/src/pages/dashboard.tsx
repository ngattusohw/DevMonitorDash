import React, { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCard } from "@/components/dashboard/project-card";
import RecentAlerts from "@/components/dashboard/recent-alerts";
import { useAlerts } from "@/hooks/use-alerts";
import { Alert } from "@/types";
import { useToast } from "@/hooks/use-toast";
import AddWidgetModal from "@/components/modals/add-widget-modal";
import { useDashboard } from "@/contexts/dashboard-context";

export function Dashboard() {
  const { projects } = useProjects();
  const { alerts, updateAlert } = useAlerts();
  const { toast } = useToast();
  const { dateRange, setDateRange, triggerRefresh } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);

  // Get the most recent alerts
  const recentAlerts = alerts.slice(0, 3);

  // Count alerts per project
  const alertCountByProject = alerts.reduce((acc, alert) => {
    if (alert.projectId) {
      acc[alert.projectId] = (acc[alert.projectId] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const handleRefreshData = () => {
    setRefreshing(true);
    triggerRefresh();
    
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
      status: "acknowledged",
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

  return (
    <div className="p-6">
      {/* Breadcrumb and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <div className="text-sm text-gray-500 mt-1">
            Monitor all your projects and services in one place
          </div>
        </div>
        <div className="flex flex-wrap mt-4 md:mt-0 gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
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
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>

          <Button onClick={() => setAddWidgetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              alertCount={alertCountByProject[project.id] || 0}
            />
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <RecentAlerts
        alerts={recentAlerts}
        onViewDetails={handleViewAlertDetails}
        onAcknowledge={handleAcknowledgeAlert}
      />

      {/* Add Widget Modal */}
      <AddWidgetModal
        open={addWidgetOpen}
        onOpenChange={setAddWidgetOpen}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}

export default Dashboard;

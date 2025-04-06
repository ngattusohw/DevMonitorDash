import React, { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ServiceHealthOverview from "@/components/dashboard/service-health-overview";
import RecentAlerts from "@/components/dashboard/recent-alerts";
import { useAlerts } from "@/hooks/use-alerts";
import { Alert, ServiceHealth } from "@/types";
import { useToast } from "@/hooks/use-toast";
import AddWidgetModal from "@/components/modals/add-widget-modal";

export function Dashboard() {
  const { projects } = useProjects();
  const { alerts, updateAlert } = useAlerts();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);

  // Mock service health data
  const serviceHealth: ServiceHealth[] = [
    {
      serviceType: "stytch",
      status: "operational",
      statusText: "Operational",
      icon: "lock",
    },
    {
      serviceType: "onesignal",
      status: "operational",
      statusText: "Operational",
      icon: "bell",
    },
    {
      serviceType: "aws",
      status: "degraded",
      statusText: "Degraded",
      icon: "cloud",
    },
    {
      serviceType: "sendbird",
      status: "operational",
      statusText: "Operational",
      icon: "message-square",
    },
    {
      serviceType: "twilio",
      status: "incident",
      statusText: "Incident",
      icon: "phone",
    },
    {
      serviceType: "mixpanel",
      status: "operational",
      statusText: "Operational",
      icon: "bar-chart",
    },
  ];

  // Get the most recent alerts
  const recentAlerts = alerts.slice(0, 3);

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
            Monitor all your services in one place
          </div>
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
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
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

import React, { useState } from "react";
import { useAlerts } from "@/hooks/use-alerts";
import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { AlertItem } from "@/components/ui/alert-item";
import { Alert, AlertSeverity, AlertStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function Alerts() {
  const { alerts, updateAlert } = useAlerts();
  const { projects } = useProjects();
  const { toast } = useToast();
  
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  
  // Filter alerts based on selections
  const filteredAlerts = alerts.filter(alert => {
    // Filter by project
    if (selectedProject !== "all" && alert.projectId !== parseInt(selectedProject)) {
      return false;
    }
    
    // Filter by status
    if (selectedStatus !== "all" && alert.status !== selectedStatus) {
      return false;
    }
    
    // Filter by severity
    if (selectedSeverity !== "all" && alert.severity !== selectedSeverity) {
      return false;
    }
    
    return true;
  });
  
  const handleViewAlertDetails = (alert: Alert) => {
    toast({
      title: "View Alert Details",
      description: `Viewing details for ${alert.title}`,
    });
  };
  
  const handleAcknowledgeAlert = (alert: Alert) => {
    updateAlert({
      ...alert,
      status: "acknowledged" as AlertStatus
    });
    toast({
      title: "Alert Acknowledged",
      description: `${alert.title} has been acknowledged.`,
    });
  };
  
  const handleResolveAlert = (alert: Alert) => {
    updateAlert({
      ...alert,
      status: "resolved" as AlertStatus
    });
    toast({
      title: "Alert Resolved",
      description: `${alert.title} has been resolved.`,
    });
  };
  
  // Count alerts by status
  const activeAlerts = alerts.filter(alert => alert.status === "active").length;
  const acknowledgedAlerts = alerts.filter(alert => alert.status === "acknowledged").length;
  const resolvedAlerts = alerts.filter(alert => alert.status === "resolved").length;
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <div className="text-sm text-gray-500 mt-1">View and manage alerts across all services</div>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Active Alerts</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{activeAlerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Acknowledged</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{acknowledgedAlerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Resolved</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{resolvedAlerts}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-gray-200">
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-gray-200">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onViewDetails={handleViewAlertDetails}
                onAcknowledge={alert.status === "active" ? handleAcknowledgeAlert : undefined}
              />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No alerts match your current filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Alerts;

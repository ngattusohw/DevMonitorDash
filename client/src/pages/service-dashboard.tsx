import React, { useState } from "react";
import { useParams } from "wouter";
import { useProjects } from "@/hooks/use-projects";
import { useAlerts } from "@/hooks/use-alerts";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, ChevronLeft } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceType } from "@/types";
import { getServiceMetadata } from "@/lib/service-integrations";
import { Link } from "wouter";
import { DataCard } from "@/components/ui/data-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceData } from "@/hooks/use-service-data";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { useToast } from "@/hooks/use-toast";

export function ServiceDashboard() {
  const { projectId, serviceType } = useParams<{ projectId: string, serviceType: string }>();
  const projectIdNum = parseInt(projectId);
  const serviceTypeEnum = serviceType as ServiceType;
  
  const { getProject } = useProjects();
  const project = getProject(projectIdNum);
  const { data, loading } = useServiceData(projectIdNum, serviceTypeEnum);
  const { toast } = useToast();
  
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const serviceMetadata = getServiceMetadata(serviceTypeEnum);
  
  const handleRefreshData = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Data refreshed",
        description: `${serviceMetadata.name} data has been updated.`,
      });
    }, 1000);
  };
  
  if (!project) {
    return <div className="p-6">Project not found</div>;
  }
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Service Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Link href={`/project/${projectId}`}>
              <a className="text-gray-500 hover:text-gray-700 flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to {project.name}
              </a>
            </Link>
          </div>
          <div className="flex items-center">
            <serviceMetadata.icon className="text-primary-600 h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">{serviceMetadata.name}</h1>
          </div>
          <div className="text-sm text-gray-500 mt-1">{serviceMetadata.description}</div>
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
        </div>
      </div>

      {/* Service Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Main metrics dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.metrics.map((metric, index) => (
              <DataCard key={index} title={metric.title} className="h-full">
                <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                {metric.trend && (
                  <div className={metric.trend.positive ? "text-green-600" : "text-red-600"} style={{ display: "flex", alignItems: "center" }}>
                    {metric.trend.direction === "up" ? (
                      <span>↑</span>
                    ) : (
                      <span>↓</span>
                    )}
                    <span className="ml-1">{metric.trend.value} {metric.trend.label}</span>
                  </div>
                )}
              </DataCard>
            ))}
          </div>
          
          {/* Primary chart */}
          <DataCard title="Historical Trend">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {data.series.map((series) => (
                    <Line 
                      key={series.name}
                      type="monotone" 
                      dataKey={series.dataKey}
                      name={series.name}
                      stroke={serviceMetadata.color}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DataCard>
          
          {/* Additional metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataCard title="Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill={serviceMetadata.color}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${210 + index * 30}, 80%, 55%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
            
            <DataCard title="Usage by Time">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Usage" fill={serviceMetadata.color} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <DataCard title="Performance Metrics">
            <div className="p-12 text-center text-gray-500">
              Performance metrics will appear here.
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="usage">
          <DataCard title="Usage Metrics">
            <div className="p-12 text-center text-gray-500">
              Usage metrics will appear here.
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="errors">
          <DataCard title="Error Metrics">
            <div className="p-12 text-center text-gray-500">
              Error metrics will appear here.
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="settings">
          <DataCard title="Service Settings">
            <div className="p-12 text-center text-gray-500">
              Service settings will appear here.
            </div>
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ServiceDashboard;

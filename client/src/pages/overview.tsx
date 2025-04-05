import React, { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import StatCard from "@/components/dashboard/stat-card";
import ProjectCard from "@/components/dashboard/project-card";
import AlertBanner from "@/components/dashboard/alert-banner";
import AlertsTable from "@/components/dashboard/alerts-table";
import MetricChart from "@/components/dashboard/metric-chart";
import DateRangeSelector from "@/components/dashboard/date-range-selector";
import { useDateRange } from "@/hooks/use-date-range";
import { api } from "@/lib/api";
import { Link } from "wouter";
import { ChartData } from "@/types";
import { getProjectStatusFromHealthScore } from "@/lib/utils/formatters";
import { AlertTableItem } from "@/types";
import { 
  ServiceStatusSummary, 
  ProjectWithServices 
} from "@shared/schema";

export default function Overview() {
  const { selectedRange, handleRangeChange } = useDateRange("7d");
  const [activeBanner, setActiveBanner] = useState<boolean>(true);

  const { data: overviewStats, refetch, isLoading } = useQuery({
    queryKey: ["/api/dashboard/overview", selectedRange.type],
    queryFn: () => api.getOverviewStats(selectedRange.type),
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleViewAlertDetails = useCallback((alertId: number) => {
    console.log("View alert details", alertId);
    // Navigate to alert details page or open modal
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-36 bg-gray-200 rounded"></div>
                ))}
              </div>
              
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 mt-8"></div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Prepare data for authentication activity chart
  const authChartData: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Logins',
        data: overviewStats?.metrics?.authentication?.[0]?.data.map(d => d.value) || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Signups',
        data: overviewStats?.metrics?.authentication?.[1]?.data.map(d => d.value) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Prepare data for API requests chart
  const apiChartData: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: overviewStats?.metrics?.apiRequests?.map((metric, index) => ({
      label: metric.name,
      data: metric.data.map(d => d.value),
      backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981'][index % 3],
      borderRadius: 4
    })) || []
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Overview Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Monitor all your projects in one place</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <DateRangeSelector 
                selectedRange={selectedRange}
                onRangeChange={handleRangeChange}
                onRefresh={handleRefresh}
              />
            </div>
          </div>

          {/* Alert Banner */}
          {activeBanner && overviewStats?.alerts?.some(a => a.severity === "critical") && (
            <div className="mt-4">
              <AlertBanner 
                severity="warning"
                title="Attention needed"
                message="AWS Lambda functions experiencing elevated error rates in the E-commerce Platform project."
                onClose={() => setActiveBanner(false)}
              />
            </div>
          )}

          {/* Stats Overview Cards */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">System Health</h2>
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {overviewStats?.services?.map((service: ServiceStatusSummary) => (
                <StatCard
                  key={service.serviceType}
                  icon={
                    service.serviceType === "stytch" ? "verified_user" :
                    service.serviceType === "aws" ? "cloud" :
                    service.serviceType === "sendbird" || service.serviceType === "twilio" ? "sms" :
                    service.serviceType === "onesignal" ? "notifications" :
                    "analytics"
                  }
                  iconBgColor={
                    service.trend === "up" ? "bg-green-100" :
                    service.trend === "down" ? "bg-red-100" :
                    "bg-yellow-100"
                  }
                  iconColor={
                    service.trend === "up" ? "text-green-600" :
                    service.trend === "down" ? "text-red-600" :
                    "text-yellow-600"
                  }
                  title={
                    service.serviceType === "stytch" ? "Authentication" :
                    service.serviceType === "aws" ? "AWS Infrastructure" :
                    service.serviceType === "sendbird" || service.serviceType === "twilio" ? "Messaging Services" :
                    service.serviceType === "onesignal" ? "Notifications" :
                    "Analytics"
                  }
                  value={`${service.healthScore.toFixed(1)}%`}
                  trend={service.trend}
                  trendValue={`${service.changePercent.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>

          {/* Projects Overview */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Projects Overview</h2>
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {overviewStats?.projects?.map((project: ProjectWithServices) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  healthScore={project.healthScore || 0}
                  status={getProjectStatusFromHealthScore(project.healthScore || 0)}
                  serviceCount={project.services.length}
                  alertCount={project.alertCount}
                />
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Active Alerts</h2>
              <Link href="/alerts">
                <a className="text-sm font-medium text-blue-500 hover:text-blue-700">
                  View all alerts
                </a>
              </Link>
            </div>
            <div className="mt-2 overflow-hidden shadow rounded-lg">
              <div className="bg-white">
                <AlertsTable
                  alerts={overviewStats?.alerts || []}
                  onViewDetails={handleViewAlertDetails}
                />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Key Metrics</h2>
            <div className="mt-2 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <MetricChart
                title="Authentication Activity"
                chartData={authChartData}
                type="line"
              />
              <MetricChart
                title="API Requests"
                chartData={apiChartData}
                type="bar"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

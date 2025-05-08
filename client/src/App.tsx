import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ProjectDashboard from "@/pages/project-dashboard";
import ServiceDashboard from "@/pages/service-dashboard";
import Settings from "@/pages/settings";
import Alerts from "@/pages/alerts";
import Landing from "@/pages/landing";
import DashboardLayout from "@/layouts/dashboard-layout";
import { DashboardProvider } from "./contexts/dashboard-context";

function DashboardRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/project/:id" component={ProjectDashboard} />
      <Route path="/project/:projectId/service/:serviceType" component={ServiceDashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/alerts" component={Alerts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // If we're on the landing page, don't use the dashboard layout
  if (location === '/') {
    return (
      <QueryClientProvider client={queryClient}>
        <Landing />
        <Toaster />
      </QueryClientProvider>
    );
  }
  
  // For all other routes, use the dashboard layout
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <DashboardLayout>
          <DashboardRouter />
        </DashboardLayout>
        <Toaster />
      </DashboardProvider>
    </QueryClientProvider>
  );
}

export default App;

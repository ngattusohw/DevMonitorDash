import React from "react";
import Sidebar from "@/components/dashboard/sidebar";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useDashboard } from "@/contexts/dashboard-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useDashboard();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar open={sidebarOpen} />
      
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar open={sidebarOpen} />
        </SheetContent>
      </Sheet>
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white w-full shadow-sm z-10 fixed top-0 left-0 right-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="ml-3 flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600 text-white">
                <span className="h-5 w-5" />
              </div>
              <h1 className="ml-2 text-lg font-semibold text-gray-900">DevMonitor</h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto mt-0 md:mt-0 pt-16 md:pt-0 bg-gray-50">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;

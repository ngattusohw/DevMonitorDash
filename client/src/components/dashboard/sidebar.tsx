import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import { useAlerts } from "@/hooks/use-alerts";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Settings, 
  Folder, 
  Plus,
  LogOut,
  Lock,
  Bell,
  Cloud,
  MessageSquare,
  Phone,
  BarChart
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  badge?: number;
  active?: boolean;
}

const SidebarItem = ({ href, icon: Icon, children, badge, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a className={cn(
        "block px-3 py-2 rounded-md text-sm font-medium",
        active
          ? "text-primary-600 bg-primary-50"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}>
        <div className="flex items-center">
          <Icon className="mr-3 h-5 w-5" />
          <span>{children}</span>
          {badge !== undefined && (
            <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </a>
    </Link>
  );
};

interface SidebarProps {
  open?: boolean;
}

export function Sidebar({ open = true }: SidebarProps) {
  const [location] = useLocation();
  const { projects } = useProjects();
  const { alerts } = useAlerts();
  
  // Count active alerts
  const activeAlerts = alerts.filter(alert => alert.status === "active");
  
  return (
    <aside className={cn(
      "w-64 bg-white shadow-md z-10 flex-shrink-0",
      open ? "hidden md:block" : "hidden"
    )}>
      <div className="h-full flex flex-col">
        {/* Logo and App Title */}
        <div className="px-4 py-5 flex items-center border-b border-gray-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">DevMonitor</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Dashboard
            </div>
            <SidebarItem 
              href="/" 
              icon={LayoutDashboard} 
              active={location === "/"}
            >
              Overview
            </SidebarItem>
            <SidebarItem 
              href="/alerts" 
              icon={AlertTriangle} 
              badge={activeAlerts.length}
              active={location === "/alerts"}
            >
              Alerts
            </SidebarItem>
            <SidebarItem 
              href="/settings" 
              icon={Settings}
              active={location === "/settings"}
            >
              Settings
            </SidebarItem>
          </div>
          
          <div className="mt-8">
            <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
              Projects
              <button className="ml-2 text-primary-600 hover:text-primary-700">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map(project => (
                <SidebarItem 
                  key={project.id} 
                  href={`/project/${project.id}`} 
                  icon={Folder}
                  active={location === `/project/${project.id}`}
                >
                  {project.name}
                </SidebarItem>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Integrations
            </div>
            <div className="space-y-1">
              <SidebarItem href="/settings?service=stytch" icon={Lock}>
                Stytch
              </SidebarItem>
              <SidebarItem href="/settings?service=onesignal" icon={Bell}>
                OneSignal
              </SidebarItem>
              <SidebarItem href="/settings?service=aws" icon={Cloud}>
                AWS
              </SidebarItem>
              <SidebarItem href="/settings?service=sendbird" icon={MessageSquare}>
                Sendbird
              </SidebarItem>
              <SidebarItem href="/settings?service=twilio" icon={Phone}>
                Twilio
              </SidebarItem>
              <SidebarItem href="/settings?service=mixpanel" icon={BarChart}>
                Mixpanel
              </SidebarItem>
            </div>
          </div>
        </nav>
        
        {/* User Menu */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">AU</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Alex User</p>
              <p className="text-xs text-gray-500">alex@example.com</p>
            </div>
            <button className="ml-auto text-gray-400 hover:text-gray-500">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

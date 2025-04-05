import React from "react";
import { Link, useLocation } from "wouter";
import { SERVICE_ICONS, SERVICE_NAMES } from "@/lib/constants";
import { ServiceType } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  if (!open) {
    return null;
  }

  const isActive = (path: string) => {
    return location === path ? 
      "bg-gray-900 text-white" : 
      "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gray-800">
        <div className="h-16 flex items-center px-4 bg-gray-900">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
              <span className="material-icons text-white text-xl">monitoring</span>
            </div>
            <div className="text-white font-semibold text-lg">DevMonitor</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <Link href="/">
              <a className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/")}`}>
                <span className="material-icons mr-3 text-gray-300">dashboard</span>
                Overview
              </a>
            </Link>

            {/* Projects Section */}
            <div className="pt-4">
              <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Projects
              </div>

              {projects && projects.map((project: any) => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <a className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(`/project/${project.id}`)}`}>
                    <span className="material-icons mr-3 text-gray-400">web</span>
                    {project.name}
                  </a>
                </Link>
              ))}
            </div>

            {/* Services Section */}
            <div className="pt-4">
              <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Services
              </div>

              {Object.entries(SERVICE_NAMES).map(([type, name]) => (
                <Link key={type} href={`/service/${type}`}>
                  <a className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(`/service/${type}`)}`}>
                    <span className="material-icons mr-3 text-gray-400">{SERVICE_ICONS[type as ServiceType]}</span>
                    {name}
                  </a>
                </Link>
              ))}
            </div>

            {/* Settings */}
            <div className="pt-4">
              <Link href="/settings">
                <a className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive("/settings")}`}>
                  <span className="material-icons mr-3 text-gray-400">settings</span>
                  Settings
                </a>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

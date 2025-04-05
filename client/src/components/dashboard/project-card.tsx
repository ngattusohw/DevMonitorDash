import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCardProps } from "@/types";
import { PROJECT_STATUS_COLORS } from "@/lib/constants";
import { Link } from "wouter";

export default function ProjectCard({
  id,
  name,
  healthScore,
  status,
  serviceCount,
  alertCount
}: ProjectCardProps) {
  const statusColor = PROJECT_STATUS_COLORS[status];
  
  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
            {status === "healthy" ? "Healthy" : status === "warning" ? "Warning" : "Alert"}
          </span>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Health Score</span>
            <span>{healthScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`${statusColor.progress} h-2 rounded-full`} style={{ width: `${healthScore}%` }}></div>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Services</p>
                <p className="text-lg font-semibold text-gray-900">{serviceCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Alerts</p>
                <p className={`text-lg font-semibold ${alertCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {alertCount}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Link href={`/project/${id}`}>
            <a className="inline-flex items-center text-sm font-medium text-blue-500">
              View dashboard
              <span className="material-icons ml-1 text-sm">arrow_forward</span>
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, Activity, Users } from "lucide-react";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  alertCount?: number;
}

export function ProjectCard({ project, alertCount = 0 }: ProjectCardProps) {
  const [_, setLocation] = useLocation();

  // Mock metrics for the project card
  const metrics = [
    {
      name: "Active Users",
      value: Math.floor(Math.random() * 5000) + 500,
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      name: "API Requests",
      value: Math.floor(Math.random() * 100000) + 10000,
      icon: Activity,
      change: "+5%",
      changeType: "positive" as const,
    },
  ];

  const handleViewProject = () => {
    setLocation(`/project/${project.id}`);
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
          </div>
          {alertCount > 0 && (
            <div className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {alertCount} {alertCount === 1 ? "Alert" : "Alerts"}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="rounded-md bg-primary-50 p-2">
                <metric.icon className="h-4 w-4 text-primary-500" />
              </div>
              <div>
                <div className="text-sm font-medium">{metric.name}</div>
                <div className="flex items-center mt-1">
                  <span className="text-xl font-semibold">
                    {metric.value.toLocaleString()}
                  </span>
                  <span
                    className={`ml-2 text-xs font-medium ${
                      metric.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="ghost"
          className="w-full justify-between group"
          onClick={handleViewProject}
        >
          <span>View Dashboard</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  action?: React.ReactNode;
}

export function DataCard({
  title,
  icon,
  children,
  className,
  headerClassName,
  action,
}: DataCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("px-4 py-3 border-b border-gray-200 flex flex-row justify-between items-center", headerClassName)}>
        <div className="flex items-center">
          {icon && <span className="text-primary-600 mr-2">{icon}</span>}
          <CardTitle className="font-medium text-gray-900 text-base">{title}</CardTitle>
        </div>
        {action && (
          <div className="flex items-center space-x-2">
            {action}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

export default DataCard;

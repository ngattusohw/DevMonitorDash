import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert } from "@/types";
import { AlertItem } from "@/components/ui/alert-item";
import { Link } from "wouter";

interface RecentAlertsProps {
  alerts: Alert[];
  onViewDetails?: (alert: Alert) => void;
  onAcknowledge?: (alert: Alert) => void;
}

export function RecentAlerts({ alerts, onViewDetails, onAcknowledge }: RecentAlertsProps) {
  return (
    <Card className="mb-8 shadow-sm overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-gray-200">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onViewDetails={onViewDetails}
              onAcknowledge={onAcknowledge}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No recent alerts
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-200 bg-gray-50">
        <Link href="/alerts">
          <a className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all alerts
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default RecentAlerts;

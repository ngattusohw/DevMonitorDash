import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVICE_ICONS } from "@/lib/constants";
import { AlertTableItem } from "@/types";
import { ALERT_SEVERITY_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/utils/formatters";

interface AlertsTableProps {
  alerts: AlertTableItem[];
  onViewDetails: (alertId: number) => void;
}

export default function AlertsTable({ alerts, onViewDetails }: AlertsTableProps) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-1/12">Status</TableHead>
                  <TableHead className="w-2/12">Service</TableHead>
                  <TableHead className="w-2/12">Project</TableHead>
                  <TableHead className="w-4/12">Description</TableHead>
                  <TableHead className="w-2/12">Time</TableHead>
                  <TableHead className="w-1/12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ALERT_SEVERITY_COLORS[alert.severity].bg} ${ALERT_SEVERITY_COLORS[alert.severity].text}`}>
                        {alert.severity === "critical" ? "Critical" : 
                          alert.severity === "warning" ? "Warning" : "Info"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                          <span className="material-icons text-gray-500">
                            {SERVICE_ICONS[alert.serviceType]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{alert.serviceName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{alert.projectName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{alert.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">{formatTimestamp(alert.timestamp)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(alert.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

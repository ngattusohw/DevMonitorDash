import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceType, WidgetType } from "@/types";
import { getServiceMetadata } from "@/lib/service-integrations";

interface AddWidgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (data: {
    widgetType: WidgetType;
    serviceType: ServiceType;
    metricType: string;
    refreshInterval: number;
  }) => void;
}

export function AddWidgetModal({ open, onOpenChange, onAddWidget }: AddWidgetModalProps) {
  const [widgetType, setWidgetType] = useState<WidgetType>("chart");
  const [serviceType, setServiceType] = useState<ServiceType>("stytch");
  const [metricType, setMetricType] = useState<string>("");
  const [refreshInterval, setRefreshInterval] = useState<number>(3600);
  
  const serviceMetadata = getServiceMetadata(serviceType);
  
  const handleSubmit = () => {
    onAddWidget({
      widgetType,
      serviceType,
      metricType: metricType || serviceMetadata.metrics[0],
      refreshInterval,
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Configure a new widget to add to your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="widgetType">Widget Type</Label>
            <Select
              value={widgetType}
              onValueChange={(value) => setWidgetType(value as WidgetType)}
            >
              <SelectTrigger id="widgetType">
                <SelectValue placeholder="Select widget type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="metric">Metric Card</SelectItem>
                <SelectItem value="status">Status Card</SelectItem>
                <SelectItem value="alert-list">Alert List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Select
              value={serviceType}
              onValueChange={(value) => setServiceType(value as ServiceType)}
            >
              <SelectTrigger id="dataSource">
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stytch">Stytch</SelectItem>
                <SelectItem value="onesignal">OneSignal</SelectItem>
                <SelectItem value="aws">AWS</SelectItem>
                <SelectItem value="sendbird">Sendbird</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="mixpanel">Mixpanel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="metricType">Metric Type</Label>
            <Select
              value={metricType}
              onValueChange={setMetricType}
            >
              <SelectTrigger id="metricType">
                <SelectValue placeholder="Select metric type" />
              </SelectTrigger>
              <SelectContent>
                {serviceMetadata.metrics.map(metric => (
                  <SelectItem key={metric} value={metric}>
                    {metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="refreshInterval">Refresh Interval</Label>
            <Select
              value={refreshInterval.toString()}
              onValueChange={(value) => setRefreshInterval(parseInt(value))}
            >
              <SelectTrigger id="refreshInterval">
                <SelectValue placeholder="Select refresh interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="900">15 minutes</SelectItem>
                <SelectItem value="3600">1 hour</SelectItem>
                <SelectItem value="21600">6 hours</SelectItem>
                <SelectItem value="86400">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddWidgetModal;

import React, { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useServiceData } from "@/hooks/use-service-data";
import { getServiceMetadata } from "@/lib/service-integrations";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/use-projects";
import { SubscriptionCard } from "@/components/subscription/subscription-card";

export function Settings() {
  const [activeTab, setActiveTab] = useState<string>("general");
  const { toast } = useToast();
  const { projects } = useProjects();
  
  const serviceTypes = ['stytch', 'onesignal', 'aws', 'sendbird', 'twilio', 'mixpanel'];
  
  // Handle saving settings
  const handleSaveGeneralSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your general settings have been updated.",
    });
  };
  
  const handleSaveIntegration = (serviceType: string) => {
    toast({
      title: "Integration Updated",
      description: `Your ${serviceType} integration has been updated.`,
    });
  };
  
  const handleSaveAlertSettings = () => {
    toast({
      title: "Alert Settings Saved",
      description: "Your alert settings have been updated.",
    });
  };
  
  const handleTestConnection = (serviceType: string) => {
    toast({
      title: "Testing Connection",
      description: `Testing connection to ${serviceType}...`,
    });
    
    // Simulate connection test
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${serviceType}.`,
      });
    }, 1500);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dashboard-name">Dashboard Name</Label>
                <Input id="dashboard-name" defaultValue="Developer Monitoring Dashboard" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-project">Default Project</Label>
                <select id="default-project" className="block appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Data Refresh Interval</Label>
                <select id="refresh-interval" className="block appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="900">15 minutes</option>
                  <option value="3600">1 hour</option>
                  <option value="21600">6 hours</option>
                  <option value="86400">24 hours</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch id="dark-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <Button onClick={handleSaveGeneralSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          {serviceTypes.map(serviceType => {
            const serviceMetadata = getServiceMetadata(serviceType as any);
            return (
              <Card key={serviceType}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center">
                    <serviceMetadata.icon className="text-primary-600 mr-2 h-5 w-5" />
                    <CardTitle>{serviceMetadata.name} Integration</CardTitle>
                  </div>
                  <Switch defaultChecked />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor={`${serviceType}-api-key`}>API Key</Label>
                    <Input
                      id={`${serviceType}-api-key`}
                      type="password"
                      defaultValue="••••••••••••••••"
                    />
                  </div>
                  
                  {serviceType === 'aws' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="aws-secret-key">Secret Key</Label>
                        <Input
                          id="aws-secret-key"
                          type="password"
                          defaultValue="••••••••••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aws-region">Region</Label>
                        <Input id="aws-region" defaultValue="us-east-1" />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${serviceType}-sync-interval`}>Sync Interval</Label>
                    <select 
                      id={`${serviceType}-sync-interval`} 
                      className="block appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="900">15 minutes</option>
                      <option value="3600">1 hour</option>
                      <option value="21600">6 hours</option>
                      <option value="86400">24 hours</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-row space-x-4">
                    <Button onClick={() => handleSaveIntegration(serviceType)}>
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection(serviceType)}
                    >
                      Test Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="alert-channels">Notification Channels</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="email-channel" defaultChecked />
                    <label htmlFor="email-channel">Email</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="slack-channel" />
                    <label htmlFor="slack-channel">Slack</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="sms-channel" />
                    <label htmlFor="sms-channel">SMS</label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-threshold">Default Alert Threshold</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="alert-threshold"
                    type="number"
                    defaultValue="10"
                    min="1"
                    max="100"
                    className="w-20"
                  />
                  <span>%</span>
                </div>
                <p className="text-xs text-gray-500">
                  Alerts are triggered when metrics deviate from historical average by this percentage.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-cooldown">Alert Cooldown Period</Label>
                <select 
                  id="alert-cooldown" 
                  className="block appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="300">5 minutes</option>
                  <option value="900">15 minutes</option>
                  <option value="1800">30 minutes</option>
                  <option value="3600">1 hour</option>
                </select>
              </div>
              
              <Button onClick={handleSaveAlertSettings}>Save Alert Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" defaultValue="Alex User" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="alex@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <Button>Update Account</Button>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <SubscriptionCard />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings;

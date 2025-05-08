import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { Link } from "wouter";

export function SubscriptionCard() {
  const { subscription, isLoading } = useSubscription();
  const error = false; // Simplified error handling

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading your subscription details...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Could not load subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">There was an error loading your subscription. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Using fallback values if subscription is not available
  const status = subscription?.status || "free";
  const isPremium = status === "active" || status === "premium";
  
  const projects = subscription?.projects || {
    current: 1,
    limit: isPremium ? 'unlimited' : 1,
    remaining: isPremium ? 'unlimited' : 0
  };
  
  const integrations = subscription?.integrations || {
    current: 2,
    limit: isPremium ? 'unlimited' : 3,
    remaining: isPremium ? 'unlimited' : 1
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subscription</CardTitle>
          <Badge variant={isPremium ? "default" : "outline"}>
            {isPremium ? "Premium" : "Free"}
          </Badge>
        </div>
        <CardDescription>
          {isPremium 
            ? "You're on the Premium plan with unlimited access" 
            : "You're currently on the Free plan with limited access"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Projects</span>
            <span className="text-sm text-muted-foreground">
              {projects.current} / {projects.limit === 'unlimited' ? '∞' : projects.limit}
            </span>
          </div>
          <Progress 
            value={projects.limit === 'unlimited' ? 50 : (projects.current / Number(projects.limit)) * 100} 
            className="h-2"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Service Integrations</span>
            <span className="text-sm text-muted-foreground">
              {integrations.current} / {integrations.limit === 'unlimited' ? '∞' : integrations.limit}
            </span>
          </div>
          <Progress 
            value={integrations.limit === 'unlimited' ? 50 : (integrations.current / Number(integrations.limit)) * 100} 
            className="h-2"
          />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Features</h4>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle2 className={`h-5 w-5 mr-2 ${isPremium ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm">Basic metrics visualization</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className={`h-5 w-5 mr-2 ${isPremium ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm">Standard alert notifications</span>
            </li>
            <li className="flex items-start">
              {isPremium ? (
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 text-muted-foreground" />
              )}
              <span className="text-sm">Advanced visualization options</span>
            </li>
            <li className="flex items-start">
              {isPremium ? (
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 text-muted-foreground" />
              )}
              <span className="text-sm">30-day data retention</span>
            </li>
            <li className="flex items-start">
              {isPremium ? (
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 text-muted-foreground" />
              )}
              <span className="text-sm">Priority support</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        {isPremium ? (
          <Button variant="outline" className="w-full">
            Manage Subscription
          </Button>
        ) : (
          <Link href="/settings/billing" className="w-full">
            <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
              Upgrade to Premium
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/use-subscription";
import { Loader2, CheckCircle2, CreditCard, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function SubscriptionCard() {
  const { subscription, isLoading, createCheckoutSession, manageBilling, isPremium } = useSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load subscription data</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${isPremium ? 'bg-gradient-to-r from-amber-500 to-amber-300 text-white' : 'bg-muted'}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            {isPremium ? 'Premium Subscription' : 'Free Plan'}
          </CardTitle>
          {isPremium ? (
            <Badge className="bg-white text-amber-600">Premium</Badge>
          ) : (
            <Badge variant="outline" className="border-primary text-primary bg-white">Free</Badge>
          )}
        </div>
        <CardDescription className={isPremium ? 'text-white/90' : ''}>
          {isPremium 
            ? 'You have access to all premium features' 
            : 'Upgrade to premium for unlimited projects and integrations'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Projects</span>
              <span className="text-sm font-medium">
                {subscription.projects.current} / {subscription.projects.limit === 'unlimited' ? '∞' : subscription.projects.limit}
              </span>
            </div>
            {!isPremium && (
              <Progress 
                value={(subscription.projects.current / (subscription.projects.limit as number)) * 100} 
                className="h-2"
              />
            )}
          </div>
          
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Service Integrations</span>
              <span className="text-sm font-medium">
                {subscription.integrations.current} / {subscription.integrations.limit === 'unlimited' ? '∞' : subscription.integrations.limit}
              </span>
            </div>
            {!isPremium && (
              <Progress 
                value={(subscription.integrations.current / (subscription.integrations.limit as number)) * 100} 
                className="h-2"
              />
            )}
          </div>
          
          {isPremium && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-muted/50 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span className="text-sm font-medium">Unlimited Projects</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span className="text-sm font-medium">Unlimited Integrations</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span className="text-sm font-medium">Premium Support</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span className="text-sm font-medium">Advanced Analytics</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
        {isPremium ? (
          <Button 
            className="w-full"
            onClick={() => manageBilling.mutate()}
            disabled={manageBilling.isPending}
          >
            {manageBilling.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Billing
              </>
            )}
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-600 hover:to-amber-400"
            onClick={() => createCheckoutSession.mutate()}
            disabled={createCheckoutSession.isPending}
          >
            {createCheckoutSession.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Upgrade to Premium ($10/month)
              </>
            )}
          </Button>
        )}
        {!isPremium && (
          <p className="text-xs text-center text-muted-foreground">
            Premium includes unlimited projects, integrations, and priority support
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
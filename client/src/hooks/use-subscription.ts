import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionStatus {
  status: string;
  projects: {
    current: number;
    limit: number | 'unlimited';
    remaining: number | 'unlimited';
  };
  integrations: {
    current: number;
    limit: number | 'unlimited';
    remaining: number | 'unlimited';
  };
  tokens: number;
}

export function useSubscription() {
  const { toast } = useToast();

  const { data: subscription, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    onError: (error) => {
      toast({
        title: 'Error fetching subscription status',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const createCheckoutSession = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/checkout');
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: 'Error creating checkout session',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const manageBilling = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/billing-portal');
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe Billing Portal
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: 'Error opening billing portal',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    subscription,
    isLoading,
    createCheckoutSession,
    manageBilling,
    isPremium: subscription?.status === 'premium',
  };
}
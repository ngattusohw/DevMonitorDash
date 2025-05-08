import { useQuery } from "@tanstack/react-query";

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
  const { data, isLoading, error } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    subscription: data,
    isLoading,
    error,
  };
}
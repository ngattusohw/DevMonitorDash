import { useState, useEffect, useCallback } from "react";
import { Alert } from "@/types";
import { fetchAlerts, updateAlert as apiUpdateAlert } from "@/lib/api";
import { useDashboard } from "@/contexts/dashboard-context";

export function useAlerts(projectId?: number) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { refreshTrigger } = useDashboard();
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts(projectId);
      setAlerts(data);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [projectId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);
  
  const updateAlert = async (updatedAlert: Alert) => {
    try {
      await apiUpdateAlert(updatedAlert.id, updatedAlert);
      
      // Update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === updatedAlert.id ? updatedAlert : alert
        )
      );
      
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };
  
  return { alerts, loading, error, updateAlert, refetch: fetchData };
}

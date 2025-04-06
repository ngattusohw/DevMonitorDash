import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

// Define DateRangeType within the file since we can't import from server
type DateRangeType = "24h" | "7d" | "30d" | "90d" | "custom";

interface DashboardContextType {
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  customDateRange: { start: Date | null; end: Date | null };
  setCustomDateRange: (start: Date | null, end: Date | null) => void;
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  selectedServiceId: number | null;
  setSelectedServiceId: (id: number | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRangeType>("7d");
  const [customDateRange, setCustomDateRangeState] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const setCustomDateRange = (start: Date | null, end: Date | null) => {
    setCustomDateRangeState({ start, end });
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dateRange,
        setDateRange,
        customDateRange,
        setCustomDateRange,
        selectedProjectId,
        setSelectedProjectId,
        selectedServiceId,
        setSelectedServiceId,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

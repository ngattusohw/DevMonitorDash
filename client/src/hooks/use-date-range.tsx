import { useCallback, useState } from "react";
import { DateRange, DateRangeType } from "../types";
import { DATE_RANGES } from "../lib/constants";

export function useDateRange(initialRange: DateRangeType = "7d") {
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    DATE_RANGES[initialRange]
  );

  const handleRangeChange = useCallback((rangeKey: string) => {
    const newRange = DATE_RANGES[rangeKey];
    if (newRange) {
      setSelectedRange(newRange);
    }
  }, []);

  const handleCustomRangeChange = useCallback((startDate: Date, endDate: Date) => {
    setSelectedRange({
      type: "custom",
      label: "Custom range",
      startDate,
      endDate
    });
  }, []);

  return {
    selectedRange,
    handleRangeChange,
    handleCustomRangeChange
  };
}

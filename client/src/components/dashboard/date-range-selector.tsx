import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DATE_RANGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { DateRange, DateRangeType } from "@/types";

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onRangeChange: (range: string) => void;
  onRefresh?: () => void;
}

export default function DateRangeSelector({ 
  selectedRange, 
  onRangeChange,
  onRefresh 
}: DateRangeSelectorProps) {
  return (
    <div className="flex space-x-3">
      <div className="relative">
        <Select
          value={selectedRange.type}
          onValueChange={onRangeChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, range]) => (
              <SelectItem key={key} value={key}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        className="flex items-center"
      >
        <span className="material-icons mr-2 text-gray-500 text-sm">refresh</span>
        Refresh
      </Button>
    </div>
  );
}

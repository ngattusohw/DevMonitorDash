import { format, subDays } from "date-fns";
import { Metric } from "@/types";

// Format date for chart display
export const formatChartDate = (date: Date): string => {
  return format(date, "MMM dd");
};

// Generate array of dates for the past n days
export const getDateRangeArray = (days: number): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    dates.push(subDays(today, i));
  }
  
  return dates;
};

// Create chart data from metrics
export const createChartDataFromMetrics = (
  metrics: Metric[],
  valueKey: string = "count",
  dateFormat: string = "MMM dd"
): any[] => {
  const metricsByDate = metrics.reduce((acc, metric) => {
    const date = new Date(metric.timestamp);
    const dateStr = format(date, dateFormat);
    
    if (!acc[dateStr]) {
      acc[dateStr] = {};
    }
    
    if (typeof metric.value === "object" && metric.value !== null) {
      acc[dateStr][metric.metricType] = metric.value[valueKey] || 0;
    } else {
      acc[dateStr][metric.metricType] = metric.value || 0;
    }
    
    return acc;
  }, {} as Record<string, Record<string, number>>);
  
  return Object.entries(metricsByDate).map(([date, values]) => ({
    name: date,
    ...values
  }));
};

// Generate mock chart data for a service type
export const generateMockChartData = (serviceType: string, days: number = 7): any[] => {
  const dates = getDateRangeArray(days);
  
  const data = dates.map(date => {
    const formattedDate = formatChartDate(date);
    
    switch (serviceType) {
      case 'stytch':
        return {
          name: formattedDate,
          activeUsers: 2000 + Math.floor(Math.random() * 1000),
          newSignups: 80 + Math.floor(Math.random() * 50)
        };
      case 'onesignal':
        return {
          name: formattedDate,
          sent: 3800 + Math.floor(Math.random() * 500),
          delivered: 3700 + Math.floor(Math.random() * 400)
        };
      case 'aws':
        return {
          name: formattedDate,
          errors: 0.5 + Math.random() * 3,
          cpu: 40 + Math.floor(Math.random() * 40)
        };
      case 'sendbird':
        return {
          name: formattedDate,
          channels: 900 + Math.floor(Math.random() * 400),
          messages: 28000 + Math.floor(Math.random() * 7000)
        };
      case 'twilio':
        return {
          name: formattedDate,
          smsSent: 1500 + Math.floor(Math.random() * 500),
          deliveryRate: 82 + Math.floor(Math.random() * 15)
        };
      case 'mixpanel':
        // For Mixpanel, conversion funnel data
        return {
          name: formattedDate,
          retention: 75 + Math.floor(Math.random() * 10)
        };
      default:
        return {
          name: formattedDate,
          value: 100 + Math.floor(Math.random() * 100)
        };
    }
  });
  
  return data;
};

// Generate mock funnel data for Mixpanel
export const generateMockFunnelData = (): any[] => {
  return [
    { name: 'View Product', value: 100 },
    { name: 'Add to Cart', value: 42 },
    { name: 'Checkout', value: 22 },
    { name: 'Purchase', value: 12 }
  ];
};

// Generate mock distribution data
export const generateMockDistributionData = (serviceType: string): any[] => {
  switch (serviceType) {
    case 'stytch':
      return [
        { name: 'Email', value: 65 },
        { name: 'Social', value: 25 },
        { name: 'SSO', value: 10 }
      ];
    case 'onesignal':
      return [
        { name: 'iOS', value: 45 },
        { name: 'Android', value: 40 },
        { name: 'Web', value: 15 }
      ];
    case 'aws':
      return [
        { name: 'Lambda', value: 40 },
        { name: 'EC2', value: 30 },
        { name: 'S3', value: 15 },
        { name: 'RDS', value: 15 }
      ];
    case 'sendbird':
      return [
        { name: 'Text', value: 70 },
        { name: 'Media', value: 20 },
        { name: 'Files', value: 10 }
      ];
    case 'twilio':
      return [
        { name: 'SMS', value: 60 },
        { name: 'Voice', value: 30 },
        { name: 'Video', value: 10 }
      ];
    case 'mixpanel':
      return [
        { name: 'Mobile', value: 55 },
        { name: 'Desktop', value: 35 },
        { name: 'Tablet', value: 10 }
      ];
    default:
      return [
        { name: 'A', value: 60 },
        { name: 'B', value: 30 },
        { name: 'C', value: 10 }
      ];
  }
};

// Generate mock time distribution data
export const generateMockTimeData = (): any[] => {
  return [
    { name: '00:00', value: Math.floor(Math.random() * 100) },
    { name: '04:00', value: Math.floor(Math.random() * 100) },
    { name: '08:00', value: 50 + Math.floor(Math.random() * 100) },
    { name: '12:00', value: 80 + Math.floor(Math.random() * 100) },
    { name: '16:00', value: 100 + Math.floor(Math.random() * 100) },
    { name: '20:00', value: 60 + Math.floor(Math.random() * 100) }
  ];
};

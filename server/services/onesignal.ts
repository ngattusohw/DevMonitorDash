import { ServiceProvider } from './index';

// Simulated metrics for OneSignal notification service
export const getMetrics: ServiceProvider['getMetrics'] = async (apiKey, apiSecret, options = {}) => {
  // In a real implementation, this would make API calls to OneSignal
  // using the provided credentials

  const { range = '7d' } = options;
  
  // Generate daily data points based on the range
  let days = 7;
  if (range === '24h') days = 1;
  if (range === '30d') days = 30;
  
  // Notification metrics
  return {
    notificationsSent: generateDataPoints(days, 5000, 15000),
    deliveryRate: generateDataPoints(days, 0.95, 0.99, true),
    openRate: generateDataPoints(days, 0.1, 0.3, true),
    clickThroughRate: generateDataPoints(days, 0.05, 0.15, true),
    optOutRate: generateDataPoints(days, 0.001, 0.005, true),
    platformDelivery: {
      ios: generateDataPoints(days, 0.96, 0.99, true),
      android: generateDataPoints(days, 0.94, 0.98, true),
      web: generateDataPoints(days, 0.9, 0.96, true)
    }
  };
};

export const getServiceStatus: ServiceProvider['getServiceStatus'] = async (apiKey, apiSecret) => {
  // In a real implementation, this would check the status of the OneSignal service
  return {
    status: 'healthy',
    healthScore: 98.2,
    trend: 'same',
    changePercent: 0.0
  };
};

// Helper function to generate mock time-series data
function generateDataPoints(days: number, min: number, max: number, isPercentage = false) {
  const now = new Date();
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    
    const value = min + Math.random() * (max - min);
    const formattedValue = isPercentage ? value : Math.round(value);
    
    data.push({
      timestamp: date.toISOString(),
      value: formattedValue,
      label: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return data;
}

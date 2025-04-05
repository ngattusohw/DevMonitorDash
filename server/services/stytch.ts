import { ServiceProvider } from './index';

// Simulated metrics for Stytch authentication service
export const getMetrics: ServiceProvider['getMetrics'] = async (apiKey, apiSecret, options = {}) => {
  // In a real implementation, this would make API calls to Stytch
  // using the provided credentials

  const { range = '7d' } = options;
  
  // Generate daily data points based on the range
  let days = 7;
  if (range === '24h') days = 1;
  if (range === '30d') days = 30;
  
  // Authentication metrics
  return {
    dailyActiveUsers: generateDataPoints(days, 1200, 1800),
    newSignups: generateDataPoints(days, 200, 400),
    loginSuccessRate: generateDataPoints(days, 0.95, 0.99, true),
    passwordResets: generateDataPoints(days, 30, 80),
    mfaUsage: generateDataPoints(days, 0.4, 0.6, true),
    sessionDuration: generateDataPoints(days, 45, 90) // minutes
  };
};

export const getServiceStatus: ServiceProvider['getServiceStatus'] = async (apiKey, apiSecret) => {
  // In a real implementation, this would check the status of the Stytch service
  return {
    status: 'healthy',
    healthScore: 99.8,
    trend: 'up',
    changePercent: 0.2
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

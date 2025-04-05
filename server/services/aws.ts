import { ServiceProvider } from './index';

// Simulated metrics for AWS infrastructure services
export const getMetrics: ServiceProvider['getMetrics'] = async (apiKey, apiSecret, options = {}) => {
  // In a real implementation, this would make API calls to AWS CloudWatch
  // using the provided credentials
  
  const { range = '7d', services = ['ec2', 'lambda', 's3', 'rds', 'apigateway'] } = options;
  
  // Generate daily data points based on the range
  let days = 7;
  if (range === '24h') days = 1;
  if (range === '30d') days = 30;
  
  const metrics: Record<string, any> = {};
  
  // EC2 metrics
  if (services.includes('ec2')) {
    metrics.ec2 = {
      cpuUtilization: generateDataPoints(days, 20, 80),
      memoryUtilization: generateDataPoints(days, 30, 75),
      networkIn: generateDataPoints(days, 100, 500),  // MB/s
      networkOut: generateDataPoints(days, 50, 250),  // MB/s
      instanceCount: generateDataPoints(days, 5, 15, false, true),  // integer values
      statusCheckFailed: generateDataPoints(days, 0, 2, false, true)  // integer values
    };
  }
  
  // Lambda metrics
  if (services.includes('lambda')) {
    metrics.lambda = {
      invocations: generateDataPoints(days, 1000, 5000, false, true),
      errors: generateDataPoints(days, 5, 50, false, true),
      throttles: generateDataPoints(days, 0, 10, false, true),
      duration: generateDataPoints(days, 100, 300),  // ms
      concurrentExecutions: generateDataPoints(days, 10, 100, false, true)
    };
  }
  
  // S3 metrics
  if (services.includes('s3')) {
    metrics.s3 = {
      bucketSizeBytes: generateDataPoints(days, 1, 10),  // GB
      numberOfObjects: generateDataPoints(days, 1000, 10000, false, true),
      allRequests: generateDataPoints(days, 5000, 20000, false, true),
      getRequests: generateDataPoints(days, 1000, 10000, false, true),
      putRequests: generateDataPoints(days, 500, 2000, false, true)
    };
  }
  
  // RDS metrics
  if (services.includes('rds')) {
    metrics.rds = {
      cpuUtilization: generateDataPoints(days, 30, 90),
      databaseConnections: generateDataPoints(days, 10, 100, false, true),
      freeStorageSpace: generateDataPoints(days, 10, 50),  // GB
      readIOPS: generateDataPoints(days, 100, 1000, false, true),
      writeIOPS: generateDataPoints(days, 50, 500, false, true)
    };
  }
  
  // API Gateway metrics
  if (services.includes('apigateway')) {
    metrics.apigateway = {
      count: generateDataPoints(days, 5000, 15000, false, true),
      latency: generateDataPoints(days, 50, 200),  // ms
      errors4xx: generateDataPoints(days, 10, 100, false, true),
      errors5xx: generateDataPoints(days, 5, 50, false, true),
      cacheHitCount: generateDataPoints(days, 100, 1000, false, true),
      cacheMissCount: generateDataPoints(days, 50, 200, false, true)
    };
  }
  
  return metrics;
};

export const getServiceStatus: ServiceProvider['getServiceStatus'] = async (apiKey, apiSecret) => {
  // In a real implementation, this would check the status of the AWS services
  return {
    status: 'warning',
    healthScore: 96.3,
    trend: 'down',
    changePercent: 1.5
  };
};

// Helper function to generate mock time-series data
function generateDataPoints(
  days: number, 
  min: number, 
  max: number, 
  isPercentage = false,
  isInteger = false
) {
  const now = new Date();
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    
    const value = min + Math.random() * (max - min);
    let formattedValue: number;
    
    if (isInteger) {
      formattedValue = Math.floor(value);
    } else if (isPercentage) {
      formattedValue = parseFloat(value.toFixed(2));
    } else {
      formattedValue = parseFloat(value.toFixed(1));
    }
    
    data.push({
      timestamp: date.toISOString(),
      value: formattedValue,
      label: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return data;
}

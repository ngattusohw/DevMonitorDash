import * as stytch from './stytch';
import * as onesignal from './onesignal';
import * as aws from './aws';
import * as mixpanel from './mixpanel';
import { ServiceType } from '@shared/schema';

// Unified interface for service metrics
export interface ServiceProvider {
  getMetrics: (apiKey: string, apiSecret?: string, options?: any) => Promise<any>;
  getServiceStatus: (apiKey: string, apiSecret?: string) => Promise<any>;
}

// Service provider registry
export const serviceProviders: Record<ServiceType, ServiceProvider> = {
  stytch,
  onesignal,
  aws,
  mixpanel,
  sendbird: {
    getMetrics: async () => ({ /* mock implementation */ }),
    getServiceStatus: async () => ({ /* mock implementation */ })
  },
  twilio: {
    getMetrics: async () => ({ /* mock implementation */ }),
    getServiceStatus: async () => ({ /* mock implementation */ })
  }
};

export async function fetchServiceMetrics(
  serviceType: ServiceType, 
  apiKey: string, 
  apiSecret?: string,
  options?: any
) {
  const provider = serviceProviders[serviceType];
  if (!provider) {
    throw new Error(`Unsupported service type: ${serviceType}`);
  }
  
  return provider.getMetrics(apiKey, apiSecret, options);
}

export async function fetchServiceStatus(
  serviceType: ServiceType, 
  apiKey: string, 
  apiSecret?: string
) {
  const provider = serviceProviders[serviceType];
  if (!provider) {
    throw new Error(`Unsupported service type: ${serviceType}`);
  }
  
  return provider.getServiceStatus(apiKey, apiSecret);
}

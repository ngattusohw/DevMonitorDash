import { Request, Response } from 'express';
import { storage } from '../storage';
import { ServiceType, insertServiceSchema } from '@shared/schema';
import { fetchServiceMetrics, fetchServiceStatus } from '../services';
import { DateRangeType } from '../../client/src/types';

export const servicesController = {
  // Get all services
  getAllServices: async (_req: Request, res: Response) => {
    try {
      const services = await storage.getAllServices();
      
      // Mask sensitive information
      const maskedServices = services.map(service => ({
        ...service,
        apiKey: service.apiKey ? maskCredential(service.apiKey) : null,
        apiSecret: service.apiSecret ? maskCredential(service.apiSecret) : null,
        otherCredentials: service.otherCredentials ? '(encrypted)' : null
      }));
      
      res.json(maskedServices);
    } catch (error) {
      console.error('Error in getAllServices:', error);
      res.status(500).json({ message: 'Failed to fetch services' });
    }
  },
  
  // Get a specific service by ID
  getServiceById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const service = await storage.getService(parseInt(id));
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      // Mask sensitive information
      const maskedService = {
        ...service,
        apiKey: service.apiKey ? maskCredential(service.apiKey) : null,
        apiSecret: service.apiSecret ? maskCredential(service.apiSecret) : null,
        otherCredentials: service.otherCredentials ? '(encrypted)' : null
      };
      
      res.json(maskedService);
    } catch (error) {
      console.error('Error in getServiceById:', error);
      res.status(500).json({ message: 'Failed to fetch service' });
    }
  },
  
  // Get services by type
  getServicesByType: async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      
      if (!Object.values(ServiceType).includes(type as ServiceType)) {
        return res.status(400).json({ message: 'Invalid service type' });
      }
      
      const services = await storage.getServicesByType(type as ServiceType);
      
      // Mask sensitive information
      const maskedServices = services.map(service => ({
        ...service,
        apiKey: service.apiKey ? maskCredential(service.apiKey) : null,
        apiSecret: service.apiSecret ? maskCredential(service.apiSecret) : null,
        otherCredentials: service.otherCredentials ? '(encrypted)' : null
      }));
      
      res.json(maskedServices);
    } catch (error) {
      console.error('Error in getServicesByType:', error);
      res.status(500).json({ message: 'Failed to fetch services by type' });
    }
  },
  
  // Create a new service
  createService: async (req: Request, res: Response) => {
    try {
      const validationResult = insertServiceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid service data', 
          errors: validationResult.error.errors 
        });
      }
      
      const newService = await storage.createService(validationResult.data);
      
      // Mask sensitive information in the response
      const maskedService = {
        ...newService,
        apiKey: newService.apiKey ? maskCredential(newService.apiKey) : null,
        apiSecret: newService.apiSecret ? maskCredential(newService.apiSecret) : null,
        otherCredentials: newService.otherCredentials ? '(encrypted)' : null
      };
      
      res.status(201).json(maskedService);
    } catch (error) {
      console.error('Error in createService:', error);
      res.status(500).json({ message: 'Failed to create service' });
    }
  },
  
  // Update an existing service
  updateService: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const service = await storage.getService(parseInt(id));
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      const updatedService = await storage.updateService(parseInt(id), req.body);
      
      // Mask sensitive information in the response
      const maskedService = {
        ...updatedService,
        apiKey: updatedService.apiKey ? maskCredential(updatedService.apiKey) : null,
        apiSecret: updatedService.apiSecret ? maskCredential(updatedService.apiSecret) : null,
        otherCredentials: updatedService.otherCredentials ? '(encrypted)' : null
      };
      
      res.json(maskedService);
    } catch (error) {
      console.error('Error in updateService:', error);
      res.status(500).json({ message: 'Failed to update service' });
    }
  },
  
  // Delete a service
  deleteService: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const service = await storage.getService(parseInt(id));
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      const success = await storage.deleteService(parseInt(id));
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: 'Failed to delete service' });
      }
    } catch (error) {
      console.error('Error in deleteService:', error);
      res.status(500).json({ message: 'Failed to delete service' });
    }
  },
  
  // Get metrics for a specific service
  getServiceMetrics: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const range = req.query.range as DateRangeType || '7d';
      
      const service = await storage.getService(parseInt(id));
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      try {
        const metrics = await fetchServiceMetrics(
          service.type,
          service.apiKey || '',
          service.apiSecret || '',
          { range }
        );
        
        // Format metrics based on service type
        let formattedMetrics;
        
        switch (service.type) {
          case 'stytch':
            formattedMetrics = {
              dailyActiveUsers: metrics.dailyActiveUsers,
              newSignups: metrics.newSignups,
              loginSuccessRate: metrics.loginSuccessRate,
              mfaUsage: metrics.mfaUsage
            };
            break;
            
          case 'onesignal':
            formattedMetrics = {
              notificationsSent: metrics.notificationsSent,
              deliveryRate: metrics.deliveryRate,
              openRate: metrics.openRate,
              platformDelivery: metrics.platformDelivery
            };
            break;
            
          case 'aws':
            formattedMetrics = metrics; // AWS metrics are already well-structured
            break;
            
          case 'mixpanel':
            formattedMetrics = {
              activeUsers: metrics.activeUsers,
              retention: metrics.retention,
              events: metrics.events,
              sessions: metrics.sessions
            };
            break;
            
          default:
            formattedMetrics = metrics;
        }
        
        res.json({
          serviceId: service.id,
          serviceName: service.name,
          serviceType: service.type,
          metrics: formattedMetrics
        });
      } catch (error) {
        console.error(`Error fetching metrics for service ${id}:`, error);
        res.status(500).json({ message: 'Failed to fetch service metrics' });
      }
    } catch (error) {
      console.error('Error in getServiceMetrics:', error);
      res.status(500).json({ message: 'Failed to process service metrics request' });
    }
  }
};

// Helper function to mask credentials
function maskCredential(credential: string): string {
  if (!credential) return '';
  
  const visibleChars = 4;
  if (credential.length <= visibleChars) {
    return '*'.repeat(credential.length);
  }
  
  return '*'.repeat(credential.length - visibleChars) + credential.slice(-visibleChars);
}

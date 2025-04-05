import { Request, Response } from 'express';
import { storage } from '../storage';
import { AlertStatus, insertAlertSchema, insertThresholdAlertSchema } from '@shared/schema';

export const alertingController = {
  // Get all alerts with optional filtering
  getAllAlerts: async (req: Request, res: Response) => {
    try {
      const { projectId, serviceId, serviceType, severity, status } = req.query;
      
      // Build filter object from query parameters
      const filters: Record<string, any> = {};
      
      if (projectId) filters.projectId = parseInt(projectId as string);
      if (serviceId) filters.serviceId = parseInt(serviceId as string);
      if (severity) filters.severity = severity;
      if (status) filters.status = status;
      
      // If serviceType is provided, we need to join with services table
      let alerts = await storage.getAllAlerts();
      
      // Apply filters
      alerts = alerts.filter(alert => {
        let match = true;
        
        for (const [key, value] of Object.entries(filters)) {
          if (alert[key] !== value) {
            match = false;
            break;
          }
        }
        
        return match;
      });
      
      // If serviceType is provided, further filter alerts
      if (serviceType) {
        const services = await storage.getAllServices();
        const serviceIdsOfType = services
          .filter(s => s.type === serviceType)
          .map(s => s.id);
          
        alerts = alerts.filter(alert => serviceIdsOfType.includes(alert.serviceId));
      }
      
      // Enhance alerts with service and project information
      const enhancedAlerts = await Promise.all(
        alerts.map(async (alert) => {
          const service = await storage.getService(alert.serviceId);
          const project = await storage.getProject(alert.projectId);
          
          return {
            ...alert,
            serviceName: service ? service.name : 'Unknown Service',
            serviceType: service ? service.type : 'unknown',
            projectName: project ? project.name : 'Unknown Project'
          };
        })
      );
      
      res.json(enhancedAlerts);
    } catch (error) {
      console.error('Error in getAllAlerts:', error);
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  },
  
  // Get a specific alert by ID
  getAlertById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const alert = await storage.getAlert(parseInt(id));
      
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      // Enhance alert with service and project information
      const service = await storage.getService(alert.serviceId);
      const project = await storage.getProject(alert.projectId);
      
      const enhancedAlert = {
        ...alert,
        serviceName: service ? service.name : 'Unknown Service',
        serviceType: service ? service.type : 'unknown',
        projectName: project ? project.name : 'Unknown Project'
      };
      
      res.json(enhancedAlert);
    } catch (error) {
      console.error('Error in getAlertById:', error);
      res.status(500).json({ message: 'Failed to fetch alert' });
    }
  },
  
  // Update an alert's status
  updateAlertStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!Object.values(AlertStatus.Values).includes(status)) {
        return res.status(400).json({ message: 'Invalid alert status' });
      }
      
      const alert = await storage.getAlert(parseInt(id));
      
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      const updatedAlert = await storage.updateAlert(parseInt(id), { status });
      res.json(updatedAlert);
    } catch (error) {
      console.error('Error in updateAlertStatus:', error);
      res.status(500).json({ message: 'Failed to update alert status' });
    }
  },
  
  // Get all threshold alerts
  getThresholdAlerts: async (_req: Request, res: Response) => {
    try {
      const thresholdAlerts = await storage.getAllThresholdAlerts();
      res.json(thresholdAlerts);
    } catch (error) {
      console.error('Error in getThresholdAlerts:', error);
      res.status(500).json({ message: 'Failed to fetch threshold alerts' });
    }
  },
  
  // Create a new threshold alert
  createThresholdAlert: async (req: Request, res: Response) => {
    try {
      const validationResult = insertThresholdAlertSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid threshold alert data', 
          errors: validationResult.error.errors 
        });
      }
      
      // Check if service exists
      const service = await storage.getService(validationResult.data.serviceId);
      
      if (!service) {
        return res.status(400).json({ message: 'Service not found' });
      }
      
      const newThresholdAlert = await storage.createThresholdAlert(validationResult.data);
      res.status(201).json(newThresholdAlert);
    } catch (error) {
      console.error('Error in createThresholdAlert:', error);
      res.status(500).json({ message: 'Failed to create threshold alert' });
    }
  },
  
  // Update an existing threshold alert
  updateThresholdAlert: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const thresholdAlert = await storage.getThresholdAlert(parseInt(id));
      
      if (!thresholdAlert) {
        return res.status(404).json({ message: 'Threshold alert not found' });
      }
      
      const updatedThresholdAlert = await storage.updateThresholdAlert(parseInt(id), req.body);
      res.json(updatedThresholdAlert);
    } catch (error) {
      console.error('Error in updateThresholdAlert:', error);
      res.status(500).json({ message: 'Failed to update threshold alert' });
    }
  },
  
  // Delete a threshold alert
  deleteThresholdAlert: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const thresholdAlert = await storage.getThresholdAlert(parseInt(id));
      
      if (!thresholdAlert) {
        return res.status(404).json({ message: 'Threshold alert not found' });
      }
      
      const success = await storage.deleteThresholdAlert(parseInt(id));
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: 'Failed to delete threshold alert' });
      }
    } catch (error) {
      console.error('Error in deleteThresholdAlert:', error);
      res.status(500).json({ message: 'Failed to delete threshold alert' });
    }
  },
  
  // For a full implementation, we would also include:
  // - An endpoint to test threshold alert configurations
  // - Webhook endpoints for integrating with external services
  // - Alert notification preference management
};

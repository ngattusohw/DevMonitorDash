import { Request, Response } from 'express';
import { storage } from '../storage';
import { fetchServiceMetrics, fetchServiceStatus } from '../services';
import { ServiceStatusSummary, AlertTableItem, ServiceType } from '@shared/schema';
import { DateRangeType } from '../../client/src/types';

export const dashboardController = {
  // Get overview metrics for the dashboard
  getOverviewStats: async (req: Request, res: Response) => {
    try {
      const range = req.query.range as DateRangeType || '7d';
      
      // Fetch all projects
      const projects = await storage.getAllProjects();
      const services = await storage.getAllServices();
      const alerts = await storage.getAllAlerts();
      
      // Get service status summaries for all service types
      const serviceStatusPromises = services.map(async (service) => {
        try {
          const status = await fetchServiceStatus(
            service.type as ServiceType,
            service.apiKey || '',
            service.apiSecret || ''
          );
          
          return {
            serviceType: service.type,
            healthScore: status.healthScore,
            trend: status.trend,
            changePercent: status.changePercent
          } as ServiceStatusSummary;
        } catch (error) {
          console.error(`Error fetching status for service ${service.id}:`, error);
          return {
            serviceType: service.type,
            healthScore: 0,
            trend: 'down',
            changePercent: 0
          } as ServiceStatusSummary;
        }
      });
      
      const serviceStatuses = await Promise.all(serviceStatusPromises);
      
      // Process projects with their services
      const projectsWithServices = await Promise.all(
        projects.map(async (project) => {
          const projectServices = await storage.getServicesByProjectId(project.id);
          const alertCount = alerts.filter(a => a.projectId === project.id && a.status === 'active').length;
          
          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            healthScore: project.healthScore || 0,
            status: project.status,
            services: projectServices.map(s => ({
              id: s.id,
              name: s.name,
              type: s.type as ServiceType
            })),
            alertCount
          };
        })
      );
      
      // Format alerts for table display
      const alertTableItems = alerts
        .filter(a => a.status === 'active')
        .slice(0, 10)  // Get top 10 most recent alerts
        .map(alert => {
          const service = services.find(s => s.id === alert.serviceId);
          const project = projects.find(p => p.id === alert.projectId);
          
          return {
            id: alert.id,
            severity: alert.severity,
            serviceName: service ? service.name : 'Unknown Service',
            serviceType: service ? service.type as ServiceType : 'aws' as ServiceType,
            projectName: project ? project.name : 'Unknown Project',
            description: alert.message,
            timestamp: alert.timestamp.toISOString()
          } as AlertTableItem;
        });
      
      // Get authentication metrics (combining Stytch metrics)
      const authServices = services.filter(s => s.type === 'stytch');
      const authMetrics = await Promise.all(
        authServices.map(async (service) => {
          try {
            const metrics = await fetchServiceMetrics(
              'stytch',
              service.apiKey || '',
              service.apiSecret || '',
              { range }
            );
            
            return [
              {
                name: 'Logins',
                data: metrics.dailyActiveUsers
              },
              {
                name: 'Signups',
                data: metrics.newSignups
              }
            ];
          } catch (error) {
            console.error(`Error fetching metrics for auth service ${service.id}:`, error);
            return [];
          }
        })
      );
      
      // Get API request metrics (from AWS API Gateway if available)
      const awsServices = services.filter(s => s.type === 'aws');
      const apiRequestMetrics = await Promise.all(
        awsServices.map(async (service) => {
          try {
            const metrics = await fetchServiceMetrics(
              'aws',
              service.apiKey || '',
              service.apiSecret || '',
              { range, services: ['apigateway'] }
            );
            
            // Create metrics per project using API Gateway data
            return projectsWithServices.map((project, index) => ({
              name: project.name,
              data: metrics.apigateway?.count || []
            }));
          } catch (error) {
            console.error(`Error fetching metrics for AWS service ${service.id}:`, error);
            return [];
          }
        })
      );
      
      // Flatten and aggregate metrics arrays
      const flattenedAuthMetrics = authMetrics.flat();
      const flattenedApiMetrics = apiRequestMetrics.flat().filter(Boolean);
      
      res.json({
        services: serviceStatuses,
        projects: projectsWithServices,
        alerts: alertTableItems,
        metrics: {
          authentication: flattenedAuthMetrics.length > 0 ? flattenedAuthMetrics : [
            {
              name: 'Logins',
              data: generateMockDataPoints(7, 1000, 1800)
            },
            {
              name: 'Signups',
              data: generateMockDataPoints(7, 200, 500)
            }
          ],
          apiRequests: flattenedApiMetrics.length > 0 ? flattenedApiMetrics : [
            {
              name: 'Project 1',
              data: generateMockDataPoints(7, 8000, 10000)
            },
            {
              name: 'Project 2',
              data: generateMockDataPoints(7, 5000, 7000)
            },
            {
              name: 'Project 3',
              data: generateMockDataPoints(7, 3000, 4000)
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error in getOverviewStats:', error);
      res.status(500).json({ message: 'Failed to fetch overview statistics' });
    }
  },
  
  // Custom views management
  getCustomViews: async (req: Request, res: Response) => {
    try {
      const userId = 1; // In a real app, this would come from the authenticated user
      const views = await storage.getCustomViewsByUserId(userId);
      res.json(views);
    } catch (error) {
      console.error('Error in getCustomViews:', error);
      res.status(500).json({ message: 'Failed to fetch custom views' });
    }
  },
  
  getCustomViewById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const view = await storage.getCustomViewById(parseInt(id));
      
      if (!view) {
        return res.status(404).json({ message: 'Custom view not found' });
      }
      
      res.json(view);
    } catch (error) {
      console.error('Error in getCustomViewById:', error);
      res.status(500).json({ message: 'Failed to fetch custom view' });
    }
  },
  
  createCustomView: async (req: Request, res: Response) => {
    try {
      const userId = 1; // In a real app, this would come from the authenticated user
      const { name, layout } = req.body;
      
      const newView = await storage.createCustomView({
        name,
        layout,
        userId
      });
      
      res.status(201).json(newView);
    } catch (error) {
      console.error('Error in createCustomView:', error);
      res.status(500).json({ message: 'Failed to create custom view' });
    }
  },
  
  updateCustomView: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, layout } = req.body;
      
      const updatedView = await storage.updateCustomView(parseInt(id), {
        name,
        layout
      });
      
      if (!updatedView) {
        return res.status(404).json({ message: 'Custom view not found' });
      }
      
      res.json(updatedView);
    } catch (error) {
      console.error('Error in updateCustomView:', error);
      res.status(500).json({ message: 'Failed to update custom view' });
    }
  },
  
  deleteCustomView: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCustomView(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: 'Custom view not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteCustomView:', error);
      res.status(500).json({ message: 'Failed to delete custom view' });
    }
  }
};

// Helper function to generate mock data points (only used as fallback if real service data is unavailable)
function generateMockDataPoints(days: number, min: number, max: number) {
  const now = new Date();
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    
    const value = Math.floor(min + Math.random() * (max - min));
    
    data.push({
      timestamp: date.toISOString(),
      value,
      label: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return data;
}

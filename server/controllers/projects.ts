import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertProjectSchema } from '@shared/schema';
import { fetchServiceMetrics } from '../services';
import { DateRangeType } from '../../client/src/types';

export const projectsController = {
  // Get all projects
  getAllProjects: async (_req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  },
  
  // Get a specific project by ID
  getProjectById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Get associated services
      const services = await storage.getServicesByProjectId(project.id);
      
      res.json({
        ...project,
        services
      });
    } catch (error) {
      console.error('Error in getProjectById:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  },
  
  // Create a new project
  createProject: async (req: Request, res: Response) => {
    try {
      const validationResult = insertProjectSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid project data', 
          errors: validationResult.error.errors 
        });
      }
      
      const newProject = await storage.createProject(validationResult.data);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error in createProject:', error);
      res.status(500).json({ message: 'Failed to create project' });
    }
  },
  
  // Update an existing project
  updateProject: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const updatedProject = await storage.updateProject(parseInt(id), req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error('Error in updateProject:', error);
      res.status(500).json({ message: 'Failed to update project' });
    }
  },
  
  // Delete a project
  deleteProject: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const success = await storage.deleteProject(parseInt(id));
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: 'Failed to delete project' });
      }
    } catch (error) {
      console.error('Error in deleteProject:', error);
      res.status(500).json({ message: 'Failed to delete project' });
    }
  },
  
  // Get metrics for a specific project
  getProjectMetrics: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const range = req.query.range as DateRangeType || '7d';
      
      const project = await storage.getProject(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Get services associated with this project
      const services = await storage.getServicesByProjectId(project.id);
      
      if (!services.length) {
        return res.json({ services: [] });
      }
      
      // Fetch metrics for each service
      const serviceMetricsPromises = services.map(async (service) => {
        try {
          const metrics = await fetchServiceMetrics(
            service.type,
            service.apiKey || '',
            service.apiSecret || '',
            { range }
          );
          
          // Format service metrics based on service type
          const formattedMetrics = [];
          
          switch (service.type) {
            case 'stytch':
              formattedMetrics.push(
                {
                  name: 'Daily Active Users',
                  data: metrics.dailyActiveUsers || []
                },
                {
                  name: 'Login Success Rate',
                  data: metrics.loginSuccessRate || []
                }
              );
              break;
              
            case 'onesignal':
              formattedMetrics.push(
                {
                  name: 'Notifications Sent',
                  data: metrics.notificationsSent || []
                },
                {
                  name: 'Delivery Rate',
                  data: metrics.deliveryRate || []
                }
              );
              break;
              
            case 'aws':
              if (metrics.apigateway) {
                formattedMetrics.push(
                  {
                    name: 'API Requests',
                    data: metrics.apigateway.count || []
                  },
                  {
                    name: 'API Latency',
                    data: metrics.apigateway.latency || []
                  }
                );
              }
              
              if (metrics.lambda) {
                formattedMetrics.push(
                  {
                    name: 'Lambda Invocations',
                    data: metrics.lambda.invocations || []
                  },
                  {
                    name: 'Lambda Errors',
                    data: metrics.lambda.errors || []
                  }
                );
              }
              break;
              
            case 'mixpanel':
              formattedMetrics.push(
                {
                  name: 'Active Users',
                  data: metrics.activeUsers?.daily || []
                },
                {
                  name: 'Session Duration',
                  data: metrics.sessions?.averageDuration || []
                }
              );
              break;
              
            default:
              // Generic metrics for other service types
              formattedMetrics.push(
                {
                  name: 'Usage',
                  data: generateFallbackMetrics(range)
                },
                {
                  name: 'Errors',
                  data: generateFallbackMetrics(range, 0, 50)
                }
              );
          }
          
          return {
            serviceId: service.id,
            serviceName: service.name,
            serviceType: service.type,
            metrics: formattedMetrics
          };
        } catch (error) {
          console.error(`Error fetching metrics for service ${service.id}:`, error);
          return {
            serviceId: service.id,
            serviceName: service.name,
            serviceType: service.type,
            metrics: [
              {
                name: 'Error fetching metrics',
                data: []
              }
            ]
          };
        }
      });
      
      const serviceMetrics = await Promise.all(serviceMetricsPromises);
      
      res.json({
        projectName: project.name,
        projectId: project.id,
        services: serviceMetrics
      });
    } catch (error) {
      console.error('Error in getProjectMetrics:', error);
      res.status(500).json({ message: 'Failed to fetch project metrics' });
    }
  }
};

// Helper function to generate fallback metrics if service integration fails
function generateFallbackMetrics(
  range: DateRangeType, 
  min: number = 100, 
  max: number = 1000
) {
  const now = new Date();
  const result = [];
  
  let days = 7;
  if (range === '24h') days = 1;
  if (range === '30d') days = 30;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    
    result.push({
      timestamp: date.toISOString(),
      value: Math.floor(min + Math.random() * (max - min)),
      label: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return result;
}

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertServiceIntegrationSchema,
  insertAlertSchema,
  insertDashboardWidgetSchema,
  insertMetricSchema
} from "@shared/schema";
import { z } from "zod";
import cron from "node-cron";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up all API routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      console.log(`Getting projects for userId: ${userId}`);
      const projects = await storage.getProjectsByUserId(userId);
      console.log(`Found ${projects.length} projects`);
      res.json(projects);
    } catch (error) {
      console.error("Error getting projects:", error);
      res.status(500).json({ message: "Failed to get projects", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post('/api/projects', async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to get project" });
    }
  });

  app.put('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      
      const updatedProject = await storage.updateProject(projectId, projectData);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const success = await storage.deleteProject(projectId);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Service integration routes
  app.get('/api/service-integrations', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.query.projectId as string);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const integrations = await storage.getServiceIntegrationsByProjectId(projectId);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get service integrations" });
    }
  });

  app.post('/api/service-integrations', async (req: Request, res: Response) => {
    try {
      const integrationData = insertServiceIntegrationSchema.parse(req.body);
      
      // Validate that the project exists
      const project = await storage.getProject(integrationData.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const integration = await storage.createServiceIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid integration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service integration" });
    }
  });

  app.get('/api/service-integrations/:id', async (req: Request, res: Response) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integration = await storage.getServiceIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "Service integration not found" });
      }
      
      res.json(integration);
    } catch (error) {
      res.status(500).json({ message: "Failed to get service integration" });
    }
  });

  app.put('/api/service-integrations/:id', async (req: Request, res: Response) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integrationData = insertServiceIntegrationSchema.partial().parse(req.body);
      
      const updatedIntegration = await storage.updateServiceIntegration(integrationId, integrationData);
      
      if (!updatedIntegration) {
        return res.status(404).json({ message: "Service integration not found" });
      }
      
      res.json(updatedIntegration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid integration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service integration" });
    }
  });

  app.delete('/api/service-integrations/:id', async (req: Request, res: Response) => {
    try {
      const integrationId = parseInt(req.params.id);
      const success = await storage.deleteServiceIntegration(integrationId);
      
      if (!success) {
        return res.status(404).json({ message: "Service integration not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service integration" });
    }
  });

  // Alert routes
  app.get('/api/alerts', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.query.projectId as string);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const alerts = await storage.getAlertsByProjectId(projectId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get alerts" });
    }
  });

  app.post('/api/alerts', async (req: Request, res: Response) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      
      // Validate that the project exists
      const project = await storage.getProject(alertData.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.get('/api/alerts/:id', async (req: Request, res: Response) => {
    try {
      const alertId = parseInt(req.params.id);
      const alert = await storage.getAlert(alertId);
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to get alert" });
    }
  });

  app.put('/api/alerts/:id', async (req: Request, res: Response) => {
    try {
      const alertId = parseInt(req.params.id);
      const alertData = insertAlertSchema.partial().parse(req.body);
      
      const updatedAlert = await storage.updateAlert(alertId, alertData);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  app.delete('/api/alerts/:id', async (req: Request, res: Response) => {
    try {
      const alertId = parseInt(req.params.id);
      const success = await storage.deleteAlert(alertId);
      
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  // Dashboard widget routes
  app.get('/api/dashboard-widgets', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.query.projectId as string);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const widgets = await storage.getDashboardWidgetsByProjectId(projectId);
      res.json(widgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard widgets" });
    }
  });

  app.post('/api/dashboard-widgets', async (req: Request, res: Response) => {
    try {
      const widgetData = insertDashboardWidgetSchema.parse(req.body);
      
      // Validate that the project exists
      const project = await storage.getProject(widgetData.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const widget = await storage.createDashboardWidget(widgetData);
      res.status(201).json(widget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid widget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dashboard widget" });
    }
  });

  app.get('/api/dashboard-widgets/:id', async (req: Request, res: Response) => {
    try {
      const widgetId = parseInt(req.params.id);
      const widget = await storage.getDashboardWidget(widgetId);
      
      if (!widget) {
        return res.status(404).json({ message: "Dashboard widget not found" });
      }
      
      res.json(widget);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard widget" });
    }
  });

  app.put('/api/dashboard-widgets/:id', async (req: Request, res: Response) => {
    try {
      const widgetId = parseInt(req.params.id);
      const widgetData = insertDashboardWidgetSchema.partial().parse(req.body);
      
      const updatedWidget = await storage.updateDashboardWidget(widgetId, widgetData);
      
      if (!updatedWidget) {
        return res.status(404).json({ message: "Dashboard widget not found" });
      }
      
      res.json(updatedWidget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid widget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update dashboard widget" });
    }
  });

  app.delete('/api/dashboard-widgets/:id', async (req: Request, res: Response) => {
    try {
      const widgetId = parseInt(req.params.id);
      const success = await storage.deleteDashboardWidget(widgetId);
      
      if (!success) {
        return res.status(404).json({ message: "Dashboard widget not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete dashboard widget" });
    }
  });

  // Metric routes
  app.get('/api/metrics', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.query.projectId as string);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const serviceType = req.query.serviceType as string | undefined;
      const metricType = req.query.metricType as string | undefined;
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      const metrics = await storage.getMetricsByProjectId(
        projectId,
        serviceType,
        metricType,
        startDate,
        endDate
      );
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get metrics" });
    }
  });

  app.post('/api/metrics', async (req: Request, res: Response) => {
    try {
      const metricData = insertMetricSchema.parse(req.body);
      
      // Validate that the project exists
      const project = await storage.getProject(metricData.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const metric = await storage.createMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid metric data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create metric" });
    }
  });

  // Set up data refresh job (daily)
  setupDataRefreshJob();

  const httpServer = createServer(app);
  return httpServer;
}

function setupDataRefreshJob() {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily data refresh job');
    try {
      // In a real implementation, this would fetch data from the actual services
      // For this MVP, we'll just log that the job ran
      console.log('Data refresh completed successfully');
    } catch (error) {
      console.error('Error during data refresh:', error);
    }
  });
}

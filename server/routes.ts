import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, ServiceType } from "./storage";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertServiceIntegrationSchema,
  insertAlertSchema,
  insertDashboardWidgetSchema,
  insertMetricSchema,
  ServiceIntegration
} from "@shared/schema";
import { z } from "zod";
import cron from "node-cron";
import express from "express";
import Stripe from "stripe";
import { stripeService } from "./services/stripe";

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
      try {
        const projects = await storage.getProjectsByUserId(userId);
        console.log(`Found ${projects.length} projects`);
        return res.json(projects);
      } catch (storageError) {
        console.error("Storage error getting projects:", storageError);
        // At this point, our storage.getProjectsByUserId method will have already
        // attempted to provide fallback data if the DB query failed
        return res.status(500).json({ 
          message: "Failed to get projects from storage", 
          error: storageError instanceof Error ? storageError.message : String(storageError) 
        });
      }
    } catch (error) {
      console.error("Unexpected error getting projects:", error);
      return res.status(500).json({ 
        message: "Failed to process projects request", 
        error: error instanceof Error ? error.message : String(error) 
      });
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

  // Get service metrics for project dashboard
  app.get('/api/projects/:projectId/metrics/:serviceType', async (req: Request, res: Response) => {
    try {
      const { projectId, serviceType } = req.params;
      const { range = '7d' } = req.query;
      
      // Validate parameters
      if (!projectId || isNaN(parseInt(projectId))) {
        return res.status(400).json({ message: "Valid project ID is required" });
      }
      if (!serviceType) {
        return res.status(400).json({ message: "Service type is required" });
      }
      
      // Generate mock metrics data for the requested service
      const generateDataPoints = (min: number, max: number, days: number, variance = 0.1) => {
        const dataPoints = [];
        let baseValue = Math.floor(Math.random() * (max - min)) + min;
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          
          // Add some randomness but maintain a trend
          const randomFactor = 1 + (Math.random() * variance * 2 - variance);
          baseValue = Math.max(min, Math.min(max, baseValue * randomFactor));
          
          dataPoints.push({
            timestamp: date.toISOString(),
            value: Math.round(baseValue)
          });
        }
        
        return dataPoints;
      };
      
      // Define metrics based on service type
      const metrics: Record<string, any> = {};
      
      switch (serviceType) {
        case 'stytch':
          metrics.users = {
            dataPoints: generateDataPoints(500, 3000, 30)
          };
          metrics.auth_success = {
            dataPoints: generateDataPoints(75, 98, 30, 0.05)
          };
          break;
        case 'onesignal':
          metrics.notifications = {
            dataPoints: generateDataPoints(5000, 25000, 30)
          };
          metrics.delivery_rate = {
            dataPoints: generateDataPoints(85, 99, 30, 0.02)
          };
          break;
        case 'aws':
          metrics.api_requests = {
            dataPoints: generateDataPoints(50000, 500000, 30)
          };
          metrics.response_time = {
            dataPoints: generateDataPoints(50, 250, 30)
          };
          metrics.error_rate = {
            dataPoints: generateDataPoints(1, 10, 30, 0.2)
          };
          break;
        case 'mixpanel':
          metrics.daily_active = {
            dataPoints: generateDataPoints(3000, 20000, 30)
          };
          metrics.revenue = {
            dataPoints: generateDataPoints(500, 5000, 30)
          };
          break;
        default:
          metrics.sample_metric = {
            dataPoints: generateDataPoints(100, 1000, 30)
          };
      }
      
      return res.json({ 
        projectId: Number(projectId),
        serviceType,
        timeRange: range,
        metrics
      });
    } catch (error: any) {
      console.error(`Error fetching ${req.params.serviceType} metrics:`, error);
      return res.status(500).json({ message: error.message || 'Failed to fetch metrics' });
    }
  });

  // Set up data refresh job (daily)
  setupDataRefreshJob();

  // Subscription endpoints
  app.get('/api/subscription/status', async (req: Request, res: Response) => {
    const userId = 1; // In a real app, get from authenticated user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Count user's projects and integrations
    const projects = await storage.getProjectsByUserId(userId);
    const projectIds = projects.map(p => p.id);
    
    let integrations: ServiceIntegration[] = [];
    for (const projectId of projectIds) {
      const projectIntegrations = await storage.getServiceIntegrationsByProjectId(projectId);
      integrations = [...integrations, ...projectIntegrations];
    }
    
    const freeProjectLimit = 1;
    const freeIntegrationLimit = 3;
    
    res.json({
      status: user.subscriptionStatus,
      projects: {
        current: projects.length,
        limit: user.subscriptionStatus === 'premium' ? 'unlimited' : freeProjectLimit,
        remaining: user.subscriptionStatus === 'premium' ? 'unlimited' : Math.max(0, freeProjectLimit - projects.length)
      },
      integrations: {
        current: integrations.length,
        limit: user.subscriptionStatus === 'premium' ? 'unlimited' : freeIntegrationLimit,
        remaining: user.subscriptionStatus === 'premium' ? 'unlimited' : Math.max(0, freeIntegrationLimit - integrations.length)
      },
      tokens: user.availableTokens
    });
  });
  
  app.post('/api/subscription/checkout', async (req: Request, res: Response) => {
    const userId = 1; // In a real app, get from authenticated user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCheckoutSession(user, `${baseUrl}/settings`);
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/subscription/billing-portal', async (req: Request, res: Response) => {
    const userId = 1; // In a real app, get from authenticated user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: 'No subscription found' });
    }
    
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createBillingPortalSession(user, `${baseUrl}/settings`);
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe portal error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Stripe webhook endpoint - use raw body parser for Stripe
  const stripeWebhookMiddleware = express.raw({ type: 'application/json' });
  app.post('/api/webhook/stripe', stripeWebhookMiddleware, async (req: Request, res: Response) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('Stripe webhook secret not configured, skipping signature verification');
      // For development, we'll proceed without verification
    }
    
    const signature = req.headers['stripe-signature'] as string;
    
    let event: Stripe.Event;
    
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' as any });
      
      if (webhookSecret && signature) {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      } else {
        // For development without webhook secret
        event = req.body as Stripe.Event;
      }
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return res.status(400).json({ message: error.message });
    }
    
    try {
      const result = await stripeService.handleWebhookEvent(event);
      
      if (result) {
        const user = await storage.getUserByStripeCustomerId(result.customerId);
        
        if (user) {
          await storage.updateUserSubscription(user.id, {
            subscriptionStatus: result.status,
            stripeSubscriptionId: result.subscriptionId
          });
          
          // If upgrading to premium, give user some tokens
          if (result.status === 'premium') {
            await storage.updateUserTokens(user.id, 20);
          }
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook event processing failed:', error.message);
      return res.status(500).json({ message: error.message });
    }
  });

  // Middleware to enforce subscription limits
  app.use('/api/projects/create', async (req: Request, res: Response, next: NextFunction) => {
    const userId = 1; // In a real app, get from authenticated user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Only check limits for free users
    if (user.subscriptionStatus === 'free') {
      const projects = await storage.getProjectsByUserId(userId);
      
      if (projects.length >= 1) { // Free tier limit of 1 project
        return res.status(403).json({ 
          message: 'Free tier limit reached',
          error: 'You have reached the maximum number of projects allowed on the free tier. Please upgrade to premium for unlimited projects.'
        });
      }
    }
    
    next();
  });

  app.use('/api/service-integrations/create', async (req: Request, res: Response, next: NextFunction) => {
    const userId = 1; // In a real app, get from authenticated user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Only check limits for free users
    if (user.subscriptionStatus === 'free') {
      const projects = await storage.getProjectsByUserId(userId);
      const projectIds = projects.map(p => p.id);
      
      let integrationCount = 0;
      for (const projectId of projectIds) {
        const integrations = await storage.getServiceIntegrationsByProjectId(projectId);
        integrationCount += integrations.length;
      }
      
      if (integrationCount >= 3) { // Free tier limit of 3 integrations
        return res.status(403).json({ 
          message: 'Free tier limit reached',
          error: 'You have reached the maximum number of service integrations allowed on the free tier. Please upgrade to premium for unlimited integrations.'
        });
      }
    }
    
    next();
  });

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

import {
  users,
  type User,
  type InsertUser,
  projects,
  type Project,
  type InsertProject,
  serviceIntegrations,
  type ServiceIntegration,
  type InsertServiceIntegration,
  alerts,
  type Alert,
  type InsertAlert,
  dashboardWidgets,
  type DashboardWidget,
  type InsertDashboardWidget,
  metrics,
  type Metric,
  type InsertMetric
} from '@shared/schema';

// Define ServiceType
export type ServiceType = 'stytch' | 'onesignal' | 'aws' | 'sendbird' | 'twilio' | 'mixpanel';
export type DateRangeType = "24h" | "7d" | "30d" | "90d" | "custom";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Service Integration methods
  getServiceIntegration(id: number): Promise<ServiceIntegration | undefined>;
  getAllServiceIntegrations(): Promise<ServiceIntegration[]>;
  getServiceIntegrationsByType(type: ServiceType): Promise<ServiceIntegration[]>;
  getServiceIntegrationsByProjectId(projectId: number): Promise<ServiceIntegration[]>;
  createServiceIntegration(service: InsertServiceIntegration): Promise<ServiceIntegration>;
  updateServiceIntegration(id: number, service: Partial<ServiceIntegration>): Promise<ServiceIntegration | undefined>;
  deleteServiceIntegration(id: number): Promise<boolean>;

  // Alert methods
  getAlert(id: number): Promise<Alert | undefined>;
  getAllAlerts(): Promise<Alert[]>;
  getAlertsByProjectId(projectId: number): Promise<Alert[]>;
  getAlertsByServiceType(serviceType: ServiceType): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<Alert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;

  // Dashboard Widget methods
  getDashboardWidget(id: number): Promise<DashboardWidget | undefined>;
  getAllDashboardWidgets(): Promise<DashboardWidget[]>;
  getDashboardWidgetsByProjectId(projectId: number): Promise<DashboardWidget[]>;
  createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget>;
  updateDashboardWidget(id: number, widget: Partial<DashboardWidget>): Promise<DashboardWidget | undefined>;
  deleteDashboardWidget(id: number): Promise<boolean>;

  // Metrics methods
  getMetric(id: number): Promise<Metric | undefined>;
  getAllMetrics(): Promise<Metric[]>;
  getMetricsByProjectId(
    projectId: number,
    serviceType?: string,
    metricType?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Metric[]>;
  getMetricsByServiceType(serviceType: ServiceType): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  deleteMetric(id: number): Promise<boolean>;
}

import { db } from './db';
import { eq, and, asc, sql } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  // User methods implementation
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Project methods implementation
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(asc(projects.name));
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    // Using sql for direct column access
    return await db.select().from(projects).where(sql`user_id = ${userId}`).orderBy(asc(projects.name));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [createdProject] = await db.insert(projects).values(project).returning();
    return createdProject;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(projectUpdate)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    // First delete related records from other tables
    await db.delete(serviceIntegrations).where(eq(serviceIntegrations.projectId, id));
    await db.delete(alerts).where(eq(alerts.projectId, id));
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.projectId, id));
    await db.delete(metrics).where(eq(metrics.projectId, id));
    
    // Then delete the project
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  // Service Integration methods implementation
  async getServiceIntegration(id: number): Promise<ServiceIntegration | undefined> {
    const [service] = await db.select().from(serviceIntegrations).where(eq(serviceIntegrations.id, id));
    return service || undefined;
  }

  async getAllServiceIntegrations(): Promise<ServiceIntegration[]> {
    return await db.select().from(serviceIntegrations);
  }

  async getServiceIntegrationsByType(type: ServiceType): Promise<ServiceIntegration[]> {
    return await db.select().from(serviceIntegrations)
      .where(eq(serviceIntegrations.serviceType, type));
  }

  async getServiceIntegrationsByProjectId(projectId: number): Promise<ServiceIntegration[]> {
    return await db.select().from(serviceIntegrations)
      .where(eq(serviceIntegrations.projectId, projectId));
  }

  async createServiceIntegration(service: InsertServiceIntegration): Promise<ServiceIntegration> {
    const [createdService] = await db.insert(serviceIntegrations).values(service).returning();
    return createdService;
  }

  async updateServiceIntegration(id: number, serviceUpdate: Partial<ServiceIntegration>): Promise<ServiceIntegration | undefined> {
    const [updatedService] = await db
      .update(serviceIntegrations)
      .set(serviceUpdate)
      .where(eq(serviceIntegrations.id, id))
      .returning();
    return updatedService || undefined;
  }

  async deleteServiceIntegration(id: number): Promise<boolean> {
    // First delete related alerts
    await db.delete(alerts).where(
      and(
        eq(alerts.serviceType, 
          // First get the service type of the integration
          db.select({ type: serviceIntegrations.serviceType })
            .from(serviceIntegrations)
            .where(eq(serviceIntegrations.id, id))
            .limit(1)
        )
      )
    );
    
    // Then delete the service integration
    const result = await db.delete(serviceIntegrations).where(eq(serviceIntegrations.id, id)).returning();
    return result.length > 0;
  }

  // Alert methods implementation
  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert || undefined;
  }

  async getAllAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts);
  }

  async getAlertsByProjectId(projectId: number): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.projectId, projectId));
  }

  async getAlertsByServiceType(serviceType: ServiceType): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.serviceType, serviceType));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [createdAlert] = await db.insert(alerts).values(alert).returning();
    return createdAlert;
  }

  async updateAlert(id: number, alertUpdate: Partial<Alert>): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set(alertUpdate)
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, id)).returning();
    return result.length > 0;
  }

  // Dashboard Widget methods implementation
  async getDashboardWidget(id: number): Promise<DashboardWidget | undefined> {
    const [widget] = await db.select().from(dashboardWidgets).where(eq(dashboardWidgets.id, id));
    return widget || undefined;
  }

  async getAllDashboardWidgets(): Promise<DashboardWidget[]> {
    return await db.select().from(dashboardWidgets);
  }

  async getDashboardWidgetsByProjectId(projectId: number): Promise<DashboardWidget[]> {
    return await db.select().from(dashboardWidgets).where(eq(dashboardWidgets.projectId, projectId));
  }

  async createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget> {
    const [createdWidget] = await db.insert(dashboardWidgets).values(widget).returning();
    return createdWidget;
  }

  async updateDashboardWidget(id: number, widgetUpdate: Partial<DashboardWidget>): Promise<DashboardWidget | undefined> {
    const [updatedWidget] = await db
      .update(dashboardWidgets)
      .set(widgetUpdate)
      .where(eq(dashboardWidgets.id, id))
      .returning();
    return updatedWidget || undefined;
  }

  async deleteDashboardWidget(id: number): Promise<boolean> {
    const result = await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, id)).returning();
    return result.length > 0;
  }

  // Metrics methods implementation
  async getMetric(id: number): Promise<Metric | undefined> {
    const [metric] = await db.select().from(metrics).where(eq(metrics.id, id));
    return metric || undefined;
  }

  async getAllMetrics(): Promise<Metric[]> {
    return await db.select().from(metrics);
  }

  async getMetricsByProjectId(
    projectId: number,
    serviceType?: string,
    metricType?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Metric[]> {
    // Build conditions array
    const conditions = [eq(metrics.projectId, projectId)];
    
    // Add additional filters if provided
    if (serviceType) {
      conditions.push(eq(metrics.serviceType, serviceType));
    }
    
    if (metricType) {
      conditions.push(eq(metrics.metricType, metricType));
    }
    
    if (startDate) {
      conditions.push(sql`${metrics.timestamp} >= ${startDate}`);
    }
    
    if (endDate) {
      conditions.push(sql`${metrics.timestamp} <= ${endDate}`);
    }
    
    // Apply all conditions with AND
    return await db.select().from(metrics).where(and(...conditions));
  }

  async getMetricsByServiceType(serviceType: ServiceType): Promise<Metric[]> {
    return await db.select().from(metrics).where(eq(metrics.serviceType, serviceType));
  }

  async createMetric(metric: InsertMetric): Promise<Metric> {
    const [createdMetric] = await db.insert(metrics).values(metric).returning();
    return createdMetric;
  }

  async deleteMetric(id: number): Promise<boolean> {
    const result = await db.delete(metrics).where(eq(metrics.id, id)).returning();
    return result.length > 0;
  }
}

export const storage: IStorage = new DatabaseStorage();

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  userId: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Service Integrations table
export const serviceIntegrations = pgTable("service_integrations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  serviceType: text("service_type").notNull(), // 'stytch', 'onesignal', 'aws', 'sendbird', 'twilio', 'mixpanel'
  credentials: jsonb("credentials").notNull(),
  active: boolean("active").default(true).notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceIntegrationSchema = createInsertSchema(serviceIntegrations).pick({
  projectId: true,
  serviceType: true,
  credentials: true,
  active: true,
});

export type InsertServiceIntegration = z.infer<typeof insertServiceIntegrationSchema>;
export type ServiceIntegration = typeof serviceIntegrations.$inferSelect;

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  serviceType: text("service_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // 'info', 'warning', 'error'
  status: text("status").notNull(), // 'active', 'acknowledged', 'resolved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  projectId: true,
  serviceType: true,
  title: true,
  description: true,
  severity: true,
  status: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Dashboard Widgets table
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  widgetType: text("widget_type").notNull(), // 'chart', 'metric', 'status', 'alert-list'
  serviceType: text("service_type").notNull(),
  metricType: text("metric_type").notNull(),
  configuration: jsonb("configuration").notNull(),
  position: jsonb("position").notNull(), // { x, y, w, h }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  projectId: true,
  name: true,
  widgetType: true,
  serviceType: true,
  metricType: true,
  configuration: true,
  position: true,
});

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

// Metrics data table
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  serviceType: text("service_type").notNull(),
  metricType: text("metric_type").notNull(),
  value: jsonb("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMetricSchema = createInsertSchema(metrics).pick({
  projectId: true,
  serviceType: true,
  metricType: true,
  value: true,
  timestamp: true,
});

export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metrics.$inferSelect;

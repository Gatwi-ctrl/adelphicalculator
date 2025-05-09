import { pgTable, text, serial, integer, boolean, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pay package schema
export const payPackages = pgTable("pay_packages", {
  id: serial("id").primaryKey(),
  // Assignment details
  providerName: text("provider_name").notNull(),
  specialty: text("specialty").notNull(),
  facility: text("facility").notNull(),
  location: text("location").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  hoursPerWeek: numeric("hours_per_week").notNull(),
  billRate: numeric("bill_rate").notNull(),
  
  // Pay rates
  regularPayRate: numeric("regular_pay_rate").notNull(),
  overtimePayRate: numeric("overtime_pay_rate").notNull(),
  taxableStipend: numeric("taxable_stipend").notNull(),
  nonTaxableStipend: numeric("non_taxable_stipend").notNull(),
  mealsStipend: numeric("meals_stipend").notNull(),
  travelStipend: numeric("travel_stipend").notNull(),
  
  // Standard burdens
  employerTaxes: numeric("employer_taxes").notNull(),
  workersComp: numeric("workers_comp").notNull(),
  healthInsurance: numeric("health_insurance").notNull(),
  professionalLiability: numeric("professional_liability").notNull(),
  
  // Additional costs
  housing: numeric("housing").notNull(),
  travel: numeric("travel").notNull(),
  bonus: numeric("bonus").notNull(),
  otherCosts: numeric("other_costs").notNull(),
  
  // Notes
  notes: text("notes"),
  
  // Calculation results (stored for reference)
  weeklyGross: numeric("weekly_gross").notNull(),
  contractTotal: numeric("contract_total").notNull(),
  weeklyAgencyRevenue: numeric("weekly_agency_revenue").notNull(),
  totalAgencyRevenue: numeric("total_agency_revenue").notNull(),
  weeklyAgencyCosts: numeric("weekly_agency_costs").notNull(),
  weeklyAgencyMargin: numeric("weekly_agency_margin").notNull(),
  weeklyNetPay: numeric("weekly_net_pay").notNull(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  emailSent: boolean("email_sent").default(false).notNull(),
  smsSent: boolean("sms_sent").default(false).notNull(),
});

export const payPackagesRelations = relations(payPackages, ({ many }) => ({
  communicationLogs: many(communicationLogs),
  journalEntries: many(journalEntries),
  reminders: many(reminders),
}));

export const insertPayPackageSchema = createInsertSchema(payPackages).omit({
  id: true,
  createdAt: true,
});

export type InsertPayPackage = z.infer<typeof insertPayPackageSchema>;
export type PayPackage = typeof payPackages.$inferSelect;

// Communication logs
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  payPackageId: integer("pay_package_id").notNull(),
  type: text("type").notNull(), // "email" or "sms"
  recipient: text("recipient").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: text("status").notNull(), // "success" or "failed"
  errorMessage: text("error_message"),
  // New fields for the journal system
  direction: text("direction").notNull().default("outbound"), // "outbound" or "inbound"
  content: text("content"), // Content of the message/email
});

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  payPackage: one(payPackages, {
    fields: [communicationLogs.payPackageId],
    references: [payPackages.id],
  }),
}));

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  sentAt: true,
});

export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;

// Journal Entries
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  payPackageId: integer("pay_package_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  entryType: text("entry_type").notNull(), // "note", "followup", "response", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  payPackage: one(payPackages, {
    fields: [journalEntries.payPackageId],
    references: [payPackages.id],
  }),
}));

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Reminders
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  payPackageId: integer("pay_package_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  priority: text("priority").default("medium").notNull(), // "low", "medium", "high"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const remindersRelations = relations(reminders, ({ one }) => ({
  payPackage: one(payPackages, {
    fields: [reminders.payPackageId],
    references: [payPackages.id],
  }),
}));

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

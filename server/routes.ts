import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPayPackageSchema, 
  insertCommunicationLogSchema,
  insertJournalEntrySchema,
  insertReminderSchema
} from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { createSMSPayPackageSummary } from "../client/src/lib/utils";

// Email configuration - Using nodemailer with ethereal for development
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
    pass: process.env.EMAIL_PASS || 'ethereal_password'
  }
});

// SMS configuration - Using Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // GET all pay packages
  app.get("/api/pay-packages", async (req, res) => {
    try {
      const packages = await storage.getAllPayPackages();
      res.json(packages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET recent pay packages (limit to 5)
  app.get("/api/pay-packages/recent", async (req, res) => {
    try {
      const packages = await storage.getRecentPayPackages(5);
      res.json(packages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET a specific pay package by ID
  app.get("/api/pay-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const payPackage = await storage.getPayPackage(id);
      if (!payPackage) {
        return res.status(404).json({ message: "Pay package not found" });
      }

      res.json(payPackage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new pay package
  app.post("/api/pay-packages", async (req, res) => {
    try {
      const validatedData = insertPayPackageSchema.parse(req.body);
      const newPackage = await storage.createPayPackage(validatedData);
      res.status(201).json(newPackage);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update an existing pay package
  app.put("/api/pay-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const validatedData = insertPayPackageSchema.parse(req.body);
      const updatedPackage = await storage.updatePayPackage(id, validatedData);
      
      if (!updatedPackage) {
        return res.status(404).json({ message: "Pay package not found" });
      }

      res.json(updatedPackage);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a pay package
  app.delete("/api/pay-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const success = await storage.deletePayPackage(id);
      if (!success) {
        return res.status(404).json({ message: "Pay package not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send pay package via email
  app.post("/api/pay-packages/email", async (req, res) => {
    try {
      const { payPackageId, email } = req.body;
      
      // Validate inputs
      if (!payPackageId || !email) {
        return res.status(400).json({ message: "Pay package ID and email are required" });
      }

      // Get the pay package
      const payPackage = await storage.getPayPackage(payPackageId);
      if (!payPackage) {
        return res.status(404).json({ message: "Pay package not found" });
      }

      // Create email content
      const emailContent = `
        <h1>Pay Package Details</h1>
        <p><strong>Provider:</strong> ${payPackage.providerName}</p>
        <p><strong>Facility:</strong> ${payPackage.facility}</p>
        <p><strong>Location:</strong> ${payPackage.location}</p>
        <p><strong>Weekly Gross Pay:</strong> $${payPackage.weeklyGross}</p>
        <p><strong>Contract Total:</strong> $${payPackage.contractTotal}</p>
        <p><strong>Duration:</strong> ${new Date(payPackage.startDate).toLocaleDateString()} to ${new Date(payPackage.endDate).toLocaleDateString()}</p>
        
        <h2>Pay Breakdown</h2>
        <p>Regular Pay Rate: $${payPackage.regularPayRate}/hr</p>
        <p>Regular Pay: $${Number(payPackage.regularPayRate) * Number(payPackage.hoursPerWeek)}</p>
        <p>Taxable Stipend: $${payPackage.taxableStipend}</p>
        <p>Non-Taxable Stipend: $${payPackage.nonTaxableStipend}</p>
        <p>Meals Stipend: $${payPackage.mealsStipend}</p>
        <p>Travel Stipend: $${payPackage.travelStipend}</p>
        
        <h2>Estimated Take-Home Pay</h2>
        <p>Weekly Net Pay: $${payPackage.weeklyNetPay}</p>
        
        <p>For more details, please log in to your account.</p>
      `;

      // Send email
      const info = await emailTransporter.sendMail({
        from: '"Adelphi Healthcare Staffing" <info@adelphihealthcare.com>',
        to: email,
        subject: `Pay Package for ${payPackage.providerName} at ${payPackage.facility}`,
        html: emailContent
      });

      // Log the communication
      const communicationLog = await storage.createCommunicationLog({
        payPackageId,
        type: 'email',
        recipient: email,
        status: 'success',
        errorMessage: null
      });

      // Update pay package to mark email as sent
      await storage.updatePayPackage(payPackageId, { ...payPackage, emailSent: true });

      res.json({ 
        message: "Email sent successfully", 
        messageId: info.messageId,
        communicationLog 
      });
    } catch (error: any) {
      // Log failed communication attempt
      if (req.body.payPackageId) {
        await storage.createCommunicationLog({
          payPackageId: req.body.payPackageId,
          type: 'email',
          recipient: req.body.email || 'unknown',
          status: 'failed',
          errorMessage: error.message
        });
      }

      res.status(500).json({ message: error.message });
    }
  });

  // Send pay package via SMS
  app.post("/api/pay-packages/sms", async (req, res) => {
    try {
      const { payPackageId, phoneNumber } = req.body;
      
      // Validate inputs
      if (!payPackageId || !phoneNumber) {
        return res.status(400).json({ message: "Pay package ID and phone number are required" });
      }

      // Get the pay package
      const payPackage = await storage.getPayPackage(payPackageId);
      if (!payPackage) {
        return res.status(404).json({ message: "Pay package not found" });
      }

      if (!twilioClient || !twilioPhoneNumber) {
        throw new Error("SMS service not configured properly");
      }

      // Create SMS content
      const smsContent = createSMSPayPackageSummary(payPackage);

      // Send SMS using Twilio
      const message = await twilioClient.messages.create({
        body: smsContent,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      // Log the communication
      const communicationLog = await storage.createCommunicationLog({
        payPackageId,
        type: 'sms',
        recipient: phoneNumber,
        status: 'success',
        errorMessage: null
      });

      // Update pay package to mark SMS as sent
      await storage.updatePayPackage(payPackageId, { ...payPackage, smsSent: true });

      res.json({ 
        message: "SMS sent successfully", 
        messageId: message.sid,
        communicationLog 
      });
    } catch (error: any) {
      // Log failed communication attempt
      if (req.body.payPackageId) {
        await storage.createCommunicationLog({
          payPackageId: req.body.payPackageId,
          type: 'sms',
          recipient: req.body.phoneNumber || 'unknown',
          status: 'failed',
          errorMessage: error.message
        });
      }

      res.status(500).json({ message: error.message });
    }
  });

  // Get communication logs for a pay package
  app.get("/api/pay-packages/:id/communications", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const logs = await storage.getCommunicationLogs(id);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Journal Entry Routes
  // Get all journal entries
  app.get("/api/journal", async (req, res) => {
    try {
      // Get all journal entries from all pay packages
      const allEntries = [];
      const payPackages = await storage.getAllPayPackages();
      
      for (const pkg of payPackages) {
        const entries = await storage.getJournalEntriesForPackage(pkg.id);
        allEntries.push(...entries);
      }
      
      // Sort by most recent first
      allEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allEntries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get journal entries for a pay package
  app.get("/api/pay-packages/:id/journal", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const entries = await storage.getJournalEntriesForPackage(id);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new journal entry
  app.post("/api/journal", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const newEntry = await storage.createJournalEntry(validatedData);
      res.status(201).json(newEntry);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update a journal entry
  app.put("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const validatedData = insertJournalEntrySchema.parse(req.body);
      const updatedEntry = await storage.updateJournalEntry(id, validatedData);
      
      if (!updatedEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }

      res.json(updatedEntry);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a journal entry
  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const success = await storage.deleteJournalEntry(id);
      if (!success) {
        return res.status(404).json({ message: "Journal entry not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reminder Routes
  // Get reminders for a pay package
  app.get("/api/pay-packages/:id/reminders", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const reminders = await storage.getRemindersForPackage(id);
      res.json(reminders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all reminders (with optional filter for completed)
  app.get("/api/reminders", async (req, res) => {
    try {
      const includeCompleted = req.query.includeCompleted === 'true';
      const reminders = await storage.getAllReminders(includeCompleted);
      res.json(reminders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get upcoming reminders
  app.get("/api/reminders/upcoming", async (req, res) => {
    try {
      const daysAhead = parseInt(req.query.days as string) || 7; // Default to 7 days
      const reminders = await storage.getUpcomingReminders(daysAhead);
      res.json(reminders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      const newReminder = await storage.createReminder(validatedData);
      res.status(201).json(newReminder);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update a reminder
  app.put("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const validatedData = insertReminderSchema.parse(req.body);
      const updatedReminder = await storage.updateReminder(id, validatedData);
      
      if (!updatedReminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json(updatedReminder);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Mark a reminder as complete/incomplete
  app.patch("/api/reminders/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const { isCompleted } = req.body;
      if (typeof isCompleted !== 'boolean') {
        return res.status(400).json({ message: "isCompleted must be a boolean" });
      }

      const updatedReminder = await storage.markReminderComplete(id, isCompleted);
      
      if (!updatedReminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json(updatedReminder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a reminder
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const success = await storage.deleteReminder(id);
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}

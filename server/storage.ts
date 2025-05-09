import { 
  users, type User, type InsertUser,
  payPackages, type PayPackage, type InsertPayPackage,
  communicationLogs, type CommunicationLog, type InsertCommunicationLog,
  journalEntries, type JournalEntry, type InsertJournalEntry,
  reminders, type Reminder, type InsertReminder
} from "@shared/schema";

// Extend the interface with any CRUD methods needed
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pay package methods
  getPayPackage(id: number): Promise<PayPackage | undefined>;
  getAllPayPackages(): Promise<PayPackage[]>;
  getRecentPayPackages(limit: number): Promise<PayPackage[]>;
  createPayPackage(data: InsertPayPackage): Promise<PayPackage>;
  updatePayPackage(id: number, data: Partial<PayPackage>): Promise<PayPackage | undefined>;
  deletePayPackage(id: number): Promise<boolean>;
  
  // Communication log methods
  getCommunicationLogs(payPackageId: number): Promise<CommunicationLog[]>;
  createCommunicationLog(data: InsertCommunicationLog): Promise<CommunicationLog>;
  
  // Journal methods
  getJournalEntriesForPackage(payPackageId: number): Promise<JournalEntry[]>;
  createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, data: Partial<JournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;
  
  // Reminder methods
  getRemindersForPackage(payPackageId: number): Promise<Reminder[]>;
  getAllReminders(includeCompleted?: boolean): Promise<Reminder[]>;
  getUpcomingReminders(daysAhead: number): Promise<Reminder[]>;
  createReminder(data: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  markReminderComplete(id: number, isCompleted: boolean): Promise<Reminder | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private payPackages: Map<number, PayPackage>;
  private communicationLogs: Map<number, CommunicationLog>;
  private journalEntries: Map<number, JournalEntry>;
  private reminders: Map<number, Reminder>;
  private userCurrentId: number;
  private payPackageCurrentId: number;
  private communicationLogCurrentId: number;
  private journalEntryCurrentId: number;
  private reminderCurrentId: number;

  constructor() {
    this.users = new Map();
    this.payPackages = new Map();
    this.communicationLogs = new Map();
    this.journalEntries = new Map();
    this.reminders = new Map();
    this.userCurrentId = 1;
    this.payPackageCurrentId = 1;
    this.communicationLogCurrentId = 1;
    this.journalEntryCurrentId = 1;
    this.reminderCurrentId = 1;
    
    // Add some sample data for testing
    this.createSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Pay package methods
  async getPayPackage(id: number): Promise<PayPackage | undefined> {
    return this.payPackages.get(id);
  }

  async getAllPayPackages(): Promise<PayPackage[]> {
    return Array.from(this.payPackages.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentPayPackages(limit: number): Promise<PayPackage[]> {
    return Array.from(this.payPackages.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createPayPackage(data: InsertPayPackage): Promise<PayPackage> {
    const id = this.payPackageCurrentId++;
    const now = new Date();
    
    // Cast numeric string values to numbers for calculations if needed
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string' && !isNaN(Number(value)) && 
          key !== 'providerName' && key !== 'specialty' && 
          key !== 'facility' && key !== 'location' && 
          key !== 'notes' && key !== 'startDate' && 
          key !== 'endDate') {
        (data as any)[key] = Number(value);
      }
    });

    const payPackage: PayPackage = {
      ...data,
      id,
      createdAt: now,
      emailSent: false,
      smsSent: false
    };

    this.payPackages.set(id, payPackage);
    return payPackage;
  }

  async updatePayPackage(id: number, data: Partial<PayPackage>): Promise<PayPackage | undefined> {
    const existingPackage = this.payPackages.get(id);
    if (!existingPackage) {
      return undefined;
    }

    const updatedPackage: PayPackage = {
      ...existingPackage,
      ...data
    };

    this.payPackages.set(id, updatedPackage);
    return updatedPackage;
  }

  async deletePayPackage(id: number): Promise<boolean> {
    return this.payPackages.delete(id);
  }

  // Communication log methods
  async getCommunicationLogs(payPackageId: number): Promise<CommunicationLog[]> {
    return Array.from(this.communicationLogs.values())
      .filter(log => log.payPackageId === payPackageId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  async createCommunicationLog(data: InsertCommunicationLog): Promise<CommunicationLog> {
    const id = this.communicationLogCurrentId++;
    const now = new Date();
    
    // Make sure all required fields have values
    const log: CommunicationLog = {
      ...data,
      id,
      sentAt: now,
      // Explicitly set defaults for optional fields to avoid type errors
      errorMessage: data.errorMessage ?? null,
      direction: data.direction ?? "outbound",
      content: data.content ?? null
    };

    this.communicationLogs.set(id, log);
    return log;
  }

  // Journal methods
  async getJournalEntriesForPackage(payPackageId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.payPackageId === payPackageId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalEntryCurrentId++;
    const now = new Date();
    
    const journalEntry: JournalEntry = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.journalEntries.set(id, journalEntry);
    return journalEntry;
  }

  async updateJournalEntry(id: number, data: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    const existingEntry = this.journalEntries.get(id);
    if (!existingEntry) {
      return undefined;
    }

    const updatedEntry: JournalEntry = {
      ...existingEntry,
      ...data,
      updatedAt: new Date()
    };

    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  // Reminder methods
  async getRemindersForPackage(payPackageId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.payPackageId === payPackageId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async getAllReminders(includeCompleted: boolean = false): Promise<Reminder[]> {
    let reminders = Array.from(this.reminders.values());
    
    if (!includeCompleted) {
      reminders = reminders.filter(reminder => !reminder.isCompleted);
    }
    
    return reminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async getUpcomingReminders(daysAhead: number): Promise<Reminder[]> {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + daysAhead);
    
    return Array.from(this.reminders.values())
      .filter(reminder => {
        const dueDate = new Date(reminder.dueDate);
        return !reminder.isCompleted && dueDate >= now && dueDate <= endDate;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async createReminder(data: InsertReminder): Promise<Reminder> {
    const id = this.reminderCurrentId++;
    const now = new Date();
    
    // Make sure all required fields have values
    const reminder: Reminder = {
      ...data,
      id,
      createdAt: now,
      // Explicitly set defaults for optional fields to avoid type errors
      description: data.description ?? null,
      isCompleted: data.isCompleted ?? false,
      priority: data.priority ?? "medium"
    };

    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder | undefined> {
    const existingReminder = this.reminders.get(id);
    if (!existingReminder) {
      return undefined;
    }

    const updatedReminder: Reminder = {
      ...existingReminder,
      ...data
    };

    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async deleteReminder(id: number): Promise<boolean> {
    return this.reminders.delete(id);
  }

  async markReminderComplete(id: number, isCompleted: boolean): Promise<Reminder | undefined> {
    const existingReminder = this.reminders.get(id);
    if (!existingReminder) {
      return undefined;
    }

    const updatedReminder: Reminder = {
      ...existingReminder,
      isCompleted
    };

    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  // Create sample data for testing (only in development)
  private createSampleData() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // Sample pay packages
    const samplePackages: Omit<InsertPayPackage, 'id'>[] = [
      {
        providerName: "Sarah Johnson",
        specialty: "nursing",
        facility: "Memorial Hospital",
        location: "Denver, CO",
        startDate: new Date("2023-06-15"),
        endDate: new Date("2023-09-10"),
        hoursPerWeek: 36,
        billRate: 85,
        regularPayRate: 40,
        overtimePayRate: 60,
        taxableStipend: 250,
        nonTaxableStipend: 800,
        mealsStipend: 350,
        travelStipend: 0,
        employerTaxes: 7.65,
        workersComp: 2,
        healthInsurance: 350,
        professionalLiability: 100,
        housing: 0,
        travel: 0,
        bonus: 0,
        otherCosts: 150,
        notes: "Excellent candidate with ICU experience",
        weeklyGross: 2840,
        contractTotal: 36920,
        weeklyAgencyRevenue: 3060,
        totalAgencyRevenue: 39780,
        weeklyAgencyCosts: 3599.23,
        weeklyAgencyMargin: -539.23,
        weeklyNetPay: 2440.31
      },
      {
        providerName: "Michael Chen",
        specialty: "physician",
        facility: "City General",
        location: "Chicago, IL",
        startDate: new Date("2023-06-10"),
        endDate: new Date("2023-08-05"),
        hoursPerWeek: 40,
        billRate: 120,
        regularPayRate: 65,
        overtimePayRate: 97.5,
        taxableStipend: 300,
        nonTaxableStipend: 950,
        mealsStipend: 400,
        travelStipend: 200,
        employerTaxes: 7.65,
        workersComp: 2,
        healthInsurance: 350,
        professionalLiability: 150,
        housing: 0,
        travel: 0,
        bonus: 500,
        otherCosts: 0,
        notes: "Experienced surgeon, needs housing close to hospital",
        weeklyGross: 3120,
        contractTotal: 24960,
        weeklyAgencyRevenue: 4800,
        totalAgencyRevenue: 38400,
        weeklyAgencyCosts: 4374.2,
        weeklyAgencyMargin: 425.8,
        weeklyNetPay: 2715.68
      },
      {
        providerName: "Emily Rodriguez",
        specialty: "therapy",
        facility: "St. Mary's",
        location: "Miami, FL",
        startDate: new Date("2023-06-05"),
        endDate: new Date("2023-09-01"),
        hoursPerWeek: 36,
        billRate: 95,
        regularPayRate: 50,
        overtimePayRate: 75,
        taxableStipend: 200,
        nonTaxableStipend: 850,
        mealsStipend: 300,
        travelStipend: 0,
        employerTaxes: 7.65,
        workersComp: 2,
        healthInsurance: 350,
        professionalLiability: 100,
        housing: 300,
        travel: 200,
        bonus: 0,
        otherCosts: 0,
        notes: "Physical therapist with pediatric experience",
        weeklyGross: 2950,
        contractTotal: 38350,
        weeklyAgencyRevenue: 3420,
        totalAgencyRevenue: 44460,
        weeklyAgencyCosts: 3209.55,
        weeklyAgencyMargin: 210.45,
        weeklyNetPay: 2554.37
      }
    ];

    // Insert sample data
    samplePackages.forEach(async (pkg) => {
      this.createPayPackage(pkg as InsertPayPackage).then(payPackage => {
        // Add sample journal entries and reminders for each package
        if (payPackage.id === 1) {
          // Journal entries for Sarah Johnson
          this.createJournalEntry({
            payPackageId: payPackage.id,
            title: "Initial Contact",
            content: "Called Sarah to discuss the Memorial Hospital opportunity. She expressed interest and requested more details about housing options.",
            entryType: "note"
          });
          
          this.createJournalEntry({
            payPackageId: payPackage.id,
            title: "Package Acceptance",
            content: "Sarah has accepted the pay package. She will start on June 15th and is excited about the opportunity.",
            entryType: "response"
          });
          
          // Reminders for Sarah Johnson
          this.createReminder({
            payPackageId: payPackage.id,
            title: "Follow up on housing",
            description: "Check if Sarah has found suitable housing near Memorial Hospital",
            dueDate: new Date("2023-06-01"),
            priority: "high",
            isCompleted: true
          });
          
          this.createReminder({
            payPackageId: payPackage.id,
            title: "Onboarding documentation",
            description: "Remind Sarah to complete remaining onboarding paperwork",
            dueDate: new Date("2023-06-10"),
            priority: "medium",
            isCompleted: false
          });
        }
        
        if (payPackage.id === 2) {
          // Journal entries for Michael Chen
          this.createJournalEntry({
            payPackageId: payPackage.id,
            title: "Negotiation Notes",
            content: "Michael requested a higher housing stipend due to Chicago's expensive rental market. We agreed to look into options.",
            entryType: "note"
          });
          
          // Reminders for Michael Chen
          this.createReminder({
            payPackageId: payPackage.id,
            title: "License verification",
            description: "Ensure Michael's Illinois medical license is verified before start date",
            dueDate: new Date("2023-06-05"),
            priority: "high",
            isCompleted: false
          });
        }
        
        if (payPackage.id === 3) {
          // Journal entries for Emily Rodriguez
          this.createJournalEntry({
            payPackageId: payPackage.id,
            title: "Pediatric Experience",
            content: "Emily has 5 years of pediatric physical therapy experience, which is perfect for the St. Mary's position.",
            entryType: "note"
          });
          
          // Reminders for Emily Rodriguez
          this.createReminder({
            payPackageId: payPackage.id,
            title: "Travel arrangements",
            description: "Confirm Emily's travel arrangements to Miami",
            dueDate: new Date("2023-05-25"),
            priority: "medium",
            isCompleted: true
          });
          
          this.createReminder({
            payPackageId: payPackage.id,
            title: "First day check-in",
            description: "Call Emily after her first day to see how it went",
            dueDate: new Date("2023-06-06"),
            priority: "low",
            isCompleted: false
          });
        }
      });
    });
  }
}

export const storage = new MemStorage();

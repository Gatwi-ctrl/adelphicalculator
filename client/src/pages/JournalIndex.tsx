import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, FileText, ClipboardList } from "lucide-react";
import JournalEntryList from "../components/journal/JournalEntryList";
import JournalEntryForm from "../components/journal/JournalEntryForm";
import ReminderList from "../components/journal/ReminderList";
import ReminderForm from "../components/journal/ReminderForm";

export default function JournalIndex() {
  const [activeTab, setActiveTab] = useState<"journal" | "reminders">("journal");
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);

  // Fetch all journal entries
  const {
    data: journalEntries = [],
    isLoading: isLoadingJournalEntries,
    error: journalError
  } = useQuery({
    queryKey: ["journal"],
    queryFn: async () => {
      const response = await fetch("/api/journal");
      if (!response.ok) {
        throw new Error("Failed to fetch journal entries");
      }
      return response.json();
    },
  });

  // Fetch all reminders
  const {
    data: reminders = [],
    isLoading: isLoadingReminders,
    error: reminderError
  } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const response = await fetch("/api/reminders");
      if (!response.ok) {
        throw new Error("Failed to fetch reminders");
      }
      return response.json();
    },
  });

  // Handle create journal entry
  const createJournalEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create journal entry");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      setShowJournalForm(false);
      toast({
        title: "Journal Entry Added",
        description: "Your journal entry has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save journal entry: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Handle create reminder
  const createReminderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create reminder");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setShowReminderForm(false);
      toast({
        title: "Reminder Added",
        description: "Your reminder has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save reminder: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Handle complete reminder
  const completeReminderMutation = useMutation({
    mutationFn: async ({ reminderId, isCompleted }: { reminderId: number; isCompleted: boolean }) => {
      const response = await fetch(`/api/reminders/${reminderId}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isCompleted }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update reminder");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update reminder: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Handle delete journal entry
  const deleteJournalEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete journal entry");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      toast({
        title: "Journal Entry Deleted",
        description: "The journal entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete journal entry: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Handle delete reminder
  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete reminder");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({
        title: "Reminder Deleted",
        description: "The reminder has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete reminder: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const handleJournalFormSubmit = (data: any) => {
    createJournalEntryMutation.mutate(data);
  };

  const handleReminderFormSubmit = (data: any) => {
    createReminderMutation.mutate(data);
  };

  const handleReminderComplete = (reminderId: number, isCompleted: boolean) => {
    completeReminderMutation.mutate({ reminderId, isCompleted });
  };

  const handleDeleteJournalEntry = (entryId: number) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      deleteJournalEntryMutation.mutate(entryId);
    }
  };

  const handleDeleteReminder = (reminderId: number) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      deleteReminderMutation.mutate(reminderId);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Journal</h1>
      </div>

      <Tabs
        defaultValue="journal"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "journal" | "reminders")}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="journal" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Notes & Communications
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              Reminders
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "journal" ? (
            <Button 
              onClick={() => setShowJournalForm(true)} 
              disabled={showJournalForm}
            >
              Add Entry
            </Button>
          ) : (
            <Button 
              onClick={() => setShowReminderForm(true)} 
              disabled={showReminderForm}
            >
              Add Reminder
            </Button>
          )}
        </div>

        <TabsContent value="journal" className="mt-0">
          {showJournalForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>New Journal Entry</CardTitle>
                <CardDescription>
                  Create a new note or record communication with a provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JournalEntryForm 
                  onSubmit={handleJournalFormSubmit} 
                  onCancel={() => setShowJournalForm(false)} 
                  isSubmitting={createJournalEntryMutation.isPending}
                />
              </CardContent>
            </Card>
          )}

          {isLoadingJournalEntries ? (
            <div className="py-4 text-center">Loading journal entries...</div>
          ) : journalError ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error loading journal entries: {(journalError as Error).message}
                  </p>
                </div>
              </div>
            </div>
          ) : journalEntries.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No journal entries yet. Add one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <JournalEntryList 
              entries={journalEntries} 
              onDelete={handleDeleteJournalEntry} 
            />
          )}
        </TabsContent>

        <TabsContent value="reminders" className="mt-0">
          {showReminderForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>New Reminder</CardTitle>
                <CardDescription>
                  Set a reminder for follow-up actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReminderForm 
                  onSubmit={handleReminderFormSubmit} 
                  onCancel={() => setShowReminderForm(false)} 
                  isSubmitting={createReminderMutation.isPending}
                />
              </CardContent>
            </Card>
          )}

          {isLoadingReminders ? (
            <div className="py-4 text-center">Loading reminders...</div>
          ) : reminderError ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error loading reminders: {(reminderError as Error).message}
                  </p>
                </div>
              </div>
            </div>
          ) : reminders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No reminders yet. Add one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Upcoming Reminders</h3>
                <ReminderList 
                  reminders={reminders.filter((r: any) => !r.isCompleted)} 
                  onComplete={handleReminderComplete}
                  onDelete={handleDeleteReminder}
                />
              </div>
              
              {reminders.some((r: any) => r.isCompleted) && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Completed Reminders</h3>
                    <ReminderList 
                      reminders={reminders.filter((r: any) => r.isCompleted)} 
                      onComplete={handleReminderComplete}
                      onDelete={handleDeleteReminder}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
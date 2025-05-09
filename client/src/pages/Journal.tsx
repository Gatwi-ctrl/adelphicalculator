import { useParams, useLocation, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getQueryFn, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, Calendar as CalendarIcon, FileText, ClipboardList, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import JournalEntryList from '../components/journal/JournalEntryList';
import JournalEntryForm from '../components/journal/JournalEntryForm';
import ReminderList from '../components/journal/ReminderList';
import ReminderForm from '../components/journal/ReminderForm';

export default function Journal() {
  const [location, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'journal' | 'reminders'>('journal');
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);

  // Fetch pay package details
  const { 
    data: payPackage,
    isLoading: isLoadingPackage,
    error: packageError
  } = useQuery({
    queryKey: ['pay-packages', id],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  // Fetch journal entries
  const {
    data: journalEntries = [],
    isLoading: isLoadingJournalEntries,
    error: journalError
  } = useQuery({
    queryKey: ['pay-packages', id, 'journal'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!id,
  });

  // Fetch reminders
  const {
    data: reminders = [],
    isLoading: isLoadingReminders,
    error: reminderError
  } = useQuery({
    queryKey: ['pay-packages', id, 'reminders'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!id,
  });

  // Handle create journal entry
  const createJournalEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create journal entry');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-packages', id, 'journal'] });
      setShowJournalForm(false);
      toast({
        title: 'Journal Entry Added',
        description: 'Your journal entry has been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save journal entry: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle create reminder
  const createReminderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create reminder');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-packages', id, 'reminders'] });
      setShowReminderForm(false);
      toast({
        title: 'Reminder Added',
        description: 'Your reminder has been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save reminder: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle complete reminder
  const completeReminderMutation = useMutation({
    mutationFn: async ({ reminderId, isCompleted }: { reminderId: number; isCompleted: boolean }) => {
      const response = await fetch(`/api/reminders/${reminderId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update reminder');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-packages', id, 'reminders'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update reminder: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle delete journal entry
  const deleteJournalEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete journal entry');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-packages', id, 'journal'] });
      toast({
        title: 'Journal Entry Deleted',
        description: 'The journal entry has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete journal entry: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle delete reminder
  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-packages', id, 'reminders'] });
      toast({
        title: 'Reminder Deleted',
        description: 'The reminder has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete reminder: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleJournalFormSubmit = (data: any) => {
    createJournalEntryMutation.mutate({
      ...data,
      payPackageId: Number(id),
    });
  };

  const handleReminderFormSubmit = (data: any) => {
    createReminderMutation.mutate({
      ...data,
      payPackageId: Number(id),
    });
  };

  const handleReminderComplete = (reminderId: number, isCompleted: boolean) => {
    completeReminderMutation.mutate({ reminderId, isCompleted });
  };

  const handleDeleteJournalEntry = (entryId: number) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      deleteJournalEntryMutation.mutate(entryId);
    }
  };

  const handleDeleteReminder = (reminderId: number) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      deleteReminderMutation.mutate(reminderId);
    }
  };

  if (isLoadingPackage) {
    return <div className="container py-8">Loading package details...</div>;
  }

  if (packageError) {
    return (
      <div className="container py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading package: {(packageError as Error).message}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setLocation('/history')}>Back to History</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setLocation(`/pay-package/${id}`)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Provider Journal</h1>
        </div>
      </div>

      {payPackage && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{payPackage.providerName}</CardTitle>
            <CardDescription>
              {payPackage.specialty} at {payPackage.facility}, {payPackage.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium">Contract Period</h3>
                <p>
                  {format(new Date(payPackage.startDate), 'MMM d, yyyy')} to{' '}
                  {format(new Date(payPackage.endDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Weekly Gross</h3>
                <p>${Number(payPackage.weeklyGross).toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Contract Total</h3>
                <p>${Number(payPackage.contractTotal).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs
        defaultValue="journal"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'journal' | 'reminders')}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="journal" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Journal Entries
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              Reminders
              {reminders.filter(r => !r.isCompleted).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {reminders.filter(r => !r.isCompleted).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'journal' ? (
            <Button 
              onClick={() => setShowJournalForm(true)} 
              disabled={showJournalForm}
            >
              Add Journal Entry
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
            <div className="text-center py-12 border rounded-md bg-gray-50">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No journal entries</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first journal entry to track provider communication and notes.
              </p>
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
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
                <div className="text-center py-12 border rounded-md bg-gray-50">
                  <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No reminders</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your first reminder to keep track of important tasks.
                  </p>
                </div>
              ) : (
                <ReminderList 
                  reminders={reminders} 
                  onComplete={handleReminderComplete} 
                  onDelete={handleDeleteReminder}
                />
              )}
            </div>
            
            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar 
                    mode="single"
                    selected={new Date()}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// Form schema
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  content: z.string().min(5, { message: 'Content must be at least 5 characters' }),
  entryType: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface JournalEntryFormProps {
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialValues?: Partial<FormValues>;
}

export default function JournalEntryForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting,
  initialValues 
}: JournalEntryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialValues?.title || '',
      content: initialValues?.content || '',
      entryType: initialValues?.entryType || 'note',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Entry title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="response">Provider Response</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your notes or communication details here..." 
                  className="min-h-[150px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Entry
          </Button>
        </div>
      </form>
    </Form>
  );
}
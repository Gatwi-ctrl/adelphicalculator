import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { insertPayPackageSchema } from '@shared/schema';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CurrencyInput from '@/components/ui/currency-input';
import PercentageInput from '@/components/ui/percentage-input';
import { FormEvent } from 'react';

// Extend the schema with additional validation
const formSchema = insertPayPackageSchema.extend({
  providerName: z.string().min(1, 'Provider name is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  facility: z.string().min(1, 'Facility is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  hoursPerWeek: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)), 
    z.number().min(1, 'Hours per week is required')
  ),
  billRate: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)), 
    z.number().min(1, 'Bill rate is required')
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface InputSectionProps {
  onCalculate: (data: FormValues) => void;
  initialValues?: Partial<FormValues>;
}

export default function InputSection({ onCalculate, initialValues }: InputSectionProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providerName: '',
      specialty: '',
      facility: '',
      location: '',
      startDate: '',
      endDate: '',
      hoursPerWeek: 36,
      billRate: 0,
      regularPayRate: 0,
      overtimePayRate: 0,
      taxableStipend: 0,
      nonTaxableStipend: 0,
      mealsStipend: 0,
      travelStipend: 0,
      employerTaxes: 7.65,
      workersComp: 2.00,
      healthInsurance: 350,
      professionalLiability: 100,
      housing: 0,
      travel: 0,
      bonus: 0,
      otherCosts: 0,
      notes: '',
      ...initialValues
    }
  });

  // Update form values when initialValues changes
  useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.setValue(key as any, value);
        }
      });
    }
  }, [initialValues, form]);

  const onSubmit = (data: FormValues) => {
    onCalculate(data);
  };

  return (
    <div className="lg:w-1/2 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-heading font-semibold text-lg mb-4 pb-2 border-b border-neutral-200 text-neutral-700 flex items-center">
              <svg 
                className="text-primary mr-2 h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Assignment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="providerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter provider name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nursing">Nursing</SelectItem>
                          <SelectItem value="physician">Physician</SelectItem>
                          <SelectItem value="therapy">Therapy</SelectItem>
                          <SelectItem value="pa">Physician Assistant</SelectItem>
                          <SelectItem value="np">Nurse Practitioner</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="facility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter facility name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, State" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hoursPerWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Per Week</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="36" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Rate</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="font-heading font-semibold text-lg mb-4 pb-2 border-b border-neutral-200 text-neutral-700 flex items-center">
              <svg 
                className="text-primary mr-2 h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pay Rates
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="regularPayRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regular Pay Rate</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="overtimePayRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overtime Pay Rate</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="taxableStipend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxable Stipend</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nonTaxableStipend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Non-Taxable Stipend</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mealsStipend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meals Stipend</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="travelStipend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Stipend</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="font-heading font-semibold text-lg mb-4 pb-2 border-b border-neutral-200 text-neutral-700 flex items-center">
              <svg 
                className="text-primary mr-2 h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 6L19 3L22 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 20H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 20C14 15.4 19 12.5 19 12.5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 15C11.1667 15.3333 5.5 17.5 5.5 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Standard Burdens
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employerTaxes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Taxes (%)</FormLabel>
                    <FormControl>
                      <PercentageInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="7.65"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="workersComp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workers Comp (%)</FormLabel>
                    <FormControl>
                      <PercentageInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="2.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="healthInsurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Insurance</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="350.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="professionalLiability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Liability</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="100.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="font-heading font-semibold text-lg mb-4 pb-2 border-b border-neutral-200 text-neutral-700 flex items-center">
              <svg 
                className="text-primary mr-2 h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 4H18L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8L6 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Additional Costs
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="housing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Housing</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="travel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonus</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="otherCosts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Costs</FormLabel>
                    <FormControl>
                      <CurrencyInput 
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={3} 
                        placeholder="Add any additional notes about this pay package..." 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset Form
              </Button>
              <Button type="submit">
                Calculate Package
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

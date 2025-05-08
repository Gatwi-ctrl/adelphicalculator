import { useState, useRef, RefObject } from 'react';
import { PayPackage } from '@shared/schema';
import { formatCurrency, calculateContractDuration } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useReactToPrint } from 'react-to-print';

interface OutputSectionProps {
  packageData: Partial<PayPackage>;
  calculated: boolean;
  onSendEmail: (email: string) => void;
  onSendSMS: (phoneNumber: string) => void;
  isEmailing: boolean;
  isSmsSending: boolean;
}

export default function OutputSection({ 
  packageData, 
  calculated,
  onSendEmail,
  onSendSMS,
  isEmailing,
  isSmsSending
}: OutputSectionProps) {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSMSDialogOpen, setIsSMSDialogOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pay Package - ${packageData.providerName || 'Provider'}`,
    onAfterPrint: () => {
      toast({
        title: "Print prepared",
        description: "The pay package has been sent to the printer."
      });
    }
  });

  const handleEmailSubmit = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }
    
    onSendEmail(email);
    setIsEmailDialogOpen(false);
  };

  const handleSMSSubmit = () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number.",
        variant: "destructive"
      });
      return;
    }
    
    onSendSMS(phoneNumber);
    setIsSMSDialogOpen(false);
  };

  // Calculate tax values for paycheck
  const taxableWages = Number(packageData.regularPayRate) * Number(packageData.hoursPerWeek) + Number(packageData.taxableStipend) || 0;
  const federalTax = taxableWages * 0.12;
  const socialSecurity = taxableWages * 0.062;
  const medicare = taxableWages * 0.0145;
  const stateTax = taxableWages * 0.04;
  const totalDeductions = federalTax + socialSecurity + medicare + stateTax;
  const netPay = Number(packageData.weeklyGross) - totalDeductions;
  
  const duration = calculateContractDuration(packageData.startDate, packageData.endDate);
  const contractWeeks = duration?.weeks || 13; // Default to 13 weeks if not calculated
  const totalNetPay = netPay * contractWeeks;

  const isPositiveMargin = packageData.weeklyAgencyMargin ? Number(packageData.weeklyAgencyMargin) >= 0 : false;
  
  return (
    <div className="lg:w-1/2 space-y-6" ref={printRef}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-200">
          <h3 className="font-heading font-semibold text-lg text-neutral-700 flex items-center">
            <svg 
              className="text-primary mr-2 h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Candidate Summary
          </h3>
          {calculated && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg 
                className="mr-1 h-3 w-3" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22 11.0801V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.5839C12.7674 22.1952 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2462 3.61096 17.4371C2.43727 15.628 1.87979 13.4882 2.02168 11.3364C2.16356 9.18467 2.99721 7.13443 4.39828 5.49718C5.79935 3.85994 7.69279 2.71778 9.79619 2.24025C11.8996 1.76272 14.1003 1.98039 16.07 2.86011" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Calculated
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-4">
          <div>
            <div className="text-sm text-neutral-500 mb-1">Provider Name</div>
            <div className="font-medium">{packageData.providerName || 'Not specified'}</div>
          </div>
          
          <div>
            <div className="text-sm text-neutral-500 mb-1">Specialty</div>
            <div className="font-medium">
              {packageData.specialty ? 
                packageData.specialty.charAt(0).toUpperCase() + packageData.specialty.slice(1) : 
                'Not specified'}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-neutral-500 mb-1">Facility</div>
            <div className="font-medium">{packageData.facility || 'Not specified'}</div>
          </div>
          
          <div>
            <div className="text-sm text-neutral-500 mb-1">Location</div>
            <div className="font-medium">{packageData.location || 'Not specified'}</div>
          </div>
          
          <div>
            <div className="text-sm text-neutral-500 mb-1">Duration</div>
            <div className="font-medium">
              {duration ? `${duration.weeks} weeks` : 'Not specified'}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-neutral-500 mb-1">Hours Per Week</div>
            <div className="font-medium">{packageData.hoursPerWeek ? `${packageData.hoursPerWeek} hours` : 'Not specified'}</div>
          </div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-neutral-700 mb-2">Weekly Pay Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Regular Pay</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.regularPayRate) * Number(packageData.hoursPerWeek) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Overtime Pay</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.overtimePayRate) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Taxable Stipend</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.taxableStipend) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Non-Taxable Stipend</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.nonTaxableStipend) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Meals Stipend</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.mealsStipend) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Travel Stipend</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.travelStipend) || 0)}
              </span>
            </div>
            
            <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between items-center font-semibold">
              <span className="text-neutral-700">Total Weekly Gross</span>
              <span className="text-primary">
                {formatCurrency(Number(packageData.weeklyGross) || 0)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary-light bg-opacity-10 p-4 rounded-md">
            <h4 className="font-medium text-primary mb-2">Weekly Compensation</h4>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(Number(packageData.weeklyGross) || 0)}
            </div>
            <div className="text-sm text-neutral-600 mt-1">Before taxes and deductions</div>
          </div>
          
          <div className="bg-secondary bg-opacity-10 p-4 rounded-md">
            <h4 className="font-medium text-secondary mb-2">Total Contract Value</h4>
            <div className="text-2xl font-bold text-secondary">
              {formatCurrency(Number(packageData.contractTotal) || 0)}
            </div>
            <div className="text-sm text-neutral-600 mt-1">
              {contractWeeks} weeks × Weekly Rate
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-heading font-semibold text-lg mb-4 pb-2 border-b border-neutral-200 text-neutral-700 flex items-center">
          <svg 
            className="text-primary mr-2 h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21.2101 15.8899C20.5472 17.3945 19.5622 18.7203 18.3232 19.777C17.0842 20.8338 15.6264 21.5878 14.0630 21.9878C12.4996 22.3878 10.8772 22.4234 9.30003 22.0929C7.7229 21.7625 6.23965 21.0748 4.94962 20.0786C3.65958 19.0823 2.59889 17.8046 1.84323 16.3553C1.08757 14.906 0.659869 13.3219 0.59391 11.7064C0.527951 10.0909 0.825029 8.48037 1.46465 6.9854C2.10428 5.49042 3.07203 4.148 4.29992 3.0499" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2V12H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Agency Summary
        </h3>
        
        <div className="bg-neutral-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-neutral-700 mb-2">Revenue</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Bill Rate</span>
              <span className="font-medium">
                {packageData.billRate ? `${formatCurrency(Number(packageData.billRate))}/hr` : '$0.00/hr'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Weekly Revenue</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.weeklyAgencyRevenue) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Total Contract Revenue</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.totalAgencyRevenue) || 0)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-neutral-700 mb-2">Costs</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Provider Compensation</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.weeklyGross) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Employer Taxes</span>
              <span className="font-medium">
                {formatCurrency((Number(packageData.regularPayRate) * Number(packageData.hoursPerWeek) + Number(packageData.taxableStipend)) * (Number(packageData.employerTaxes) / 100) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Workers Comp</span>
              <span className="font-medium">
                {formatCurrency((Number(packageData.regularPayRate) * Number(packageData.hoursPerWeek)) * (Number(packageData.workersComp) / 100) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Health Insurance</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.healthInsurance) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Professional Liability</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.professionalLiability) || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Additional Costs</span>
              <span className="font-medium">
                {formatCurrency(
                  (Number(packageData.housing) || 0) + 
                  (Number(packageData.travel) || 0) + 
                  (Number(packageData.bonus) || 0) + 
                  (Number(packageData.otherCosts) || 0)
                )}
              </span>
            </div>
            
            <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between items-center font-semibold">
              <span className="text-neutral-700">Total Weekly Costs</span>
              <span className="text-error">
                {formatCurrency(Number(packageData.weeklyAgencyCosts) || 0)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-800 text-white p-4 rounded-md">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Weekly Margin</h4>
            <div className="flex items-center">
              <span className={`text-xl font-bold ${isPositiveMargin ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(Number(packageData.weeklyAgencyMargin) || 0)}
              </span>
              <span className="ml-2 text-sm text-neutral-300">
                {packageData.weeklyAgencyMargin && packageData.weeklyAgencyRevenue 
                  ? `${((Number(packageData.weeklyAgencyMargin) / Number(packageData.weeklyAgencyRevenue)) * 100).toFixed(1)}%` 
                  : '0.0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-heading font-semibold text-lg mb-4 pb-2 border-b border-neutral-200 text-neutral-700 flex items-center">
          <svg 
            className="text-primary mr-2 h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 10V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 14H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 10H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14C12 12.3431 13.3431 11 15 11H22C22.5523 11 23 11.4477 23 12V16C23 16.5523 22.5523 17 22 17H15C13.3431 17 12 15.6569 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Estimated Paycheck
        </h3>
        
        <div className="bg-neutral-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-neutral-700 mb-2">Weekly Gross Pay</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Taxable Wages</span>
              <span className="font-medium">
                {formatCurrency(taxableWages)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Non-Taxable Stipends</span>
              <span className="font-medium">
                {formatCurrency(Number(packageData.nonTaxableStipend) + Number(packageData.mealsStipend) + Number(packageData.travelStipend) || 0)}
              </span>
            </div>
            
            <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between items-center font-semibold">
              <span className="text-neutral-700">Total Gross Pay</span>
              <span className="text-primary">
                {formatCurrency(Number(packageData.weeklyGross) || 0)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-neutral-700 mb-2">Estimated Deductions</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Federal Income Tax (12%)</span>
              <span className="font-medium">
                {formatCurrency(-federalTax)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Social Security (6.2%)</span>
              <span className="font-medium">
                {formatCurrency(-socialSecurity)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Medicare (1.45%)</span>
              <span className="font-medium">
                {formatCurrency(-medicare)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">State Income Tax (4%)</span>
              <span className="font-medium">
                {formatCurrency(-stateTax)}
              </span>
            </div>
            
            <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between items-center font-semibold">
              <span className="text-neutral-700">Total Deductions</span>
              <span className="text-error">
                {formatCurrency(-totalDeductions)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-success bg-opacity-10 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-success">Estimated Net Pay (Weekly)</h4>
            <span className="text-xl font-bold text-success">
              {formatCurrency(netPay)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-green-200 flex justify-between items-center">
            <h4 className="font-medium text-success">Estimated Net Pay ({contractWeeks} Weeks)</h4>
            <span className="text-xl font-bold text-success">
              {formatCurrency(totalNetPay)}
            </span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={handlePrint}>
            <svg 
              className="mr-2 h-4 w-4" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 14H6V22H18V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Print
          </Button>
          
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-primary border-primary">
                <svg 
                  className="mr-2 h-4 w-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Pay Package via Email</DialogTitle>
                <DialogDescription>
                  Enter the email address to send this pay package to the provider.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="provider@example.com"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEmailSubmit} disabled={isEmailing}>
                  {isEmailing ? "Sending..." : "Send Email"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isSMSDialogOpen} onOpenChange={setIsSMSDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary-dark">
                <svg 
                  className="mr-2 h-4 w-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send SMS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Pay Package via SMS</DialogTitle>
                <DialogDescription>
                  Enter the phone number to send this pay package summary to the provider.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="phone-number" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSMSDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSMSSubmit} disabled={isSmsSending} className="bg-secondary hover:bg-secondary-dark">
                  {isSmsSending ? "Sending..." : "Send SMS"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

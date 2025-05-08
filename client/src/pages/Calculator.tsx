import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import InputSection from "@/components/calculator/InputSection";
import OutputSection from "@/components/calculator/OutputSection";
import HistoryTable from "@/components/calculator/HistoryTable";
import { useCalculate } from "@/hooks/use-calculate";
import { PayPackage } from "@shared/schema";

export default function Calculator() {
  const { toast } = useToast();
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [payPackage, setPayPackage] = useState<Partial<PayPackage>>({
    // Default values for standard burdens
    employerTaxes: 7.65,
    workersComp: 2.00,
    healthInsurance: 350.00,
    professionalLiability: 100.00,
    
    // Initialize all numeric fields to zero
    hoursPerWeek: 0,
    billRate: 0,
    regularPayRate: 0,
    overtimePayRate: 0,
    taxableStipend: 0,
    nonTaxableStipend: 0,
    mealsStipend: 0,
    travelStipend: 0,
    housing: 0,
    travel: 0,
    bonus: 0,
    otherCosts: 0,
    
    // Initialize calculation results to zero
    weeklyGross: 0,
    contractTotal: 0,
    weeklyAgencyRevenue: 0,
    totalAgencyRevenue: 0,
    weeklyAgencyCosts: 0,
    weeklyAgencyMargin: 0,
    weeklyNetPay: 0,
  });
  
  const { calculate } = useCalculate();
  
  // Fetch latest pay packages for history
  const { data: recentPackages = [], isLoading } = useQuery({
    queryKey: ['/api/pay-packages/recent'],
  });
  
  // Save pay package
  const { mutate: savePayPackage, isPending: isSaving } = useMutation({
    mutationFn: async (data: Partial<PayPackage>) => {
      const response = await apiRequest('POST', '/api/pay-packages', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pay package has been saved.",
      });
      // Refresh the recent packages list
      queryClient.invalidateQueries({ queryKey: ['/api/pay-packages/recent'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save pay package: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Email pay package
  const { mutate: emailPayPackage, isPending: isEmailing } = useMutation({
    mutationFn: async (data: { payPackageId: number, email: string }) => {
      const response = await apiRequest('POST', '/api/pay-packages/email', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pay package has been emailed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to email pay package: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // SMS pay package
  const { mutate: smsPayPackage, isPending: isSmsSending } = useMutation({
    mutationFn: async (data: { payPackageId: number, phoneNumber: string }) => {
      const response = await apiRequest('POST', '/api/pay-packages/sms', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pay package has been sent via SMS successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send SMS: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const handleCalculate = (formData: Partial<PayPackage>) => {
    const calculatedPackage = calculate(formData);
    setPayPackage(calculatedPackage);
    setCalculationComplete(true);
    
    // Auto-save the calculated package
    savePayPackage(calculatedPackage);
  };
  
  // Handle sending email
  const handleSendEmail = (email: string) => {
    if (!payPackage.id) {
      toast({
        title: "Error",
        description: "Please save the pay package first",
        variant: "destructive",
      });
      return;
    }
    
    emailPayPackage({
      payPackageId: payPackage.id,
      email
    });
  };
  
  // Handle sending SMS
  const handleSendSMS = (phoneNumber: string) => {
    if (!payPackage.id) {
      toast({
        title: "Error",
        description: "Please save the pay package first",
        variant: "destructive",
      });
      return;
    }
    
    smsPayPackage({
      payPackageId: payPackage.id,
      phoneNumber
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 p-6 md:p-8">
              <h2 className="font-heading font-bold text-2xl mb-3 text-neutral-800">Healthcare Pay Package Calculator</h2>
              <p className="text-neutral-600 mb-4">Create, calculate and share compensation packages for healthcare professionals. Input assignment details on the left, view results on the right.</p>
              <div className="flex flex-wrap gap-4">
                <button 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition flex items-center"
                  onClick={() => setCalculationComplete(false)}
                >
                  <i className="fas fa-plus mr-2"></i> New Package
                </button>
              </div>
            </div>
            <div className="md:w-1/3 bg-neutral-100 min-h-[200px]" style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}></div>
          </div>
        </div>
      </section>

      <section className="flex flex-col lg:flex-row gap-6">
        <InputSection 
          onCalculate={handleCalculate} 
          initialValues={payPackage} 
        />
        <OutputSection 
          packageData={payPackage} 
          calculated={calculationComplete}
          onSendEmail={handleSendEmail}
          onSendSMS={handleSendSMS}
          isEmailing={isEmailing}
          isSmsSending={isSmsSending}
        />
      </section>
      
      <section className="mt-8">
        <HistoryTable packages={recentPackages} isLoading={isLoading} />
      </section>
    </div>
  );
}

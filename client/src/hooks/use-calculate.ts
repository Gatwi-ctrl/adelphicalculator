import { PayPackage } from '@shared/schema';
import { calculateContractWeeks } from '@/lib/utils';

export function useCalculate() {
  const calculate = (data: Partial<PayPackage>): Partial<PayPackage> => {
    const {
      regularPayRate = 0,
      overtimePayRate = 0,
      taxableStipend = 0,
      nonTaxableStipend = 0,
      mealsStipend = 0,
      travelStipend = 0,
      hoursPerWeek = 0,
      billRate = 0,
      employerTaxes = 0,
      workersComp = 0,
      healthInsurance = 0,
      professionalLiability = 0,
      housing = 0,
      travel = 0,
      bonus = 0,
      otherCosts = 0,
      startDate,
      endDate,
    } = data;

    // Calculate contract duration in weeks
    const contractWeeks = calculateContractWeeks(startDate, endDate);

    // Weekly compensation calculations
    const regularPay = Number(regularPayRate) * Number(hoursPerWeek);
    const weeklyGross = regularPay + 
      Number(overtimePayRate) + 
      Number(taxableStipend) + 
      Number(nonTaxableStipend) + 
      Number(mealsStipend) + 
      Number(travelStipend);
    
    // Contract total
    const contractTotal = weeklyGross * contractWeeks;
    
    // Agency revenue
    const weeklyAgencyRevenue = Number(billRate) * Number(hoursPerWeek);
    const totalAgencyRevenue = weeklyAgencyRevenue * contractWeeks;
    
    // Agency costs
    const taxablePay = regularPay + Number(taxableStipend);
    const employerTaxAmount = taxablePay * (Number(employerTaxes) / 100);
    const workersCompAmount = regularPay * (Number(workersComp) / 100);
    const additionalCosts = Number(housing) + Number(travel) + Number(bonus) + Number(otherCosts);
    
    const weeklyAgencyCosts = weeklyGross + 
      employerTaxAmount + 
      workersCompAmount + 
      Number(healthInsurance) + 
      Number(professionalLiability) + 
      additionalCosts;
    
    // Agency margin
    const weeklyAgencyMargin = weeklyAgencyRevenue - weeklyAgencyCosts;
    
    // Estimated net pay
    const federalTax = taxablePay * 0.12;
    const socialSecurity = taxablePay * 0.062;
    const medicare = taxablePay * 0.0145;
    const stateTax = taxablePay * 0.04;
    const totalDeductions = federalTax + socialSecurity + medicare + stateTax;
    const weeklyNetPay = weeklyGross - totalDeductions;
    
    return {
      ...data,
      weeklyGross,
      contractTotal,
      weeklyAgencyRevenue,
      totalAgencyRevenue,
      weeklyAgencyCosts,
      weeklyAgencyMargin,
      weeklyNetPay
    };
  };

  return { calculate };
}

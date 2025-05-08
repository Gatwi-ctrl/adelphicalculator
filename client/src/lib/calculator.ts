import { PayPackage } from '@shared/schema';

/**
 * Calculate a pay package based on input data
 * 
 * This function performs all the necessary calculations for a healthcare pay package
 * including weekly gross, contract total, agency revenue and costs, and estimated paycheck
 */
export function calculatePayPackage(data: Partial<PayPackage>): Partial<PayPackage> {
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

  // Calculate contract duration
  let contractWeeks = 13; // Default to 13 weeks
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      contractWeeks = Math.ceil(diffDays / 7);
    }
  }

  // Convert all inputs to numbers to ensure calculations work correctly
  const numRegularPayRate = Number(regularPayRate);
  const numOvertimePayRate = Number(overtimePayRate);
  const numTaxableStipend = Number(taxableStipend);
  const numNonTaxableStipend = Number(nonTaxableStipend);
  const numMealsStipend = Number(mealsStipend);
  const numTravelStipend = Number(travelStipend);
  const numHoursPerWeek = Number(hoursPerWeek);
  const numBillRate = Number(billRate);
  const numEmployerTaxes = Number(employerTaxes);
  const numWorkersComp = Number(workersComp);
  const numHealthInsurance = Number(healthInsurance);
  const numProfessionalLiability = Number(professionalLiability);
  const numHousing = Number(housing);
  const numTravel = Number(travel);
  const numBonus = Number(bonus);
  const numOtherCosts = Number(otherCosts);

  // Weekly compensation calculations
  const regularPay = numRegularPayRate * numHoursPerWeek;
  const weeklyGross = regularPay + 
    numOvertimePayRate + 
    numTaxableStipend + 
    numNonTaxableStipend + 
    numMealsStipend + 
    numTravelStipend;
  
  // Contract total
  const contractTotal = weeklyGross * contractWeeks;
  
  // Agency revenue
  const weeklyAgencyRevenue = numBillRate * numHoursPerWeek;
  const totalAgencyRevenue = weeklyAgencyRevenue * contractWeeks;
  
  // Agency costs
  const taxablePay = regularPay + numTaxableStipend;
  const employerTaxAmount = taxablePay * (numEmployerTaxes / 100);
  const workersCompAmount = regularPay * (numWorkersComp / 100);
  const additionalCosts = numHousing + numTravel + numBonus + numOtherCosts;
  
  const weeklyAgencyCosts = weeklyGross + 
    employerTaxAmount + 
    workersCompAmount + 
    numHealthInsurance + 
    numProfessionalLiability + 
    additionalCosts;
  
  // Agency margin
  const weeklyAgencyMargin = weeklyAgencyRevenue - weeklyAgencyCosts;
  
  // Estimated net pay calculations
  const federalTax = taxablePay * 0.12;
  const socialSecurity = taxablePay * 0.062;
  const medicare = taxablePay * 0.0145;
  const stateTax = taxablePay * 0.04;
  const totalDeductions = federalTax + socialSecurity + medicare + stateTax;
  const weeklyNetPay = weeklyGross - totalDeductions;
  
  // Return calculated values
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
}

/**
 * Format a pay package for email content
 */
export function formatPayPackageForEmail(payPackage: PayPackage): string {
  const startDate = new Date(payPackage.startDate).toLocaleDateString();
  const endDate = new Date(payPackage.endDate).toLocaleDateString();
  const regularPay = Number(payPackage.regularPayRate) * Number(payPackage.hoursPerWeek);
  
  return `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #0073b6; }
        h2 { color: #4caf50; margin-top: 20px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777; }
        .highlight { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        table { width: 100%; border-collapse: collapse; }
        table td, table th { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .amount { text-align: right; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Healthcare Pay Package Details</h1>
        
        <p>Hello ${payPackage.providerName},</p>
        
        <p>Here are the details of your pay package with Adelphi Healthcare Staffing:</p>
        
        <div class="highlight">
          <h2>Assignment Information</h2>
          <table>
            <tr>
              <td>Provider:</td>
              <td>${payPackage.providerName}</td>
            </tr>
            <tr>
              <td>Specialty:</td>
              <td>${payPackage.specialty}</td>
            </tr>
            <tr>
              <td>Facility:</td>
              <td>${payPackage.facility}</td>
            </tr>
            <tr>
              <td>Location:</td>
              <td>${payPackage.location}</td>
            </tr>
            <tr>
              <td>Assignment Period:</td>
              <td>${startDate} to ${endDate}</td>
            </tr>
            <tr>
              <td>Hours Per Week:</td>
              <td>${payPackage.hoursPerWeek}</td>
            </tr>
          </table>
        </div>
        
        <h2>Weekly Pay Breakdown</h2>
        <table>
          <tr>
            <td>Regular Pay Rate:</td>
            <td class="amount">$${payPackage.regularPayRate}/hr</td>
          </tr>
          <tr>
            <td>Regular Pay (${payPackage.hoursPerWeek} hours):</td>
            <td class="amount">$${regularPay.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Overtime Pay:</td>
            <td class="amount">$${payPackage.overtimePayRate}</td>
          </tr>
          <tr>
            <td>Taxable Stipend:</td>
            <td class="amount">$${payPackage.taxableStipend}</td>
          </tr>
          <tr>
            <td>Non-Taxable Stipend:</td>
            <td class="amount">$${payPackage.nonTaxableStipend}</td>
          </tr>
          <tr>
            <td>Meals Stipend:</td>
            <td class="amount">$${payPackage.mealsStipend}</td>
          </tr>
          <tr>
            <td>Travel Stipend:</td>
            <td class="amount">$${payPackage.travelStipend}</td>
          </tr>
          <tr>
            <td><strong>Total Weekly Gross:</strong></td>
            <td class="amount" style="color: #0073b6;">$${payPackage.weeklyGross}</td>
          </tr>
        </table>
        
        <h2>Estimated Take-Home Pay</h2>
        <table>
          <tr>
            <td>Weekly Net Pay (after taxes):</td>
            <td class="amount">$${payPackage.weeklyNetPay}</td>
          </tr>
          <tr>
            <td>Total Contract Value:</td>
            <td class="amount" style="color: #4caf50;">$${payPackage.contractTotal}</td>
          </tr>
        </table>
        
        <p>If you have any questions about this pay package, please contact your Adelphi Healthcare representative.</p>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Adelphi Healthcare Staffing. All rights reserved.</p>
          <p>123 Healthcare Avenue, Suite 300, New York, NY 10001 | (800) 555-1234 | info@adelphihealthcare.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Calculate the hourly rate from a weekly rate and hours per week
 */
export function calculateHourlyRate(weeklyRate: number, hoursPerWeek: number): number {
  if (!hoursPerWeek || hoursPerWeek <= 0) return 0;
  return weeklyRate / hoursPerWeek;
}

/**
 * Calculate the percentage of two values
 */
export function calculatePercentage(value: number, total: number): string {
  if (!total || total === 0) return '0.0%';
  return ((value / total) * 100).toFixed(1) + '%';
}

/**
 * Create a shortened summary of a pay package suitable for SMS
 */
export function createPayPackageSummary(payPackage: PayPackage): string {
  const startDate = new Date(payPackage.startDate).toLocaleDateString();
  const endDate = new Date(payPackage.endDate).toLocaleDateString();
  
  return `
Pay Package Summary from Adelphi Healthcare:
- Provider: ${payPackage.providerName}
- Facility: ${payPackage.facility} (${payPackage.location})
- Period: ${startDate} - ${endDate}
- Weekly Gross: $${payPackage.weeklyGross}
- Est. Weekly Net: $${payPackage.weeklyNetPay}
- Total Contract: $${payPackage.contractTotal}

For complete details, please log in to your account or contact your recruiter.
  `.trim();
}

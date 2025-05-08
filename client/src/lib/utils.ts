import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a date as a string (MM/DD/YYYY)
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * Calculate the contract duration between two dates
 */
export function calculateContractDuration(startDate?: string | Date, endDate?: string | Date) {
  if (!startDate || !endDate) return null;
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.ceil(diffDays / 7);
  
  return {
    days: diffDays,
    weeks: diffWeeks
  };
}

/**
 * Calculate the number of weeks between two dates
 */
export function calculateContractWeeks(startDate?: string | Date, endDate?: string | Date): number {
  const duration = calculateContractDuration(startDate, endDate);
  return duration ? duration.weeks : 13; // Default to 13 weeks if dates are invalid
}

/**
 * Calculate the hourly rate from weekly rate and hours per week
 */
export function calculateHourlyRate(weeklyRate: number, hoursPerWeek: number): number {
  if (hoursPerWeek <= 0) return 0;
  return weeklyRate / hoursPerWeek;
}

/**
 * Parse a currency string into a number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
}

/**
 * Create a pay package summary for SMS messages
 */
export function createSMSPayPackageSummary(packageData: any): string {
  return `Pay Package Summary:
Provider: ${packageData.providerName}
Facility: ${packageData.facility}
Weekly Gross: ${formatCurrency(Number(packageData.weeklyGross))}
Contract Total: ${formatCurrency(Number(packageData.contractTotal))}
Estimated Net Pay: ${formatCurrency(Number(packageData.weeklyNetPay))}
View online for full details.`;
}

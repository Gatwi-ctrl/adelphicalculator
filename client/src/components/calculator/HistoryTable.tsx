import { PayPackage } from "@shared/schema";
import { formatCurrency, formatDate, calculateContractDuration } from "@/lib/utils";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Copy } from "lucide-react";

interface HistoryTableProps {
  packages: PayPackage[];
  isLoading: boolean;
}

export default function HistoryTable({ packages, isLoading }: HistoryTableProps) {
  const isPositiveMargin = (margin: number) => Number(margin) >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-heading font-semibold text-lg mb-6 pb-2 border-b border-neutral-200 text-neutral-700 flex items-center">
        <svg 
          className="text-primary mr-2 h-5 w-5" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.05078 11.0002C3.27508 7.60383 5.52308 4.75983 8.64078 3.76683C11.7585 2.77383 15.1488 3.87083 17.0708 6.54883C18.9928 9.22683 18.9928 12.7732 17.0708 15.4512C15.1488 18.1292 11.7585 19.2262 8.64078 18.2332C5.52308 17.2402 3.27508 14.3962 3.05078 10.9992" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Recent Pay Packages
      </h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Weekly Pay</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading recent pay packages...
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No pay packages found. Create your first pay package above.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => {
                const duration = calculateContractDuration(pkg.startDate, pkg.endDate);
                
                return (
                  <TableRow key={pkg.id} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{pkg.providerName}</TableCell>
                    <TableCell>{pkg.facility}</TableCell>
                    <TableCell>{pkg.location}</TableCell>
                    <TableCell>{duration ? `${duration.weeks} weeks` : 'N/A'}</TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatCurrency(Number(pkg.weeklyGross))}
                    </TableCell>
                    <TableCell className={`font-medium ${isPositiveMargin(Number(pkg.weeklyAgencyMargin)) ? 'text-success' : 'text-error'}`}>
                      {formatCurrency(Number(pkg.weeklyAgencyMargin))}
                    </TableCell>
                    <TableCell>{formatDate(new Date(pkg.createdAt))}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" asChild title="View">
                          <Link to={`/calculator/${pkg.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Edit">
                          <Link to={`/calculator/${pkg.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Duplicate">
                          <Link to={`/calculator/${pkg.id}/duplicate`}>
                            <Copy className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {packages.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-neutral-600">Showing {packages.length} of {packages.length} entries</div>
          <Link to="/history">
            <Button variant="link" className="text-primary">
              View All Pay Packages
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

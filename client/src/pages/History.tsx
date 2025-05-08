import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PayPackage } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, Edit, Copy, Search } from "lucide-react";
import { Link } from "wouter";

export default function History() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery<PayPackage[]>({
    queryKey: ['/api/pay-packages'],
  });

  const packages = data || [];
  
  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg => 
    pkg.providerName.toLowerCase().includes(search.toLowerCase()) ||
    pkg.facility.toLowerCase().includes(search.toLowerCase()) ||
    pkg.location.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPackages.length / pageSize);
  const pagePackages = filteredPackages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const isPositiveMargin = (margin: number) => Number(margin) >= 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Pay Package History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            View and manage all previously created pay packages. Search by provider name, facility, or location.
          </p>
          
          <div className="relative mb-6">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pay packages..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
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
                      Loading pay packages...
                    </TableCell>
                  </TableRow>
                ) : pagePackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No pay packages found. Try adjusting your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagePackages.map((pkg) => {
                    const startDate = new Date(pkg.startDate);
                    const endDate = new Date(pkg.endDate);
                    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
                    
                    return (
                      <TableRow key={pkg.id} className="hover:bg-neutral-50">
                        <TableCell className="font-medium">{pkg.providerName}</TableCell>
                        <TableCell>{pkg.facility}</TableCell>
                        <TableCell>{pkg.location}</TableCell>
                        <TableCell>{`${diffWeeks} weeks`}</TableCell>
                        <TableCell className="font-medium text-primary">
                          {formatCurrency(Number(pkg.weeklyGross))}
                        </TableCell>
                        <TableCell className={`font-medium ${isPositiveMargin(Number(pkg.weeklyAgencyMargin)) ? 'text-success' : 'text-error'}`}>
                          {formatCurrency(Number(pkg.weeklyAgencyMargin))}
                        </TableCell>
                        <TableCell>{formatDate(new Date(pkg.createdAt))}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/calculator/${pkg.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/calculator/${pkg.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
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

          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-neutral-600">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPackages.length)} of {filteredPackages.length} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, idx) => (
                  <Button
                    key={idx}
                    variant={currentPage === idx + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  entryType: string;
  createdAt: string;
  updatedAt: string;
  payPackageId: number;
}

interface JournalEntryListProps {
  entries: JournalEntry[];
  onDelete: (id: number) => void;
}

export default function JournalEntryList({ entries, onDelete }: JournalEntryListProps) {
  // Helper function to get badge color based on entry type
  const getEntryTypeBadge = (type: string) => {
    switch (type) {
      case 'note':
        return <Badge variant="secondary">Note</Badge>;
      case 'response':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Provider Response</Badge>;
      case 'followup':
        return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Follow-up</Badge>;
      case 'call':
        return <Badge variant="default">Phone Call</Badge>;
      case 'email':
        return <Badge variant="outline">Email</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{entry.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getEntryTypeBadge(entry.entryType)}
                  <span className="text-xs text-gray-500">
                    {format(new Date(entry.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line">{entry.content}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
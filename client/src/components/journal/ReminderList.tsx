import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CalendarClock, Clock } from "lucide-react";

interface Reminder {
  id: number;
  title: string;
  description: string | null;
  dueDate: string; // ISO date string
  priority: string;
  isCompleted: boolean;
  payPackageId: number;
  createdAt: string;
}

interface ReminderListProps {
  reminders: Reminder[];
  onComplete: (id: number, isCompleted: boolean) => void;
  onDelete: (id: number) => void;
}

export default function ReminderList({ reminders, onComplete, onDelete }: ReminderListProps) {
  // Sort reminders by due date (incomplete first) and then by priority
  const sortedReminders = [...reminders].sort((a, b) => {
    // First sort by completion status
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    
    // Then sort by due date
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // Finally sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - 
           priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  // Helper function to get badge color based on priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Helper function to get due date display
  const getDueDateDisplay = (dateString: string) => {
    const dueDate = new Date(dateString);
    
    if (isToday(dueDate)) {
      return (
        <div className="flex items-center text-orange-500">
          <Clock className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">Today</span>
        </div>
      );
    } else if (isTomorrow(dueDate)) {
      return (
        <div className="flex items-center text-blue-500">
          <CalendarClock className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">Tomorrow</span>
        </div>
      );
    } else if (isPast(dueDate)) {
      return (
        <div className="flex items-center text-red-500">
          <Clock className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">Overdue - {format(dueDate, "MMM d")}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          <CalendarClock className="h-3 w-3 mr-1" />
          <span className="text-xs">{format(dueDate, "MMM d, yyyy")}</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-3">
      {sortedReminders.map((reminder) => (
        <Card 
          key={reminder.id} 
          className={cn(
            "overflow-hidden transition-all",
            reminder.isCompleted ? "opacity-60" : ""
          )}
        >
          <CardHeader className="p-4 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <Checkbox 
                  id={`reminder-${reminder.id}`}
                  checked={reminder.isCompleted} 
                  onCheckedChange={(checked) => onComplete(reminder.id, !!checked)}
                  className="mt-1"
                />
                <div>
                  <CardTitle 
                    className={cn(
                      "text-base font-medium",
                      reminder.isCompleted && "line-through text-gray-500"
                    )}
                  >
                    {reminder.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {getPriorityBadge(reminder.priority)}
                    {getDueDateDisplay(reminder.dueDate)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500"
                onClick={() => onDelete(reminder.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {reminder.description && (
            <CardContent className="pt-2 pb-4 px-4">
              <p className="text-sm text-gray-600 ml-7 whitespace-pre-line">
                {reminder.description}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

// Helper function
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
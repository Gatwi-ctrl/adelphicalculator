import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  Settings,
  Grid3X3,
  Plus,
  X,
  Move,
  Bell,
  BarChart,
  Calendar,
  Clock,
  UserCircle,
  Mail,
  MessageSquare,
  FileText
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format } from "date-fns";

// Define dashboard widget types for strong typing
type WidgetType = 
  | 'upcoming-reminders'
  | 'recent-activity'
  | 'performance-metrics'
  | 'quick-actions'
  | 'recent-pay-packages'
  | 'journal-entries'
  | 'calendar-view'
  | 'profile-summary';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  color?: string;
  icon: React.ReactNode;
}

// Define the dashboard layout state interface
interface DashboardLayout {
  widgets: Widget[];
}

export default function Account() {
  // Default dashboard layout with widgets
  const defaultLayout: DashboardLayout = {
    widgets: [
      {
        id: 'upcoming-reminders',
        type: 'upcoming-reminders',
        title: 'Upcoming Reminders',
        description: 'Your tasks and reminders for the week',
        size: 'medium',
        color: 'bg-blue-50 border-blue-200',
        icon: <Bell className="h-5 w-5 text-blue-500" />
      },
      {
        id: 'performance-metrics',
        type: 'performance-metrics',
        title: 'Performance Metrics',
        description: 'Key performance indicators and statistics',
        size: 'medium',
        color: 'bg-green-50 border-green-200',
        icon: <BarChart className="h-5 w-5 text-green-500" />
      },
      {
        id: 'recent-activity',
        type: 'recent-activity',
        title: 'Recent Activity',
        description: 'Latest updates and communications',
        size: 'small',
        color: 'bg-purple-50 border-purple-200',
        icon: <Clock className="h-5 w-5 text-purple-500" />
      },
      {
        id: 'quick-actions',
        type: 'quick-actions',
        title: 'Quick Actions',
        description: 'Frequently used tools and shortcuts',
        size: 'small',
        color: 'bg-amber-50 border-amber-200',
        icon: <Grid3X3 className="h-5 w-5 text-amber-500" />
      }
    ]
  };

  // Available widgets for adding to dashboard
  const availableWidgets: Widget[] = [
    ...defaultLayout.widgets,
    {
      id: 'recent-pay-packages',
      type: 'recent-pay-packages',
      title: 'Recent Pay Packages',
      description: 'Recently created and updated pay packages',
      size: 'medium',
      color: 'bg-indigo-50 border-indigo-200',
      icon: <FileText className="h-5 w-5 text-indigo-500" />
    },
    {
      id: 'journal-entries',
      type: 'journal-entries',
      title: 'Journal Entries',
      description: 'Recent notes and communications',
      size: 'medium',
      color: 'bg-cyan-50 border-cyan-200',
      icon: <MessageSquare className="h-5 w-5 text-cyan-500" />
    },
    {
      id: 'calendar-view',
      type: 'calendar-view',
      title: 'Calendar View',
      description: 'Upcoming events and due dates',
      size: 'large',
      color: 'bg-rose-50 border-rose-200',
      icon: <Calendar className="h-5 w-5 text-rose-500" />
    },
    {
      id: 'profile-summary',
      type: 'profile-summary',
      title: 'Profile Summary',
      description: 'Your account information and settings',
      size: 'small',
      color: 'bg-slate-50 border-slate-200',
      icon: <UserCircle className="h-5 w-5 text-slate-500" />
    }
  ];

  // State for the current dashboard layout
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>(
    () => {
      // Load from localStorage if available
      const savedLayout = localStorage.getItem('dashboardLayout');
      return savedLayout ? JSON.parse(savedLayout) : defaultLayout;
    }
  );

  // State for widget customization
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // State for unused widgets that can be added
  const [unusedWidgets, setUnusedWidgets] = useState<Widget[]>([]);

  // Fetch reminders for the upcoming reminders widget
  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const response = await fetch('/api/reminders');
      if (!response.ok) throw new Error('Failed to fetch reminders');
      return response.json();
    }
  });
  
  // Fetch recent packages for the metrics widget
  const { data: recentPackages = [] } = useQuery({
    queryKey: ['/api/pay-packages/recent'],
    queryFn: async () => {
      const response = await fetch('/api/pay-packages/recent');
      if (!response.ok) throw new Error('Failed to fetch recent packages');
      return response.json();
    }
  });
  
  // Fetch journal entries for the journal widget
  const { data: journalEntries = [] } = useQuery({
    queryKey: ['journal'],
    queryFn: async () => {
      const response = await fetch('/api/journal');
      if (!response.ok) throw new Error('Failed to fetch journal entries');
      return response.json();
    }
  });

  // Update the unused widgets whenever dashboard layout changes
  useEffect(() => {
    const currentWidgetIds = dashboardLayout.widgets.map(w => w.id);
    const filtered = availableWidgets.filter(w => !currentWidgetIds.includes(w.id));
    setUnusedWidgets(filtered);
    
    // Save layout to localStorage
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
  }, [dashboardLayout]);

  // Handle drag and drop to reorder widgets
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(dashboardLayout.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setDashboardLayout({ widgets: items });
  };

  // Function to add a widget to the dashboard
  const addWidget = (widgetId: string) => {
    const widgetToAdd = availableWidgets.find(w => w.id === widgetId);
    if (!widgetToAdd) return;
    
    setDashboardLayout({
      widgets: [...dashboardLayout.widgets, widgetToAdd]
    });
  };

  // Function to remove a widget from the dashboard
  const removeWidget = (widgetId: string) => {
    setDashboardLayout({
      widgets: dashboardLayout.widgets.filter(w => w.id !== widgetId)
    });
  };

  // Reset dashboard to default layout
  const resetDashboard = () => {
    setDashboardLayout(defaultLayout);
    toast({
      title: "Dashboard Reset",
      description: "Your dashboard has been reset to the default layout."
    });
  };

  // Get CSS class for widget size
  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-1';
    }
  };

  // Render content for each widget type
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'upcoming-reminders':
        return (
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming reminders</p>
            ) : (
              reminders.slice(0, 3).map((reminder: any) => (
                <div key={reminder.id} className="flex items-start gap-2 border-b pb-2">
                  <Bell className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(reminder.dueDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'performance-metrics':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <p className="text-xs font-medium text-green-800">Weekly Packages</p>
              <p className="text-xl font-bold text-green-900">{recentPackages.length}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <p className="text-xs font-medium text-blue-800">Avg. Margin</p>
              <p className="text-xl font-bold text-blue-900">$2,450</p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3">
              <p className="text-xs font-medium text-amber-800">Placements</p>
              <p className="text-xl font-bold text-amber-900">3</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <p className="text-xs font-medium text-purple-800">Communications</p>
              <p className="text-xl font-bold text-purple-900">{journalEntries.length}</p>
            </div>
          </div>
        );

      case 'recent-activity':
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-green-500"></div>
              <span>Package created for John Smith</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500"></div>
              <span>Email sent to Sarah Johnson</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-amber-500"></div>
              <span>Reminder completed</span>
            </div>
          </div>
        );

      case 'quick-actions':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="h-auto py-2 justify-start">
              <FileText className="h-4 w-4 mr-2" />
              New Package
            </Button>
            <Button size="sm" variant="outline" className="h-auto py-2 justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
            <Button size="sm" variant="outline" className="h-auto py-2 justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button size="sm" variant="outline" className="h-auto py-2 justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        );

      case 'recent-pay-packages':
        return (
          <div className="space-y-3">
            {recentPackages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent packages</p>
            ) : (
              recentPackages.slice(0, 3).map((pkg: any) => (
                <div key={pkg.id} className="flex items-start gap-2 border-b pb-2">
                  <FileText className="h-4 w-4 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{pkg.providerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {pkg.facility}, ${Number(pkg.weeklyGross).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'journal-entries':
        return (
          <div className="space-y-3">
            {journalEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No journal entries</p>
            ) : (
              journalEntries.slice(0, 3).map((entry: any) => (
                <div key={entry.id} className="flex items-start gap-2 border-b pb-2">
                  <MessageSquare className="h-4 w-4 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'calendar-view':
        return (
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium">{day}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const isToday = i === 15;
              const hasEvent = [3, 8, 12, 17, 22].includes(i);
              return (
                <div 
                  key={i} 
                  className={`text-center p-1 text-xs rounded-md
                    ${isToday ? 'bg-blue-100 text-blue-800 font-medium' : ''}
                    ${hasEvent && !isToday ? 'bg-gray-100' : ''}
                  `}
                >
                  {i + 1}
                  {hasEvent && <div className="h-1 w-1 mx-auto mt-0.5 rounded-full bg-blue-500"></div>}
                </div>
              );
            })}
          </div>
        );

      case 'profile-summary':
        return (
          <div className="flex flex-col items-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-sm font-medium">Demo User</p>
            <Button size="sm" variant="outline" className="w-full">Edit Profile</Button>
          </div>
        );

      default:
        return <p>Widget content not available</p>;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setIsCustomizing(!isCustomizing)}
            variant={isCustomizing ? "default" : "outline"}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isCustomizing ? "Done" : "Customize"}
          </Button>
          {isCustomizing && (
            <Button variant="outline" onClick={resetDashboard}>
              Reset Layout
            </Button>
          )}
        </div>
      </div>

      {isCustomizing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Widgets</CardTitle>
            <CardDescription>
              Drag and drop widgets to reorder. Add or remove widgets to customize your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {unusedWidgets.map((widget) => (
                <div 
                  key={widget.id}
                  className={`p-3 border rounded-md flex justify-between items-center ${widget.color || 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2">
                    {widget.icon}
                    <span className="text-sm font-medium">{widget.title}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => addWidget(widget.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets" direction="horizontal">
            {(provided) => (
              <div 
                className="grid grid-cols-3 gap-4 w-full"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {dashboardLayout.widgets.map((widget, index) => (
                  <Draggable 
                    key={widget.id} 
                    draggableId={widget.id} 
                    index={index}
                    isDragDisabled={!isCustomizing}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${getWidgetSizeClass(widget.size)}`}
                      >
                        <Card className={`h-full ${widget.color || ''}`}>
                          <CardHeader className="pb-2 flex-row justify-between items-start space-y-0 space-x-0">
                            <div className="flex items-center gap-2">
                              {widget.icon}
                              <CardTitle className="text-base">{widget.title}</CardTitle>
                            </div>
                            {isCustomizing && (
                              <div className="flex items-center">
                                <div {...provided.dragHandleProps}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Move className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-red-500 hover:text-red-700"
                                  onClick={() => removeWidget(widget.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </CardHeader>
                          <CardContent>
                            {renderWidgetContent(widget)}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
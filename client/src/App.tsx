import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Calculator from "@/pages/Calculator";
import History from "@/pages/History";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import JournalIndex from "@/pages/JournalIndex";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/history" component={History} />
      <Route path="/journal" component={JournalIndex} />
      <Route path="/journal/:id" component={Journal} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-neutral-50">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

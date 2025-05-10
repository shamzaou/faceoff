import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import UpcomingEvents from "@/pages/upcoming-events";
import PastEvents from "@/pages/past-events";
import EventDetail from "@/pages/event-detail";
import AdminDashboard from "@/pages/admin/dashboard";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/upcoming-events" component={UpcomingEvents} />
          <Route path="/past-events" component={PastEvents} />
          <Route path="/events/:id" component={EventDetail} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;

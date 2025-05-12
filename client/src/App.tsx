import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import UpcomingEvents from "@/pages/upcoming-events";
import PastEvents from "@/pages/past-events";
import EventDetail from "@/pages/event-detail";
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/users";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ProfilePage from "@/pages/profile";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import { AuthProvider } from "@/provider/auth-provider";
import ProtectedRoute from "@/components/auth/protected-route";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/upcoming-events" component={UpcomingEvents} />
          <Route path="/past-events" component={PastEvents} />
          <Route path="/events/:id" component={EventDetail} />
          <Route path="/profile">
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Route>
          <Route path="/admin">
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/users">
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;

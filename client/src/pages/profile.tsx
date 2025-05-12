import { useState, useEffect } from "react";
import { useAuth } from "@/provider/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Event } from "@shared/schema";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // If user is not authenticated and not loading, redirect to login
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to view your profile",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsEventsLoading(true);
        setError(null);
        
        // Log the authentication state to debug
        console.log("Auth state:", { isAuthenticated, userId: user?.id });
        
        const response = await fetch("/api/user/registrations", {
          // Include credentials to ensure cookies are sent
          credentials: "include",
          headers: {
            // Explicitly request JSON
            'Accept': 'application/json'
          }
        });
        
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(Array.from(response.headers.entries())));
        
        // Get raw text first to inspect the response
        const responseText = await response.text();
        console.log("Raw response:", responseText.substring(0, 500));
        
        if (!response.ok) {
          // If the response starts with HTML, it's likely a server error page
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
          }
          
          // Try to parse JSON error if possible
          try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData?.message || `Failed to fetch: ${response.status} ${response.statusText}`);
          } catch (parseError) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          }
        }
        
        // Try to parse JSON response
        let data;
        try {
          // Don't try to parse if we get HTML
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            throw new Error("Response is HTML, not JSON");
          }
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          throw new Error(`Server returned invalid JSON. Check console for details.`);
        }
        
        setRegisteredEvents(data);
      } catch (error) {
        console.error("Error fetching registered events:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load your registered events";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsEventsLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, [isAuthenticated, toast, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>
              You need to log in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => navigate("/login")}>
              Go to Login
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                try {
                  toast({
                    title: "Please wait",
                    description: "Logging in with test account...",
                  });
                  
                  const response = await fetch("/api/auth/test-login", {
                    credentials: "include"
                  });
                  
                  if (response.ok) {
                    toast({
                      title: "Success",
                      description: "Logged in with test account",
                    });
                    window.location.reload();
                  } else {
                    throw new Error("Failed to log in with test account");
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to log in with test account",
                    variant: "destructive",
                  });
                }
              }}
            >
              Use Test Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get initials for avatar
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Format event date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500";
      case "ongoing":
        return "bg-green-500";
      case "past":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{user.displayName || user.username}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
            {user.role === "admin" && (
              <Badge className="mt-2" variant="outline">
                Admin
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{user.email || "No email provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
                <p className="capitalize">{user.role}</p>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/upcoming-events")}
              >
                Browse Events
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
            <CardDescription>
              Events you're registered to attend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="all">All Events</TabsTrigger>
              </TabsList>
              
              {isEventsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              ) : registeredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't registered for any events yet.</p>
                  <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2">
                    <Button 
                      onClick={() => navigate("/upcoming-events")}
                    >
                      Browse Events
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          toast({
                            title: "Please wait",
                            description: "Registering you for test events...",
                          });
                          
                          const response = await fetch("/api/test/register-events", {
                            credentials: "include",
                            headers: {
                              'Accept': 'application/json'
                            }
                          });
                          
                          console.log("Test registration response status:", response.status);
                          const responseText = await response.text();
                          console.log("Test registration raw response:", responseText.substring(0, 500));
                          
                          let responseData;
                          try {
                            responseData = JSON.parse(responseText);
                          } catch (parseError) {
                            console.error("Error parsing test registration response:", parseError);
                            throw new Error("Invalid JSON response from server");
                          }
                          
                          if (response.ok) {
                            toast({
                              title: "Success",
                              description: `You've been registered for ${responseData.registrations?.length || 0} test events!`,
                            });
                            
                            // Reload registered events
                            setIsEventsLoading(true);
                            setError(null);
                            const eventsResponse = await fetch("/api/user/registrations", {
                              credentials: "include",
                              headers: {
                                'Accept': 'application/json'
                              }
                            });
                            
                            const eventsText = await eventsResponse.text();
                            
                            if (eventsResponse.ok) {
                              try {
                                const data = JSON.parse(eventsText);
                                setRegisteredEvents(data);
                              } catch (parseError) {
                                console.error("Error parsing events response:", parseError);
                                throw new Error("Invalid JSON in events response");
                              }
                            } else {
                              throw new Error(`Failed to reload events: ${eventsResponse.status}`);
                            }
                          } else {
                            throw new Error(responseData?.message || "Failed to register for test events");
                          }
                        } catch (error) {
                          console.error("Registration error:", error);
                          toast({
                            title: "Error",
                            description: error instanceof Error ? error.message : "Failed to register for test events",
                            variant: "destructive",
                          });
                        } finally {
                          setIsEventsLoading(false);
                        }
                      }}
                    >
                      Register for Test Events
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <TabsContent value="upcoming">
                    <EventList 
                      events={registeredEvents.filter(e => 
                        e.status === "upcoming" || e.status === "ongoing"
                      )} 
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                    />
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <EventList 
                      events={registeredEvents.filter(e => e.status === "past")} 
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                    />
                  </TabsContent>
                  
                  <TabsContent value="all">
                    <EventList 
                      events={registeredEvents} 
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface EventListProps {
  events: Event[];
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
}

function EventList({ events, formatDate, getStatusColor }: EventListProps) {
  const [, navigate] = useLocation();
  
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No events found in this category.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div 
          key={event.id} 
          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/events/${event.id}`)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{event.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {event.description}
              </p>
            </div>
            <Badge className={`${getStatusColor(event.status)} text-white`}>
              {event.status}
            </Badge>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              {event.time}
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              {event.location}
            </div>
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              {event.attendees} {event.attendees === 1 ? "attendee" : "attendees"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
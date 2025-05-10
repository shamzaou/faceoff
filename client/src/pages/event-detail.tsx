import { useParams, useLocation } from "wouter";
import { useEvents } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date-formatter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isUpcomingOrOngoing } from "@/lib/utils/date-formatter";
import { useToast } from "@/hooks/use-toast";

export default function EventDetail() {
  const params = useParams();
  const id = params?.id || "0";
  const eventId = parseInt(id);
  const { getEvent, registerForEvent } = useEvents();
  const { data: event, isLoading, error } = getEvent(eventId);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleRegister = async () => {
    try {
      await registerForEvent.mutateAsync(eventId);
      toast({
        title: "Success!",
        description: "You have been registered for this event.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register. You may need to log in first.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <nav className="flex mb-5 text-sm text-gray-500 dark:text-gray-400">
            <span 
              onClick={() => navigate("/")}
              className="hover:text-primary dark:hover:text-primary-400 transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Events
            </span>
          </nav>
          
          <Card>
            <Skeleton className="h-72 sm:h-96 w-full" />
            <CardContent className="p-6 sm:p-8">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Skeleton className="h-6 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-6" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="ml-4">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-40 w-full rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The event you're looking for doesn't exist or there was an error loading it.
            </p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-gray-500 dark:text-gray-400">
          <span 
            onClick={() => navigate("/")}
            className="hover:text-primary dark:hover:text-primary-400 transition-colors duration-200 cursor-pointer"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </span>
        </nav>

        {/* Event Detail Card */}
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="relative h-72 sm:h-96">
            <img 
              src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&h=500'} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            
            {/* Status badge */}
            <div className="absolute top-4 right-4">
              {event.status === 'upcoming' && (
                <Badge className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Upcoming
                </Badge>
              )}
              {event.status === 'ongoing' && (
                <Badge className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 animate-pulse-slow">
                  Ongoing
                </Badge>
              )}
              {event.status === 'past' && (
                <Badge className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Past
                </Badge>
              )}
            </div>
            
            {/* Category badge */}
            <div className="absolute bottom-4 left-4">
              <Badge className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {event.category}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold mb-2">About the Event</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{event.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Date</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Time</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Location</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Organizer</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.organizer}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4">Registration</h2>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Attendees</span>
                    <span className="text-sm font-medium">{event.attendees} registered</span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!isUpcomingOrOngoing(event.status)}
                    onClick={handleRegister}
                  >
                    {isUpcomingOrOngoing(event.status) ? 'Register for Event' : 'Event has ended'}
                  </Button>
                  
                  <div className="mt-4 flex justify-between">
                    <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Add to calendar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

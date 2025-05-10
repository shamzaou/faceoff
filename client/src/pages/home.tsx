import { useEvents } from "@/hooks/use-events";
import EventList from "@/components/events/event-list";
import EventSearch from "@/components/events/event-search";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { events, upcomingEvents, isLoading } = useEvents();
  
  const featuredEvents = upcomingEvents.slice(0, 3);
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative bg-primary-700 dark:bg-primary-800 rounded-lg shadow-xl overflow-hidden mb-8">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-700/90 to-primary-800/70">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&h=500" 
            alt="Event management background" 
            className="h-full w-full object-cover mix-blend-overlay opacity-50"
          />
        </div>
        <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
          <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block text-white">Discover Amazing Events</span>
            <span className="block text-primary-200">Connect with the Community</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-center text-xl text-primary-100 sm:max-w-3xl">
            Browse upcoming workshops, conferences, and hackathons. Join the tech community and expand your network.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <Link href="/upcoming-events">
                <Button variant="secondary" className="flex w-full items-center justify-center px-4 py-3 text-primary-700 bg-white hover:bg-primary-50">
                  Browse Events
                </Button>
              </Link>
              <Button className="flex w-full items-center justify-center px-4 py-3 bg-primary-500 bg-opacity-80 hover:bg-opacity-100">
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <EventSearch />

      {/* Event Cards */}
      <EventList title="Featured Events" events={featuredEvents} loading={isLoading} />
    </div>
  );
}

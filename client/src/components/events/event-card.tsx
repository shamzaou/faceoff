import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";
import { formatDate } from "@/lib/utils/date-formatter";
import { useEventContext } from "@/provider/event-provider";
import { useLocation } from "wouter";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const { setSelectedEvent } = useEventContext();
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setSelectedEvent(event);
    setLocation(`/events/${event.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div className="relative">
        {/* Event image */}
        <div className="h-48 w-full">
          <img 
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&h=500'} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          {event.status === 'upcoming' && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Upcoming
            </Badge>
          )}
          {event.status === 'ongoing' && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 animate-pulse-slow">
              Ongoing
            </Badge>
          )}
          {event.status === 'past' && (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              Past
            </Badge>
          )}
        </div>
        
        {/* Category badge */}
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {event.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{event.title}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>{event.attendees}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

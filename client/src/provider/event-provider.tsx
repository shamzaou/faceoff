import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface EventContextType {
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  events: Event[];
  isLoading: boolean;
  error: Error | null;
  filteredEvents: Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: events = [], isLoading, error } = useQuery<Event[]>({ 
    queryKey: ['/api/events'],
    queryFn: () => apiRequest("/api/events"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter events based on search and status filter
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <EventContext.Provider
      value={{
        selectedEvent,
        setSelectedEvent,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        events,
        isLoading,
        error: error as Error | null,
        filteredEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
}

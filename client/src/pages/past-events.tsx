import { useEvents } from "@/hooks/use-events";
import EventList from "@/components/events/event-list";
import EventSearch from "@/components/events/event-search";

export default function PastEvents() {
  const { pastEvents, isLoading } = useEvents();
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Search and Filters */}
      <EventSearch />

      {/* Event Cards */}
      <EventList title="Past Events" events={pastEvents} loading={isLoading} />
    </div>
  );
}

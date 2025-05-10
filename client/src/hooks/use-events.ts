import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Event, InsertEvent } from '@shared/schema';

export function useEvents() {
  const queryClient = useQueryClient();
  
  // Get all events
  const { data: events = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  // Get upcoming events
  const { data: upcomingEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/upcoming'],
  });
  
  // Get past events
  const { data: pastEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/past'],
  });
  
  // Get event by ID
  const getEvent = (id: number) => {
    return useQuery<Event>({
      queryKey: ['/api/events', id],
      queryFn: async () => {
        const res = await apiRequest('GET', `/api/events/${id}`);
        return res.json();
      },
    });
  };
  
  // Create event
  const createEvent = useMutation({
    mutationFn: async (eventData: InsertEvent) => {
      const res = await apiRequest('POST', '/api/events', eventData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
    },
  });
  
  // Update event
  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertEvent> }) => {
      const res = await apiRequest('PUT', `/api/events/${id}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
    },
  });
  
  // Delete event
  const deleteEvent = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/events/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
    },
  });
  
  // Register for event
  const registerForEvent = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest('POST', `/api/events/${eventId}/register`);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', variables] });
    },
  });
  
  return {
    events,
    upcomingEvents,
    pastEvents,
    isLoading,
    error,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
  };
}

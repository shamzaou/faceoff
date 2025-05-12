export function formatDate(dateString: Date | string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(dateString);
  }
}

export function formatTime(timeString: string): string {
  if (!timeString) return '';
  
  if (timeString.includes('-')) {
    const [start, end] = timeString.split('-').map(t => t.trim());
    return `${formatTimeSegment(start)} - ${formatTimeSegment(end)}`;
  }
  
  return formatTimeSegment(timeString);
}

function formatTimeSegment(timeSegment: string): string {
  try {
    if (timeSegment.includes(' ')) {
      return timeSegment.split(' ')[1];
    }
    
    return timeSegment;
  } catch (error) {
    console.error("Error formatting time segment:", error);
    return timeSegment;
  }
}

export function formatDateTime(date: Date | string, time: string): string {
  return `${formatDate(date)}, ${formatTime(time)}`;
}

export function determineEventStatus(dateStr: string, timeStr: string): 'upcoming' | 'ongoing' | 'past' {
  const today = new Date();
  const eventDate = new Date(dateStr);
  
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  
  if (eventDateOnly < todayDate) {
    return 'past';
  }
  
  if (eventDateOnly > todayDate) {
    return 'upcoming';
  }
  
  if (timeStr) {
    try {
      if (timeStr.includes('-')) {
        const [startTime, endTime] = timeStr.split('-').map(t => t.trim());
        
        let endHours = 0, endMinutes = 0;
        
        if (endTime.includes(' ')) {
          const timePart = endTime.split(' ')[1];
          [endHours, endMinutes] = timePart.split(':').map(Number);
        } else {
          [endHours, endMinutes] = endTime.split(':').map(Number);
        }
        
        const endTimeDate = new Date(today);
        endTimeDate.setHours(endHours, endMinutes, 0, 0);
        
        if (today > endTimeDate) {
          return 'past';
        }
        
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const startTimeDate = new Date(today);
        startTimeDate.setHours(startHours, startMinutes, 0, 0);
        
        if (today < startTimeDate) {
          return 'upcoming';
        }
        
        return 'ongoing';
      } else {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const startTime = new Date(today);
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);
        
        if (today < startTime) {
          return 'upcoming';
        }
        
        if (today >= startTime && today <= endTime) {
          return 'ongoing';
        }
        
        return 'past';
      }
    } catch (error) {
      console.error("Error parsing time for status determination:", error);
      return 'ongoing';
    }
  }
  
  return 'ongoing';
}

export function updateEventStatus(event: any): any {
  if (!event) return event;
  
  const calculatedStatus = determineEventStatus(event.date, event.time);
  
  if (event.status !== calculatedStatus) {
    return { ...event, status: calculatedStatus };
  }
  
  return event;
}

export function filterEventsByStatus(events: any[], requestedStatus: 'upcoming' | 'ongoing' | 'past' | 'all'): any[] {
  if (!events) return [];
  
  const updatedEvents = events.map(updateEventStatus);
  
  if (requestedStatus === 'all') {
    return updatedEvents;
  }
  
  if (requestedStatus === 'upcoming') {
    return updatedEvents.filter(event => event.status === 'upcoming');
  }
  
  if (requestedStatus === 'ongoing') {
    return updatedEvents.filter(event => event.status === 'ongoing');
  }
  
  if (requestedStatus === 'past') {
    return updatedEvents.filter(event => event.status === 'past');
  }
  
  return updatedEvents;
}

export function isUpcomingOrOngoing(event: any): boolean {
  const updatedEvent = updateEventStatus(event);
  return updatedEvent.status === 'upcoming' || updatedEvent.status === 'ongoing';
}

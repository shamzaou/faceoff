export function formatDate(dateString: Date | string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export function getEventStatus(eventDate: Date | string): 'upcoming' | 'ongoing' | 'past' {
  const today = new Date();
  const eventDay = new Date(eventDate);
  
  // Set hours to compare just the dates
  today.setHours(0, 0, 0, 0);
  eventDay.setHours(0, 0, 0, 0);
  
  if (eventDay.getTime() > today.getTime()) {
    return 'upcoming';
  } else if (eventDay.getTime() === today.getTime()) {
    return 'ongoing';
  } else {
    return 'past';
  }
}

export function isUpcomingOrOngoing(status: string): boolean {
  return status === 'upcoming' || status === 'ongoing';
}

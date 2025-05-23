import { 
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  eventAttendees, type EventAttendee, type InsertEventAttendee
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count, sql } from "drizzle-orm";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFortyTwoId(fortytwoId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Event methods
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getUpcomingEvents(): Promise<Event[]>;
  getPastEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event attendee methods
  registerForEvent(eventId: number, userId: number): Promise<EventAttendee>;
  getEventAttendees(eventId: number): Promise<number>;
  getUserRegisteredEvents(userId: number): Promise<Event[]>;
}

// Add this helper function at the top of the file
function determineEventStatus(dateStr: string, timeStr: string): 'upcoming' | 'ongoing' | 'past' {
  const today = new Date();
  const eventDate = new Date(dateStr);
  
  // Set to midnight for date comparison
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  
  // Past event (date is before today)
  if (eventDateOnly < todayDate) {
    return 'past';
  }
  
  // Future event (date is after today)
  if (eventDateOnly > todayDate) {
    return 'upcoming';
  }
  
  // Same day - determine based on time
  if (timeStr) {
    try {
      // Handle time ranges like "14:00 - 17:00"
      if (timeStr.includes('-')) {
        const [startTime, endTime] = timeStr.split('-').map(t => t.trim());
        
        // Extract hours and minutes from the time strings
        let endHours = 0, endMinutes = 0;
        
        // Handle end time that might include a date
        if (endTime.includes(' ')) {
          // Format: "2023-10-22 18:00"
          const timePart = endTime.split(' ')[1];
          [endHours, endMinutes] = timePart.split(':').map(Number);
        } else {
          // Format: "18:00"
          [endHours, endMinutes] = endTime.split(':').map(Number);
        }
        
        // Create a Date object for the end time today
        const endTimeDate = new Date(today);
        endTimeDate.setHours(endHours, endMinutes, 0, 0);
        
        // If current time is after the end time, the event is past
        if (today > endTimeDate) {
          return 'past';
        }
        
        // Extract start time
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const startTimeDate = new Date(today);
        startTimeDate.setHours(startHours, startMinutes, 0, 0);
        
        // If current time is before start time, the event is upcoming
        if (today < startTimeDate) {
          return 'upcoming';
        }
        
        // If current time is between start and end time, the event is ongoing
        return 'ongoing';
      } else {
        // Simple time format without range - assume 2 hours duration
        const [hours, minutes] = timeStr.split(':').map(Number);
        const startTime = new Date(today);
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2); // Assume 2 hours duration
        
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
      // If we can't determine from time, use date only
      return 'ongoing'; // Same day, so it's ongoing
    }
  }
  
  // If no time specified but same day, consider it ongoing
  return 'ongoing';
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private eventAttendees: Map<number, EventAttendee>;
  private userCurrentId: number;
  private eventCurrentId: number;
  private attendeeCurrentId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventAttendees = new Map();
    this.userCurrentId = 1;
    this.eventCurrentId = 1;
    this.attendeeCurrentId = 1;
    
    // Add some sample events
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByFortyTwoId(fortytwoId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.fortytwoId === fortytwoId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      id,
      username: insertUser.username,
      displayName: insertUser.displayName || null,
      password: insertUser.password || null,
      email: insertUser.email || null,
      fortytwoId: insertUser.fortytwoId || null,
      role: insertUser.role || "user"
    };
    this.users.set(id, user);
    return user;
  }
  
  // Event methods
  async getAllEvents(): Promise<Event[]> {
    // Update status for all events based on current date/time before returning
    return Array.from(this.events.values()).map(event => {
      const calculatedStatus = determineEventStatus(event.date, event.time);
      if (event.status !== calculatedStatus) {
        const updatedEvent = { ...event, status: calculatedStatus };
        this.events.set(event.id, updatedEvent);
        return updatedEvent;
      }
      return event;
    });
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getUpcomingEvents(): Promise<Event[]> {
    // Get all events with dynamically calculated status
    const allEvents = await this.getAllEvents();
    
    // Return only upcoming and ongoing events
    return allEvents.filter(
      event => event.status === "upcoming" || event.status === "ongoing"
    );
  }
  
  async getPastEvents(): Promise<Event[]> {
    // Get all events with dynamically calculated status
    const allEvents = await this.getAllEvents();
    
    // Return only past events
    return allEvents.filter(event => event.status === "past");
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const event: Event = { 
      id,
      title: insertEvent.title,
      description: insertEvent.description,
      date: typeof insertEvent.date === 'object' && insertEvent.date !== null && 'toISOString' in insertEvent.date 
        ? (insertEvent.date as any).toISOString().split('T')[0] 
        : insertEvent.date,
      time: insertEvent.time,
      location: insertEvent.location,
      organizer: insertEvent.organizer,
      status: insertEvent.status || "upcoming",
      attendees: insertEvent.attendees || 0,
      category: insertEvent.category,
      image: insertEvent.image || null,
      createdAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    
    if (!existingEvent) {
      return undefined;
    }
    
    // Process date correctly if it's provided
    let dateValue = existingEvent.date;
    if (updateData.date !== undefined) {
      dateValue = typeof updateData.date === 'object' && updateData.date !== null && 'toISOString' in updateData.date 
        ? (updateData.date as any).toISOString().split('T')[0] 
        : updateData.date;
    }
    
    const updatedEvent: Event = {
      ...existingEvent,
      title: updateData.title || existingEvent.title,
      description: updateData.description || existingEvent.description,
      date: dateValue,
      time: updateData.time || existingEvent.time,
      location: updateData.location || existingEvent.location,
      organizer: updateData.organizer || existingEvent.organizer,
      status: updateData.status || existingEvent.status,
      category: updateData.category || existingEvent.category,
      attendees: updateData.attendees !== undefined ? updateData.attendees : existingEvent.attendees,
      image: updateData.image !== undefined ? (updateData.image || null) : existingEvent.image,
      createdAt: existingEvent.createdAt
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Event attendee methods
  async registerForEvent(eventId: number, userId: number): Promise<EventAttendee> {
    const id = this.attendeeCurrentId++;
    const eventAttendee: EventAttendee = { id, eventId, userId };
    this.eventAttendees.set(id, eventAttendee);
    
    // Increment attendee count
    const event = this.events.get(eventId);
    if (event) {
      event.attendees += 1;
      this.events.set(eventId, event);
    }
    
    return eventAttendee;
  }
  
  async getEventAttendees(eventId: number): Promise<number> {
    const event = this.events.get(eventId);
    return event?.attendees || 0;
  }
  
  // Initialize sample data
  private initializeData() {
    // Sample events for testing
    const sampleEvents: InsertEvent[] = [
      {
        title: 'Web Development Workshop',
        description: 'Learn modern web development techniques with React and Node.js. This workshop is designed for intermediate developers who want to enhance their skills in building modern web applications.',
        date: '2025-05-15',
        time: '14:00 - 17:00',
        location: 'Building 42, Room 101',
        organizer: 'Tech Community',
        status: 'upcoming',
        attendees: 24,
        category: 'workshop',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      {
        title: 'AI & Machine Learning Conference',
        description: 'Join us for a day of inspiring talks about the latest advances in artificial intelligence and machine learning. Network with professionals and researchers in the field.',
        date: '2025-05-10',
        time: '09:00 - 18:00',
        location: 'Main Auditorium',
        organizer: 'AI Research Group',
        status: 'ongoing',
        attendees: 150,
        category: 'conference',
        image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      {
        title: 'Hackathon: Build for Good',
        description: 'A 48-hour coding challenge to develop solutions for social good. Teams will work on projects addressing environmental, educational, or healthcare challenges.',
        date: '2025-05-20',
        time: '09:00 - 2025-05-22 18:00',
        location: 'Innovation Hub',
        organizer: 'Code for Change',
        status: 'upcoming',
        attendees: 75,
        category: 'hackathon',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      {
        title: 'Introduction to Cybersecurity',
        description: 'An introductory seminar covering the fundamentals of cybersecurity, common threats, and best practices for protecting your digital assets.',
        date: '2025-05-08',
        time: '10:00 - 12:00',
        location: 'Virtual (Zoom)',
        organizer: 'Security Experts Association',
        status: 'past',
        attendees: 120,
        category: 'seminar',
        image: 'https://images.unsplash.com/photo-1496096265110-f83ad7f96608?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      },
      {
        title: 'Design Systems Workshop',
        description: 'Learn how to create and implement an effective design system for your organization. This hands-on workshop will cover component libraries, documentation, and team collaboration.',
        date: '2025-05-12',
        time: '13:00 - 17:00',
        location: 'Design Studio, Floor 3',
        organizer: 'UX Community',
        status: 'upcoming',
        attendees: 30,
        category: 'workshop',
        image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      }
    ];
    
    // Add sample events
    sampleEvents.forEach(event => {
      this.createEvent(event);
    });
  }

  // Add new user management methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...existingUser,
      username: updateData.username || existingUser.username,
      displayName: updateData.displayName !== undefined ? updateData.displayName : existingUser.displayName,
      email: updateData.email !== undefined ? updateData.email : existingUser.email,
      password: updateData.password !== undefined ? updateData.password : existingUser.password,
      role: updateData.role || existingUser.role,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getUserRegisteredEvents(userId: number): Promise<Event[]> {
    // Find all event attendee entries for this user
    const userAttendances = Array.from(this.eventAttendees.values()).filter(
      (attendance) => attendance.userId === userId
    );
    
    // Get the event details for each registration
    const registeredEvents: Event[] = [];
    for (const attendance of userAttendances) {
      const event = this.events.get(attendance.eventId);
      if (event) {
        registeredEvents.push(event);
      }
    }
    
    return registeredEvents;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByFortyTwoId(fortytwoId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.fortytwoId, fortytwoId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllEvents(): Promise<Event[]> {
    const allEvents = await db.select().from(events);
    
    // Update status for all events based on current date/time
    return allEvents.map(event => {
      const calculatedStatus = determineEventStatus(event.date, event.time);
      if (event.status !== calculatedStatus) {
        // Update in database asynchronously (fire and forget)
        db.update(events)
          .set({ status: calculatedStatus })
          .where(eq(events.id, event.id))
          .execute()
          .catch(error => console.error("Error updating event status:", error));
        
        // Return updated event
        return { ...event, status: calculatedStatus };
      }
      return event;
    });
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getUpcomingEvents(): Promise<Event[]> {
    // First, get all events to ensure statuses are updated
    const allEvents = await this.getAllEvents();
    
    // Then filter for upcoming and ongoing
    return allEvents.filter(
      event => event.status === "upcoming" || event.status === "ongoing"
    );
  }

  async getPastEvents(): Promise<Event[]> {
    // First, get all events to ensure statuses are updated
    const allEvents = await this.getAllEvents();
    
    // Then filter for past events
    return allEvents.filter(event => event.status === "past");
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values({
      ...insertEvent,
      attendees: insertEvent.attendees || 0
    }).returning();
    return event;
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  async registerForEvent(eventId: number, userId: number): Promise<EventAttendee> {
    // Check if user is already registered
    const [existingRegistration] = await db
      .select()
      .from(eventAttendees)
      .where(
        and(
          eq(eventAttendees.eventId, eventId),
          eq(eventAttendees.userId, userId)
        )
      );
    
    if (existingRegistration) {
      throw new Error("User is already registered for this event");
    }
    
    // Get current attendees count
    const [currentEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    
    if (!currentEvent) {
      throw new Error("Event not found");
    }
    
    // Update event attendee count
    await db
      .update(events)
      .set({ 
        attendees: (currentEvent.attendees || 0) + 1
      })
      .where(eq(events.id, eventId));
    
    // Create registration
    const [eventAttendee] = await db
      .insert(eventAttendees)
      .values({ eventId, userId })
      .returning();
    
    return eventAttendee;
  }

  async getEventAttendees(eventId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, eventId));
    
    return result?.count || 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    // Remove undefined values to avoid overwriting with null
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );
    
    const result = await db
      .update(users)
      .set(cleanUpdateData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    
    return result.length > 0;
  }

  async getUserRegisteredEvents(userId: number): Promise<Event[]> {
    try {
      // Join event_attendees with events to get registered events
      const registeredEvents = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          date: events.date,
          time: events.time,
          location: events.location,
          organizer: events.organizer,
          status: events.status,
          attendees: events.attendees,
          category: events.category,
          image: events.image,
          createdAt: events.createdAt
        })
        .from(events)
        .innerJoin(
          eventAttendees,
          eq(events.id, eventAttendees.eventId)
        )
        .where(eq(eventAttendees.userId, userId));
      
      // Convert to Event objects
      return registeredEvents.map(event => ({
        ...event
      }));
    } catch (error) {
      console.error("Error getting user registered events:", error);
      return [];
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();

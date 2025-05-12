import { db } from "../server/db";
import { events, users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("Starting database seeding...");
  
  try {
    // Check if admin user exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
    
    let adminUser;
    if (existingAdmin.length === 0) {
      // Create sample admin user
      const adminResult = await db.insert(users).values({
        username: "admin",
        password: "admin123", // In a real app, this should be hashed
        email: "admin@example.com",
        displayName: "Admin User",
        fortytwoId: null
      }).returning();
      
      adminUser = adminResult[0];
      console.log("Created admin user:", adminUser.username);
    } else {
      adminUser = existingAdmin[0];
      console.log("Admin user already exists:", adminUser.username);
    }
    
    // Check if regular user exists
    const existingUser = await db.select().from(users).where(eq(users.username, "user"));
    
    let regularUser;
    if (existingUser.length === 0) {
      // Create sample regular user
      const userResult = await db.insert(users).values({
        username: "user",
        password: "user123", // In a real app, this should be hashed
        email: "user@example.com",
        displayName: "Regular User",
        fortytwoId: null
      }).returning();
      
      regularUser = userResult[0];
      console.log("Created regular user:", regularUser.username);
    } else {
      regularUser = existingUser[0];
      console.log("Regular user already exists:", regularUser.username);
    }
    
    // Check if events already exist
    const existingEvents = await db.select().from(events);
    if (existingEvents.length > 0) {
      console.log("Events already exist in the database. Skipping event creation.");
    } else {
      // Sample events
      const sampleEvents = [
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
      
      for (const eventData of sampleEvents) {
        const result = await db.insert(events).values(eventData).returning();
        console.log("Created event:", result[0].title);
      }
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
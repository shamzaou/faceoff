import { db } from "../server/db";
import { events } from "../shared/schema";

async function checkEvents() {
  console.log("Checking events in the database...");
  
  try {
    const allEvents = await db.select().from(events);
    
    console.log(`Found ${allEvents.length} events in the database.`);
    
    if (allEvents.length > 0) {
      console.log("\nEvents list:");
      allEvents.forEach(event => {
        console.log(`- ${event.id}: ${event.title} (${event.status})`);
      });
    } else {
      console.log("No events found in the database.");
    }
  } catch (error) {
    console.error("Error checking events:", error);
  } finally {
    process.exit(0);
  }
}

// Run the check function
checkEvents(); 
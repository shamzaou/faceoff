import { sql } from 'drizzle-orm';
import { db } from '../server/db';
import { users, events, eventAttendees } from '../shared/schema';
import { hashPassword } from '../server/auth';

// Format: yyyy-mm-dd
const CURRENT_DATE = '2025-05-11';

async function resetDatabase() {
  console.log('🗑️ Resetting database...');
  
  try {
    // Disable foreign key constraints temporarily
    console.log('🔓 Disabling foreign key constraints...');
    await db.execute(sql.raw('SET session_replication_role = replica;'));
    
    // Get all tables from the database
    console.log('📋 Getting database tables...');
    const tablesQuery = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `);
    
    // Truncate all tables
    console.log('🧹 Truncating all tables...');
    for (const row of tablesQuery.rows || []) {
      const tableName = row.table_name;
      console.log(`  • Truncating ${tableName}...`);
      await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" CASCADE;`));
    }
    
    // Re-enable foreign key constraints
    console.log('🔐 Re-enabling foreign key constraints...');
    await db.execute(sql.raw('SET session_replication_role = origin;'));
    
    // Initialize with sample data
    console.log('🌱 Initializing sample data...');
    
    // Create test users
    console.log('👤 Creating users...');
    
    // Admin user
    const adminUser = await db.insert(users).values({
      username: 'admin',
      displayName: 'Administrator',
      email: 'admin@example.com',
      password: hashPassword('admin123'),
      role: 'admin'
    }).returning();
    
    // Regular user
    const regularUser = await db.insert(users).values({
      username: 'user',
      displayName: 'Regular User',
      email: 'user@example.com',
      password: hashPassword('user123'),
      role: 'user'
    }).returning();
    
    console.log(`  • Created admin user: ${adminUser[0].username}`);
    console.log(`  • Created regular user: ${regularUser[0].username}`);
    
    // Create sample events
    console.log('📅 Creating events...');
    
    // Calculate dates relative to the current date (May 11, 2025)
    const yesterday = new Date(CURRENT_DATE);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(CURRENT_DATE);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(CURRENT_DATE);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const lastWeek = new Date(CURRENT_DATE);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const twoWeeksAhead = new Date(CURRENT_DATE);
    twoWeeksAhead.setDate(twoWeeksAhead.getDate() + 14);
    
    // Create events with different statuses
    const sampleEvents = [
      {
        title: 'Tech Conference 2025',
        description: 'Annual technology conference featuring the latest innovations',
        date: nextWeek.toISOString().split('T')[0],
        time: '09:00',
        location: 'Convention Center',
        organizer: 'Tech Association',
        status: 'upcoming',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        attendees: 0
      },
      {
        title: 'Music Festival',
        description: 'A weekend of amazing live performances',
        date: twoWeeksAhead.toISOString().split('T')[0],
        time: '18:00',
        location: 'City Park',
        organizer: 'Music Promoters Inc',
        status: 'upcoming',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec',
        attendees: 0
      },
      {
        title: 'Charity Run',
        description: 'Annual 5k run to raise funds for local charities',
        date: tomorrow.toISOString().split('T')[0],
        time: '08:00',
        location: 'Downtown',
        organizer: 'City Charities',
        status: 'upcoming',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5',
        attendees: 0
      },
      {
        title: 'Art Exhibition',
        description: 'Featuring works from local artists',
        date: lastWeek.toISOString().split('T')[0],
        time: '10:00',
        location: 'Art Gallery',
        organizer: 'Arts Council',
        status: 'completed',
        category: 'Arts',
        image: 'https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07',
        attendees: 15
      },
      {
        title: 'Business Networking',
        description: 'Connect with local entrepreneurs',
        date: yesterday.toISOString().split('T')[0],
        time: '19:00',
        location: 'Grand Hotel',
        organizer: 'Business Association',
        status: 'completed',
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1560439514-4e9645039924',
        attendees: 30
      }
    ];
    
    // Insert events
    for (const eventData of sampleEvents) {
      const [event] = await db.insert(events).values(eventData).returning();
      console.log(`  • Created event: ${event.title} (${event.date})`);
      
      // For completed events, add the admin and user as attendees
      if (event.status === 'completed') {
        await db.insert(eventAttendees).values({
          eventId: event.id,
          userId: adminUser[0].id
        });
        
        await db.insert(eventAttendees).values({
          eventId: event.id,
          userId: regularUser[0].id
        });
        
        console.log(`    - Added admin and regular user as attendees`);
      }
    }
    
    console.log('✅ Database reset and initialized successfully!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}

// Run the reset function
resetDatabase()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }); 
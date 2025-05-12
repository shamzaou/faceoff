import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "keyboard cat",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        sameSite: "lax"
      },
    })
  );

  console.log("Session middleware configured");
  
  // Set up authentication
  setupAuth(app);
  app.use(passport.initialize());
  app.use(passport.session());
  console.log("Passport authentication configured");

  // Check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    console.log("Authentication check - isAuthenticated:", req.isAuthenticated());
    console.log("Authentication check - user:", req.user);
    console.log("Authentication check - session:", req.session);
    
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized - You must be logged in" });
  };

  // Check if user is admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    console.log("Admin check - isAuthenticated:", req.isAuthenticated());
    console.log("Admin check - user:", req.user);
    console.log("Admin check - user role:", (req.user as any)?.role);
    
    if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Admin access required" });
  };

  // Auth endpoints
  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ isAuthenticated: true, user: req.user });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  app.get("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ success: true });
    });
  });

  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    console.log("Received signup request:", req.body);
    
    try {
      const { username, displayName, email, password, role } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        console.log("Missing required fields:", { username, email, password: !!password });
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        console.log("Username already exists:", username);
        return res.status(409).json({ message: "Username already exists" });
      }

      // Hash the password before storing
      const hashedPassword = hashPassword(password);

      console.log("Creating new user with username:", username);
      
      // Create the user with the provided role or default to "user"
      const newUser = await storage.createUser({
        username,
        displayName: displayName || null,
        email,
        password: hashedPassword, // Store the hashed password
        role: role || "user" // Use the provided role or default to "user"
      });

      // Remove sensitive information before sending the response
      const { password: _, ...userResponse } = newUser;
      
      console.log("User created successfully:", username, "with role:", role || "user");
      
      // Don't auto-login until we fix the basic registration
      return res.status(201).json(userResponse);
      
      /* Commenting out auto-login for now to simplify debugging
      // Auto-login the user
      req.login(userResponse, (loginErr) => {
        if (loginErr) {
          console.error("Error during auto-login:", loginErr);
          return res.status(500).json({ message: "Error logging in after signup", error: loginErr.message });
        }
        console.log("User automatically logged in after signup:", username);
        return res.status(201).json(userResponse);
      });
      */
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error creating user account", error: String(error) });
    }
  });

  // Event endpoints
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events" });
    }
  });

  // Get upcoming events
  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const events = await storage.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      console.error("Upcoming events error:", error);
      res.status(500).json({ message: "Error fetching upcoming events", error: String(error) });
    }
  });

  // Get past events
  app.get("/api/events/past", async (req, res) => {
    try {
      const events = await storage.getPastEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching past events" });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event" });
    }
  });

  // Create event (admin only)
  app.post("/api/events", isAdmin, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: "Invalid event data", errors: validationError.details });
      }
      res.status(500).json({ message: "Error creating event" });
    }
  });

  // Update event (admin only)
  app.put("/api/events/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const eventData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(id, eventData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: "Invalid event data", errors: validationError.details });
      }
      res.status(500).json({ message: "Error updating event" });
    }
  });

  // Delete event (admin only)
  app.delete("/api/events/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const deleted = await storage.deleteEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting event" });
    }
  });

  // Register for event
  app.post("/api/events/:id/register", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const userId = (req.user as any).id;
      const registration = await storage.registerForEvent(eventId, userId);
      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Error registering for event" });
    }
  });

  // User endpoints (admin only)
  // Get all users
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Create new user (admin only)
  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      // You might want to use a validation schema here
      const userData = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Update user (admin only)
  app.put("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const userData = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If username is changing, check if new username is available
      if (userData.username && userData.username !== existingUser.username) {
        const usernameExists = await storage.getUserByUsername(userData.username);
        if (usernameExists) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Test endpoint to verify API connectivity
  app.get("/api/test", (req, res) => {
    console.log("Test endpoint hit with headers:", req.headers);
    console.log("Test endpoint hit with cookies:", req.cookies);
    res.json({ 
      message: "API is working correctly", 
      timestamp: new Date().toISOString(),
      requestInfo: {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        hostname: req.hostname,
        ip: req.ip,
        protocol: req.protocol,
        headers: req.headers,
      }
    });
  });
  
  app.post("/api/test", (req, res) => {
    console.log("POST test endpoint hit with body:", req.body);
    console.log("POST test endpoint hit with headers:", req.headers);
    res.json({ 
      message: "POST API is working correctly", 
      receivedData: req.body,
      timestamp: new Date().toISOString(),
      requestInfo: {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        hostname: req.hostname,
        ip: req.ip,
        protocol: req.protocol,
      }
    });
  });

  // Test endpoint to register the current user for test events
  app.get("/api/test/register-events", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      console.log(`Test endpoint: Registering user ${userId} for test events`);
      
      if (!userId) {
        console.error("Test endpoint: Invalid user ID");
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get all events
      const allEvents = await storage.getAllEvents();
      console.log(`Test endpoint: Found ${allEvents.length} events in total`);
      
      if (allEvents.length === 0) {
        console.error("Test endpoint: No events available");
        return res.status(404).json({ message: "No events available to register for" });
      }
      
      // Register user for first 2 events if there are that many
      const eventsToRegister = allEvents.slice(0, Math.min(2, allEvents.length));
      console.log(`Test endpoint: Will try to register for ${eventsToRegister.length} events:`, 
        eventsToRegister.map(e => ({id: e.id, title: e.title})));
        
      const registrations = [];
      
      for (const event of eventsToRegister) {
        try {
          console.log(`Test endpoint: Registering for event ${event.id} - ${event.title}`);
          const registration = await storage.registerForEvent(event.id, userId);
          console.log(`Test endpoint: Registration success:`, registration);
          registrations.push({ eventId: event.id, registrationId: registration.id });
        } catch (err) {
          console.error(`Test endpoint: Error registering for event ${event.id}:`, err);
          // Continue with other events even if one fails
        }
      }
      
      console.log(`Test endpoint: Registration complete. Registered for ${registrations.length} events`);
      res.json({ 
        message: `Successfully registered for ${registrations.length} events`, 
        registrations 
      });
    } catch (error) {
      console.error("Test endpoint: Error registering for events:", error);
      res.status(500).json({ message: "Error registering for events", error: String(error) });
    }
  });

  // Get current user's registered events
  app.get("/api/user/registrations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      console.log(`Fetching registrations for user ID: ${userId}`);
      
      // Check if userId is valid
      if (!userId) {
        console.error("Invalid user ID in request");
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const events = await storage.getUserRegisteredEvents(userId);
      console.log(`Found ${events.length} registered events for user ${userId}:`, events);
      
      // Set explicit content type
      res.setHeader('Content-Type', 'application/json');
      res.json(events);
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      // Set explicit content type
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Error fetching registered events", error: String(error) });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

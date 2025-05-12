import type { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import axios from "axios";
import { storage } from "./storage";
import { type User } from "@shared/schema";
import crypto from "crypto";

// 42 OAuth Configuration
const FORTYTWO_CLIENT_ID = "u-s4t2ud-6c4a343fd92c2fcbb8f1ed67fa6518b5f1cff90d322bce634b2979384f799d70";
const FORTYTWO_CLIENT_SECRET = "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";
const FORTYTWO_CALLBACK_URL = "http://localhost:5000/api/auth/42/callback";
const FORTYTWO_API_URL = "https://api.intra.42.fr";

// Password hashing utilities
export function hashPassword(password: string): string {
  // In a real application, use a proper password hashing library like bcrypt
  // This is a simple implementation for demonstration purposes
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(storedPassword: string, providedPassword: string): boolean {
  // Password is stored as salt:hash
  const [salt, storedHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(providedPassword, salt, 1000, 64, 'sha512').toString('hex');
  return storedHash === hash;
}

export function setupAuth(app: Express): void {
  // Configure Passport
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      done(error, null);
    }
  });

  // Local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Check if this is an OAuth user without a password
        if (!user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Verify the password hash
        const isValidPassword = verifyPassword(user.password, password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // 42 OAuth Strategy
  passport.use('42', 
    new OAuth2Strategy({
      authorizationURL: `${FORTYTWO_API_URL}/oauth/authorize`,
      tokenURL: `${FORTYTWO_API_URL}/oauth/token`,
      clientID: FORTYTWO_CLIENT_ID as string,
      clientSecret: FORTYTWO_CLIENT_SECRET as string,
      callbackURL: FORTYTWO_CALLBACK_URL
    }, 
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Fetch user data from 42 API
        const response = await axios.get(`${FORTYTWO_API_URL}/v2/me`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const fortytwoProfile = response.data;
        const fortytwoId = fortytwoProfile.id.toString();
        
        // Check if user exists
        let user = await storage.getUserByFortyTwoId(fortytwoId);
        
        if (!user) {
          // Create new user
          user = await storage.createUser({
            username: fortytwoProfile.login,
            displayName: fortytwoProfile.displayname || fortytwoProfile.login,
            email: fortytwoProfile.email,
            fortytwoId: fortytwoId,
            password: null // No password for OAuth users
          });
          
          console.log(`Created new user from 42 OAuth: ${user.username}`);
        } else {
          console.log(`Found existing user from 42 OAuth: ${user.username}`);
        }
        
        return done(null, user);
      } catch (error) {
        console.error("42 OAuth error:", error);
        return done(error);
      }
    })
  );

  // Add a test login endpoint that creates a test user if necessary
  app.get("/api/auth/test-login", async (req, res, next) => {
    try {
      console.log("Test login endpoint hit");
      
      // Check if test user exists
      let testUser = await storage.getUserByUsername("testuser");
      
      if (!testUser) {
        console.log("Creating test user");
        // Create a test user
        testUser = await storage.createUser({
          username: "testuser",
          displayName: "Test User",
          email: "test@example.com",
          password: hashPassword("password123"),
          role: "user"
        });
        console.log("Test user created:", testUser);
      } else {
        console.log("Test user already exists:", testUser);
      }
      
      // Login the user
      req.login(testUser, (loginErr) => {
        if (loginErr) {
          console.error("Test login error:", loginErr);
          return next(loginErr);
        }
        console.log("Test user logged in successfully");
        return res.json({ 
          message: "Test user logged in automatically", 
          user: testUser 
        });
      });
    } catch (error) {
      console.error("Test login error:", error);
      res.status(500).json({ 
        message: "Error creating/logging in test user", 
        error: String(error) 
      });
    }
  });

  // Simple login endpoint for local strategy
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.json({ user });
      });
    })(req, res, next);
  });

  // 42 OAuth Routes
  app.get("/api/auth/42", 
    passport.authenticate("42", { 
      scope: ["public"] 
    })
  );

  app.get("/api/auth/42/callback", 
    passport.authenticate("42", { 
      failureRedirect: "/login" 
    }),
    (req, res) => {
      // Successful authentication
      res.redirect("/");
    }
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/provider/auth-provider";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  displayName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  isAdmin: z.boolean().default(false)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isAdmin: false
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, isAdmin, ...userData } = values;
      
      // Set the role based on the isAdmin checkbox
      const dataToSend = {
        ...userData,
        role: isAdmin ? "admin" : "user"
      };
      
      // Log what we're sending to the server
      console.log("Sending data to server:", dataToSend);
      
      // First try the direct API endpoint
      console.log("Trying signup with: /api/auth/signup");
      let response;
      
      try {
        response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
          // Add credentials to ensure cookies are sent
          credentials: "include"
        });
      } catch (fetchError) {
        console.error("Fetch error with relative URL:", fetchError);
        
        // Try with explicit localhost:3000 if the relative URL failed
        console.log("Trying with direct URL: http://localhost:3000/api/auth/signup");
        response = await fetch("http://localhost:3000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
          credentials: "include"
        });
      }
      
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(Array.from(response.headers.entries())));
      
      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Raw server response:", responseText);
      
      // Try to parse the response as JSON only if it looks like JSON
      let data;
      try {
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          data = JSON.parse(responseText);
        } else {
          throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}...`);
        }
      } catch (parseError) {
        console.error("Failed to parse server response:", parseError);
        throw new Error(`Server returned invalid JSON. Response starts with: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data?.message || `Registration failed with status ${response.status}`);
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully. You can now log in.",
      });

      // Auto-login after successful registration
      await login(values.username, values.password);
      
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      console.error("Registration error details:", error);
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      const testData = {
        username: "testuser" + Math.floor(Math.random() * 10000),
        email: "test@example.com",
        password: "password123"
      };
      
      console.log("Sending test data to server:", testData);
      
      // Try simple GET test first
      try {
        console.log("Trying simple GET test: /api/test");
        const response = await fetch("/api/test");
        
        const responseText = await response.text();
        console.log("Simple GET Test - Status:", response.status);
        console.log("Simple GET Test - Raw response:", responseText);
        
        toast({
          title: "Simple GET Test Result",
          description: `Status: ${response.status}, Response: ${responseText.substring(0, 50)}...`,
        });
        
        // If this failed, we have a basic connectivity issue
        if (!response.ok) {
          return;
        }
      } catch (err) {
        console.error("Simple GET test error:", err);
        toast({
          title: "Simple GET Test Failed",
          description: String(err),
          variant: "destructive",
        });
        return;
      }
      
      // Try simple POST test next
      try {
        console.log("Trying simple POST test: /api/test");
        const response = await fetch("/api/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ test: "data" }),
        });
        
        const responseText = await response.text();
        console.log("Simple POST Test - Status:", response.status);
        console.log("Simple POST Test - Raw response:", responseText);
        
        toast({
          title: "Simple POST Test Result",
          description: `Status: ${response.status}, Response: ${responseText.substring(0, 50)}...`,
        });
        
        // If this worked, we can move on to the actual signup test
        if (!response.ok) {
          return;
        }
      } catch (err) {
        console.error("Simple POST test error:", err);
        toast({
          title: "Simple POST Test Failed",
          description: String(err),
          variant: "destructive",
        });
        return;
      }
      
      // Only now try the actual signup endpoint
      // Rest of the function as before...
    
      // Try the relative path first
      try {
        console.log("Trying API with relative path: /api/auth/signup");
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        });
        
        const responseText = await response.text();
        console.log("API Test (relative) - Status:", response.status);
        console.log("API Test (relative) - Raw response:", responseText);
        
        // If this worked, show toast and return
        if (response.ok) {
          toast({
            title: "API Test Succeeded (relative)",
            description: `Status: ${response.status}, Response starts with: ${responseText.substring(0, 50)}...`,
          });
          return;
        }
      } catch (err) {
        console.error("API test error (relative):", err);
      }
      
      // Try with direct port 3000
      try {
        console.log("Trying API with direct port 3000: http://localhost:3000/api/auth/signup");
        const response = await fetch("http://localhost:3000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        });
        
        const responseText = await response.text();
        console.log("API Test (port 3000) - Status:", response.status);
        console.log("API Test (port 3000) - Raw response:", responseText);
        
        toast({
          title: "API Test Result (port 3000)",
          description: `Status: ${response.status}, Response starts with: ${responseText.substring(0, 50)}...`,
        });
        return;
      } catch (err) {
        console.error("API test error (port 3000):", err);
      }
      
      // Try with port 5000 as backup
      try {
        console.log("Trying API with port 5000: http://localhost:5000/api/auth/signup");
        const response = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        });
        
        const responseText = await response.text();
        console.log("API Test (port 5000) - Status:", response.status);
        console.log("API Test (port 5000) - Raw response:", responseText);
        
        toast({
          title: "API Test Result (port 5000)",
          description: `Status: ${response.status}, Response starts with: ${responseText.substring(0, 50)}...`,
        });
        return;
      } catch (err) {
        console.error("API test error (port 5000):", err);
      }
      
      toast({
        title: "All API Tests Failed",
        description: "Check console for details",
        variant: "destructive",
      });
    } catch (err) {
      console.error("Overall API test error:", err);
      toast({
        title: "API Test Failed",
        description: String(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Sign up to join our event platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password*</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter a password (min. 6 characters)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password*</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Admin Account</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This account will have administrator privileges
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
              <div className="mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    testApiConnection();
                  }}
                >
                  Test API Connection
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = "/api/auth/42"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                Sign up with 42
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="ml-1 cursor-pointer text-primary hover:underline"
          >
            Log in
          </span>
        </CardFooter>
      </Card>
    </div>
  );
} 
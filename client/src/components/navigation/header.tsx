import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import MobileSidebar from "./mobile-sidebar";
import { useAuth } from "@/provider/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navLinkClasses = (path: string) => {
    return `cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive(path)
        ? "text-primary-400"
        : "text-gray-300 hover:text-white"
    }`;
  };

  return (
    <header className="bg-black shadow-sm z-10 relative border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-2 p-2 rounded-md lg:hidden text-gray-400 hover:text-white focus:outline-none"
              >
                {sidebarOpen ? (
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <span 
                onClick={() => navigate("/")}
                className="text-xl font-bold text-primary-400 tracking-tight cursor-pointer"
              >
                42 Events
              </span>
            </div>
            <nav className="hidden lg:ml-6 lg:flex lg:space-x-6">
              <span 
                onClick={() => navigate("/")}
                className={navLinkClasses("/")}
              >
                Home
              </span>
              <span 
                onClick={() => navigate("/upcoming-events")}
                className={navLinkClasses("/upcoming-events")}
              >
                Upcoming Events
              </span>
              <span 
                onClick={() => navigate("/past-events")}
                className={navLinkClasses("/past-events")}
              >
                Past Events
              </span>
              {isAdmin && (
                <span 
                  onClick={() => navigate("/admin")}
                  className={navLinkClasses("/admin")}
                >
                  Admin
                </span>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors duration-200">
                      <span className="mr-2">{user?.displayName || user?.username}</span>
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {user?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate("/profile")}
                    >
                      Profile
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => navigate("/admin")}
                        >
                          Admin Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => navigate("/admin/users")}
                        >
                          Manage Users
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 focus:text-red-500"
                      onClick={logout}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
                  onClick={() => navigate("/login")}
                >
                  <span className="mr-2">Login with</span>
                  <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">42</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  );
}

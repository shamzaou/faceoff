import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import MobileSidebar from "./mobile-sidebar";

export default function Header() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navLinkClasses = (path: string) => {
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive(path)
        ? "text-primary dark:text-primary-400"
        : "text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    }`;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10 relative border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-2 p-2 rounded-md lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none"
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
              <Link href="/">
                <a className="text-xl font-bold text-primary dark:text-primary-400 tracking-tight">42 Events</a>
              </Link>
            </div>
            <nav className="hidden lg:ml-6 lg:flex lg:space-x-6">
              <Link href="/">
                <a className={navLinkClasses("/")}>Home</a>
              </Link>
              <Link href="/upcoming-events">
                <a className={navLinkClasses("/upcoming-events")}>Upcoming Events</a>
              </Link>
              <Link href="/past-events">
                <a className={navLinkClasses("/past-events")}>Past Events</a>
              </Link>
              <Link href="/admin">
                <a className={navLinkClasses("/admin")}>Admin</a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <ModeToggle />
              
              <Button variant="ghost" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none transition-colors duration-200">
                <span className="mr-2">Login with</span>
                <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">42</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  );
}

import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/provider/auth-provider";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  // Close sidebar when location changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location, isOpen, onClose]);

  if (!isOpen) return null;

  const isActive = (path: string) => {
    return location === path;
  };

  const navLinkClasses = (path: string) => {
    return `group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer ${
      isActive(path)
        ? "bg-gray-900 text-primary-400"
        : "text-gray-300 hover:bg-gray-800"
    }`;
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="lg:hidden fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-75" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Sidebar panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-black border-r border-gray-800">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            onClick={onClose}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <span 
              onClick={() => navigate("/")}
              className="text-xl font-bold text-primary-400 cursor-pointer"
            >
              42 Events
            </span>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            <div 
              onClick={() => navigate("/")}
              className={navLinkClasses("/")}
            >
              <svg className="mr-3 h-6 w-6 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </div>
            <div 
              onClick={() => navigate("/upcoming-events")}
              className={navLinkClasses("/upcoming-events")}
            >
              <svg className="mr-3 h-6 w-6 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming Events
            </div>
            <div 
              onClick={() => navigate("/past-events")}
              className={navLinkClasses("/past-events")}
            >
              <svg className="mr-3 h-6 w-6 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Past Events
            </div>
            
            {/* Admin link - only shown for admins */}
            {isAdmin && (
              <div 
                onClick={() => navigate("/admin")}
                className={navLinkClasses("/admin")}
              >
                <svg className="mr-3 h-6 w-6 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Dashboard
              </div>
            )}
            
            {/* Users Management - only shown for admins */}
            {isAdmin && (
              <div 
                onClick={() => navigate("/admin/users")}
                className={navLinkClasses("/admin/users")}
              >
                <svg className="mr-3 h-6 w-6 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Manage Users
              </div>
            )}
            
            {/* Show login or logout based on authentication state */}
            {isAuthenticated ? (
              <>
                <div 
                  onClick={() => navigate("/profile")}
                  className={navLinkClasses("/profile")}
                >
                  <svg className="mr-3 h-6 w-6 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </div>
                <div 
                  onClick={handleLogout}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer text-red-400 hover:bg-gray-800"
                >
                  <svg className="mr-3 h-6 w-6 text-red-400 group-hover:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </div>
              </>
            ) : (
              <div 
                onClick={() => navigate("/login")}
                className={navLinkClasses("/login")}
              >
                <svg className="mr-3 h-6 w-6 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </div>
            )}
          </nav>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-14"></div>
    </div>
  );
}

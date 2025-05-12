import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/provider/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (adminOnly && !isAdmin) {
        navigate("/");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate, adminOnly]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Only render the children if:
  // 1. The user is authenticated AND
  // 2. Either it's not an admin-only route OR the user is an admin
  if (isAuthenticated && (!adminOnly || isAdmin)) {
    return <>{children}</>;
  }

  // This should never be rendered as the useEffect should navigate away
  return null;
} 
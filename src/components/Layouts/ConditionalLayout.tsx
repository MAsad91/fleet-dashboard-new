"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // Don't show sidebar/header on auth pages
  const isAuthPage = pathname.startsWith('/auth');

  // Prevent hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle all redirects based on authentication and current route
  useEffect(() => {
    console.log('🔄 ConditionalLayout: Auth state changed', { isHydrated, loading, isAuthenticated, isAuthPage, pathname });
    
    if (!isHydrated || loading) {
      console.log('🔄 ConditionalLayout: Not ready yet', { isHydrated, loading });
      return;
    }

    // Handle root route redirects
    if (pathname === '/') {
      if (isAuthenticated) {
        console.log('🔄 ConditionalLayout: Root route - authenticated user, redirecting to /fleet');
        router.replace('/fleet');
      } else {
        console.log('🔄 ConditionalLayout: Root route - not authenticated, redirecting to /auth/sign-in');
        router.replace('/auth/sign-in');
      }
      return;
    }

    // Handle other routes
    if (!isAuthenticated && !isAuthPage) {
      console.log('🔄 ConditionalLayout: Unauthenticated user on protected route, redirecting to sign-in');
      router.replace('/auth/sign-in');
    }
  }, [isHydrated, loading, isAuthenticated, isAuthPage, pathname, router]);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (isHydrated && !loading && isAuthenticated && isAuthPage) {
      console.log('🔄 ConditionalLayout: Redirecting authenticated user to fleet');
      // Add small delay to prevent flash
      setTimeout(() => {
        router.replace('/fleet');
      }, 50);
    }
  }, [isHydrated, loading, isAuthenticated, isAuthPage, router]);

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('🔄 ConditionalLayout: Showing loading spinner', { loading, isAuthenticated, isAuthPage });
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isAuthPage ? 'Signing in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  // If not authenticated and not on auth page, redirect to sign-in
  if (!isAuthenticated) {
    // Don't render children that might cause redirect loops
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Redirecting to Sign In...
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            If this takes too long, please refresh the page
          </p>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  console.log('🔄 ConditionalLayout: Rendering main layout', { loading, isAuthenticated, isAuthPage });
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />
        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {/* Don't show breadcrumbs on dashboard */}
          {pathname !== '/fleet' && <Breadcrumb />}
          {children}
        </main>
      </div>
    </div>
  );
}

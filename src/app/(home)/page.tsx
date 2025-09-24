"use client";

import { useAuth } from "../../contexts/AuthContext";

export default function Home() {
  const { loading } = useAuth();

  // Show loading state while ConditionalLayout handles redirects
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Fleet Management Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {loading ? 'Loading...' : 'Redirecting...'}
        </p>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
      </div>
    </div>
  );
}

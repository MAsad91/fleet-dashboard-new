"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

export default function PerformancePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to driver performance as the default performance page
    router.push('/driver-performance');
  }, [router]);

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </ProtectedRoute>
  );
}

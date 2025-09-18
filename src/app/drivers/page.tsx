"use client";

import { useEffect } from "react";
import { useListDriversQuery, useSuspendDriversMutation } from "@/store/api/driversApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDriverFilters } from "@/store/slices/driversSlice";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

export default function DriversPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.driversUI.filters);

  const { data, isLoading, refetch } = useListDriversQuery({
    page: filters.page,
    search: filters.search,
    status: filters.status,
  });

  const [suspendDrivers, { isLoading: isSuspending }] = useSuspendDriversMutation();

  useEffect(() => {
    // Ensure page defaults
    if (!filters.page) {
      dispatch(setDriverFilters({ page: 1 }));
    }
  }, [dispatch, filters.page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDriverFilters({ search: e.target.value, page: 1 }));
  };

  const handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setDriverFilters({ status: e.target.value || undefined, page: 1 }));
  };

  const handlePage = (delta: number) => {
    const next = Math.max(1, (filters.page || 1) + delta);
    dispatch(setDriverFilters({ page: next }));
  };

  const handleSuspendSelected = async () => {
    // Minimal demo action: suspend first 3 if present
    const ids = (data?.results || []).slice(0, 3).map((d: any) => d.id);
    if (ids.length) {
      await suspendDrivers({ ids });
      refetch();
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-4">
      <div>
        <h1 className="text-title-md2 font-bold text-black dark:text-white">Drivers</h1>
        <p className="text-sm text-body-color dark:text-body-color-dark">Manage drivers, documents, and status.</p>
      </div>

      {/* Filters */}
      <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search drivers..."
              className="w-64 rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-gray-600"
              onChange={handleSearch}
              defaultValue={filters.search}
            />
            <select
              className="rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-gray-600"
              onChange={handleStatus}
              defaultValue={filters.status || ""}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSuspendSelected}
              className={cn(
                "rounded-md bg-red-500 px-3 py-2 text-xs font-medium text-white",
                isSuspending && "opacity-60"
              )}
            >
              Suspend sample (3)
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[10px] bg-white p-0 shadow-1 dark:bg-gray-dark">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm dark:border-gray-700">
                <th className="px-4 py-3 font-medium text-dark dark:text-white">Name</th>
                <th className="px-4 py-3 font-medium text-dark dark:text-white">Phone</th>
                <th className="px-4 py-3 font-medium text-dark dark:text-white">Status</th>
                <th className="px-4 py-3 font-medium text-dark dark:text-white">Trips</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"/></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"/></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"/></td>
                    <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"/></td>
                  </tr>
                ))
              ) : (data?.results || []).length ? (
                (data?.results || []).map((driver: any) => (
                  <tr key={driver.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 text-sm text-dark dark:text-white">{driver.name || driver.full_name || driver.username || `Driver #${driver.id}`}</td>
                    <td className="px-4 py-3 text-sm text-body-color dark:text-body-color-dark">{driver.phone || driver.mobile || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        (driver.status || "active").toLowerCase() === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                      )}>
                        {(driver.status || "active").toString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-body-color dark:text-body-color-dark">{driver.total_trips ?? "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-body-color dark:text-body-color-dark" colSpan={4}>
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm dark:border-gray-700">
          <button onClick={() => handlePage(-1)} className="rounded-md border px-3 py-1 dark:border-gray-600">Prev</button>
          <div className="text-body-color dark:text-body-color-dark">Page {filters.page || 1}</div>
          <button onClick={() => handlePage(1)} className="rounded-md border px-3 py-1 dark:border-gray-600">Next</button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}


